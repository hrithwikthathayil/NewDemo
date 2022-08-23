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
/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const vscode = require("vscode");
function isEmpty(value) {
    return !value || value.length === 0;
}
exports.isEmpty = isEmpty;
function isNotEmpty(value) {
    return !isEmpty(value);
}
// cache last test class and test method values to
// enable re-running w/o command context via built-in LRU
class ForceApexTestRunCacheService {
    constructor() {
        this.lastClassTestParam = '';
        this.lastMethodTestParam = '';
    }
    static getInstance() {
        if (!ForceApexTestRunCacheService.instance) {
            ForceApexTestRunCacheService.instance = new ForceApexTestRunCacheService();
        }
        return ForceApexTestRunCacheService.instance;
    }
    getLastClassTestParam() {
        return this.lastClassTestParam;
    }
    getLastMethodTestParam() {
        return this.lastMethodTestParam;
    }
    hasCachedClassTestParam() {
        return isNotEmpty(this.lastClassTestParam);
    }
    hasCachedMethodTestParam() {
        return isNotEmpty(this.lastMethodTestParam);
    }
    setCachedClassTestParam(test) {
        return __awaiter(this, void 0, void 0, function* () {
            // enable then run 'last executed' command so command
            // added to 'recently used'
            yield vscode.commands.executeCommand('setContext', 'sfdx:has_cached_test_class', true);
            this.lastClassTestParam = test;
        });
    }
    setCachedMethodTestParam(test) {
        return __awaiter(this, void 0, void 0, function* () {
            // enable then run 'last executed' command so command
            // added to 'recently used'
            yield vscode.commands.executeCommand('setContext', 'sfdx:has_cached_test_method', true);
            this.lastMethodTestParam = test;
        });
    }
}
exports.forceApexTestRunCacheService = ForceApexTestRunCacheService.getInstance();
//# sourceMappingURL=forceApexTestRunCacheService.js.map