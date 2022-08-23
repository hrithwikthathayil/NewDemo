"use strict";
/*
 * Copyright (c) 2017, salesforce.com, inc.
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
const apex_node_1 = require("@salesforce/apex-node");
const src_1 = require("@salesforce/salesforcedx-utils-vscode/out/src");
const helpers_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/helpers");
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const channels_1 = require("../channels");
const context_1 = require("../context");
const messages_1 = require("../messages");
const settings = require("../settings");
var TestType;
(function (TestType) {
    TestType[TestType["All"] = 0] = "All";
    TestType[TestType["AllLocal"] = 1] = "AllLocal";
    TestType[TestType["Suite"] = 2] = "Suite";
    TestType[TestType["Class"] = 3] = "Class";
})(TestType = exports.TestType || (exports.TestType = {}));
class TestsSelector {
    gather() {
        return __awaiter(this, void 0, void 0, function* () {
            const testSuites = yield vscode.workspace.findFiles('**/*.testSuite-meta.xml');
            const fileItems = testSuites.map(testSuite => {
                return {
                    label: path
                        .basename(testSuite.toString())
                        .replace('.testSuite-meta.xml', ''),
                    description: testSuite.fsPath,
                    type: TestType.Suite
                };
            });
            fileItems.push({
                label: messages_1.nls.localize('force_apex_test_run_all_local_test_label'),
                description: messages_1.nls.localize('force_apex_test_run_all_local_tests_description_text'),
                type: TestType.AllLocal
            });
            fileItems.push({
                label: messages_1.nls.localize('force_apex_test_run_all_test_label'),
                description: messages_1.nls.localize('force_apex_test_run_all_tests_description_text'),
                type: TestType.All
            });
            const apexClasses = yield vscode.workspace.findFiles('**/*.cls');
            apexClasses.forEach(apexClass => {
                const fileContent = fs.readFileSync(apexClass.fsPath).toString();
                if (fileContent && fileContent.toLowerCase().includes('@istest')) {
                    fileItems.push({
                        label: path.basename(apexClass.toString()).replace('.cls', ''),
                        description: apexClass.fsPath,
                        type: TestType.Class
                    });
                }
            });
            const selection = (yield vscode.window.showQuickPick(fileItems));
            return selection
                ? { type: 'CONTINUE', data: selection }
                : { type: 'CANCEL' };
        });
    }
}
exports.TestsSelector = TestsSelector;
function getTempFolder() {
    if (src_1.hasRootWorkspace()) {
        const apexDir = helpers_1.getTestResultsFolder(src_1.getRootWorkspacePath(), 'apex');
        return apexDir;
    }
    else {
        throw new Error(messages_1.nls.localize('cannot_determine_workspace'));
    }
}
class ApexLibraryTestRunExecutor extends src_1.LibraryCommandletExecutor {
    constructor() {
        super(messages_1.nls.localize('force_apex_test_run_text'), 'force_apex_test_run_library', channels_1.OUTPUT_CHANNEL);
        this.cancellable = true;
    }
    run(response, progress, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield context_1.workspaceContext.getConnection();
            const testService = new apex_node_1.TestService(connection);
            const testLevel = "RunSpecifiedTests" /* RunSpecifiedTests */;
            const codeCoverage = settings.retrieveTestCodeCoverage();
            let payload;
            switch (response.data.type) {
                case TestType.Class:
                    payload = yield testService.buildAsyncPayload(testLevel, undefined, response.data.label);
                    break;
                case TestType.Suite:
                    payload = yield testService.buildAsyncPayload(testLevel, undefined, undefined, response.data.label);
                    break;
                case TestType.AllLocal:
                    payload = { testLevel: "RunLocalTests" /* RunLocalTests */ };
                    break;
                case TestType.All:
                    payload = { testLevel: "RunAllTestsInOrg" /* RunAllTestsInOrg */ };
                    break;
                default:
                    payload = { testLevel: "RunAllTestsInOrg" /* RunAllTestsInOrg */ };
            }
            const progressReporter = {
                report: value => {
                    if (value.type === 'StreamingClientProgress' ||
                        value.type === 'FormatTestResultProgress') {
                        progress === null || progress === void 0 ? void 0 : progress.report({ message: value.message });
                    }
                }
            };
            const result = (yield testService.runTestAsynchronous(payload, codeCoverage, false, progressReporter, token));
            if (token === null || token === void 0 ? void 0 : token.isCancellationRequested) {
                return false;
            }
            yield testService.writeResultFiles(result, {
                resultFormats: [apex_node_1.ResultFormat.json],
                dirPath: getTempFolder()
            }, codeCoverage);
            const humanOutput = new apex_node_1.HumanReporter().format(result, codeCoverage);
            channels_1.channelService.appendLine(humanOutput);
            return true;
        });
    }
}
exports.ApexLibraryTestRunExecutor = ApexLibraryTestRunExecutor;
ApexLibraryTestRunExecutor.diagnostics = vscode.languages.createDiagnosticCollection('apex-errors');
const workspaceChecker = new src_1.SfdxWorkspaceChecker();
const parameterGatherer = new TestsSelector();
function forceApexTestRun() {
    return __awaiter(this, void 0, void 0, function* () {
        const commandlet = new src_1.SfdxCommandlet(workspaceChecker, parameterGatherer, new ApexLibraryTestRunExecutor());
        yield commandlet.run();
    });
}
exports.forceApexTestRun = forceApexTestRun;
//# sourceMappingURL=forceApexTestRun.js.map