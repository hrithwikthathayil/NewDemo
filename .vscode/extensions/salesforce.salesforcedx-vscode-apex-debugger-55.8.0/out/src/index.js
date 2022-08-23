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
const src_1 = require("@salesforce/salesforcedx-apex-debugger/out/src");
const path = require("path");
const vscode = require("vscode");
const debugConfigurationProvider_1 = require("./adapter/debugConfigurationProvider");
const context_1 = require("./context");
const messages_1 = require("./messages");
const telemetry_1 = require("./telemetry");
const cachedExceptionBreakpoints = new Map();
const sfdxCoreExtension = vscode.extensions.getExtension('salesforce.salesforcedx-vscode-core');
function getDebuggerType(session) {
    return __awaiter(this, void 0, void 0, function* () {
        let type = session.type;
        if (type === src_1.LIVESHARE_DEBUGGER_TYPE) {
            type = yield session.customRequest(src_1.LIVESHARE_DEBUG_TYPE_REQUEST);
        }
        return type;
    });
}
exports.getDebuggerType = getDebuggerType;
function registerCommands() {
    const customEventHandler = vscode.debug.onDidReceiveDebugSessionCustomEvent((event) => __awaiter(this, void 0, void 0, function* () {
        if (event && event.session) {
            const type = yield getDebuggerType(event.session);
            if (type === src_1.DEBUGGER_TYPE && event.event === src_1.SHOW_MESSAGE_EVENT) {
                const eventBody = event.body;
                if (eventBody && eventBody.type && eventBody.message) {
                    switch (eventBody.type) {
                        case src_1.VscodeDebuggerMessageType.Info: {
                            vscode.window.showInformationMessage(eventBody.message);
                            break;
                        }
                        case src_1.VscodeDebuggerMessageType.Warning: {
                            vscode.window.showWarningMessage(eventBody.message);
                            break;
                        }
                        case src_1.VscodeDebuggerMessageType.Error: {
                            vscode.window.showErrorMessage(eventBody.message);
                            break;
                        }
                    }
                }
            }
        }
    }));
    const exceptionBreakpointCmd = vscode.commands.registerCommand('sfdx.debug.exception.breakpoint', configureExceptionBreakpoint);
    const startSessionHandler = vscode.debug.onDidStartDebugSession(session => {
        cachedExceptionBreakpoints.forEach(breakpoint => {
            const args = {
                exceptionInfo: breakpoint
            };
            session.customRequest(src_1.EXCEPTION_BREAKPOINT_REQUEST, args);
        });
    });
    return vscode.Disposable.from(customEventHandler, exceptionBreakpointCmd, startSessionHandler);
}
const EXCEPTION_BREAK_MODES = [
    {
        label: messages_1.nls.localize('always_break_text'),
        description: '',
        breakMode: src_1.EXCEPTION_BREAKPOINT_BREAK_MODE_ALWAYS
    },
    {
        label: messages_1.nls.localize('never_break_text'),
        description: '',
        breakMode: src_1.EXCEPTION_BREAKPOINT_BREAK_MODE_NEVER
    }
];
function configureExceptionBreakpoint() {
    return __awaiter(this, void 0, void 0, function* () {
        const sfdxApex = vscode.extensions.getExtension('salesforce.salesforcedx-vscode-apex');
        if (sfdxApex && sfdxApex.exports) {
            const exceptionBreakpointInfos = yield sfdxApex.exports.getExceptionBreakpointInfo();
            console.log('Retrieved exception breakpoint info from language server');
            let enabledExceptionBreakpointTyperefs = [];
            if (vscode.debug.activeDebugSession) {
                const responseBody = yield vscode.debug.activeDebugSession.customRequest(src_1.LIST_EXCEPTION_BREAKPOINTS_REQUEST);
                if (responseBody && responseBody.typerefs) {
                    enabledExceptionBreakpointTyperefs = responseBody.typerefs;
                }
            }
            else {
                enabledExceptionBreakpointTyperefs = Array.from(cachedExceptionBreakpoints.keys());
            }
            const processedBreakpointInfos = mergeExceptionBreakpointInfos(exceptionBreakpointInfos, enabledExceptionBreakpointTyperefs);
            const selectExceptionOptions = {
                placeHolder: messages_1.nls.localize('select_exception_text'),
                matchOnDescription: true
            };
            const selectedException = yield vscode.window.showQuickPick(processedBreakpointInfos, selectExceptionOptions);
            if (selectedException) {
                const selectBreakModeOptions = {
                    placeHolder: messages_1.nls.localize('select_break_option_text'),
                    matchOnDescription: true
                };
                const selectedBreakMode = yield vscode.window.showQuickPick(EXCEPTION_BREAK_MODES, selectBreakModeOptions);
                if (selectedBreakMode) {
                    selectedException.breakMode = selectedBreakMode.breakMode;
                    const args = {
                        exceptionInfo: selectedException
                    };
                    if (vscode.debug.activeDebugSession) {
                        yield vscode.debug.activeDebugSession.customRequest(src_1.EXCEPTION_BREAKPOINT_REQUEST, args);
                    }
                    updateExceptionBreakpointCache(selectedException);
                }
            }
        }
    });
}
function mergeExceptionBreakpointInfos(breakpointInfos, enabledBreakpointTyperefs) {
    const processedBreakpointInfos = [];
    if (enabledBreakpointTyperefs.length > 0) {
        for (let i = breakpointInfos.length - 1; i >= 0; i--) {
            if (enabledBreakpointTyperefs.indexOf(breakpointInfos[i].typeref) >= 0) {
                breakpointInfos[i].breakMode = src_1.EXCEPTION_BREAKPOINT_BREAK_MODE_ALWAYS;
                breakpointInfos[i].description = `$(stop) ${messages_1.nls.localize('always_break_text')}`;
                processedBreakpointInfos.unshift(breakpointInfos[i]);
                breakpointInfos.splice(i, 1);
            }
        }
    }
    return processedBreakpointInfos.concat(breakpointInfos);
}
exports.mergeExceptionBreakpointInfos = mergeExceptionBreakpointInfos;
function updateExceptionBreakpointCache(selectedException) {
    if (selectedException.breakMode === src_1.EXCEPTION_BREAKPOINT_BREAK_MODE_ALWAYS &&
        !cachedExceptionBreakpoints.has(selectedException.typeref)) {
        cachedExceptionBreakpoints.set(selectedException.typeref, selectedException);
    }
    else if (selectedException.breakMode === src_1.EXCEPTION_BREAKPOINT_BREAK_MODE_NEVER &&
        cachedExceptionBreakpoints.has(selectedException.typeref)) {
        cachedExceptionBreakpoints.delete(selectedException.typeref);
    }
}
exports.updateExceptionBreakpointCache = updateExceptionBreakpointCache;
function getExceptionBreakpointCache() {
    return cachedExceptionBreakpoints;
}
exports.getExceptionBreakpointCache = getExceptionBreakpointCache;
function registerFileWatchers() {
    const clsWatcher = vscode.workspace.createFileSystemWatcher('**/*.cls');
    clsWatcher.onDidChange(uri => notifyDebuggerSessionFileChanged());
    clsWatcher.onDidCreate(uri => notifyDebuggerSessionFileChanged());
    clsWatcher.onDidDelete(uri => notifyDebuggerSessionFileChanged());
    const trgWatcher = vscode.workspace.createFileSystemWatcher('**/*.trigger');
    trgWatcher.onDidChange(uri => notifyDebuggerSessionFileChanged());
    trgWatcher.onDidCreate(uri => notifyDebuggerSessionFileChanged());
    trgWatcher.onDidDelete(uri => notifyDebuggerSessionFileChanged());
    return vscode.Disposable.from(clsWatcher, trgWatcher);
}
function notifyDebuggerSessionFileChanged() {
    if (vscode.debug.activeDebugSession) {
        vscode.debug.activeDebugSession.customRequest(src_1.HOTSWAP_REQUEST);
    }
}
function registerIsvAuthWatcher(extensionContext) {
    if (vscode.workspace.workspaceFolders instanceof Array &&
        vscode.workspace.workspaceFolders.length > 0) {
        const configPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.sfdx', 'sfdx-config.json');
        const isvAuthWatcher = vscode.workspace.createFileSystemWatcher(configPath);
        isvAuthWatcher.onDidChange(uri => context_1.setupGlobalDefaultUserIsvAuth());
        isvAuthWatcher.onDidCreate(uri => context_1.setupGlobalDefaultUserIsvAuth());
        isvAuthWatcher.onDidDelete(uri => context_1.setupGlobalDefaultUserIsvAuth());
        extensionContext.subscriptions.push(isvAuthWatcher);
    }
}
function activate(extensionContext) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Apex Debugger Extension Activated');
        const extensionHRStart = process.hrtime();
        const commands = registerCommands();
        const fileWatchers = registerFileWatchers();
        extensionContext.subscriptions.push(commands, fileWatchers);
        extensionContext.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('apex', new debugConfigurationProvider_1.DebugConfigurationProvider()));
        if (sfdxCoreExtension && sfdxCoreExtension.exports) {
            if (sfdxCoreExtension.exports.isCLIInstalled()) {
                console.log('Setting up ISV Debugger environment variables');
                // register watcher for ISV authentication and setup default user for CLI
                // this is done in core because it shares access to GlobalCliEnvironment with the commands
                // (VS Code does not seem to allow sharing npm modules between extensions)
                try {
                    registerIsvAuthWatcher(extensionContext);
                    console.log('Configured file watcher for .sfdx/sfdx-config.json');
                    yield context_1.setupGlobalDefaultUserIsvAuth();
                }
                catch (e) {
                    console.error(e);
                    vscode.window.showWarningMessage(messages_1.nls.localize('isv_debug_config_environment_error'));
                }
            }
            // Telemetry
            telemetry_1.telemetryService.initializeService(sfdxCoreExtension.exports.telemetryService.getReporter(), sfdxCoreExtension.exports.telemetryService.isTelemetryEnabled());
        }
        telemetry_1.telemetryService.sendExtensionActivationEvent(extensionHRStart);
    });
}
exports.activate = activate;
function deactivate() {
    console.log('Apex Debugger Extension Deactivated');
    telemetry_1.telemetryService.sendExtensionDeactivationEvent();
}
exports.deactivate = deactivate;
//# sourceMappingURL=index.js.map