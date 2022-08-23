import { LibraryCommandletExecutor } from '@salesforce/salesforcedx-utils-vscode/out/src';
import { ContinueResponse } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import * as vscode from 'vscode';
export declare class ApexLibraryTestRunExecutor extends LibraryCommandletExecutor<{}> {
    protected cancellable: boolean;
    private tests;
    private codeCoverage;
    private outputDir;
    static diagnostics: vscode.DiagnosticCollection;
    constructor(tests: string[], outputDir?: string, codeCoverage?: boolean);
    run(response?: ContinueResponse<{}>, progress?: vscode.Progress<{
        message?: string | undefined;
        increment?: number | undefined;
    }>, token?: vscode.CancellationToken): Promise<boolean>;
    private handleDiagnostics;
    private getZeroBasedRange;
}
export declare function forceApexTestClassRunCodeActionDelegate(testClass: string): Promise<void>;
export declare function forceApexDebugClassRunCodeActionDelegate(testClass: string): Promise<void>;
export declare function resolveTestClassParam(testClass: string): Promise<string>;
export declare function forceApexTestClassRunCodeAction(testClass: string): Promise<void>;
export declare function forceApexTestMethodRunCodeActionDelegate(testMethod: string): Promise<void>;
export declare function forceApexDebugMethodRunCodeActionDelegate(testMethod: string): Promise<void>;
export declare function resolveTestMethodParam(testMethod: string): Promise<string>;
export declare function forceApexTestMethodRunCodeAction(testMethod: string): Promise<void>;
//# sourceMappingURL=forceApexTestRunCodeAction.d.ts.map