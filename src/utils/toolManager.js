/**
 * Gestión de herramientas externas para AccuExtension
 * @module utils/toolManager
 */

const vscode = require('vscode');
const { exec } = require('child_process');
const { validateInput } = require('./pathValidator');
const config = require('../constants/config');

/**
 * Abre una herramienta externa con validación completa
 * @param {string} path - Ruta al ejecutable
 * @param {string} name - Nombre de la herramienta para mostrar en mensajes
 * @param {boolean} checkExistence - Si debe verificar que el archivo existe
 */
function openTool(path, name, checkExistence = false) {
    // Validar que la ruta esté configurada
    if (!path) {
        vscode.window.showErrorMessage(
            `${config.ERROR_MESSAGES.TOOL_NOT_CONFIGURED} ${name}`
        );
        return;
    }
    
    // Validar formato de la ruta
    const pathValidation = validateInput(path, 'path');
    if (!pathValidation.isValid) {
        vscode.window.showErrorMessage(
            `${config.ERROR_MESSAGES.INVALID_PATH} para ${name}: ${path}. La ruta debe ser absoluta y no contener caracteres especiales.`
        );
        return;
    }
    
    // Verificar existencia del archivo si se solicita
    if (checkExistence) {
        const fileValidation = validateInput(path, 'file');
        if (!fileValidation.isValid) {
            vscode.window.showErrorMessage(
                `${config.ERROR_MESSAGES.FILE_NOT_FOUND} ${name} en: ${path}. Verifica la ruta en Configuración > AccuExtension.`
            );
            return;
        }
    }
    
    try {
    // Ejecutar la herramienta
    exec(`"${path}"`, (error) => {
        if (error) {
            vscode.window.showErrorMessage(
                `${config.ERROR_MESSAGES.TOOL_OPEN_ERROR} ${name}: ${error.message}. Verifica la ruta en Configuración > AccuExtension.`
            );
        }
    });
    } catch (error) {
        console.error(`Error al abrir ${name}:`, error.message);
        return false;
    }
}

/**
 * Abre AST-Activities Manager usando la ruta configurada
 */
function openASTManager() {
    const { getToolPath } = require('./configManager');
    const astPath = getToolPath('ast');
    
    if (!astPath) {
        vscode.window.showErrorMessage(
            `${config.ERROR_MESSAGES.TOOL_NOT_CONFIGURED} AST. Ve a Configuración > AccuExtension para configurar la ruta.`
        );
        return;
    }
    
    // Usar la función unificada openTool para consistencia
    openTool(astPath, config.TOOL_NAMES.ast, true);
}

/**
 * Función de compatibilidad para mantener la API existente
 * @param {string} path - Ruta al ejecutable
 * @param {string} name - Nombre de la herramienta
 * @param {string} toolName - Nombre de la herramienta (no usado, mantenido por compatibilidad)
 */
function checkAndOpenTool(path, name, toolName) {
    openTool(path, name, true);
}

/**
 * Abre una URL en el navegador predeterminado con validación
 * @param {string} url - URL a abrir
 */
function openTFS(url) {
    // Validar que la URL no esté vacía
    if (!url || typeof url !== 'string') {
        vscode.window.showErrorMessage(config.ERROR_MESSAGES.INVALID_URL);
        return;
    }
    
    // Validar formato básico de URL
    const urlValidation = validateInput(url, 'url');
    if (!urlValidation.isValid) {
        vscode.window.showErrorMessage(`${config.ERROR_MESSAGES.INVALID_URL}: ${url}`);
        return;
    }
    
    try {
        const uri = vscode.Uri.parse(url);
        vscode.env.openExternal(uri);
    } catch (error) {
        vscode.window.showErrorMessage(`${config.ERROR_MESSAGES.INVALID_URL}: ${url}. Error: ${error.message}`);
    }
}

module.exports = {
    openTool,
    openASTManager,
    checkAndOpenTool,
    openTFS
}; 