export declare function isEmpty(value: string): boolean;
declare class ForceApexTestRunCacheService {
    private lastClassTestParam;
    private lastMethodTestParam;
    private static instance;
    static getInstance(): ForceApexTestRunCacheService;
    constructor();
    getLastClassTestParam(): string;
    getLastMethodTestParam(): string;
    hasCachedClassTestParam(): boolean;
    hasCachedMethodTestParam(): boolean;
    setCachedClassTestParam(test: string): Promise<void>;
    setCachedMethodTestParam(test: string): Promise<void>;
}
export declare const forceApexTestRunCacheService: ForceApexTestRunCacheService;
export {};
//# sourceMappingURL=forceApexTestRunCacheService.d.ts.map