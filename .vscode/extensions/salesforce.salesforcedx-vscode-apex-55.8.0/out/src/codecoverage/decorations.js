"use strict";
/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const lime = (opacity) => `rgba(45, 121, 11, ${opacity})`;
const red = (opacity) => `rgba(253, 72, 73, ${opacity})`;
exports.coveredLinesDecorationType = vscode_1.window.createTextEditorDecorationType({
    backgroundColor: lime(0.5),
    borderRadius: '.2em',
    overviewRulerColor: lime(0.5)
});
exports.uncoveredLinesDecorationType = vscode_1.window.createTextEditorDecorationType({
    backgroundColor: red(0.5),
    borderRadius: '.2em',
    overviewRulerColor: red(0.5)
});
//# sourceMappingURL=decorations.js.map