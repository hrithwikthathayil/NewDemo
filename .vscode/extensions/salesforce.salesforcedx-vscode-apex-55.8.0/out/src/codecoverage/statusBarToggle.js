"use strict";
/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const messages_1 = require("../messages");
class StatusBarToggle {
    constructor() {
        this.statusBarItem = vscode_1.window.createStatusBarItem();
        this.statusBarItem.command = StatusBarToggle.toggleCodeCovCommand;
        this.statusBarItem.text = StatusBarToggle.showIcon;
        this.statusBarItem.tooltip = StatusBarToggle.toolTip;
        this.statusBarItem.show();
        this.isEnabled = false;
    }
    get isHighlightingEnabled() {
        return this.isEnabled;
    }
    toggle(active) {
        if (active) {
            this.statusBarItem.text = StatusBarToggle.hideIcon;
            this.isEnabled = true;
        }
        else {
            this.statusBarItem.text = StatusBarToggle.showIcon;
            this.isEnabled = false;
        }
    }
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.StatusBarToggle = StatusBarToggle;
StatusBarToggle.toggleCodeCovCommand = 'sfdx.force.apex.toggle.colorizer';
StatusBarToggle.showIcon = '$(three-bars)';
StatusBarToggle.hideIcon = '$(tasklist)';
StatusBarToggle.toolTip = messages_1.nls.localize('colorizer_statusbar_hover_text');
//# sourceMappingURL=statusBarToggle.js.map