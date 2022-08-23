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
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const context_1 = require("@salesforce/salesforcedx-apex-debugger/out/src/context");
const vscode = require("vscode");
function setupGlobalDefaultUserIsvAuth() {
    return __awaiter(this, void 0, void 0, function* () {
        const isvUtil = new context_1.IsvContextUtil();
        if (vscode.workspace &&
            vscode.workspace.workspaceFolders &&
            vscode.workspace.workspaceFolders[0]) {
            const isvDebugProject = yield isvUtil.setIsvDebuggerContext(vscode.workspace.workspaceFolders[0].uri.fsPath);
            vscode.commands.executeCommand('setContext', 'sfdx:isv_debug_project', isvDebugProject);
            const isvDebugMsg = isvDebugProject
                ? 'Configured ISV Project Authentication'
                : 'Project is not for ISV Debugger';
            console.log(isvDebugMsg);
        }
        // reset any auth
        isvUtil.resetCliEnvironmentVars();
    });
}
exports.setupGlobalDefaultUserIsvAuth = setupGlobalDefaultUserIsvAuth;
//# sourceMappingURL=isvContext.js.map