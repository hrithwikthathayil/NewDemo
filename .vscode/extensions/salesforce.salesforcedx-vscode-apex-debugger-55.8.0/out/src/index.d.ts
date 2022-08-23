import * as vscode from 'vscode';
import { DebugProtocol } from 'vscode-debugprotocol';
export declare function getDebuggerType(session: vscode.DebugSession): Promise<string>;
export interface ExceptionBreakpointItem extends vscode.QuickPickItem {
    typeref: string;
    breakMode: DebugProtocol.ExceptionBreakMode;
    uri?: string;
}
export declare function mergeExceptionBreakpointInfos(breakpointInfos: ExceptionBreakpointItem[], enabledBreakpointTyperefs: string[]): ExceptionBreakpointItem[];
export declare function updateExceptionBreakpointCache(selectedException: ExceptionBreakpointItem): void;
export declare function getExceptionBreakpointCache(): Map<string, ExceptionBreakpointItem>;
export declare function activate(extensionContext: vscode.ExtensionContext): Promise<void>;
export declare function deactivate(): void;
//# sourceMappingURL=index.d.ts.map