/// <reference types="node" />
import * as events from 'events';
import * as vscode from 'vscode';
import { ApexTestOutlineProvider, TestNode } from './testOutlineProvider';
export declare enum TestRunType {
    All = 0,
    Class = 1,
    Method = 2
}
export declare class ApexTestRunner {
    private testOutline;
    private eventsEmitter;
    constructor(testOutline: ApexTestOutlineProvider, eventsEmitter?: events.EventEmitter);
    showErrorMessage(test: TestNode): void;
    updateSelection(index: vscode.Range | number): void;
    getTempFolder(): string;
    runAllApexTests(): Promise<void>;
    runApexTests(tests: string[], testRunType: TestRunType): Promise<never[] | undefined>;
}
//# sourceMappingURL=testRunner.d.ts.map