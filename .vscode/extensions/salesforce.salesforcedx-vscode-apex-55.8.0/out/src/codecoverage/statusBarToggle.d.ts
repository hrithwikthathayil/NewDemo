import { Disposable } from 'vscode';
export declare class StatusBarToggle implements Disposable {
    private static readonly toggleCodeCovCommand;
    private static readonly showIcon;
    private static readonly hideIcon;
    private static readonly toolTip;
    private isEnabled;
    private statusBarItem;
    constructor();
    get isHighlightingEnabled(): boolean;
    toggle(active: boolean): void;
    dispose(): void;
}
//# sourceMappingURL=statusBarToggle.d.ts.map