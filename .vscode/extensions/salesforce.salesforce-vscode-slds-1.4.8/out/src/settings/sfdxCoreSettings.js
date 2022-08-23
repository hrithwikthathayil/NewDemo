"use strict";
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
exports.SfdxCoreSettings = void 0;
const vscode = require("vscode");
const constants_1 = require("../constants");
/**
 * A centralized location for interacting with sfdx-core settings.
 */
class SfdxCoreSettings {
    static getInstance() {
        if (!SfdxCoreSettings.instance) {
            SfdxCoreSettings.instance = new SfdxCoreSettings();
        }
        return SfdxCoreSettings.instance;
    }
    /**
   * Get the configuration for a sfdx-core
   */
    getConfiguration() {
        return vscode.workspace.getConfiguration(constants_1.SFDX_CORE_CONFIGURATION_NAME);
    }
    getShowCLISuccessMsg() {
        return this.getConfigValue(constants_1.SHOW_CLI_SUCCESS_INFO_MSG, true);
    }
    // checks for Microsoft's telemetry setting as well as Salesforce's telemetry setting.
    getTelemetryEnabled() {
        return (vscode.workspace
            .getConfiguration('telemetry')
            .get('enableTelemetry', true) &&
            this.getConfigValue(constants_1.TELEMETRY_ENABLED, true));
    }
    updateShowCLISuccessMsg(value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setConfigValue(constants_1.SHOW_CLI_SUCCESS_INFO_MSG, value);
        });
    }
    getPushOrDeployOnSaveEnabled() {
        return this.getConfigValue(constants_1.PUSH_OR_DEPLOY_ON_SAVE_ENABLED, false);
    }
    getRetrieveTestCodeCoverage() {
        return this.getConfigValue(constants_1.RETRIEVE_TEST_CODE_COVERAGE, false);
    }
    getConfigValue(key, defaultValue) {
        return this.getConfiguration().get(key, defaultValue);
    }
    setConfigValue(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getConfiguration().update(key, value);
        });
    }
}
exports.SfdxCoreSettings = SfdxCoreSettings;
//# sourceMappingURL=sfdxCoreSettings.js.map