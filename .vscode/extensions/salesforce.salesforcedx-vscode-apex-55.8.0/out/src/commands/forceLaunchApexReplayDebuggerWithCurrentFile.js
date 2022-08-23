"use strict";
/*
 * Copyright (c) 2022, salesforce.com, inc.
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
const src_1 = require("@salesforce/salesforcedx-utils-vscode/out/src");
const cli_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/cli");
const commands_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/commands");
const vscode = require("vscode");
const messages_1 = require("../messages");
const testOutlineProvider_1 = require("../views/testOutlineProvider");
const forceAnonApexExecute_1 = require("./forceAnonApexExecute");
function forceLaunchApexReplayDebuggerWithCurrentFile() {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            commands_1.notificationService.showErrorMessage(messages_1.nls.localize('unable_to_locate_editor'));
            return;
        }
        const sourceUri = editor.document.uri;
        if (!sourceUri) {
            commands_1.notificationService.showErrorMessage(messages_1.nls.localize('unable_to_locate_document'));
            return;
        }
        if (isLogFile(sourceUri)) {
            yield launchReplayDebuggerLogFile(sourceUri);
            return;
        }
        if (isAnonymousApexFile(sourceUri)) {
            yield launchAnonymousApexReplayDebugger();
            return;
        }
        const apexTestClassName = yield getApexTestClassName(sourceUri);
        if (apexTestClassName) {
            yield launchApexReplayDebugger(apexTestClassName);
            return;
        }
        commands_1.notificationService.showErrorMessage(messages_1.nls.localize('launch_apex_replay_debugger_unsupported_file'));
    });
}
exports.forceLaunchApexReplayDebuggerWithCurrentFile = forceLaunchApexReplayDebuggerWithCurrentFile;
function isLogFile(sourceUri) {
    return src_1.fileExtensionsMatch(sourceUri, 'log');
}
function isAnonymousApexFile(sourceUri) {
    return src_1.fileExtensionsMatch(sourceUri, 'apex');
}
function launchReplayDebuggerLogFile(sourceUri) {
    return __awaiter(this, void 0, void 0, function* () {
        yield vscode.commands.executeCommand('sfdx.launch.replay.debugger.logfile', {
            fsPath: sourceUri.fsPath
        });
    });
}
function getApexTestClassName(sourceUri) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!sourceUri) {
            return undefined;
        }
        yield testOutlineProvider_1.testOutlineProvider.refresh();
        const testClassName = testOutlineProvider_1.testOutlineProvider.getTestClassName(sourceUri);
        return testClassName;
    });
}
function launchAnonymousApexReplayDebugger() {
    return __awaiter(this, void 0, void 0, function* () {
        const commandlet = new src_1.SfdxCommandlet(new src_1.SfdxWorkspaceChecker(), new src_1.EmptyParametersGatherer(), new ForceAnonApexLaunchReplayDebuggerExecutor());
        yield commandlet.run();
    });
}
function launchApexReplayDebugger(apexTestClassName) {
    return __awaiter(this, void 0, void 0, function* () {
        // Launch using QuickLaunch (the same way the "Debug All Tests" code lens runs)
        yield vscode.commands.executeCommand('sfdx.force.test.view.debugTests', {
            name: apexTestClassName
        });
    });
}
class ForceAnonApexLaunchReplayDebuggerExecutor extends src_1.SfdxCommandletExecutor {
    build() {
        return new cli_1.CommandBuilder(messages_1.nls.localize('force_launch_apex_replay_debugger_with_selected_file'))
            .withLogName('force_launch_apex_replay_debugger_with_selected_file')
            .build();
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            yield forceAnonApexExecute_1.forceAnonApexDebug();
        });
    }
}
exports.ForceAnonApexLaunchReplayDebuggerExecutor = ForceAnonApexLaunchReplayDebuggerExecutor;
//# sourceMappingURL=forceLaunchApexReplayDebuggerWithCurrentFile.js.map