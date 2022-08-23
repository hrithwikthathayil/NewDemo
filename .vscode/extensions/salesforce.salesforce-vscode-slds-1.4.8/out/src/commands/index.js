/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const context_1 = require("./../context");
class Commands {
    constructor(context, languageClient, outputChannel) {
        this.context = new context_1.SLDSContext(context, languageClient);
        this.outputChannel = outputChannel;
    }
    register() {
        vscode.commands.registerCommand('slds.enable', () => this.context.updateState(context_1.ContextKey.GLOBAL, true));
        vscode.commands.registerCommand('slds.disable', () => this.context.updateState(context_1.ContextKey.GLOBAL, false));
        vscode.commands.registerCommand('slds.enable:density', () => this.context.updateState(context_1.ContextKey.DENSITY, true));
        vscode.commands.registerCommand('slds.disable:density', () => this.context.updateState(context_1.ContextKey.DENSITY, false));
        vscode.commands.registerCommand('slds.enable:utility', () => this.context.updateState(context_1.ContextKey.UTILITY_CLASS, true));
        vscode.commands.registerCommand('slds.disable:utility', () => this.context.updateState(context_1.ContextKey.UTILITY_CLASS, false));
        vscode.commands.registerCommand('slds.enable:bem', () => this.context.updateState(context_1.ContextKey.BEM, true));
        vscode.commands.registerCommand('slds.disable:bem', () => this.context.updateState(context_1.ContextKey.BEM, false));
        vscode.commands.registerCommand('slds.enable:deprecated', () => this.context.updateState(context_1.ContextKey.DEPRECATED, true));
        vscode.commands.registerCommand('slds.disable:deprecated', () => this.context.updateState(context_1.ContextKey.DEPRECATED, false));
        vscode.commands.registerCommand('slds.enable:invalid', () => this.context.updateState(context_1.ContextKey.INVALID, true));
        vscode.commands.registerCommand('slds.disable:invalid', () => this.context.updateState(context_1.ContextKey.INVALID, false));
        vscode.commands.registerCommand('slds.enable:override', () => this.context.updateState(context_1.ContextKey.OVERRIDE, true));
        vscode.commands.registerCommand('slds.disable:override', () => this.context.updateState(context_1.ContextKey.OVERRIDE, false));
        vscode.commands.registerCommand('slds.enable:designToken', () => this.context.updateState(context_1.ContextKey.DESIGN_TOKEN, true));
        vscode.commands.registerCommand('slds.disable:designToken', () => this.context.updateState(context_1.ContextKey.DESIGN_TOKEN, false));
        vscode.commands.registerCommand('slds.enable:autoSuggest', () => this.context.updateState(context_1.ContextKey.AUTO_SUGGEST, true));
        vscode.commands.registerCommand('slds.disable:autoSuggest', () => this.context.updateState(context_1.ContextKey.AUTO_SUGGEST, false));
    }
}
exports.Commands = Commands;
//# sourceMappingURL=index.js.map