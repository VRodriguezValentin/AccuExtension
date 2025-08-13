const vscode = require('vscode');

// Importar módulos refactorizados
const webviewManager = require('./utils/webviewManager');
const messageHandler = require('./utils/messageHandler');
const configManager = require('./utils/configManager');
const config = require('./constants/config');

// Variable global para rastrear si el panel ya está abierto
let currentPanel = undefined;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('AccuExtension esta activa!');

    // Registrar el comando principal
    let disposable = vscode.commands.registerCommand('accuextension.showImage', () => {
        // Si ya hay un panel abierto, mostrarlo en lugar de crear uno nuevo
        if (currentPanel) {
            currentPanel.reveal(vscode.ViewColumn.One);
            return;
        }

        // Crear y configurar el panel del webview
        const panel = webviewManager.createWebviewPanel(context);
        currentPanel = panel;

        // Limpiar la referencia cuando el panel se cierre
        panel.onDidDispose(() => {
            currentPanel = undefined;
        }, null, context.subscriptions);

        // Configurar el contenido del webview
        webviewManager.setupWebviewContent(context, panel);

        // Configurar el listener de mensajes
        messageHandler.setupMessageListener(panel, context);
    });

    // Registrar el comando de configuración
    let settingsDisposable = vscode.commands.registerCommand('accuextension.openSettings', () => {
        configManager.openExtensionSettings();
    });

    // Registrar el comando de configuración de accesos directos
    let shortcutsSettingsDisposable = vscode.commands.registerCommand('accuextension.openShortcutsSettings', () => {
        configManager.openShortcutsSettings();
    });

    // Comando para vaciar un acceso directo desde Settings UI
    let clearShortcutDisposable = vscode.commands.registerCommand('accuextension.clearShortcut', (args) => {
        // args puede venir como [index] desde el enlace markdown
        const index = Array.isArray(args) ? Number(args[0]) : Number(args);
        configManager.clearShortcutByCommand(index);
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(settingsDisposable);
    context.subscriptions.push(shortcutsSettingsDisposable);
    context.subscriptions.push(clearShortcutDisposable);

    // Crear el botón en la StatusBar
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(rocket) AccuExtension';
    statusBarItem.tooltip = 'Abrir AccuExtension';
    statusBarItem.command = 'accuextension.showImage';
    statusBarItem.show();

    context.subscriptions.push(statusBarItem);

    // Escuchar cambios en el tema del editor
    vscode.window.onDidChangeActiveColorTheme(() => {
        if (currentPanel) {
            messageHandler.updateLogoForTheme(currentPanel, context);
        }
    });
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
} 