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
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const vscode_1 = require("vscode");
const SOQL_SPECIAL_COMPLETION_ITEM_LABEL = '_SOQL_';
const virtualDocumentContents = new Map();
vscode_1.workspace.registerTextDocumentContentProvider('embedded-soql', {
    provideTextDocumentContent: uri => {
        const originalUri = uri.path.replace(/^\//, '').replace(/.soql$/, '');
        return virtualDocumentContents.get(originalUri);
    }
});
function insideSOQLBlock(apexItems) {
    const soqlItem = apexItems.find(i => i.label === SOQL_SPECIAL_COMPLETION_ITEM_LABEL);
    return soqlItem
        ? { queryText: soqlItem.detail, location: soqlItem.data }
        : undefined;
}
function insideApexBindingExpression(document, soqlQuery, position) {
    // Simple heuristic to detect when cursor is on a binding expression
    // (which might have been missed by Apex LSP)
    const rangeAtCursor = document.getWordRangeAtPosition(position, /[:(_\.\w)]+/);
    const wordAtCursor = rangeAtCursor
        ? document.getText(rangeAtCursor)
        : undefined;
    return !!wordAtCursor && wordAtCursor.startsWith(':');
}
function getSOQLVirtualContent(document, position, soqlBlock) {
    const eol = eolForDocument(document);
    const blankedContent = document
        .getText()
        .split(eol)
        .map(line => {
        return ' '.repeat(line.length);
    })
        .join(eol);
    const content = blankedContent.slice(0, soqlBlock.location.startIndex) +
        ' ' +
        soqlBlock.queryText +
        ' ' +
        blankedContent.slice(soqlBlock.location.startIndex + soqlBlock.queryText.length + 2);
    return content;
}
exports.soqlMiddleware = {
    provideCompletionItem: (document, position, context, token, next) => __awaiter(void 0, void 0, void 0, function* () {
        const apexCompletionItems = yield next(document, position, context, token);
        if (!apexCompletionItems) {
            return;
        }
        const items = Array.isArray(apexCompletionItems)
            ? apexCompletionItems
            : apexCompletionItems
                .items;
        const soqlBlock = insideSOQLBlock(items);
        if (soqlBlock) {
            if (!insideApexBindingExpression(document, soqlBlock.queryText, position)) {
                return yield doSOQLCompletion(document, position.with({ character: position.character }), context, soqlBlock);
            }
            else {
                return items.filter(i => i.label !== SOQL_SPECIAL_COMPLETION_ITEM_LABEL);
            }
        }
        else
            return apexCompletionItems;
    })
};
function doSOQLCompletion(document, position, context, soqlBlock) {
    return __awaiter(this, void 0, void 0, function* () {
        const originalUri = document.uri.path;
        virtualDocumentContents.set(originalUri, getSOQLVirtualContent(document, position, soqlBlock));
        const vdocUriString = `embedded-soql://soql/${originalUri}.soql`;
        const vdocUri = vscode_1.Uri.parse(vdocUriString);
        const soqlCompletions = yield vscode_1.commands.executeCommand('vscode.executeCompletionItemProvider', vdocUri, position, context.triggerCharacter);
        return soqlCompletions || [];
    });
}
function eolForDocument(doc) {
    switch (doc.eol) {
        case vscode_1.EndOfLine.LF:
            return '\n';
        case vscode_1.EndOfLine.CRLF:
            return '\r\n';
    }
    return '\n';
}
//# sourceMappingURL=soqlCompletion.js.map