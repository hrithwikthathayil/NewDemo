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
const helpers_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/helpers");
const path = require("path");
const vscode = require("vscode");
const codecoverage_1 = require("./codecoverage");
const commands_1 = require("./commands");
const constants_1 = require("./constants");
const context_1 = require("./context");
const languageClientUtils_1 = require("./languageClientUtils");
const languageServer = require("./languageServer");
const messages_1 = require("./messages");
const telemetry_1 = require("./telemetry");
const testOutlineProvider_1 = require("./views/testOutlineProvider");
const testRunner_1 = require("./views/testRunner");
let languageClient;
function activate(extensionContext) {
    return __awaiter(this, void 0, void 0, function* () {
        const extensionHRStart = process.hrtime();
        if (vscode.workspace && vscode.workspace.workspaceFolders) {
            const apexDirPath = helpers_1.getTestResultsFolder(vscode.workspace.workspaceFolders[0].uri.fsPath, 'apex');
            const testResultOutput = path.join(apexDirPath, '*.json');
            const testResultFileWatcher = vscode.workspace.createFileSystemWatcher(testResultOutput);
            testResultFileWatcher.onDidCreate(uri => testOutlineProvider_1.testOutlineProvider.onResultFileCreate(apexDirPath, uri.fsPath));
            testResultFileWatcher.onDidChange(uri => testOutlineProvider_1.testOutlineProvider.onResultFileCreate(apexDirPath, uri.fsPath));
            extensionContext.subscriptions.push(testResultFileWatcher);
        }
        else {
            throw new Error(messages_1.nls.localize('cannot_determine_workspace'));
        }
        // Workspace Context
        yield context_1.workspaceContext.initialize(extensionContext);
        // Telemetry
        const extensionPackage = require(extensionContext.asAbsolutePath('./package.json'));
        yield telemetry_1.telemetryService.initializeService(extensionContext, constants_1.APEX_EXTENSION_NAME, extensionPackage.aiKey, extensionPackage.version);
        // Initialize Apex language server
        try {
            const langClientHRStart = process.hrtime();
            languageClient = yield languageServer.createLanguageServer(extensionContext);
            languageClientUtils_1.languageClientUtils.setClientInstance(languageClient);
            const handle = languageClient.start();
            languageClientUtils_1.languageClientUtils.setStatus(languageClientUtils_1.ClientStatus.Indexing, '');
            extensionContext.subscriptions.push(handle);
            languageClient
                .onReady()
                .then(() => __awaiter(this, void 0, void 0, function* () {
                if (languageClient) {
                    languageClient.onNotification('indexer/done', () => __awaiter(this, void 0, void 0, function* () {
                        yield testOutlineProvider_1.testOutlineProvider.refresh();
                    }));
                }
                // TODO: This currently keeps existing behavior in which we set the language
                // server to ready before it finishes indexing. We'll evaluate this in the future.
                languageClientUtils_1.languageClientUtils.setStatus(languageClientUtils_1.ClientStatus.Ready, '');
                const startTime = telemetry_1.telemetryService.getEndHRTime(langClientHRStart);
                telemetry_1.telemetryService.sendEventData('apexLSPStartup', undefined, {
                    activationTime: startTime
                });
            }))
                .catch(err => {
                // Handled by clients
                telemetry_1.telemetryService.sendException(constants_1.LSP_ERR, err.message);
                languageClientUtils_1.languageClientUtils.setStatus(languageClientUtils_1.ClientStatus.Error, messages_1.nls.localize('apex_language_server_failed_activate'));
            });
        }
        catch (e) {
            console.error('Apex language server failed to initialize');
            languageClientUtils_1.languageClientUtils.setStatus(languageClientUtils_1.ClientStatus.Error, e);
        }
        // Javadoc support
        languageClientUtils_1.enableJavaDocSymbols();
        // Commands
        const commands = registerCommands();
        extensionContext.subscriptions.push(commands);
        extensionContext.subscriptions.push(yield registerTestView());
        const exportedApi = {
            getLineBreakpointInfo: languageClientUtils_1.getLineBreakpointInfo,
            getExceptionBreakpointInfo: languageClientUtils_1.getExceptionBreakpointInfo,
            getApexTests: languageClientUtils_1.getApexTests,
            languageClientUtils: languageClientUtils_1.languageClientUtils
        };
        telemetry_1.telemetryService.sendExtensionActivationEvent(extensionHRStart);
        return exportedApi;
    });
}
exports.activate = activate;
function registerCommands() {
    // Colorize code coverage
    const statusBarToggle = new codecoverage_1.StatusBarToggle();
    const colorizer = new codecoverage_1.CodeCoverage(statusBarToggle);
    const forceApexToggleColorizerCmd = vscode.commands.registerCommand('sfdx.force.apex.toggle.colorizer', () => colorizer.toggleCoverage());
    // Customer-facing commands
    const forceApexTestClassRunDelegateCmd = vscode.commands.registerCommand('sfdx.force.apex.test.class.run.delegate', commands_1.forceApexTestClassRunCodeActionDelegate);
    const forceApexTestLastClassRunCmd = vscode.commands.registerCommand('sfdx.force.apex.test.last.class.run', commands_1.forceApexTestClassRunCodeAction);
    const forceApexTestClassRunCmd = vscode.commands.registerCommand('sfdx.force.apex.test.class.run', commands_1.forceApexTestClassRunCodeAction);
    const forceApexTestMethodRunDelegateCmd = vscode.commands.registerCommand('sfdx.force.apex.test.method.run.delegate', commands_1.forceApexTestMethodRunCodeActionDelegate);
    const forceApexDebugClassRunDelegateCmd = vscode.commands.registerCommand('sfdx.force.apex.debug.class.run.delegate', commands_1.forceApexDebugClassRunCodeActionDelegate);
    const forceApexDebugMethodRunDelegateCmd = vscode.commands.registerCommand('sfdx.force.apex.debug.method.run.delegate', commands_1.forceApexDebugMethodRunCodeActionDelegate);
    // TODO: remove forceApexAnonRunDelegateCmd
    // forceApexAnonRunDelegateCmd is a duplicate of forceAnonApexRunDelegateCmd
    // and needs to be removed after the Apex language server is updated.
    const forceApexAnonRunDelegateCmd = vscode.commands.registerCommand('sfdx.force.apex.anon.run.delegate', commands_1.forceAnonApexExecute);
    const forceAnonApexRunDelegateCmd = vscode.commands.registerCommand('sfdx.force.anon.apex.run.delegate', commands_1.forceAnonApexExecute);
    const forceAnonApexDebugDelegateCmd = vscode.commands.registerCommand('sfdx.force.anon.apex.debug.delegate', commands_1.forceAnonApexDebug);
    const forceApexLogGetCmd = vscode.commands.registerCommand('sfdx.force.apex.log.get', commands_1.forceApexLogGet);
    const forceApexTestLastMethodRunCmd = vscode.commands.registerCommand('sfdx.force.apex.test.last.method.run', commands_1.forceApexTestMethodRunCodeAction);
    const forceApexTestMethodRunCmd = vscode.commands.registerCommand('sfdx.force.apex.test.method.run', commands_1.forceApexTestMethodRunCodeAction);
    const forceApexTestSuiteCreateCmd = vscode.commands.registerCommand('sfdx.force.apex.test.suite.create', commands_1.forceApexTestSuiteCreate);
    const forceApexTestSuiteRunCmd = vscode.commands.registerCommand('sfdx.force.apex.test.suite.run', commands_1.forceApexTestSuiteRun);
    const forceApexTestSuiteAddCmd = vscode.commands.registerCommand('sfdx.force.apex.test.suite.add', commands_1.forceApexTestSuiteAdd);
    const forceApexTestRunCmd = vscode.commands.registerCommand('sfdx.force.apex.test.run', commands_1.forceApexTestRun);
    const forceAnonApexExecuteDocumentCmd = vscode.commands.registerCommand('sfdx.force.anon.apex.execute.document', commands_1.forceAnonApexExecute);
    const forceAnonApexDebugDocumentCmd = vscode.commands.registerCommand('sfdx.force.apex.debug.document', commands_1.forceAnonApexDebug);
    const forceAnonApexExecuteSelectionCmd = vscode.commands.registerCommand('sfdx.force.anon.apex.execute.selection', commands_1.forceAnonApexExecute);
    const forceLaunchApexReplayDebuggerWithCurrentFileCmd = vscode.commands.registerCommand('sfdx.force.launch.apex.replay.debugger.with.current.file', commands_1.forceLaunchApexReplayDebuggerWithCurrentFile);
    return vscode.Disposable.from(forceApexDebugClassRunDelegateCmd, forceApexDebugMethodRunDelegateCmd, forceApexAnonRunDelegateCmd, forceAnonApexRunDelegateCmd, forceAnonApexDebugDelegateCmd, forceAnonApexExecuteDocumentCmd, forceAnonApexExecuteSelectionCmd, forceAnonApexDebugDocumentCmd, forceLaunchApexReplayDebuggerWithCurrentFileCmd, forceApexLogGetCmd, forceApexTestClassRunCmd, forceApexTestClassRunDelegateCmd, forceApexTestLastClassRunCmd, forceApexTestLastMethodRunCmd, forceApexTestMethodRunCmd, forceApexTestMethodRunDelegateCmd, forceApexTestRunCmd, forceApexToggleColorizerCmd, forceApexTestSuiteCreateCmd, forceApexTestSuiteRunCmd, forceApexTestSuiteAddCmd);
}
function registerTestView() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create TestRunner
        const testRunner = new testRunner_1.ApexTestRunner(testOutlineProvider_1.testOutlineProvider);
        // Test View
        const testViewItems = new Array();
        const testProvider = vscode.window.registerTreeDataProvider('sfdx.force.test.view', testOutlineProvider_1.testOutlineProvider);
        testViewItems.push(testProvider);
        // Run Test Button on Test View command
        testViewItems.push(vscode.commands.registerCommand('sfdx.force.test.view.run', () => testRunner.runAllApexTests()));
        // Show Error Message command
        testViewItems.push(vscode.commands.registerCommand('sfdx.force.test.view.showError', test => testRunner.showErrorMessage(test)));
        // Show Definition command
        testViewItems.push(vscode.commands.registerCommand('sfdx.force.test.view.goToDefinition', test => testRunner.showErrorMessage(test)));
        // Run Class Tests command
        testViewItems.push(vscode.commands.registerCommand('sfdx.force.test.view.runClassTests', test => testRunner.runApexTests([test.name], testRunner_1.TestRunType.Class)));
        // Run Single Test command
        testViewItems.push(vscode.commands.registerCommand('sfdx.force.test.view.runSingleTest', test => testRunner.runApexTests([test.name], testRunner_1.TestRunType.Method)));
        // Refresh Test View command
        testViewItems.push(vscode.commands.registerCommand('sfdx.force.test.view.refresh', () => {
            if (languageClientUtils_1.languageClientUtils.getStatus().isReady()) {
                return testOutlineProvider_1.testOutlineProvider.refresh();
            }
        }));
        return vscode.Disposable.from(...testViewItems);
    });
}
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        telemetry_1.telemetryService.sendExtensionDeactivationEvent();
    });
}
exports.deactivate = deactivate;
//# sourceMappingURL=index.js.map