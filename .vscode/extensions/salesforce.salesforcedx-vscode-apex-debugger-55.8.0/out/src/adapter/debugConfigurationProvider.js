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
const src_1 = require("@salesforce/salesforcedx-apex-debugger/out/src");
const vscode = require("vscode");
const messages_1 = require("../messages");
class DebugConfigurationProvider {
    constructor() {
        this.sfdxApex = vscode.extensions.getExtension('salesforce.salesforcedx-vscode-apex');
    }
    static getConfig(folder) {
        return {
            name: messages_1.nls.localize('config_name_text'),
            type: src_1.DEBUGGER_TYPE,
            request: src_1.DEBUGGER_LAUNCH_TYPE,
            userIdFilter: [],
            requestTypeFilter: [],
            entryPointFilter: '',
            sfdxProject: folder ? folder.uri.fsPath : '${workspaceRoot}'
        };
    }
    provideDebugConfigurations(folder, token) {
        return [DebugConfigurationProvider.getConfig(folder)];
    }
    resolveDebugConfiguration(folder, config, token) {
        return this.asyncDebugConfig(folder, config).catch((err) => __awaiter(this, void 0, void 0, function* () {
            return vscode.window
                .showErrorMessage(err.message, { modal: true })
                .then(x => undefined);
        }));
    }
    asyncDebugConfig(folder, config) {
        return __awaiter(this, void 0, void 0, function* () {
            config.name = config.name || messages_1.nls.localize('config_name_text');
            config.type = config.type || src_1.DEBUGGER_TYPE;
            config.request = config.request || src_1.DEBUGGER_LAUNCH_TYPE;
            if (config.userIdFilter === undefined) {
                config.userIdFilter = [];
            }
            if (config.requestTypeFilter === undefined) {
                config.requestTypeFilter = [];
            }
            if (config.entryPointFilter === undefined) {
                config.entryPointFilter = '';
            }
            config.sfdxProject =
                config.sfdxProject || (folder ? folder.uri.fsPath : '${workspaceRoot}');
            if (vscode.workspace) {
                const workspaceConfig = vscode.workspace.getConfiguration();
                config.workspaceSettings = {
                    proxyUrl: workspaceConfig.get('http.proxy', ''),
                    proxyStrictSSL: workspaceConfig.get('http.proxyStrictSSL', false),
                    proxyAuth: workspaceConfig.get('http.proxyAuthorization', ''),
                    connectionTimeoutMs: workspaceConfig.get('salesforcedx-vscode-apex-debugger.connectionTimeoutMs')
                };
            }
            if (this.sfdxApex && this.sfdxApex.exports) {
                yield this.isLanguageClientReady();
                config.lineBreakpointInfo = yield this.sfdxApex.exports.getLineBreakpointInfo();
            }
            return config;
        });
    }
    isLanguageClientReady() {
        return __awaiter(this, void 0, void 0, function* () {
            let expired = false;
            let i = 0;
            while (this.sfdxApex &&
                this.sfdxApex.exports &&
                !this.sfdxApex.exports.languageClientUtils.getStatus().isReady() &&
                !expired) {
                if (this.sfdxApex.exports.languageClientUtils
                    .getStatus()
                    .failedToInitialize()) {
                    throw Error(this.sfdxApex.exports.languageClientUtils
                        .getStatus()
                        .getStatusMessage());
                }
                yield new Promise(r => setTimeout(r, 100));
                if (i >= 30) {
                    expired = true;
                }
                i++;
            }
            if (expired) {
                throw Error(messages_1.nls.localize('language_client_not_ready'));
            }
        });
    }
}
exports.DebugConfigurationProvider = DebugConfigurationProvider;
//# sourceMappingURL=debugConfigurationProvider.js.map