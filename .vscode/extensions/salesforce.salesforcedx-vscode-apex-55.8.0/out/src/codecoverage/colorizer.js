"use strict";
/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path_1 = require("path");
const vscode_1 = require("vscode");
const messages_1 = require("../messages");
const decorations_1 = require("./decorations");
const apexDirPath = path_1.join(vscode_1.workspace.workspaceFolders[0].uri.fsPath, '.sfdx', 'tools', 'testresults', 'apex');
function getLineRange(document, lineNumber) {
    let adjustedLineNumber;
    let firstLine;
    try {
        adjustedLineNumber = lineNumber - 1;
        firstLine = document.lineAt(adjustedLineNumber);
    }
    catch (e) {
        throw new Error(messages_1.nls.localize('colorizer_out_of_sync_code_coverage_data'));
    }
    return new vscode_1.Range(adjustedLineNumber, firstLine.range.start.character, adjustedLineNumber, firstLine.range.end.character);
}
exports.getLineRange = getLineRange;
function getTestRunId() {
    const testRunIdFile = path_1.join(apexDirPath, 'test-run-id.txt');
    if (!fs.existsSync(testRunIdFile)) {
        throw new Error(messages_1.nls.localize('colorizer_no_code_coverage_on_project'));
    }
    return fs.readFileSync(testRunIdFile, 'utf8');
}
function getCoverageData() {
    const testRunId = getTestRunId();
    const testResultFilePath = path_1.join(apexDirPath, `test-result-${testRunId}.json`);
    if (!fs.existsSync(testResultFilePath)) {
        throw new Error(messages_1.nls.localize('colorizer_no_code_coverage_on_test_results', testRunId));
    }
    const testResultOutput = fs.readFileSync(testResultFilePath, 'utf8');
    const testResult = JSON.parse(testResultOutput);
    if (testResult.coverage === undefined &&
        testResult.codecoverage === undefined) {
        throw new Error(messages_1.nls.localize('colorizer_no_code_coverage_on_test_results', testRunId));
    }
    return testResult.codecoverage || testResult.coverage.coverage;
}
function isApexMetadata(filePath) {
    return filePath.endsWith('.cls') || filePath.endsWith('.trigger');
}
function getApexMemberName(filePath) {
    if (isApexMetadata(filePath)) {
        const filePathWithOutType = filePath.replace(/.cls|.trigger/g, '');
        const indexOfLastFolder = filePathWithOutType.lastIndexOf(path_1.sep);
        return filePathWithOutType.substring(indexOfLastFolder + 1);
    }
    return '';
}
class CodeCoverage {
    constructor(statusBar) {
        this.statusBar = statusBar;
        this.coveredLines = Array();
        this.uncoveredLines = Array();
        vscode_1.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor, this);
        this.onDidChangeActiveTextEditor(vscode_1.window.activeTextEditor);
    }
    onDidChangeActiveTextEditor(editor) {
        if (editor && this.statusBar.isHighlightingEnabled) {
            this.colorizer(editor);
        }
    }
    toggleCoverage() {
        if (this.statusBar.isHighlightingEnabled) {
            this.statusBar.toggle(false);
            this.coveredLines = [];
            this.uncoveredLines = [];
            const editor = vscode_1.window.activeTextEditor;
            if (editor) {
                editor.setDecorations(decorations_1.coveredLinesDecorationType, this.coveredLines);
                editor.setDecorations(decorations_1.uncoveredLinesDecorationType, this.uncoveredLines);
            }
        }
        else {
            this.colorizer(vscode_1.window.activeTextEditor);
            this.statusBar.toggle(true);
        }
    }
    colorizer(editor) {
        try {
            if (editor && isApexMetadata(editor.document.uri.fsPath)) {
                const codeCovArray = getCoverageData();
                const apexMemberName = getApexMemberName(editor.document.uri.fsPath);
                const codeCovItem = codeCovArray.find(covItem => covItem.name === apexMemberName);
                if (!codeCovItem) {
                    throw new Error(messages_1.nls.localize('colorizer_no_code_coverage_current_file'));
                }
                if (codeCovItem.hasOwnProperty('lines') &&
                    !codeCovItem.hasOwnProperty('uncoveredLines')) {
                    const covItem = codeCovItem;
                    for (const key in covItem.lines) {
                        if (covItem.lines.hasOwnProperty(key)) {
                            if (covItem.lines[key] === 1) {
                                this.coveredLines.push(getLineRange(editor.document, Number(key)));
                            }
                            else {
                                this.uncoveredLines.push(getLineRange(editor.document, Number(key)));
                            }
                        }
                    }
                }
                else {
                    const covResult = codeCovItem;
                    this.coveredLines = covResult.coveredLines.map(cov => getLineRange(editor.document, Number(cov)));
                    this.uncoveredLines = covResult.uncoveredLines.map(uncov => getLineRange(editor.document, Number(uncov)));
                }
                editor.setDecorations(decorations_1.coveredLinesDecorationType, this.coveredLines);
                editor.setDecorations(decorations_1.uncoveredLinesDecorationType, this.uncoveredLines);
            }
        }
        catch (e) {
            // telemetry
            vscode_1.window.showWarningMessage(e.message);
        }
    }
}
exports.CodeCoverage = CodeCoverage;
//# sourceMappingURL=colorizer.js.map