import { LibraryCommandletExecutor } from '@salesforce/salesforcedx-utils-vscode/out/src';
import { CancelResponse, ContinueResponse, ParametersGatherer } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import * as vscode from 'vscode';
import { ApexTestQuickPickItem } from './forceApexTestRun';
export declare type ApexTestSuiteOptions = {
    suitename: string;
    tests: string[];
};
export declare class TestSuiteSelector implements ParametersGatherer<ApexTestQuickPickItem> {
    gather(): Promise<CancelResponse | ContinueResponse<ApexTestQuickPickItem>>;
}
export declare class TestSuiteBuilder implements ParametersGatherer<ApexTestSuiteOptions> {
    gather(): Promise<CancelResponse | ContinueResponse<ApexTestSuiteOptions>>;
}
export declare class TestSuiteCreator implements ParametersGatherer<ApexTestSuiteOptions> {
    gather(): Promise<CancelResponse | ContinueResponse<ApexTestSuiteOptions>>;
}
export declare class ApexLibraryTestSuiteBuilder extends LibraryCommandletExecutor<ApexTestSuiteOptions> {
    static diagnostics: vscode.DiagnosticCollection;
    constructor();
    run(response: ContinueResponse<ApexTestSuiteOptions>): Promise<boolean>;
}
export declare function forceApexTestSuiteAdd(): Promise<void>;
export declare function forceApexTestSuiteCreate(): Promise<void>;
export declare function forceApexTestSuiteRun(): Promise<void>;
//# sourceMappingURL=forceApexTestSuite.d.ts.map