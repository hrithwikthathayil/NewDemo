"use strict";
/*
 * Copyright (c) 2021, salesforce.com, inc.
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
const fs_1 = require("fs");
const path_1 = require("path");
const vscode = require("vscode");
const channels_1 = require("../channels");
const context_1 = require("../context");
const messages_1 = require("../messages");
const forceApexTestRun_1 = require("./forceApexTestRun");
function listApexClassItems() {
    return __awaiter(this, void 0, void 0, function* () {
        const apexClasses = yield vscode.workspace.findFiles('**/*.cls');
        const apexClassItems = [];
        apexClasses.forEach(apexClass => {
            const fileContent = fs_1.readFileSync(apexClass.fsPath).toString();
            if (fileContent && fileContent.toLowerCase().includes('@istest')) {
                apexClassItems.push({
                    label: path_1.basename(apexClass.toString()).replace('.cls', ''),
                    description: apexClass.fsPath,
                    type: forceApexTestRun_1.TestType.Class
                });
            }
        });
        return apexClassItems;
    });
}
function listApexTestSuiteItems() {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield context_1.workspaceContext.getConnection();
        const testService = new apex_node_1.TestService(connection);
        const testSuites = yield testService.retrieveAllSuites();
        const quickPickItems = testSuites.map(testSuite => {
            return {
                label: testSuite.TestSuiteName,
                // @ts-ignore
                description: testSuite.Id,
                type: forceApexTestRun_1.TestType.Suite
            };
        });
        return quickPickItems;
    });
}
class TestSuiteSelector {
    gather() {
        return __awaiter(this, void 0, void 0, function* () {
            const quickPickItems = yield listApexTestSuiteItems();
            const testSuiteName = (yield vscode.window.showQuickPick(quickPickItems));
            return testSuiteName
                ? { type: 'CONTINUE', data: testSuiteName }
                : { type: 'CANCEL' };
        });
    }
}
exports.TestSuiteSelector = TestSuiteSelector;
class TestSuiteBuilder {
    gather() {
        return __awaiter(this, void 0, void 0, function* () {
            const quickPickItems = yield listApexTestSuiteItems();
            const testSuiteName = (yield vscode.window.showQuickPick(quickPickItems));
            if (testSuiteName) {
                const apexClassItems = yield listApexClassItems();
                const apexClassSelection = (yield vscode.window.showQuickPick(apexClassItems, { canPickMany: true }));
                const apexClassNames = apexClassSelection === null || apexClassSelection === void 0 ? void 0 : apexClassSelection.map(selection => selection.label);
                return apexClassSelection
                    ? {
                        type: 'CONTINUE',
                        data: { suitename: testSuiteName.label, tests: apexClassNames }
                    }
                    : { type: 'CANCEL' };
            }
            return { type: 'CANCEL' };
        });
    }
}
exports.TestSuiteBuilder = TestSuiteBuilder;
class TestSuiteCreator {
    gather() {
        return __awaiter(this, void 0, void 0, function* () {
            const testSuiteInput = {
                prompt: 'Enter desired Apex test suite name:'
            };
            const testSuiteName = yield vscode.window.showInputBox(testSuiteInput);
            if (testSuiteName) {
                const apexClassItems = yield listApexClassItems();
                const apexClassSelection = (yield vscode.window.showQuickPick(apexClassItems, { canPickMany: true }));
                const apexClassNames = apexClassSelection === null || apexClassSelection === void 0 ? void 0 : apexClassSelection.map(selection => selection.label);
                return apexClassSelection
                    ? {
                        type: 'CONTINUE',
                        data: { suitename: testSuiteName, tests: apexClassNames }
                    }
                    : { type: 'CANCEL' };
            }
            return { type: 'CANCEL' };
        });
    }
}
exports.TestSuiteCreator = TestSuiteCreator;
class ApexLibraryTestSuiteBuilder extends src_1.LibraryCommandletExecutor {
    constructor() {
        super(messages_1.nls.localize('force_apex_test_suite_build_text'), 'force_apex_test_suite_build_library', channels_1.OUTPUT_CHANNEL);
    }
    run(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield context_1.workspaceContext.getConnection();
            const testService = new apex_node_1.TestService(connection);
            yield testService.buildSuite(response.data.suitename, response.data.tests);
            return true;
        });
    }
}
exports.ApexLibraryTestSuiteBuilder = ApexLibraryTestSuiteBuilder;
ApexLibraryTestSuiteBuilder.diagnostics = vscode.languages.createDiagnosticCollection('apex-errors');
const workspaceChecker = new src_1.SfdxWorkspaceChecker();
const testSuiteSelector = new TestSuiteSelector();
const testSuiteCreator = new TestSuiteCreator();
const testSuiteBuilder = new TestSuiteBuilder();
function forceApexTestSuiteAdd() {
    return __awaiter(this, void 0, void 0, function* () {
        const commandlet = new src_1.SfdxCommandlet(workspaceChecker, testSuiteBuilder, new ApexLibraryTestSuiteBuilder());
        yield commandlet.run();
    });
}
exports.forceApexTestSuiteAdd = forceApexTestSuiteAdd;
function forceApexTestSuiteCreate() {
    return __awaiter(this, void 0, void 0, function* () {
        const commandlet = new src_1.SfdxCommandlet(workspaceChecker, testSuiteCreator, new ApexLibraryTestSuiteBuilder());
        yield commandlet.run();
    });
}
exports.forceApexTestSuiteCreate = forceApexTestSuiteCreate;
function forceApexTestSuiteRun() {
    return __awaiter(this, void 0, void 0, function* () {
        const commandlet = new src_1.SfdxCommandlet(workspaceChecker, testSuiteSelector, new forceApexTestRun_1.ApexLibraryTestRunExecutor());
        yield commandlet.run();
    });
}
exports.forceApexTestSuiteRun = forceApexTestSuiteRun;
//# sourceMappingURL=forceApexTestSuite.js.map