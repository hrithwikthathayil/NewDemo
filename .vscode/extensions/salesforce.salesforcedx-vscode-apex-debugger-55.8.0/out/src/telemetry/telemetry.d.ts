import TelemetryReporter from 'vscode-extension-telemetry';
export declare class TelemetryService {
    private static instance;
    private reporter;
    private isTelemetryEnabled;
    constructor();
    static getInstance(): TelemetryService;
    initializeService(reporter: TelemetryReporter, isTelemetryEnabled: boolean): void;
    sendExtensionActivationEvent(hrstart: [number, number]): void;
    sendExtensionDeactivationEvent(): void;
    private getEndHRTime;
}
//# sourceMappingURL=telemetry.d.ts.map