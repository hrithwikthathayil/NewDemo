import * as vscode from 'vscode';
export declare type LSPApexTestMethod = {
    methodName: string;
    definingType: string;
    location: LSPLocation;
};
export declare type LSPLocation = {
    uri: string;
    range: {
        start: LSPPosition;
        end: LSPPosition;
    };
};
export declare type LSPPosition = {
    line: number;
    character: number;
};
export declare type ApexTestMethod = {
    methodName: string;
    definingType: string;
    location: vscode.Location;
};
export declare class ApexLSPConverter {
    static toApexTestMethod(requestInfo: LSPApexTestMethod): ApexTestMethod;
    static toUri(lspUri: string): vscode.Uri;
    static toLocation(lspLocation: LSPLocation): vscode.Location;
    static toPosition(lspPosition: LSPPosition): vscode.Position;
}
//# sourceMappingURL=lspConverter.d.ts.map