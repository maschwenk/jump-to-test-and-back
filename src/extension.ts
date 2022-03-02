'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

const findAndNavigateToFile = (globPattern: string) : void => {
  vscode.workspace.findFiles(globPattern, undefined, 2).then((ps: vscode.Uri[]): void => {
    if (ps.length === 0) {
      vscode.window.setStatusBarMessage(`jumpToTestAndBack: Unable to find test file using glob ${globPattern}`, 30000);
      return;  
    }
    if (ps.length > 1) {
      vscode.window.setStatusBarMessage('jumpToTestAndBack: Found multiple results, going with the first', 30000);
    }  

    vscode.commands.executeCommand('vscode.open', vscode.Uri.file(ps[0].path));
  });
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.jumpToTestAndBack', () => {
    const fileName = path.basename(vscode.window.activeTextEditor.document.fileName)

    if (fileName.endsWith('.test.ts')) {
      findAndNavigateToFile(`**/*${fileName.replace('.test.ts', '.ts')}`);
    } else if (fileName.endsWith('.ts')) {
      findAndNavigateToFile(`**/*${fileName.replace('.ts', '.test.ts')}`);
    } else {
      vscode.window.setStatusBarMessage('jumpToTestAndBack: Cant parse appropiate filename', 3000);
      return 
    }    
  });

  context.subscriptions.push(disposable);
}
