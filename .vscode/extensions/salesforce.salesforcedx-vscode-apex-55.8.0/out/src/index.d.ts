import * as vscode from 'vscode';
import { getApexTests, getExceptionBreakpointInfo, getLineBreakpointInfo } from './languageClientUtils';
export declare function activate(extensionContext: vscode.ExtensionContext): Promise<{
    getLineBreakpointInfo: typeof getLineBreakpointInfo;
    getExceptionBreakpointInfo: typeof getExceptionBreakpointInfo;
    getApexTests: typeof getApexTests;
    languageClientUtils: import("./languageClientUtils/languageClientUtils").LanguageClientUtils;
}>;
export declare function deactivate(): Promise<void>;
//# sourceMappingURL=index.d.ts.map