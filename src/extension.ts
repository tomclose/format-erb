// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ErbFormatter } from "./erb-formatter";

export async function activate(context: vscode.ExtensionContext) {
  const formatter = new ErbFormatter();
  context.subscriptions.push(formatter._channel);

  const disposable = vscode.languages.registerDocumentFormattingEditProvider(
    "erb",
    formatter
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
