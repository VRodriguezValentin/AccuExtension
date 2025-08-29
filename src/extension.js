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
    // Establecer el contexto global para que esté disponible en otros módulos
    global.extensionContext = context;
    
    // Registrar el comando para abrir el webview
    let webviewDisposable = vscode.commands.registerCommand('accuextension.openWebview', () => {
        createWebviewPanel(context);
    });
    
    context.subscriptions.push(webviewDisposable);

    // Registrar el comando principal
    let showImageDisposable = vscode.commands.registerCommand('accuextension.showImage', () => {
        // Si ya hay un panel abierto, mostrarlo en lugar de crear uno nuevo
        if (currentPanel) {
            currentPanel.reveal(vscode.ViewColumn.Beside); // Cambiar a panel lateral
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

    // Comando para abrir configuración de accesos directos
    let shortcutsSettingsDisposable = vscode.commands.registerCommand('accuextension.openShortcutsSettings', () => {
        configManager.openShortcutsSettings();
    });

    // Comando para vaciar acceso directo
    let clearShortcutDisposable = vscode.commands.registerCommand('accuextension.clearShortcut', (args) => {
        configManager.clearShortcutByCommand(args);
    });

    // Comando para abrir time report
    let openTimeReportDisposable = vscode.commands.registerCommand('accuextension.openTimeReport', () => {
        configManager.openTimeReport();
    });

    context.subscriptions.push(showImageDisposable);
    context.subscriptions.push(settingsDisposable);
    context.subscriptions.push(shortcutsSettingsDisposable);
    context.subscriptions.push(clearShortcutDisposable);
    context.subscriptions.push(openTimeReportDisposable);

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

    // Sistema de recordatorios
    let reminderTimer = null;

    /**
     * Inicia el sistema de recordatorios
     */
    function startReminderSystem() {
        if (reminderTimer) {
            clearInterval(reminderTimer);
        }

        if (!configManager.areRemindersEnabled()) {
            return;
        }

        const intervalMs = configManager.getReminderIntervalMs();
        if (intervalMs > 0) {
            reminderTimer = setInterval(() => {
                showReminderNotification();
            }, intervalMs);
        }
    }

    /**
     * Reinicia el sistema de recordatorios
     */
    function restartReminderSystem() {
        startReminderSystem();
    }

    /**
     * Muestra la notificación de recordatorio
     */
    function showReminderNotification() {
        const notification = vscode.window.showInformationMessage(
            '⏰ ¡No te olvides de cargar las horas de trabajo!',
            'Abrir Time Report'
        );

        notification.then(selection => {
            if (selection === 'Abrir Time Report') {
                configManager.openTimeReport();
            }
        });
    }

    // Escuchar cambios en la configuración de recordatorios
    vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('accuextension.reminders')) {
            restartReminderSystem();
        }
    });

    // Iniciar sistema de recordatorios
    startReminderSystem();
}

function deactivate() {
    // Limpiar el contexto global
    global.extensionContext = null;
}

module.exports = {
    activate,
    deactivate
} 