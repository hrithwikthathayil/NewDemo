/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const tokens_json_1 = require("./data/tokens.json");
const context_1 = require("./context");
const Kind = vscode.CompletionItemKind;
const documentSelector = { pattern: '**/*.{css}', scheme: 'file' };
const triggerChars = 'abcdefghijklmnopqrstuvwxyz1234567890('.split('');
const kindMap = {
    'box-shadow': undefined,
    'color': Kind.Color,
    'font': Kind.Text,
    'font-size': Kind.Unit,
    'font-weight': Kind.Unit,
    'number': Kind.Unit,
    'opacity': Kind.Unit,
    'shadow': undefined,
    'size': Kind.Unit,
    'string': Kind.Text,
    'text-align': undefined,
    'time': Kind.Unit,
    'z-index': Kind.Unit
};
// determine if current state warrants looking for completion items
// if yes return range of text that would be replaced, if no return undefined
function shouldTriggerCompletions(document, position) {
    // must start with "t(", then letters and numbers, optionally ending with a closing ")"
    let triggerRange = document.getWordRangeAtPosition(position, /\bt\([a-z\d]*\)?/i);
    return triggerRange;
}
// get list of completion items to display, potentially replacing the provided text range
function getCompletions(range) {
    let completions = Object.values(tokens_json_1.default)
        .filter(token => token.deprecated !== 'true')
        .map(token => {
        let completionItem = new vscode.CompletionItem(token.auraToken);
        let text = 't(' + token.auraToken + ')';
        completionItem.kind = kindMap[token.type] || Kind.Value;
        completionItem.filterText = text;
        completionItem.insertText = text;
        completionItem.detail = token.value;
        completionItem.documentation = [token.comment || '', '(' + token.type + ')'].join(' ');
        completionItem.range = range;
        return completionItem;
    });
    return new vscode.CompletionList(completions, false);
}
function register(context) {
    const extensionContext = context;
    const provider = {
        provideCompletionItems(document, position, token, context) {
            let triggerRange = context_1.SLDSContext.isEnable(extensionContext, context_1.ContextKey.GLOBAL, context_1.ContextKey.AUTO_SUGGEST, context_1.ContextKey.DESIGN_TOKEN)
                ? shouldTriggerCompletions(document, position) : false;
            return triggerRange ? getCompletions(triggerRange) : undefined;
        }
    };
    return vscode.languages.registerCompletionItemProvider(documentSelector, provider, ...triggerChars);
}
exports.register = register;
//# sourceMappingURL=sldsAuraTokensProvider.js.map