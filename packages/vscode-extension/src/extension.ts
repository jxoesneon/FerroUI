/**
 * FerroUI VS Code Extension (G.3)
 * Provides AI-powered component generation and validation
 */

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('FerroUI extension activated');

  // Generate Component command
  const generateDisposable = vscode.commands.registerCommand(
    'ferroui.generateComponent',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
      }

      const prompt = await vscode.window.showInputBox({
        prompt: 'Describe the component you want to generate',
        placeHolder: 'e.g., A dashboard with metrics cards and a line chart',
      });

      if (!prompt) return;

      // Show progress
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Generating component with FerroUI...',
        cancellable: false,
      }, async () => {
        try {
          const config = vscode.workspace.getConfiguration('ferroui');
          const apiUrl = config.get<string>('apiUrl') || 'https://api.ferroui.dev';
          const apiKey = config.get<string>('apiKey');

          if (!apiKey) {
            throw new Error('FerroUI API key not configured');
          }

          // Call FerroUI API
          const response = await fetch(`${apiUrl}/api/ferroui/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              prompt,
              context: {
                userId: 'vscode-extension',
                requestId: `vscode-${Date.now()}`,
                permissions: ['read', 'write'],
                locale: vscode.env.language,
              },
            }),
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const result = await response.json();
          
          // Insert generated code
          const position = editor.selection.active;
          editor.edit((editBuilder) => {
            editBuilder.insert(position, JSON.stringify(result.layout, null, 2));
          });

          vscode.window.showInformationMessage('Component generated successfully!');
        } catch (error) {
          vscode.window.showErrorMessage(`FerroUI error: ${error}`);
        }
      });
    }
  );

  // Validate Layout command
  const validateDisposable = vscode.commands.registerCommand(
    'ferroui.validateLayout',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const text = editor.document.getText();
      
      try {
        const layout = JSON.parse(text);
        
        // Call validation API
        const config = vscode.workspace.getConfiguration('ferroui');
        const apiUrl = config.get<string>('apiUrl');
        
        const response = await fetch(`${apiUrl}/api/v1/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(layout),
        });

        const validation = await response.json();

        if (validation.valid) {
          vscode.window.showInformationMessage('✅ Layout is valid');
        } else {
          const diagnostics: vscode.Diagnostic[] = validation.errors.map(
            (err: any) => new vscode.Diagnostic(
              new vscode.Range(0, 0, 0, 0),
              err.message,
              vscode.DiagnosticSeverity.Error
            )
          );
          
          const diagnosticCollection = vscode.languages.createDiagnosticCollection('ferroui');
          diagnosticCollection.set(editor.document.uri, diagnostics);
          
          vscode.window.showWarningMessage(`❌ Layout has ${validation.errors.length} errors`);
        }
      } catch {
        vscode.window.showErrorMessage('Invalid JSON in document');
      }
    }
  );

  context.subscriptions.push(generateDisposable, validateDisposable);
}

export function deactivate() {
  console.log('FerroUI extension deactivated');
}
