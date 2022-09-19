// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as process from 'child_process';

let myStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
	
	console.log('Congratulations, your extension "status-so" is now active!');

	let disposable = vscode.commands.registerCommand('status-so.showExpiration', () => {
		getStatusSO();
	});
	context.subscriptions.push(disposable);

	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
	myStatusBarItem.command = 'status-so.showExpiration';
	myStatusBarItem.text = 'Waiting for informations';
	myStatusBarItem.tooltip = 'Current Organization Expiration Date';
	context.subscriptions.push(myStatusBarItem);
	context.subscriptions.push(vscode.window.onDidChangeWindowState(getStatusSO));

	myStatusBarItem.show();
	
	getStatusSO();
}

const execShell = (cmd: string) =>
new Promise<string>((resolve, reject) => {
  process.exec(cmd, (err, out) => {
	if (err) { return resolve(cmd + ' error!'); }
	return resolve(out);
  });
});

async function getStatusSO() {
	let workspaceRoot = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
	const display = await execShell(`cd ${workspaceRoot} && sfdx force:org:display --json`);
	try {
		const infoSO = JSON.parse(display);
		infoSO.result.status ? updateInfoSO(infoSO.result.status, infoSO.result.expirationDate) : modifyItemBar('');
	} catch(e) {
		modifyItemBar('');
	}
}

function updateInfoSO(status: string, date: string) {
	if(status !== 'Active') {
		modifyItemBar('Org Expired !', new vscode.ThemeColor('statusBarItem.errorBackground'));
	} else {
		let diffDays = calculateDifferenceDays(date);
		console.log(diffDays);
		if(diffDays === 0) { 
			modifyItemBar('Warning, this is the last day !', new vscode.ThemeColor('statusBarItem.errorBackground')); 
		} else {
			diffDays <= 2 ? 
			modifyItemBar(`Org expire in ${diffDays} days`, new vscode.ThemeColor('statusBarItem.warningBackground')) :
			modifyItemBar(`Org expire in ${diffDays} days`, new vscode.ThemeColor('statusBarItem.standardBackground'));
		}

	}
}

function modifyItemBar(text: string, backgroundColor?: vscode.ThemeColor) {
	myStatusBarItem.text = text;
	myStatusBarItem.backgroundColor = backgroundColor;
	myStatusBarItem.show();
}

function calculateDifferenceDays(date: string) {
	let expirationDate = new Date(date);
	let today = new Date();
	let difference = Math.abs(expirationDate.getTime() - today.getTime());
	console.log(difference);
	console.log(difference / (1000 * 3600 * 24));
	return Math.floor(difference / (1000 * 3600 * 24));
}

// this method is called when your extension is deactivated
export function deactivate() {}
