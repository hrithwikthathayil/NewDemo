import { Range, TextDocument, TextEditor } from 'vscode';
import { StatusBarToggle } from './statusBarToggle';
export declare function getLineRange(document: TextDocument, lineNumber: number): Range;
export declare type CoverageTestResult = {
    coverage: {
        coverage: CoverageItem[];
    };
};
export declare type CoverageItem = {
    id: string;
    name: string;
    totalLines: number;
    lines: {
        [key: string]: number;
    };
};
export declare class CodeCoverage {
    private statusBar;
    coveredLines: Range[];
    uncoveredLines: Range[];
    constructor(statusBar: StatusBarToggle);
    onDidChangeActiveTextEditor(editor?: TextEditor): void;
    toggleCoverage(): void;
    colorizer(editor?: TextEditor): void;
}
//# sourceMappingURL=colorizer.d.ts.map