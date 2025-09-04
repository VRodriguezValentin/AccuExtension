/**
 * Manejo de mensajes entre webview y extensión para AccuExtension
 * @module utils/messageHandler
 */

const vscode = require('vscode');
const config = require('../constants/config');
const toolManager = require('./toolManager');
const configManager = require('./configManager');
const sqlConnectionManager = require('./sqlConnectionManager');
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
    },
    
    [config.MESSAGE_COMMANDS.EXECUTE_SQL_QUERY]: async (connectionKey, query) => {
        try {
            const result = await sqlConnectionManager.executeSqlQuery(connectionKey, query);
            return result;
        } catch (error) {
            throw error;
        }
    },
    
    [config.MESSAGE_COMMANDS.GET_SQL_CONNECTIONS]: () => {
        return sqlConnectionManager.getSqlConnections();
    },
    
    [config.MESSAGE_COMMANDS.SAVE_SQL_CONNECTION]: async (connectionKey, connectionData) => {
        await sqlConnectionManager.saveSqlConnection(connectionKey, connectionData);
    },
    
    [config.MESSAGE_COMMANDS.GET_SQL_HISTORY]: () => {
        return sqlConnectionManager.getQueryHistory();
    },
    
    [config.MESSAGE_COMMANDS.EXPORT_SQL_RESULTS]: async (data, format) => {
        return await sqlConnectionManager.exportResults(data, format);
    },
    
    [config.MESSAGE_COMMANDS.OPEN_SQL_SETTINGS]: () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'accuextension.sql');
    },
    
    [config.MESSAGE_COMMANDS.DIAGNOSE_SQL]: () => {
        const diagnosis = sqlConnectionManager.diagnoseSqlConfiguration();
        let message = 'DIAGNÓSTICO SQL:\n\n';
        message += `ISQL Path: ${diagnosis.isqlPath}\n`;
        message += `ISQL Existe: ${diagnosis.isqlExists ? '✅' : '❌'}\n`;
        message += `Directorio Temporal: ${diagnosis.tempDir}\n`;
        message += `Dir Temp Existe: ${diagnosis.tempDirExists ? '✅' : '❌'}\n`;
        message += `Dir Temp Escribible: ${diagnosis.tempDirWritable ? '✅' : '❌'}\n`;
        if (diagnosis.tempDirWritableError) {
            message += `Error Escritura: ${diagnosis.tempDirWritableError}\n`;
        }
        message += `Home Directory: ${diagnosis.homeDir}\n`;
        message += `Plataforma: ${diagnosis.platform}\n`;
        message += `Conexiones configuradas: ${diagnosis.connections}\n`;
        message += `Ancho de salida: ${diagnosis.outputWidth}`;
        
        vscode.window.showInformationMessage(message, { modal: true });
    },
    
    [config.MESSAGE_COMMANDS.TEST_SQL_CONNECTION]: async (connectionKey) => {
        try {
            const result = await sqlConnectionManager.testSqlConnection(connectionKey);
            let message = `PRUEBA DE CONEXIÓN: ${connectionKey}\n\n`;
            
            if (result.success) {
                message += `✅ CONEXIÓN EXITOSA\n\n`;
                message += `Resultado:\n${result.output || 'Sin salida'}`;
            } else {
                message += `❌ CONEXIÓN FALLIDA\n\n`;
                message += `Error: ${result.error}\n`;
                if (result.stderr) {
                    message += `STDERR: ${result.stderr}\n`;
                }
                if (result.exitCode) {
                    message += `Código de salida: ${result.exitCode}`;
                }
            }
            
            vscode.window.showInformationMessage(message, { modal: true });
        } catch (error) {
            vscode.window.showErrorMessage(`Error en prueba de conexión: ${error.message}`);
        }
    }
};

/**
 * Maneja un mensaje recibido del webview
 * @param {Object} message - Mensaje recibido
 * @param {vscode.WebviewPanel} panel - Panel del webview
 * @param {vscode.ExtensionContext} context - Contexto de la extensión
 */
async function handleMessage(message, panel, context) {
    const handler = messageHandlers[message.command];
    
    if (handler) {
        try {
            // Manejar comandos SQL especiales
            if (message.command === config.MESSAGE_COMMANDS.EXECUTE_SQL_QUERY) {
                const result = await handler(message.connectionKey, message.query);
                
                // Enviar resultado de vuelta al webview
                if (panel && panel.webview) {
                    panel.webview.postMessage({
                        command: 'sqlQueryResult',
                        messageId: message.messageId,
                        success: true,
                        result: result
                    });
                }
                return;
            }
            
            if (message.command === config.MESSAGE_COMMANDS.GET_SQL_CONNECTIONS) {
                const connections = handler();
                
                if (panel && panel.webview) {
                    panel.webview.postMessage({
                        command: 'sqlConnectionsLoaded',
                        connections: connections
                    });
                }
                return;
            }
            
            if (message.command === config.MESSAGE_COMMANDS.GET_SQL_HISTORY) {
                const history = handler();
                
                if (panel && panel.webview) {
                    panel.webview.postMessage({
                        command: 'sqlHistoryLoaded',
                        history: history
                    });
                }
                return;
            }
            
            if (message.command === config.MESSAGE_COMMANDS.TEST_SQL_CONNECTION) {
                await handler(message.connectionKey);
                return;
            }
            
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
                const result = await handler(...params);
                
                // Si hay resultado y es una operación SQL, enviarlo de vuelta
                if (result && message.command.includes('SQL')) {
                    panel.webview.postMessage({
                        command: 'sqlOperationResult',
                        result: result
                    });
                }
            }
        } catch (error) {
            // Enviar error de SQL de vuelta al webview si es necesario
            if (message.command === config.MESSAGE_COMMANDS.EXECUTE_SQL_QUERY && panel && panel.webview) {
                panel.webview.postMessage({
                    command: 'sqlQueryResult',
                    messageId: message.messageId,
                    success: false,
                    error: error.message
                });
            }
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