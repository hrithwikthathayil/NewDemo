import { LibraryCommandletExecutor } from '@salesforce/salesforcedx-utils-vscode/out/src';
import { CancelResponse, ContinueResponse, ParametersGatherer } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import * as vscode from 'vscode';
interface ApexExecuteParameters {
    apexCode?: string;
    fileName?: string;
    selection?: vscode.Range;
}
export declare class AnonApexGatherer implements ParametersGatherer<ApexExecuteParameters> {
    gather(): Promise<CancelResponse | ContinueResponse<ApexExecuteParameters>>;
}
export declare class AnonApexLibraryExecuteExecutor extends LibraryCommandletExecutor<ApexExecuteParameters> {
    static diagnostics: vscode.DiagnosticCollection;
    private isDebugging;
    constructor(isDebugging: boolean);
    run(response: ContinueResponse<ApexExecuteParameters>): Promise<boolean>;
    private setUpTraceFlags;
    private processResult;
    private launchReplayDebugger;
    private getLogFilePath;
    private saveLogFile;
    private outputResult;
    private handleDiagnostics;
    private adjustErrorRange;
    private getZeroBasedRange;
}
export declare function forceAnonApexExecute(): Promise<void>;
export declare function forceAnonApexDebug(): Promise<void>;
export {};
//# sourceMappingURL=forceAnonApexExecute.d.ts.map