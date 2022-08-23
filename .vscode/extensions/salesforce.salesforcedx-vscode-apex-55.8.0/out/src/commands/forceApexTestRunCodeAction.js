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
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const apex_node_1 = require("@salesforce/apex-node");
const core_1 = require("@salesforce/core");
const src_1 = require("@salesforce/salesforcedx-utils-vscode/out/src");
const src_2 = require("@salesforce/salesforcedx-utils-vscode/out/src");
const commands_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/commands");
const helpers_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/helpers");
const source_deploy_retrieve_1 = require("@salesforce/source-deploy-retrieve");
const vscode = require("vscode");
const channels_1 = require("../channels");
const context_1 = require("../context");
const messages_1 = require("../messages");
const settings = require("../settings");
const testRunCache_1 = require("../testRunCache");
class ApexLibraryTestRunExecutor extends src_2.LibraryCommandletExecutor {
    constructor(tests, outputDir = getTempFolder(), codeCoverage = settings.retrieveTestCodeCoverage()) {
        super(messages_1.nls.localize('force_apex_test_run_text'), 'force_apex_test_run_code_action_library', channels_1.OUTPUT_CHANNEL);
        this.cancellable = true;
        this.codeCoverage = false;
        this.tests = tests;
        this.outputDir = outputDir;
        this.codeCoverage = codeCoverage;
    }
    run(response, progress, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield context_1.workspaceContext.getConnection();
            const testService = new apex_node_1.TestService(connection);
            const payload = yield testService.buildAsyncPayload("RunSpecifiedTests" /* RunSpecifiedTests */, this.tests.join());
            const progressReporter = {
                report: value => {
                    if (value.type === 'StreamingClientProgress' ||
                        value.type === 'FormatTestResultProgress') {
                        progress === null || progress === void 0 ? void 0 : progress.report({ message: value.message });
                    }
                }
            };
            const result = (yield testService.runTestAsynchronous(payload, this.codeCoverage, false, progressReporter, token));
            if (token === null || token === void 0 ? void 0 : token.isCancellationRequested) {
                return false;
            }
            yield testService.writeResultFiles(result, { resultFormats: [apex_node_1.ResultFormat.json], dirPath: this.outputDir }, this.codeCoverage);
            const humanOutput = new apex_node_1.HumanReporter().format(result, this.codeCoverage);
            channels_1.channelService.appendLine(humanOutput);
            yield this.handleDiagnostics(result);
            return result.summary.outcome === 'Passed';
        });
    }
    handleDiagnostics(result) {
        return __awaiter(this, void 0, void 0, function* () {
            ApexLibraryTestRunExecutor.diagnostics.clear();
            const projectPath = src_1.getRootWorkspacePath();
            const project = yield core_1.SfdxProject.resolve(projectPath);
            const defaultPackage = project.getDefaultPackage().fullPath;
            result.tests.forEach(test => {
                var _a, _b;
                if (test.diagnostic) {
                    const diagnostic = test.diagnostic;
                    const components = source_deploy_retrieve_1.ComponentSet.fromSource(defaultPackage);
                    const testClassCmp = components
                        .getSourceComponents({
                        fullName: test.apexClass.name,
                        type: 'ApexClass'
                    })
                        .first();
                    const componentPath = testClassCmp.content;
                    const vscDiagnostic = {
                        message: `${diagnostic.exceptionMessage}\n${diagnostic.exceptionStackTrace}`,
                        severity: vscode.DiagnosticSeverity.Error,
                        source: componentPath,
                        range: this.getZeroBasedRange((_a = diagnostic.lineNumber) !== null && _a !== void 0 ? _a : 1, (_b = diagnostic.columnNumber) !== null && _b !== void 0 ? _b : 1)
                    };
                    if (componentPath) {
                        ApexLibraryTestRunExecutor.diagnostics.set(vscode.Uri.file(componentPath), [vscDiagnostic]);
                    }
                }
            });
        });
    }
    getZeroBasedRange(line, column) {
        const pos = new vscode.Position(line > 0 ? line - 1 : 0, column > 0 ? column - 1 : 0);
        return new vscode.Range(pos, pos);
    }
}
exports.ApexLibraryTestRunExecutor = ApexLibraryTestRunExecutor;
ApexLibraryTestRunExecutor.diagnostics = vscode.languages.createDiagnosticCollection('apex-errors');
function forceApexTestRunCodeAction(tests) {
    return __awaiter(this, void 0, void 0, function* () {
        const testRunExecutor = new ApexLibraryTestRunExecutor(tests);
        const commandlet = new src_2.SfdxCommandlet(new src_2.SfdxWorkspaceChecker(), new src_2.EmptyParametersGatherer(), testRunExecutor);
        yield commandlet.run();
    });
}
function getTempFolder() {
    if (vscode.workspace && vscode.workspace.workspaceFolders) {
        const apexDir = helpers_1.getTestResultsFolder(vscode.workspace.workspaceFolders[0].uri.fsPath, 'apex');
        return apexDir;
    }
    else {
        throw new Error(messages_1.nls.localize('cannot_determine_workspace'));
    }
}
//   T E S T   C L A S S
// redirects to run-all-tests cmd
function forceApexTestClassRunCodeActionDelegate(testClass) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.commands.executeCommand('sfdx.force.apex.test.class.run', testClass);
    });
}
exports.forceApexTestClassRunCodeActionDelegate = forceApexTestClassRunCodeActionDelegate;
function forceApexDebugClassRunCodeActionDelegate(testClass) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.commands.executeCommand('sfdx.force.test.view.debugTests', {
            name: testClass
        });
    });
}
exports.forceApexDebugClassRunCodeActionDelegate = forceApexDebugClassRunCodeActionDelegate;
// evaluate test class param: if not provided, apply cached value
// exported for testability
function resolveTestClassParam(testClass) {
    return __awaiter(this, void 0, void 0, function* () {
        if (testRunCache_1.isEmpty(testClass)) {
            // value not provided for re-run invocations
            // apply cached value, if available
            if (testRunCache_1.forceApexTestRunCacheService.hasCachedClassTestParam()) {
                testClass = testRunCache_1.forceApexTestRunCacheService.getLastClassTestParam();
            }
        }
        else {
            yield testRunCache_1.forceApexTestRunCacheService.setCachedClassTestParam(testClass);
        }
        return testClass;
    });
}
exports.resolveTestClassParam = resolveTestClassParam;
// invokes apex test run on all tests in a class
function forceApexTestClassRunCodeAction(testClass) {
    return __awaiter(this, void 0, void 0, function* () {
        testClass = yield resolveTestClassParam(testClass);
        if (testRunCache_1.isEmpty(testClass)) {
            // test param not provided: show error and terminate
            commands_1.notificationService.showErrorMessage(messages_1.nls.localize('force_apex_test_run_codeAction_no_class_test_param_text'));
            return;
        }
        yield forceApexTestRunCodeAction([testClass]);
    });
}
exports.forceApexTestClassRunCodeAction = forceApexTestClassRunCodeAction;
//   T E S T   M E T H O D
// redirects to run-test-method cmd
function forceApexTestMethodRunCodeActionDelegate(testMethod) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.commands.executeCommand('sfdx.force.apex.test.method.run', testMethod);
    });
}
exports.forceApexTestMethodRunCodeActionDelegate = forceApexTestMethodRunCodeActionDelegate;
function forceApexDebugMethodRunCodeActionDelegate(testMethod) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.commands.executeCommand('sfdx.force.test.view.debugSingleTest', {
            name: testMethod
        });
    });
}
exports.forceApexDebugMethodRunCodeActionDelegate = forceApexDebugMethodRunCodeActionDelegate;
// evaluate test method param: if not provided, apply cached value
// exported for testability
function resolveTestMethodParam(testMethod) {
    return __awaiter(this, void 0, void 0, function* () {
        if (testRunCache_1.isEmpty(testMethod)) {
            // value not provided for re-run invocations
            // apply cached value, if available
            if (testRunCache_1.forceApexTestRunCacheService.hasCachedMethodTestParam()) {
                testMethod = testRunCache_1.forceApexTestRunCacheService.getLastMethodTestParam();
            }
        }
        else {
            yield testRunCache_1.forceApexTestRunCacheService.setCachedMethodTestParam(testMethod);
        }
        return testMethod;
    });
}
exports.resolveTestMethodParam = resolveTestMethodParam;
// invokes apex test run on a test method
function forceApexTestMethodRunCodeAction(testMethod) {
    return __awaiter(this, void 0, void 0, function* () {
        testMethod = yield resolveTestMethodParam(testMethod);
        if (testRunCache_1.isEmpty(testMethod)) {
            // test param not provided: show error and terminate
            commands_1.notificationService.showErrorMessage(messages_1.nls.localize('force_apex_test_run_codeAction_no_method_test_param_text'));
            return;
        }
        yield forceApexTestRunCodeAction([testMethod]);
    });
}
exports.forceApexTestMethodRunCodeAction = forceApexTestMethodRunCodeAction;
//# sourceMappingURL=forceApexTestRunCodeAction.js.map