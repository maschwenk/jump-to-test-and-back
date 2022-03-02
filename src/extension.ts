'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

const findAndNavigateToFile = (globPattern: any) : void => {
  vscode.workspace.findFiles(globPattern, '**/node_modules').then((ps: vscode.Uri[]): void => {
    if (ps.length === 0) {
      vscode.window.setStatusBarMessage(`jumpToTestAndBack: Unable to find test file using glob ${globPattern}`, 30000);
      return;  
    }
    if (ps.length > 1) {
      vscode.window.setStatusBarMessage(`jumpToTestAndBack: Found ${ps.length} results, going with the first`, 30000);
    }  

    vscode.commands.executeCommand('vscode.open', vscode.Uri.file(ps[0].path));
  });
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.jumpToTestAndBack', () => {
    const fileName = path.basename(vscode.window.activeTextEditor.document.fileName)
    const containingDirectory = path.dirname(vscode.window.activeTextEditor.document.fileName)
    const containingDirectoryAsRelativePath = vscode.workspace.asRelativePath(containingDirectory)
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0];

    if (fileName.endsWith('.test.ts')) {
      // For tests, we need to jump out of the __tests__ directory
      // For some reason, resolve adds a leading slash, so we need to remove it with substring
      const adjustedPath = containingDirectoryAsRelativePath.endsWith('__tests__') ? 
        path.resolve(containingDirectoryAsRelativePath, '..').substring(1) :
        containingDirectoryAsRelativePath
      const relativeGlob = new vscode.RelativePattern(workspaceRoot, `${adjustedPath}/**/${fileName.replace('.test.ts', '.ts')}`)
      findAndNavigateToFile(relativeGlob);
    } else if (fileName.endsWith('.ts')) {
      const relativeGlob = new vscode.RelativePattern(workspaceRoot, `${containingDirectoryAsRelativePath}/**/${fileName.replace('.ts', '.test.ts')}`)
      findAndNavigateToFile(relativeGlob);
    } else {
      vscode.window.setStatusBarMessage('jumpToTestAndBack: Cant parse appropiate filename', 3000);
      return 
    }    
  });

  context.subscriptions.push(disposable);
}
