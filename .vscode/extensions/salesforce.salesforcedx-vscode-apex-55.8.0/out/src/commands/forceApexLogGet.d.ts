import { LogRecord } from '@salesforce/apex-node';
import { LibraryCommandletExecutor } from '@salesforce/salesforcedx-utils-vscode/out/src';
import { CancelResponse, ContinueResponse, ParametersGatherer } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
export declare type ApexDebugLogIdStartTime = {
    id: string;
    startTime: string;
};
export declare class LogFileSelector implements ParametersGatherer<ApexDebugLogIdStartTime> {
    gather(): Promise<CancelResponse | ContinueResponse<ApexDebugLogIdStartTime>>;
    getLogRecords(): Promise<LogRecord[]>;
}
export declare type ApexDebugLogObject = {
    Id: string;
    StartTime: string;
    LogLength: number;
    Operation: string;
    Request: string;
    Status: string;
    LogUser: {
        Name: string;
    };
};
export declare class ApexLibraryGetLogsExecutor extends LibraryCommandletExecutor<{
    id: string;
}> {
    constructor();
    run(response: ContinueResponse<{
        id: string;
    }>): Promise<boolean>;
}
export declare function forceApexLogGet(explorerDir?: any): Promise<void>;
//# sourceMappingURL=forceApexLogGet.d.ts.map