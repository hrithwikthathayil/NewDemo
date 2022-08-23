"use strict";
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This list needs to match Server's LSP ContextKey
 * Server will ignore Key's not available in the server
 */
var ContextKey;
(function (ContextKey) {
    ContextKey["GLOBAL"] = "GLOBAL";
    ContextKey["BEM"] = "BEM";
    ContextKey["DENSITY"] = "DENSITY";
    ContextKey["DEPRECATED"] = "DEPRECATED";
    ContextKey["INVALID"] = "INVALID";
    ContextKey["OVERRIDE"] = "OVERRIDE";
    ContextKey["UTILITY_CLASS"] = "UTILITY_CLASS";
    ContextKey["DESIGN_TOKEN"] = "DESIGN_TOKEN";
    ContextKey["AUTO_SUGGEST"] = "AUTO_SUGGEST";
})(ContextKey = exports.ContextKey || (exports.ContextKey = {}));
//# sourceMappingURL=contextKey.js.map