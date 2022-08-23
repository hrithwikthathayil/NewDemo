/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const sldsLanguageClient_1 = require("./sldsLanguageClient");
const componentsProvider = require("./sldsComponentsProvider");
const utilitiesProvider = require("./sldsUtilitiesProvider");
const varTokensProvider = require("./sldsVarTokensProvider");
const auraTokensProvider = require("./sldsAuraTokensProvider");
const commands_1 = require("./commands");
const telemetry_1 = require("./telemetry");
const outputChannel = vscode.window.createOutputChannel(`SLDS`);
function activate(context) {
    // Telemetry service
    const machineId = vscode && vscode.env ? vscode.env.machineId : 'someValue.machineId';
    telemetry_1.telemetryService.initializeService(context, machineId);
    telemetry_1.telemetryService.showTelemetryMessage();
    const extensionHRStart = process.hrtime();
    // SLDS validation language client
    outputChannel.append(`Starting SLDS ... `);
    const languageClient = sldsLanguageClient_1.createLanguageClient(context, outputChannel);
    context.subscriptions.push(languageClient.start());
    // SLDS Commands
    outputChannel.append(`registering commands ... `);
    const commands = new commands_1.Commands(context, languageClient, outputChannel);
    commands.register();
    outputChannel.appendLine(`registering providers`);
    // SLDS components completion provider
    let components = componentsProvider.register(context);
    context.subscriptions.push(components);
    // SLDS utilities completion provider
    let utilities = utilitiesProvider.register(context);
    context.subscriptions.push(utilities);
    // SLDS var tokens completion provider
    let varTokens = varTokensProvider.register(context);
    context.subscriptions.push(varTokens);
    // SLDS aura tokens completion provider
    let auraTokens = auraTokensProvider.register(context);
    context.subscriptions.push(auraTokens);
    // send activationEvent
    telemetry_1.telemetryService.sendExtensionActivationEvent(extensionHRStart);
}
exports.activate = activate;
function deactivate() {
    telemetry_1.telemetryService.sendExtensionDeactivationEvent();
    return;
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map