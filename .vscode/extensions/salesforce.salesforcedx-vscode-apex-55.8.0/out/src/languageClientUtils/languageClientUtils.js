"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const lspConverter_1 = require("../views/lspConverter");
class LanguageClientUtils {
    constructor() {
        this.status = new LanguageClientStatus(ClientStatus.Unavailable, '');
    }
    static getInstance() {
        if (!LanguageClientUtils.instance) {
            LanguageClientUtils.instance = new LanguageClientUtils();
        }
        return LanguageClientUtils.instance;
    }
    getClientInstance() {
        return this.clientInstance;
    }
    setClientInstance(languageClient) {
        this.clientInstance = languageClient;
    }
    getStatus() {
        return this.status;
    }
    setStatus(status, message) {
        this.status = new LanguageClientStatus(status, message);
    }
}
exports.LanguageClientUtils = LanguageClientUtils;
var ClientStatus;
(function (ClientStatus) {
    ClientStatus[ClientStatus["Unavailable"] = 0] = "Unavailable";
    ClientStatus[ClientStatus["Indexing"] = 1] = "Indexing";
    ClientStatus[ClientStatus["Error"] = 2] = "Error";
    ClientStatus[ClientStatus["Ready"] = 3] = "Ready";
})(ClientStatus = exports.ClientStatus || (exports.ClientStatus = {}));
class LanguageClientStatus {
    constructor(status, message) {
        this.status = status;
        this.message = message;
    }
    isReady() {
        return this.status === ClientStatus.Ready;
    }
    isIndexing() {
        return this.status === ClientStatus.Indexing;
    }
    failedToInitialize() {
        return this.status === ClientStatus.Error;
    }
    getStatusMessage() {
        return this.message;
    }
}
exports.LanguageClientStatus = LanguageClientStatus;
function getLineBreakpointInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        let response = {};
        const languageClient = LanguageClientUtils.getInstance().getClientInstance();
        if (languageClient) {
            response = yield languageClient.sendRequest(constants_1.DEBUGGER_LINE_BREAKPOINTS);
        }
        return Promise.resolve(response);
    });
}
exports.getLineBreakpointInfo = getLineBreakpointInfo;
function getApexTests() {
    return __awaiter(this, void 0, void 0, function* () {
        let response = new Array();
        const ret = new Array();
        const languageClient = LanguageClientUtils.getInstance().getClientInstance();
        if (languageClient) {
            response = (yield languageClient.sendRequest('test/getTestMethods'));
        }
        for (const requestInfo of response) {
            ret.push(lspConverter_1.ApexLSPConverter.toApexTestMethod(requestInfo));
        }
        return Promise.resolve(ret);
    });
}
exports.getApexTests = getApexTests;
function getExceptionBreakpointInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        let response = {};
        const languageClient = LanguageClientUtils.getInstance().getClientInstance();
        if (languageClient) {
            response = yield languageClient.sendRequest(constants_1.DEBUGGER_EXCEPTION_BREAKPOINTS);
        }
        return Promise.resolve(response);
    });
}
exports.getExceptionBreakpointInfo = getExceptionBreakpointInfo;
//# sourceMappingURL=languageClientUtils.js.map