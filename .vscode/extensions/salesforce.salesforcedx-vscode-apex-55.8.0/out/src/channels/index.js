"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const commands_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/commands");
const vscode = require("vscode");
const messages_1 = require("../messages");
exports.OUTPUT_CHANNEL = vscode.window.createOutputChannel(messages_1.nls.localize('channel_name'));
exports.channelService = new commands_1.ChannelService(exports.OUTPUT_CHANNEL);
//# sourceMappingURL=index.js.map