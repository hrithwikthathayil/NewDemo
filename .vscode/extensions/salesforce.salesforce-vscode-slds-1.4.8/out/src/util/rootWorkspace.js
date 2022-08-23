"use strict";
/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRootWorkspacePath = exports.getRootWorkspace = exports.hasRootWorkspace = void 0;
const vscode_1 = require("vscode");
function hasRootWorkspace(ws = vscode_1.workspace) {
    return ws && ws.workspaceFolders && ws.workspaceFolders.length > 0;
}
exports.hasRootWorkspace = hasRootWorkspace;
function getRootWorkspace() {
    return hasRootWorkspace()
        ? vscode_1.workspace.workspaceFolders[0]
        : {};
}
exports.getRootWorkspace = getRootWorkspace;
function getRootWorkspacePath() {
    return getRootWorkspace().uri ? getRootWorkspace().uri.fsPath : '';
}
exports.getRootWorkspacePath = getRootWorkspacePath;
//# sourceMappingURL=rootWorkspace.js.map