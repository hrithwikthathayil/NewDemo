"use strict";
/*
 * Copyright (c) 2017, salesforce.com, inc.
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
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const constants_1 = require("./constants");
const embeddedSoql_1 = require("./embeddedSoql");
const messages_1 = require("./messages");
const requirements = require("./requirements");
const telemetry_1 = require("./telemetry");
const UBER_JAR_NAME = 'apex-jorje-lsp.jar';
const JDWP_DEBUG_PORT = 2739;
const APEX_LANGUAGE_SERVER_MAIN = 'apex.jorje.lsp.ApexLanguageServerLauncher';
const DEBUG = typeof v8debug === 'object' || startedInDebugMode();
function createServer(extensionContext) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            setupDB();
            const requirementsData = yield requirements.resolveRequirements();
            const uberJar = path.resolve(extensionContext.extensionPath, 'out', UBER_JAR_NAME);
            const javaExecutable = path.resolve(`${requirementsData.java_home}/bin/java`);
            const jvmMaxHeap = requirementsData.java_memory;
            const enableSemanticErrors = vscode.workspace
                .getConfiguration()
                .get('salesforcedx-vscode-apex.enable-semantic-errors', false);
            const enableCompletionStatistics = vscode.workspace
                .getConfiguration()
                .get('salesforcedx-vscode-apex.advanced.enable-completion-statistics', false);
            const args = [
                '-cp',
                uberJar,
                '-Ddebug.internal.errors=true',
                `-Ddebug.semantic.errors=${enableSemanticErrors}`,
                `-Ddebug.completion.statistics=${enableCompletionStatistics}`,
                '-Dlwc.typegeneration.disabled=true'
            ];
            if (jvmMaxHeap) {
                args.push(`-Xmx${jvmMaxHeap}M`);
            }
            telemetry_1.telemetryService.sendEventData('apexLSPSettings', undefined, { maxHeapSize: jvmMaxHeap != null ? jvmMaxHeap : 0 });
            if (DEBUG) {
                args.push('-Dtrace.protocol=false', `-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=${JDWP_DEBUG_PORT},quiet=y`);
                if (process.env.YOURKIT_PROFILER_AGENT) {
                    args.push(`-agentpath:${process.env.YOURKIT_PROFILER_AGENT}`);
                }
            }
            args.push(APEX_LANGUAGE_SERVER_MAIN);
            return {
                options: {
                    env: process.env,
                    stdio: 'pipe'
                },
                command: javaExecutable,
                args
            };
        }
        catch (err) {
            vscode.window.showErrorMessage(err);
            telemetry_1.telemetryService.sendException(constants_1.LSP_ERR, err.error);
            throw err;
        }
    });
}
function setupDB() {
    if (vscode.workspace.workspaceFolders &&
        vscode.workspace.workspaceFolders[0]) {
        const dbPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.sfdx', 'tools', 'apex.db');
        if (fs.existsSync(dbPath)) {
            fs.unlinkSync(dbPath);
        }
        try {
            const systemDb = path.join(__dirname, '..', '..', 'resources', 'apex.db');
            if (fs.existsSync(systemDb)) {
                fs.copyFileSync(systemDb, dbPath);
            }
        }
        catch (e) {
            console.log(e);
        }
    }
}
exports.setupDB = setupDB;
function startedInDebugMode() {
    const args = process.execArgv;
    if (args) {
        return args.some((arg) => /^--debug=?/.test(arg) ||
            /^--debug-brk=?/.test(arg) ||
            /^--inspect=?/.test(arg) ||
            /^--inspect-brk=?/.test(arg));
    }
    return false;
}
// See https://github.com/Microsoft/vscode-languageserver-node/issues/105
function code2ProtocolConverter(value) {
    if (/^win32/.test(process.platform)) {
        // The *first* : is also being encoded which is not the standard for URI on Windows
        // Here we transform it back to the standard way
        return value.toString().replace('%3A', ':');
    }
    else {
        return value.toString();
    }
}
exports.code2ProtocolConverter = code2ProtocolConverter;
function protocol2CodeConverter(value) {
    return vscode.Uri.parse(value);
}
function createLanguageServer(extensionContext) {
    return __awaiter(this, void 0, void 0, function* () {
        const server = yield createServer(extensionContext);
        const client = new vscode_languageclient_1.LanguageClient('apex', messages_1.nls.localize('client_name'), server, buildClientOptions());
        client.onTelemetry(data => telemetry_1.telemetryService.sendEventData('apexLSPLog', data.properties, data.measures));
        return client;
    });
}
exports.createLanguageServer = createLanguageServer;
// exported only for testing
function buildClientOptions() {
    const soqlExtensionInstalled = isSOQLExtensionInstalled();
    return Object.assign({ 
        // Register the server for Apex documents
        documentSelector: [
            { language: 'apex', scheme: 'file' },
            { language: 'apex-anon', scheme: 'file' }
        ], synchronize: {
            configurationSection: 'apex',
            fileEvents: [
                vscode.workspace.createFileSystemWatcher('**/*.cls'),
                vscode.workspace.createFileSystemWatcher('**/*.trigger'),
                vscode.workspace.createFileSystemWatcher('**/*.apex'),
                vscode.workspace.createFileSystemWatcher('**/sfdx-project.json') // SFDX workspace configuration file
            ]
        }, revealOutputChannelOn: vscode_languageclient_1.RevealOutputChannelOn.Never, uriConverters: {
            code2Protocol: code2ProtocolConverter,
            protocol2Code: protocol2CodeConverter
        }, initializationOptions: {
            enableEmbeddedSoqlCompletion: soqlExtensionInstalled
        } }, (soqlExtensionInstalled ? { middleware: embeddedSoql_1.soqlMiddleware } : {}));
}
exports.buildClientOptions = buildClientOptions;
function isSOQLExtensionInstalled() {
    const soqlExtensionName = 'salesforce.salesforcedx-vscode-soql';
    const soqlExtension = vscode.extensions.getExtension(soqlExtensionName);
    return soqlExtension !== undefined;
}
//# sourceMappingURL=languageServer.js.map