"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const vscode = require("vscode");
class ApexLSPConverter {
    static toApexTestMethod(requestInfo) {
        const testLocation = ApexLSPConverter.toLocation(requestInfo.location);
        const retInfo = {
            methodName: requestInfo.methodName,
            definingType: requestInfo.definingType,
            location: testLocation
        };
        return retInfo;
    }
    static toUri(lspUri) {
        const uriString = lspUri;
        const uriPath = vscode.Uri.parse(uriString).path;
        return vscode.Uri.file(uriPath);
    }
    static toLocation(lspLocation) {
        const actualUri = ApexLSPConverter.toUri(lspLocation.uri);
        const actualStart = ApexLSPConverter.toPosition(lspLocation.range.start);
        const actualEnd = ApexLSPConverter.toPosition(lspLocation.range.end);
        const actualRange = new vscode.Range(actualStart, actualEnd);
        return new vscode.Location(actualUri, actualRange);
    }
    static toPosition(lspPosition) {
        return new vscode.Position(lspPosition.line, lspPosition.character);
    }
}
exports.ApexLSPConverter = ApexLSPConverter;
//# sourceMappingURL=lspConverter.js.map