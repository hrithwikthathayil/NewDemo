"use strict";
/*
 * Copyright (c) 2020, salesforce.com, inc.
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
class WorkspaceContext {
    initialize(extensionContext) {
        return __awaiter(this, void 0, void 0, function* () {
            yield src_1.WorkspaceContextUtil.getInstance().initialize(extensionContext);
        });
    }
    static getInstance(forceNew = false) {
        if (!this.instance || forceNew) {
            this.instance = new WorkspaceContext();
        }
        return this.instance;
    }
    getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield src_1.WorkspaceContextUtil.getInstance().getConnection();
        });
    }
}
exports.WorkspaceContext = WorkspaceContext;
//# sourceMappingURL=workspaceContext.js.map