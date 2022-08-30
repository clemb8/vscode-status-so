/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("child_process");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __webpack_require__(1);
const process = __webpack_require__(2);
let myStatusBarItem;
function activate(context) {
    console.log('Congratulations, your extension "status-so" is now active!');
    let disposable = vscode.commands.registerCommand('status-so.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from status-SO!');
    });
    context.subscriptions.push(disposable);
    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
    myStatusBarItem.text = 'Waiting for informations';
    myStatusBarItem.tooltip = 'Current Organization Expiration Date';
    context.subscriptions.push(myStatusBarItem);
    context.subscriptions.push(vscode.window.onDidChangeWindowState(getStatusSO));
    myStatusBarItem.show();
    getStatusSO();
}
exports.activate = activate;
const execShell = (cmd) => new Promise((resolve, reject) => {
    process.exec(cmd, (err, out) => {
        if (err) {
            return resolve(cmd + ' error!');
        }
        return resolve(out);
    });
});
async function getStatusSO() {
    let workspaceRoot = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
    const display = await execShell(`cd ${workspaceRoot} && sfdx force:org:display --json`);
    try {
        const infoSO = JSON.parse(display);
        infoSO.result.status ? updateInfoSO(infoSO.result.status, infoSO.result.expirationDate) : modifyItemBar('');
    }
    catch (e) {
        modifyItemBar('');
    }
}
function updateInfoSO(status, date) {
    if (status !== 'Active') {
        modifyItemBar('Org Expired !', new vscode.ThemeColor('statusBarItem.errorBackground'));
    }
    else {
        let diffDays = calculateDifferenceDays(date);
        console.log(diffDays);
        if (diffDays === 0) {
            modifyItemBar('Warning, this is the last day !', new vscode.ThemeColor('statusBarItem.errorBackground'));
        }
        else {
            diffDays <= 2 ?
                modifyItemBar(`Org expire in ${diffDays} days`, new vscode.ThemeColor('statusBarItem.warningBackground')) :
                modifyItemBar(`Org expire in ${diffDays} days`, myStatusBarItem.backgroundColor);
        }
    }
}
function modifyItemBar(text, backgroundColor) {
    myStatusBarItem.text = text;
    myStatusBarItem.backgroundColor = backgroundColor;
    myStatusBarItem.show();
}
function calculateDifferenceDays(date) {
    let expirationDate = new Date(date);
    let today = new Date();
    let difference = Math.abs(expirationDate.getTime() - today.getTime());
    console.log(difference);
    console.log(difference / (1000 * 3600 * 24));
    return Math.floor(difference / (1000 * 3600 * 24));
}
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map