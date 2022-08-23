export declare type FullTestResult = {
    summary: TestSummary;
    tests: TestResult[];
};
export declare type TestSummary = {
    outcome: string;
    testsRan: number;
    passing: number;
    failing: number;
    skipped: number;
    passRate: string;
    failRate: string;
    testStartTime: string;
    testExecutionTime: string;
    testTotalTime: string;
    commandTime: string;
    hostname: string;
    orgId: string;
    username: string;
    testRunId: string;
    userId: string;
};
export declare class TestSummarizer {
    static summarize(summary: TestSummary): string;
}
export declare type TestResult = {
    ApexClass: ApexClass;
    MethodName: string;
    Outcome: string;
    RunTime: number;
    Message: string;
    StackTrace: string;
    FullName: string;
};
export declare type ApexClass = {
    attributes: {
        type: string;
    };
    Id: string;
    Name: string;
    NamespacePrefix: string;
};
//# sourceMappingURL=testDataAccessObjects.d.ts.map