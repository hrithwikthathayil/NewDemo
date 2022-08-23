"use strict";
/*
 * Copyright (c) 2019, salesforce.com, inc.
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
exports.isCLITelemetryAllowed = exports.disableCLITelemetry = exports.isSFDXContainerMode = exports.showCLINotInstalledMessage = exports.isCLIInstalled = void 0;
// import {
// 	ForceConfigGet,
// 	GlobalCliEnvironment,
// } from '../packages/salesforcedx-utils-vscode/src/cli';
const vscode = require("vscode");
const sfdxUtilsExtension = vscode.extensions.getExtension('salesforce.salesforcedx-utils-vscode');
const ForceConfigGet = sfdxUtilsExtension.exports.ForceConfigGet;
const GlobalCliEnvironment = sfdxUtilsExtension.exports.GlobalCliEnvironment;
const shelljs_1 = require("shelljs");
const vscode_1 = require("vscode");
const constants_1 = require("../constants");
const messages_1 = require("../messages");
function isCLIInstalled() {
    let isInstalled = false;
    try {
        if (shelljs_1.which('sfdx')) {
            isInstalled = true;
        }
    }
    catch (e) {
        console.error('An error happened while looking for sfdx cli', e);
    }
    return isInstalled;
}
exports.isCLIInstalled = isCLIInstalled;
function showCLINotInstalledMessage() {
    const showMessage = messages_1.nls.localize('sfdx_cli_not_found', constants_1.SFDX_CLI_DOWNLOAD_LINK, constants_1.SFDX_CLI_DOWNLOAD_LINK);
    vscode_1.window.showWarningMessage(showMessage);
}
exports.showCLINotInstalledMessage = showCLINotInstalledMessage;
function isSFDXContainerMode() {
    return process.env.SFDX_CONTAINER_MODE ? true : false;
}
exports.isSFDXContainerMode = isSFDXContainerMode;
function disableCLITelemetry() {
    GlobalCliEnvironment.environmentVariables.set(constants_1.ENV_SFDX_DISABLE_TELEMETRY, 'true');
}
exports.disableCLITelemetry = disableCLITelemetry;
function isCLITelemetryAllowed(projectPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isCLIInstalled()) {
            const forceConfig = yield new ForceConfigGet().getConfig(projectPath, constants_1.SFDX_CONFIG_DISABLE_TELEMETRY);
            const disabledConfig = forceConfig.get(constants_1.SFDX_CONFIG_DISABLE_TELEMETRY) || '';
            return disabledConfig !== 'true';
        }
        return true;
    });
}
exports.isCLITelemetryAllowed = isCLITelemetryAllowed;
//# sourceMappingURL=cliConfiguration.js.map