"use strict";
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryService = void 0;
const util = require("util");
const constants_1 = require("../constants");
const messages_1 = require("../messages");
const settings_1 = require("../settings");
const util_1 = require("../util");
const telemetryReporter_1 = require("./telemetryReporter");
const vscode = require("vscode");
const TELEMETRY_GLOBAL_VALUE = 'sfdxTelemetryMessage';
const EXTENSION_NAME = 'salesforcedx-vscode-slds'; //TODO: change
class TelemetryService {
    constructor() {
        this.cliAllowsTelemetry = true;
    }
    static getInstance() {
        if (!TelemetryService.instance) {
            TelemetryService.instance = new TelemetryService();
        }
        return TelemetryService.instance;
    }
    initializeService(context, machineId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.context = context;
            this.cliAllowsTelemetry = yield this.checkCliTelemetry();
            const isDevMode = machineId === 'someValue.machineId';
            // TelemetryReporter is not initialized if user has disabled telemetry setting.
            if (this.reporter === undefined &&
                this.isTelemetryEnabled() &&
                !isDevMode) {
                const extensionPackage = require(this.context.asAbsolutePath('./package.json'));
                this.reporter = new telemetryReporter_1.default('salesforcedx-vscode', extensionPackage.version, extensionPackage.aiKey, true);
                this.context.subscriptions.push(this.reporter);
            }
            this.setCliTelemetryEnabled(this.isTelemetryEnabled());
        });
    }
    getReporter() {
        return this.reporter;
    }
    isTelemetryEnabled() {
        return settings_1.sfdxCoreSettings.getTelemetryEnabled() && this.cliAllowsTelemetry;
    }
    getHasTelemetryMessageBeenShown() {
        if (this.context === undefined) {
            return true;
        }
        const sfdxTelemetryState = this.context.globalState.get(TELEMETRY_GLOBAL_VALUE);
        return typeof sfdxTelemetryState === 'undefined';
    }
    setTelemetryMessageShowed() {
        if (this.context === undefined) {
            return;
        }
        this.context.globalState.update(TELEMETRY_GLOBAL_VALUE, true);
    }
    showTelemetryMessage() {
        // check if we've ever shown Telemetry message to user
        const showTelemetryMessage = this.getHasTelemetryMessageBeenShown();
        if (showTelemetryMessage) {
            // Show the message and setb telemetry to true;
            const showButtonText = messages_1.nls.localize('telemetry_legal_dialog_button_text');
            const showMessage = messages_1.nls.localize('telemetry_legal_dialog_message', constants_1.TELEMETRY_OPT_OUT_LINK);
            vscode.window
                .showInformationMessage(showMessage, showButtonText)
                .then((selection) => {
                // Open disable telemetry link
                if (selection && selection === showButtonText) {
                    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(constants_1.TELEMETRY_OPT_OUT_LINK));
                }
            });
            this.setTelemetryMessageShowed();
        }
    }
    sendExtensionActivationEvent(hrstart) {
        if (this.reporter !== undefined && this.isTelemetryEnabled) {
            const startupTime = this.getEndHRTime(hrstart);
            this.reporter.sendTelemetryEvent('activationEvent', {
                extensionName: EXTENSION_NAME,
            }, { startupTime });
        }
    }
    sendExtensionDeactivationEvent() {
        if (this.reporter !== undefined && this.isTelemetryEnabled()) {
            this.reporter.sendTelemetryEvent('deactivationEvent', {
                extensionName: EXTENSION_NAME,
            });
        }
    }
    sendCommandEvent(commandName, hrstart, properties, measurements) {
        if (this.reporter !== undefined &&
            this.isTelemetryEnabled() &&
            commandName) {
            const baseProperties = {
                extensionName: EXTENSION_NAME,
                commandName,
            };
            const aggregatedProps = Object.assign(baseProperties, properties);
            let aggregatedMeasurements;
            if (hrstart || measurements) {
                aggregatedMeasurements = Object.assign({}, measurements);
                if (hrstart) {
                    aggregatedMeasurements.executionTime = this.getEndHRTime(hrstart);
                }
            }
            this.reporter.sendTelemetryEvent('commandExecution', aggregatedProps, aggregatedMeasurements);
        }
    }
    sendException(name, message) {
        if (this.reporter !== undefined && this.isTelemetryEnabled) {
            this.reporter.sendExceptionEvent(name, message);
        }
    }
    sendEventData(eventName, properties, measures) {
        if (this.reporter !== undefined && this.isTelemetryEnabled) {
            this.reporter.sendTelemetryEvent(eventName, properties, measures);
        }
    }
    dispose() {
        if (this.reporter !== undefined) {
            this.reporter.dispose().catch((err) => console.log(err));
        }
    }
    getEndHRTime(hrstart) {
        const hrend = process.hrtime(hrstart);
        return Number(util.format('%d%d', hrend[0], hrend[1] / 1000000));
    }
    checkCliTelemetry() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield util_1.isCLITelemetryAllowed(util_1.getRootWorkspacePath());
        });
    }
    setCliTelemetryEnabled(isEnabled) {
        if (!isEnabled) {
            util_1.disableCLITelemetry();
        }
    }
}
exports.TelemetryService = TelemetryService;
//# sourceMappingURL=telemetry.js.map