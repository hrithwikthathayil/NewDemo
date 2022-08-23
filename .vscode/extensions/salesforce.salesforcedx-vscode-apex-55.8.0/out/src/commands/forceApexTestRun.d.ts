import { LibraryCommandletExecutor } from '@salesforce/salesforcedx-utils-vscode/out/src';
import { CancelResponse, ContinueResponse, ParametersGatherer } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import * as vscode from 'vscode';
export declare enum TestType {
    All = 0,
    AllLocal = 1,
    Suite = 2,
    Class = 3
}
export interface ApexTestQuickPickItem extends vscode.QuickPickItem {
    type: TestType;
}
export declare class TestsSelector implements ParametersGatherer<ApexTestQuickPickItem> {
    gather(): Promise<CancelResponse | ContinueResponse<ApexTestQuickPickItem>>;
}
export declare class ApexLibraryTestRunExecutor extends LibraryCommandletExecutor<ApexTestQuickPickItem> {
    protected cancellable: boolean;
    static diagnostics: vscode.DiagnosticCollection;
    constructor();
    run(response: ContinueResponse<ApexTestQuickPickItem>, progress?: vscode.Progress<{
        message?: string | undefined;
        increment?: number | undefined;
    }>, token?: vscode.CancellationToken): Promise<boolean>;
}
export declare function forceApexTestRun(): Promise<void>;
//# sourceMappingURL=forceApexTestRun.d.ts.map