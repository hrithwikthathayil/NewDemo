import { SfdxCommandletExecutor } from '@salesforce/salesforcedx-utils-vscode/out/src';
import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
export declare function forceLaunchApexReplayDebuggerWithCurrentFile(): Promise<void>;
export declare class ForceAnonApexLaunchReplayDebuggerExecutor extends SfdxCommandletExecutor<{}> {
    build(): Command;
    execute(): Promise<void>;
}
//# sourceMappingURL=forceLaunchApexReplayDebuggerWithCurrentFile.d.ts.map