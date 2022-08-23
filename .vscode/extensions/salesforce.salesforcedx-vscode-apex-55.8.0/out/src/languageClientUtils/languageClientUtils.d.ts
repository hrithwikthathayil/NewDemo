import { LanguageClient } from 'vscode-languageclient';
import { ApexTestMethod } from '../views/lspConverter';
export declare class LanguageClientUtils {
    private static instance;
    private clientInstance;
    private status;
    constructor();
    static getInstance(): LanguageClientUtils;
    getClientInstance(): LanguageClient | undefined;
    setClientInstance(languageClient: LanguageClient | undefined): void;
    getStatus(): LanguageClientStatus;
    setStatus(status: ClientStatus, message: string): void;
}
export declare enum ClientStatus {
    Unavailable = 0,
    Indexing = 1,
    Error = 2,
    Ready = 3
}
export declare class LanguageClientStatus {
    private status;
    private message;
    constructor(status: ClientStatus, message: string);
    isReady(): boolean;
    isIndexing(): boolean;
    failedToInitialize(): boolean;
    getStatusMessage(): string;
}
export declare function getLineBreakpointInfo(): Promise<{}>;
export declare function getApexTests(): Promise<ApexTestMethod[]>;
export declare function getExceptionBreakpointInfo(): Promise<{}>;
//# sourceMappingURL=languageClientUtils.d.ts.map