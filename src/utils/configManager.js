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
    vscode.commands.executeCommand('workbench.action.selectTheme');
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
    openTimeReport
}; 