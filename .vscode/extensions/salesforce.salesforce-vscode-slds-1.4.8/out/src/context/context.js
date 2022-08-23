"use strict";
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
const contextKey_1 = require("./contextKey");
class SLDSContext {
    constructor(context, languageClient) {
        this.context = context;
        this.languageClient = languageClient;
        this.syncServer();
    }
    syncServer() {
        this.languageClient.onReady().then(() => {
            for (var key in contextKey_1.ContextKey) {
                const contextKey = key;
                const value = SLDSContext.isEnable(this.context, contextKey);
                this.languageClient.sendNotification('state/updateState', { key, value });
            }
        });
    }
    updateState(key, value) {
        this.context.globalState.update(key, value);
        this.languageClient.onReady().then(() => {
            this.languageClient.sendNotification('state/updateState', { key, value });
        });
    }
    static isEnable(context, ...keys) {
        for (var key in keys) {
            if (context.globalState.get(key) === false) {
                return false;
            }
        }
        return true;
    }
}
exports.SLDSContext = SLDSContext;
//# sourceMappingURL=context.js.map