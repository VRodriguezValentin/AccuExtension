/**
 * Manejo de mensajes entre webview y extensión para AccuExtension
 * @module utils/messageHandler
 */

const vscode = require('vscode');
const config = require('../constants/config');
const toolManager = require('./toolManager');
const configManager = require('./configManager');
const { getAllShortcutConfigs, updateShortcutConfig } = require('./configManager');

/**
 * Mapeo de manejadores de mensajes
 */
const messageHandlers = {
    [config.MESSAGE_COMMANDS.OPEN_AST]: () => {
        toolManager.openASTManager();
    },
    
    [config.MESSAGE_COMMANDS.OPEN_TFS]: (url) => {
        toolManager.openTFS(url);
    },
    
    [config.MESSAGE_COMMANDS.SEARCH_AST]: (url) => {
        toolManager.openTFS(url);
    },
    
    [config.MESSAGE_COMMANDS.OPEN_TOOL]: (path, name) => {
        toolManager.openTool(path, name);
    },
    
    [config.MESSAGE_COMMANDS.CHECK_AND_OPEN_TOOL]: (path, name, toolName) => {
        toolManager.checkAndOpenTool(path, name, toolName);
    },
    
    [config.MESSAGE_COMMANDS.GET_TOOL_PATH]: (panel, toolName) => {
        handleGetToolPath(panel, toolName);
    },
    
    [config.MESSAGE_COMMANDS.SHOW_ERROR]: (message) => {
        vscode.window.showErrorMessage(message);
    },
    
    [config.MESSAGE_COMMANDS.OPEN_SETTINGS]: () => {
        configManager.openExtensionSettings();
    },
    
    [config.MESSAGE_COMMANDS.OPEN_THEME_SETTINGS]: () => {
        configManager.openThemeSettings();
    },
    
    [config.MESSAGE_COMMANDS.UPDATE_LOGO]: (panel, context) => {
        updateLogoForTheme(panel, context);
    },
    
    [config.MESSAGE_COMMANDS.OPEN_CUSTOM_URL]: (url) => {
        toolManager.openTFS(url);
    },
    
    [config.MESSAGE_COMMANDS.OPEN_SHORTCUTS_SETTINGS]: () => {
        configManager.openShortcutsSettings();
    },
    
    [config.MESSAGE_COMMANDS.OPEN_TIME_REPORT]: () => {
        configManager.openTimeReport();
    },
    
    [config.MESSAGE_COMMANDS.SAVE_TFS_SELECTION]: (area, equipo) => {
        configManager.saveTFSSelection(area, equipo);
    },
    
    [config.MESSAGE_COMMANDS.GET_TFS_SELECTION]: (panel) => {
        try {
            const selection = configManager.getTFSSelection();
            
            if (panel && panel.webview) {
                panel.webview.postMessage({
                    command: 'tfsSelectionLoaded',
                    area: selection.area,
                    equipo: selection.equipo
                });
            }
        } catch (error) {
            // Error silencioso para mantener la consola limpia
        }
    }
};

/**
 * Maneja un mensaje recibido del webview
 * @param {Object} message - Mensaje recibido
 * @param {vscode.WebviewPanel} panel - Panel del webview
 * @param {vscode.ExtensionContext} context - Contexto de la extensión
 */
function handleMessage(message, panel, context) {
    const handler = messageHandlers[message.command];
    
    if (handler) {
        try {
            // Extraer los parámetros del mensaje (excluyendo 'command')
            const params = Object.values(message).slice(1);
            
            // Agregar panel y context si son necesarios
            if (message.command === config.MESSAGE_COMMANDS.GET_TOOL_PATH) {
                handler(panel, ...params);
            } else if (message.command === config.MESSAGE_COMMANDS.UPDATE_LOGO) {
                handler(panel, context);
            } else if (message.command === config.MESSAGE_COMMANDS.GET_TFS_SELECTION) {
                handler(panel);
            } else {
                handler(...params);
            }
        } catch (error) {
            // Error silencioso para mantener la consola limpia
        }
    } else {
        // Comando desconocido, continuar sin mostrar warning
    }
}

/**
 * Maneja la solicitud de ruta de herramienta desde el webview
 * @param {vscode.WebviewPanel} panel - Panel del webview
 * @param {string} toolName - Nombre de la herramienta solicitada
 */
function handleGetToolPath(panel, toolName) {
    const path = configManager.getToolPath(toolName);
    
    if (path) {
        panel.webview.postMessage({ 
            command: config.MESSAGE_COMMANDS.TOOL_PATH, 
            path: path 
        });
    } else {
        panel.webview.postMessage({ 
            command: config.MESSAGE_COMMANDS.TOOL_PATH, 
            path: null 
        });
    }
}

/**
 * Actualiza el logo del webview basado en el tema actual
 * @param {vscode.WebviewPanel} panel - Panel del webview
 * @param {vscode.ExtensionContext} context - Contexto de la extensión
 */
function updateLogoForTheme(panel, context) {
    const { getCurrentTheme } = require('./configManager');
    const theme = getCurrentTheme();
    const logoFileName = theme.isDark ? config.LOGO_BY_THEME.dark : config.LOGO_BY_THEME.light;
    
    const imagePath = vscode.Uri.file(
        require('path').join(context.extensionPath, 'media', logoFileName)
    );
    const imageSrc = panel.webview.asWebviewUri(imagePath);
    
    panel.webview.postMessage({
        command: config.MESSAGE_COMMANDS.UPDATE_LOGO_VIEW,
        imageSrc: imageSrc.toString()
    });
}

/**
 * Configura el listener de mensajes para un panel webview
 * @param {vscode.WebviewPanel} panel - Panel del webview
 * @param {vscode.ExtensionContext} context - Contexto de la extensión
 */
function setupMessageListener(panel, context) {
    panel.webview.onDidReceiveMessage(
        message => {
            if (message.command === 'syncShortcutToSettings') {
                try {
                    const idx = Number(message.index);
                    const data = message.data || {};
                    updateShortcutConfig(idx, {
                        character: data.character || '',
                        url: data.url || '',
                        name: data.name || ''
                    });
                } catch (e) {
                    // Error silencioso para mantener la consola limpia
                }
                return;
            }
            if (message.command === 'bulkSyncShortcutsToSettings') {
                try {
                    const list = Array.isArray(message.data) ? message.data : [];
                    list.slice(0,5).forEach((item, idx) => {
                        updateShortcutConfig(idx, {
                            character: (item && item.character) || '',
                            url: (item && item.url) || '',
                            name: (item && item.name) || ''
                        });
                    });
                } catch (e) {
                    // Error silencioso para mantener la consola limpia
                }
                return;
            }
            handleMessage(message, panel, context);
        },
        undefined,
        context.subscriptions
    );

    // Enviar configuraciones iniciales
    try {
        const cfgs = getAllShortcutConfigs();
        panel.webview.postMessage({ command: 'initShortcutsFromSettings', data: cfgs });
    } catch (e) {
        // Error silencioso para mantener la consola limpia
    }

    // Escuchar cambios en configuración para sincronizar hacia el webview
    const configChangeDisposable = vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('accuextension.shortcuts')) {
            try {
                const cfgs = getAllShortcutConfigs();
                panel.webview.postMessage({ command: 'initShortcutsFromSettings', data: cfgs });
            } catch (err) {
                // Error silencioso para mantener la consola limpia
            }
        }
    });
    context.subscriptions.push(configChangeDisposable);

    // Reenviar accesos cuando el panel vuelve a ser visible
    panel.onDidChangeViewState(() => {
        if (panel.visible) {
            try {
                const cfgs = getAllShortcutConfigs();
                panel.webview.postMessage({ command: 'initShortcutsFromSettings', data: cfgs });
            } catch (err) {
                // Error silencioso para mantener la consola limpia
            }
        }
    }, null, context.subscriptions);
}

module.exports = {
    handleMessage,
    handleGetToolPath,
    updateLogoForTheme,
    setupMessageListener
}; 