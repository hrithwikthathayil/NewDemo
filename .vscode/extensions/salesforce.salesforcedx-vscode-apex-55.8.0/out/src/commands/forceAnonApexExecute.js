"use strict";
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
/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const apex_node_1 = require("@salesforce/apex-node");
const src_1 = require("@salesforce/salesforcedx-utils-vscode/out/src");
const date_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/date");
const helpers_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/helpers");
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const channels_1 = require("../channels");
const context_1 = require("../context");
const messages_1 = require("../messages");
class AnonApexGatherer {
    gather() {
        return __awaiter(this, void 0, void 0, function* () {
            if (src_1.hasRootWorkspace()) {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    return { type: 'CANCEL' };
                }
                const document = editor.document;
                if (!editor.selection.isEmpty ||
                    document.isUntitled ||
                    document.isDirty) {
                    return {
                        type: 'CONTINUE',
                        data: {
                            apexCode: !editor.selection.isEmpty
                                ? document.getText(editor.selection)
                                : document.getText(),
                            selection: !editor.selection.isEmpty
                                ? new vscode.Range(editor.selection.start, editor.selection.end)
                                : undefined
                        }
                    };
                }
                return { type: 'CONTINUE', data: { fileName: document.uri.fsPath } };
            }
            return { type: 'CANCEL' };
        });
    }
}
exports.AnonApexGatherer = AnonApexGatherer;
class AnonApexLibraryExecuteExecutor extends src_1.LibraryCommandletExecutor {
    constructor(isDebugging) {
        super(messages_1.nls.localize('apex_execute_text'), 'force_apex_execute_library', channels_1.OUTPUT_CHANNEL);
        this.isDebugging = isDebugging;
    }
    run(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield context_1.workspaceContext.getConnection();
            if (this.isDebugging) {
                if (!(yield this.setUpTraceFlags(connection))) {
                    return false;
                }
            }
            const executeService = new apex_node_1.ExecuteService(connection);
            const { apexCode, fileName: apexFilePath, selection } = response.data;
            const result = yield executeService.executeAnonymous({
                apexFilePath,
                apexCode
            });
            this.processResult(result, apexFilePath, selection);
            if (this.isDebugging) {
                return yield this.launchReplayDebugger(result.logs);
            }
            return true;
        });
    }
    setUpTraceFlags(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            const traceFlags = new helpers_1.TraceFlags(connection);
            if (!(yield traceFlags.ensureTraceFlags())) {
                return false;
            }
            return true;
        });
    }
    processResult(result, apexFilePath, selection) {
        this.outputResult(result);
        const editor = vscode.window.activeTextEditor;
        const document = editor.document;
        const filePath = apexFilePath !== null && apexFilePath !== void 0 ? apexFilePath : document.uri.fsPath;
        this.handleDiagnostics(result, filePath, selection);
    }
    launchReplayDebugger(logs) {
        return __awaiter(this, void 0, void 0, function* () {
            const logFilePath = this.getLogFilePath();
            if (!this.saveLogFile(logFilePath, logs)) {
                return false;
            }
            yield vscode.commands.executeCommand('sfdx.launch.replay.debugger.logfile.path', logFilePath);
            return true;
        });
    }
    getLogFilePath() {
        const outputDir = src_1.getLogDirPath();
        const now = new Date();
        const localDateFormatted = date_1.getYYYYMMddHHmmssDateFormat(now);
        const logFilePath = path.join(outputDir, `${localDateFormatted}.log`);
        return logFilePath;
    }
    saveLogFile(logFilePath, logs) {
        if (!logFilePath || !logs) {
            return false;
        }
        fs.writeFileSync(logFilePath, logs);
        return true;
    }
    outputResult(response) {
        let outputText = '';
        if (response.success) {
            outputText += `${messages_1.nls.localize('apex_execute_compile_success')}\n`;
            outputText += `${messages_1.nls.localize('apex_execute_runtime_success')}\n`;
            outputText += `\n${response.logs}`;
        }
        else {
            const diagnostic = response.diagnostic[0];
            if (!response.compiled) {
                outputText += `Error: Line: ${diagnostic.lineNumber}, Column: ${diagnostic.columnNumber}\n`;
                outputText += `Error: ${diagnostic.compileProblem}\n`;
            }
            else {
                outputText += `${messages_1.nls.localize('apex_execute_compile_success')}\n`;
                outputText += `Error: ${diagnostic.exceptionMessage}\n`;
                outputText += `Error: ${diagnostic.exceptionStackTrace}\n`;
                outputText += `\n${response.logs}`;
            }
        }
        channels_1.channelService.appendLine(outputText);
    }
    handleDiagnostics(response, filePath, selection) {
        AnonApexLibraryExecuteExecutor.diagnostics.clear();
        if (response.diagnostic) {
            const { compileProblem, exceptionMessage, lineNumber, columnNumber } = response.diagnostic[0];
            let message;
            if (compileProblem && compileProblem !== '') {
                message = compileProblem;
            }
            else if (exceptionMessage && exceptionMessage !== '') {
                message = exceptionMessage;
            }
            else {
                message = messages_1.nls.localize('apex_execute_unexpected_error');
            }
            const vscDiagnostic = {
                message,
                severity: vscode.DiagnosticSeverity.Error,
                source: filePath,
                range: this.adjustErrorRange(Number(lineNumber), Number(columnNumber), selection)
            };
            AnonApexLibraryExecuteExecutor.diagnostics.set(vscode.Uri.file(filePath), [
                vscDiagnostic
            ]);
        }
    }
    adjustErrorRange(lineNumber, columnNumber, selection) {
        const lineOffset = selection ? selection.start.line : 0;
        const adjustedLine = lineNumber ? lineNumber + lineOffset : 1;
        return this.getZeroBasedRange(adjustedLine, columnNumber || 1);
    }
    getZeroBasedRange(line, column) {
        const pos = new vscode.Position(line > 0 ? line - 1 : 0, column > 0 ? column - 1 : 0);
        return new vscode.Range(pos, pos);
    }
}
exports.AnonApexLibraryExecuteExecutor = AnonApexLibraryExecuteExecutor;
AnonApexLibraryExecuteExecutor.diagnostics = vscode.languages.createDiagnosticCollection('apex-errors');
function forceAnonApexExecute() {
    return __awaiter(this, void 0, void 0, function* () {
        const commandlet = new src_1.SfdxCommandlet(new src_1.SfdxWorkspaceChecker(), new AnonApexGatherer(), new AnonApexLibraryExecuteExecutor(false));
        yield commandlet.run();
    });
}
exports.forceAnonApexExecute = forceAnonApexExecute;
function forceAnonApexDebug() {
    return __awaiter(this, void 0, void 0, function* () {
        const commandlet = new src_1.SfdxCommandlet(new src_1.SfdxWorkspaceChecker(), new AnonApexGatherer(), new AnonApexLibraryExecuteExecutor(true));
        yield commandlet.run();
    });
}
exports.forceAnonApexDebug = forceAnonApexDebug;
//# sourceMappingURL=forceAnonApexExecute.js.map