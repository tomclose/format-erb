import * as vscode from "vscode";
import { execSync } from "child_process";
import * as path from "path";
import { hrtime } from "process";

let firstWorkspace = function () {
  return vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders[0]
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : null;
};

function getCurrentPath(fileName: string): string {
  return firstWorkspace() || path.dirname(fileName);
}

export class ErbFormatter {
  public _channel: vscode.OutputChannel;
  public _config: vscode.WorkspaceConfiguration;

  constructor() {
    this._channel = vscode.window.createOutputChannel("erb formatter");
    this._config = vscode.workspace.getConfiguration("format-erb");
  }

  get command(): string {
    if (this._config["useBundler"]) {
      return `${this._config["bundlerPath"]} exec htmlbeautifier`;
    } else {
      return `${this._config["commandPath"]}`;
    }
  }

  provideDocumentFormattingEdits(
    document: vscode.TextDocument
  ): vscode.TextEdit[] {
    const cmd = `${this.command} ${this.getArgs().join(" ")}`;
    this.log(`executing command: ${cmd}`);
    const startTime = hrtime();
    const stdout = execSync(cmd, {
      cwd: getCurrentPath(document.fileName),
      input: document.getText(),
    });
    const [secs, nanosecs] = hrtime(startTime);
    this.log(
      `command completed in ${secs}s ${Math.round(nanosecs / 1000000)}ms`
    );

    return [
      new vscode.TextEdit(this.getFullRange(document), stdout.toString()),
    ];
  }

  private log(text: string) {
    console.log(text);
    this._channel.appendLine(text);
  }

  private getFullRange(document: vscode.TextDocument): vscode.Range {
    return new vscode.Range(
      new vscode.Position(0, 0),
      document.lineAt(document.lineCount - 1).range.end
    );
  }

  private getArgs(): string[] {
    const config = vscode.workspace.getConfiguration("format-erb");
    const args = [
      "--indent-by",
      config["indentBy"],
      "--keep-blank-lines",
      config["keepBlankLines"],
      "--tab-stops",
      config["tabStops"],
    ];

    if (config["stopOnErrors"]) {
      args.push("--stop-on-errors");
    }
    if (config["tab"]) {
      args.push("--tab");
    }
    return args;
  }
}
