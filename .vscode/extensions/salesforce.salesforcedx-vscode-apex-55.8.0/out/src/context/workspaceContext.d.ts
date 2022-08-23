import { Connection } from '@salesforce/core';
import * as vscode from 'vscode';
export declare class WorkspaceContext {
    protected static instance?: WorkspaceContext;
    initialize(extensionContext: vscode.ExtensionContext): Promise<void>;
    static getInstance(forceNew?: boolean): WorkspaceContext;
    getConnection(): Promise<Connection>;
}
//# sourceMappingURL=workspaceContext.d.ts.map