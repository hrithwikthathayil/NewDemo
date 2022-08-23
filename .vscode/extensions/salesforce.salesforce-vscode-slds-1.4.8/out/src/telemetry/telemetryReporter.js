/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const appInsights = require("applicationinsights");
const fs = require("fs");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
class TelemetryReporter extends vscode.Disposable {
    constructor(extensionId, extensionVersion, key, enableUniqueMetrics) {
        super(() => this.toDispose.forEach((d) => d && d.dispose()));
        this.extensionId = extensionId;
        this.extensionVersion = extensionVersion;
        this.userOptIn = false;
        this.toDispose = [];
        this.uniqueUserMetrics = false;
        let logFilePath = process.env['VSCODE_LOGS'] || '';
        if (logFilePath &&
            extensionId &&
            process.env['VSCODE_LOG_LEVEL'] === 'trace') {
            logFilePath = path.join(logFilePath, `${extensionId}.txt`);
            this.logStream = fs.createWriteStream(logFilePath, {
                flags: 'a',
                encoding: 'utf8',
                autoClose: true,
            });
        }
        if (enableUniqueMetrics) {
            this.uniqueUserMetrics = true;
        }
        this.updateUserOptIn(key);
        this.toDispose.push(vscode.workspace.onDidChangeConfiguration(() => this.updateUserOptIn(key)));
    }
    updateUserOptIn(key) {
        const config = vscode.workspace.getConfiguration(TelemetryReporter.TELEMETRY_CONFIG_ID);
        if (this.userOptIn !==
            config.get(TelemetryReporter.TELEMETRY_CONFIG_ENABLED_ID, true)) {
            this.userOptIn = config.get(TelemetryReporter.TELEMETRY_CONFIG_ENABLED_ID, true);
            if (this.userOptIn) {
                this.createAppInsightsClient(key);
            }
            else {
                // tslint:disable-next-line:no-floating-promises
                this.dispose();
            }
        }
    }
    createAppInsightsClient(key) {
        // check if another instance is already initialized
        if (appInsights.defaultClient) {
            this.appInsightsClient = new appInsights.TelemetryClient(key);
            // no other way to enable offline mode
            this.appInsightsClient.channel.setUseDiskRetryCaching(true);
        }
        else {
            appInsights
                .setup(key)
                .setAutoCollectRequests(false)
                .setAutoCollectPerformance(false)
                .setAutoCollectExceptions(false)
                .setAutoCollectDependencies(false)
                .setAutoDependencyCorrelation(false)
                .setAutoCollectConsole(false)
                .setUseDiskRetryCaching(true)
                .start();
            this.appInsightsClient = appInsights.defaultClient;
        }
        this.appInsightsClient.commonProperties = this.getCommonProperties();
        if (this.uniqueUserMetrics && vscode && vscode.env) {
            this.appInsightsClient.context.tags['ai.user.id'] = vscode.env.machineId;
            this.appInsightsClient.context.tags['ai.session.id'] =
                vscode.env.sessionId;
            this.appInsightsClient.context.tags['ai.cloud.roleInstance'] =
                'DEPRECATED';
        }
        // check if it's an Asimov key to change the endpoint
        if (key && key.indexOf('AIF-') === 0) {
            this.appInsightsClient.config.endpointUrl =
                'https://vortex.data.microsoft.com/collect/v1';
        }
    }
    getCommonProperties() {
        const commonProperties = Object.create(null);
        commonProperties['common.os'] = os.platform();
        commonProperties['common.platformversion'] = (os.release() || '').replace(/^(\d+)(\.\d+)?(\.\d+)?(.*)/, '$1$2$3');
        const cpus = os.cpus();
        if (cpus && cpus.length > 0) {
            commonProperties['common.cpus'] = `${cpus[0].model}(${cpus.length} x ${cpus[0].speed})`;
        }
        commonProperties['common.systemmemory'] = `${(os.totalmem() /
            (1024 * 1024 * 1024)).toFixed(2)} GB`;
        commonProperties['common.extname'] = this.extensionId;
        commonProperties['common.extversion'] = this.extensionVersion;
        if (vscode && vscode.env) {
            commonProperties['common.vscodemachineid'] = vscode.env.machineId;
            commonProperties['common.vscodesessionid'] = vscode.env.sessionId;
            commonProperties['common.vscodeversion'] = vscode.version;
            if (vscode.env.uiKind) {
                commonProperties['common.vscodeuikind'] =
                    vscode.UIKind[vscode.env.uiKind];
            }
        }
        return commonProperties;
    }
    sendTelemetryEvent(eventName, properties, measurements) {
        if (this.userOptIn && eventName && this.appInsightsClient) {
            this.appInsightsClient.trackEvent({
                name: `${this.extensionId}/${eventName}`,
                // tslint:disable-next-line:object-literal-shorthand
                properties: properties,
                // tslint:disable-next-line:object-literal-shorthand
                measurements: measurements,
            });
            if (this.logStream) {
                this.logStream.write(`telemetry/${eventName} ${JSON.stringify({
                    properties,
                    measurements,
                })}\n`);
            }
        }
    }
    sendExceptionEvent(exceptionName, exceptionMessage, measurements) {
        if (this.userOptIn && exceptionMessage && this.appInsightsClient) {
            const error = new Error();
            error.name = `${this.extensionId}/${exceptionName}`;
            error.message = exceptionMessage;
            error.stack = 'DEPRECATED';
            this.appInsightsClient.trackException({
                exception: error,
                measurements,
            });
            if (this.logStream) {
                this.logStream.write(`telemetry/${exceptionName} ${JSON.stringify({
                    measurements,
                })}\n`);
            }
        }
    }
    dispose() {
        const flushEventsToLogger = new Promise((resolve) => {
            if (!this.logStream) {
                return resolve(void 0);
            }
            this.logStream.on('finish', resolve);
            this.logStream.end();
        });
        const flushEventsToAI = new Promise((resolve) => {
            if (this.appInsightsClient) {
                this.appInsightsClient.flush({
                    callback: () => {
                        // all data flushed
                        this.appInsightsClient = undefined;
                        resolve(void 0);
                    },
                });
            }
            else {
                resolve(void 0);
            }
        });
        return Promise.all([flushEventsToAI, flushEventsToLogger]);
    }
}
exports.default = TelemetryReporter;
TelemetryReporter.TELEMETRY_CONFIG_ID = 'telemetry';
TelemetryReporter.TELEMETRY_CONFIG_ENABLED_ID = 'enableTelemetry';
//# sourceMappingURL=telemetryReporter.js.map