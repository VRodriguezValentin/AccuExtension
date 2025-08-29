/**
 * Gestión de configuración para AccuExtension
 * @module utils/configManager
 */

const vscode = require('vscode');

/**
 * Obtiene las rutas de las herramientas desde la configuración de Cursor
 * @returns {Object} - Objeto con las rutas configuradas para cada herramienta
 */
function getToolPaths() {
    const config = vscode.workspace.getConfiguration('accuextension.tools');
    return {
        putty: config.get('putty'),
        winscp: config.get('winscp'),
        soapui: config.get('soapui'),
        isqlw: config.get('isqlw'),
        cobis: config.get('cobis'),
        ast: config.get('ast')
    };
}

/**
 * Obtiene la configuración de una herramienta específica
 * @param {string} toolName - Nombre de la herramienta
 * @returns {string|null} - Ruta configurada o null si no está configurada
 */
function getToolPath(toolName) {
    const toolPaths = getToolPaths();
    return toolPaths[toolName] || null;
}

/**
 * Verifica si una herramienta está configurada
 * @param {string} toolName - Nombre de la herramienta
 * @returns {boolean} - True si la herramienta está configurada
 */
function isToolConfigured(toolName) {
    const path = getToolPath(toolName);
    return path !== null && path.trim() !== '';
}

/**
 * Obtiene la configuración del tema actual
 * @returns {Object} - Información del tema actual
 */
function getCurrentTheme() {
    const currentTheme = vscode.window.activeColorTheme;
    return {
        kind: currentTheme.kind,
        isDark: currentTheme.kind === vscode.ColorThemeKind.Dark,
        isLight: currentTheme.kind === vscode.ColorThemeKind.Light
    };
}

/**
 * Abre la configuración de la extensión
 */
function openExtensionSettings() {
    vscode.commands.executeCommand('workbench.action.openSettings', 'accuextension.tools');
}

/**
 * Abre la configuración de temas
 */
function openThemeSettings() {
    try {
        // Comando que abre la paleta de comandos y filtra por tema
        vscode.commands.executeCommand('workbench.action.selectTheme');
    } catch (error) {
        try {
            // Fallback: abrir configuración general
            vscode.commands.executeCommand('workbench.action.openSettings');
        } catch (fallbackError) {
            // Si todo falla, mostrar un mensaje
            vscode.window.showInformationMessage('Para cambiar el tema, ve a Configuración > Color Theme');
        }
    }
}

/**
 * Obtiene la configuración de un acceso directo específico
 * @param {number} index - Índice del acceso directo (0-4)
 * @returns {Object} - Configuración del acceso directo
 */
function getShortcutConfig(index) {
    const config = vscode.workspace.getConfiguration();
    // Leer primero formato granular si existe
    const base = `accuextension.shortcuts.custom${index + 1}`;
    const character = config.get(`${base}.character`);
    const url = config.get(`${base}.url`);
    const name = config.get(`${base}.name`);
    if (character !== undefined || url !== undefined || name !== undefined) {
        return {
            url: url || '',
            character: character || '',
            name: name || ''
        };
    }
    // Fallback al objeto completo si persiste
    return config.get(base, { url: '', character: '', name: '' });
}

/**
 * Actualiza la configuración de un acceso directo
 * @param {number} index - Índice del acceso directo (0-4)
 * @param {Object} config - Nueva configuración
 */
function updateShortcutConfig(index, data) {
    const base = `accuextension.shortcuts.custom${index + 1}`;
    const cfg = vscode.workspace.getConfiguration();
    if (data.hasOwnProperty('character')) {
        cfg.update(`${base}.character`, data.character || '', vscode.ConfigurationTarget.Global);
    }
    if (data.hasOwnProperty('url')) {
        cfg.update(`${base}.url`, data.url || '', vscode.ConfigurationTarget.Global);
    }
    if (data.hasOwnProperty('name')) {
        cfg.update(`${base}.name`, data.name || '', vscode.ConfigurationTarget.Global);
    }
}

/**
 * Obtiene todas las configuraciones de accesos directos
 * @returns {Array} - Array con las configuraciones de los 5 accesos directos
 */
function getAllShortcutConfigs() {
    const configs = [];
    for (let i = 0; i < 5; i++) {
        configs.push(getShortcutConfig(i));
    }
    return configs;
}

/**
 * Limpia la configuración de un acceso directo (lo deja vacío)
 * @param {number} index - Índice del acceso directo (0-4)
 */
function clearShortcutConfig(index) {
    updateShortcutConfig(index, {
        url: '',
        character: '',
        name: ''
    });
}

/**
 * Vacía un acceso directo desde un comando (índice 1..5)
 */
function clearShortcutByCommand(oneBasedIndex) {
    const index = Math.max(0, Math.min(4, (oneBasedIndex || 1) - 1));
    clearShortcutConfig(index);
}

/**
 * Abre la configuración de accesos directos
 */
function openShortcutsSettings() {
    vscode.commands.executeCommand('workbench.action.openSettings', 'accuextension.shortcuts');
}

/**
 * Obtiene la configuración de recordatorios
 * @returns {Object} - Configuración de recordatorios
 */
function getReminderConfig() {
    const config = vscode.workspace.getConfiguration('accuextension.reminders');
    return {
        enabled: config.get('enabled', true),
        interval: config.get('interval', '2hrs')
    };
}

/**
 * Verifica si los recordatorios están habilitados
 * @returns {boolean} - True si están habilitados
 */
function areRemindersEnabled() {
    const config = getReminderConfig();
    return config.enabled && config.interval !== 'Desactivado';
}

/**
 * Obtiene el intervalo de recordatorios en milisegundos
 * @returns {number} - Intervalo en milisegundos
 */
function getReminderIntervalMs() {
    const config = getReminderConfig();
    if (!config.enabled || config.interval === 'Desactivado') {
        return 0;
    }
    
    const { REMINDER_INTERVALS } = require('../constants/config');
    return REMINDER_INTERVALS[config.interval] || REMINDER_INTERVALS['2hrs'];
}

/**
 * Abre el time report de Accusys
 */
function openTimeReport() {
    const { SYSTEM_URLS } = require('../constants/config');
    try {
        const uri = vscode.Uri.parse(SYSTEM_URLS.TIME_REPORT);
        vscode.env.openExternal(uri);
    } catch (error) {
        vscode.window.showErrorMessage(`Error al abrir el time report: ${error.message}`);
    }
}

/**
 * Guarda la selección de área y equipo de TFS
 * @param {string} area - Área seleccionada
 * @param {string} equipo - Equipo seleccionado
 */
async function saveTFSSelection(area, equipo) {
    try {
        // Verificar que los valores no sean undefined o null
        if (!area || !equipo) {
            vscode.window.showErrorMessage('Error: Valores inválidos para guardar');
            return;
        }
        
        // Usar el almacenamiento global de la extensión
        const context = getExtensionContext();
        if (context) {
            // Guardar en el almacenamiento global
            await context.globalState.update('tfs.selectedArea', area);
            await context.globalState.update('tfs.selectedEquipo', equipo);
            
            vscode.window.showInformationMessage(`Configuración de TFS guardada: ${area} - ${equipo}`);
        } else {
            vscode.window.showErrorMessage('Error: No se pudo acceder al almacenamiento de la extensión');
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Error al guardar la configuración de TFS: ${error.message}`);
    }
}

/**
 * Obtiene la configuración guardada de TFS
 * @returns {Object} - Objeto con área y equipo guardados
 */
function getTFSSelection() {
    try {
        // Usar el almacenamiento global de la extensión
        const context = getExtensionContext();
        if (context) {
            const area = context.globalState.get('tfs.selectedArea', '');
            const equipo = context.globalState.get('tfs.selectedEquipo', '');
            
            return { area, equipo };
        } else {
            return { area: '', equipo: '' };
        }
    } catch (error) {
        return { area: '', equipo: '' };
    }
}

/**
 * Limpia la configuración guardada de TFS
 */
function clearTFSSelection() {
    const { TFS_CONFIG_KEYS } = require('../constants/config');
    try {
        const config = vscode.workspace.getConfiguration();
        config.update(TFS_CONFIG_KEYS.SELECTED_AREA, undefined, vscode.ConfigurationTarget.Global);
        config.update(TFS_CONFIG_KEYS.SELECTED_EQUIPO, undefined, vscode.ConfigurationTarget.Global);
        
        vscode.window.showInformationMessage('Configuración de TFS limpiada');
    } catch (error) {
        vscode.window.showErrorMessage(`Error al limpiar la configuración de TFS: ${error.message}`);
    }
}

/**
 * Obtiene el contexto de la extensión
 * @returns {vscode.ExtensionContext|null} - Contexto de la extensión o null si no está disponible
 */
function getExtensionContext() {
    // Intentar obtener el contexto desde el módulo principal
    try {
        // Buscar en el módulo principal de la extensión
        const mainModule = require.main;
        if (mainModule && mainModule.exports && mainModule.exports.context) {
            return mainModule.exports.context;
        }
        
        // Si no está disponible, intentar usar una variable global
        if (global.extensionContext) {
            return global.extensionContext;
        }
        
        return null;
    } catch (error) {
        return null;
    }
}

module.exports = {
    getToolPaths,
    getToolPath,
    isToolConfigured,
    getCurrentTheme,
    openExtensionSettings,
    openThemeSettings,
    getShortcutConfig,
    updateShortcutConfig,
    getAllShortcutConfigs,
    clearShortcutConfig,
    openShortcutsSettings,
    clearShortcutByCommand,
    getReminderConfig,
    areRemindersEnabled,
    getReminderIntervalMs,
    openTimeReport,
    saveTFSSelection,
    getTFSSelection,
    clearTFSSelection
}; 