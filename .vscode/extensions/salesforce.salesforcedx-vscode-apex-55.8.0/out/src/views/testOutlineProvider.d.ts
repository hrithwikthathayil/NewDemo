import * as vscode from 'vscode';
import { ApexTestMethod } from './lspConverter';
export declare class ApexTestOutlineProvider implements vscode.TreeDataProvider<TestNode> {
    private onDidChangeTestData;
    onDidChangeTreeData: vscode.Event<TestNode | undefined>;
    private apexTestMap;
    private rootNode;
    testStrings: Set<string>;
    private apexTestInfo;
    private testIndex;
    constructor(apexTestInfo: ApexTestMethod[] | null);
    getHead(): TestNode;
    getChildren(element: TestNode): TestNode[];
    getTreeItem(element: TestNode): vscode.TreeItem;
    refresh(): Promise<void>;
    onResultFileCreate(apexTestPath: string, testResultFile: string): Promise<void>;
    getTestClassName(uri: vscode.Uri): string | undefined;
    private createTestIndex;
    private getAllApexTests;
    updateTestResults(testResultFilePath: string): void;
    private updateTestsFromLibrary;
}
export declare abstract class TestNode extends vscode.TreeItem {
    children: TestNode[];
    description: string;
    name: string;
    location: vscode.Location | null;
    constructor(label: string, collapsibleState: vscode.TreeItemCollapsibleState, location: vscode.Location | null);
    iconPath: {
        light: string;
        dark: string;
    };
    get tooltip(): string;
    updateOutcome(outcome: string): void;
    abstract contextValue: string;
}
export declare class ApexTestGroupNode extends TestNode {
    passing: number;
    failing: number;
    skipping: number;
    constructor(label: string, location: vscode.Location | null);
    contextValue: string;
    updatePassFailLabel(): void;
    updateOutcome(outcome: string): void;
}
export declare class ApexTestNode extends TestNode {
    errorMessage: string;
    stackTrace: string;
    outcome: string;
    constructor(label: string, location: vscode.Location | null);
    updateOutcome(): void;
    contextValue: string;
}
export declare const testOutlineProvider: ApexTestOutlineProvider;
//# sourceMappingURL=testOutlineProvider.d.ts.map