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
const apex_node_1 = require("@salesforce/apex-node");
const src_1 = require("@salesforce/salesforcedx-utils-vscode/out/src");
const date_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/date");
const path = require("path");
const vscode = require("vscode");
const channels_1 = require("../channels");
const context_1 = require("../context");
const messages_1 = require("../messages");
const LOG_DIRECTORY = path.join(src_1.getRootWorkspaceSfdxPath(), 'tools', 'debug', 'logs');
class LogFileSelector {
    gather() {
        return __awaiter(this, void 0, void 0, function* () {
            const cancellationTokenSource = new vscode.CancellationTokenSource();
            const logInfos = yield this.getLogRecords();
            if (logInfos && logInfos.length > 0) {
                const logItems = logInfos.map(logInfo => {
                    const icon = '$(file-text) ';
                    const localUTCDate = new Date(logInfo.StartTime);
                    const localDateFormatted = localUTCDate.toLocaleDateString(undefined, date_1.optionYYYYMMddHHmmss);
                    return {
                        id: logInfo.Id,
                        label: icon + logInfo.LogUser.Name + ' - ' + logInfo.Operation,
                        startTime: localDateFormatted,
                        detail: localDateFormatted + ' - ' + logInfo.Status.substr(0, 150),
                        description: `${(logInfo.LogLength / 1024).toFixed(2)} KB`
                    };
                });
                const logItem = yield vscode.window.showQuickPick(logItems, { placeHolder: messages_1.nls.localize('force_apex_log_get_pick_log_text') }, cancellationTokenSource.token);
                if (logItem) {
                    return {
                        type: 'CONTINUE',
                        data: { id: logItem.id, startTime: logItem.startTime }
                    };
                }
            }
            else {
                return {
                    type: 'CANCEL',
                    msg: messages_1.nls.localize('force_apex_log_get_no_logs_text')
                };
            }
            return { type: 'CANCEL' };
        });
    }
    getLogRecords() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield context_1.workspaceContext.getConnection();
            const logService = new apex_node_1.LogService(connection);
            return vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: messages_1.nls.localize('force_apex_log_list_text')
            }, () => logService.getLogRecords());
        });
    }
}
exports.LogFileSelector = LogFileSelector;
class ApexLibraryGetLogsExecutor extends src_1.LibraryCommandletExecutor {
    constructor() {
        super(messages_1.nls.localize('force_apex_log_get_text'), 'force_apex_log_get_library', channels_1.OUTPUT_CHANNEL);
    }
    run(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield context_1.workspaceContext.getConnection();
            const logService = new apex_node_1.LogService(connection);
            const { id: logId } = response.data;
            const logResults = yield logService.getLogs({ logId, outputDir: LOG_DIRECTORY });
            logResults.forEach(logResult => channels_1.OUTPUT_CHANNEL.appendLine(logResult.log));
            const logPath = logResults[0].logPath;
            if (logPath) {
                const document = yield vscode.workspace.openTextDocument(logPath);
                vscode.window.showTextDocument(document);
            }
            return true;
        });
    }
}
exports.ApexLibraryGetLogsExecutor = ApexLibraryGetLogsExecutor;
function forceApexLogGet(explorerDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const commandlet = new src_1.SfdxCommandlet(new src_1.SfdxWorkspaceChecker(), new LogFileSelector(), new ApexLibraryGetLogsExecutor());
        yield commandlet.run();
    });
}
exports.forceApexLogGet = forceApexLogGet;
//# sourceMappingURL=forceApexLogGet.js.map