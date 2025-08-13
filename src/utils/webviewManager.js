/**
 * Gestión del webview para AccuExtension
 * @module utils/webviewManager
 */

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const config = require('../constants/config');

/**
 * Crea y configura un nuevo panel webview
 * @param {vscode.ExtensionContext} context - Contexto de la extensión
 * @returns {vscode.WebviewPanel} - Panel del webview configurado
 */
function createWebviewPanel(context) {
    const panel = vscode.window.createWebviewPanel(
        'accuExtensionView',
        'AccuExtension',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(context.extensionPath, 'media')),
                vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview'))
            ]
        }
    );
    
    return panel;
}

/**
 * Obtiene el logo apropiado según el tema actual
 * @param {vscode.ExtensionContext} context - Contexto de la extensión
 * @param {vscode.WebviewPanel} panel - Panel del webview
 * @returns {string} - URI del logo como string
 */
function getLogoUri(context, panel) {
    const { getCurrentTheme } = require('./configManager');
    const theme = getCurrentTheme();
    const logoFileName = theme.isDark ? config.LOGO_BY_THEME.dark : config.LOGO_BY_THEME.light;
    
    const imagePath = vscode.Uri.file(
        path.join(context.extensionPath, 'media', logoFileName)
    );
    return panel.webview.asWebviewUri(imagePath);
}

/**
 * Obtiene la URI de una imagen de herramienta
 * @param {vscode.ExtensionContext} context - Contexto de la extensión
 * @param {vscode.WebviewPanel} panel - Panel del webview
 * @param {string} toolName - Nombre de la herramienta
 * @returns {string} - URI de la imagen como string
 */
function getToolImageUri(context, panel, toolName) {
    const imageFileName = config.TOOL_IMAGES[toolName];
    if (!imageFileName) {
        return null;
    }
    
    const imagePath = vscode.Uri.file(
        path.join(context.extensionPath, 'media', imageFileName)
    );
    return panel.webview.asWebviewUri(imagePath);
}

/**
 * Obtiene todas las URIs de imágenes de herramientas
 * @param {vscode.ExtensionContext} context - Contexto de la extensión
 * @param {vscode.WebviewPanel} panel - Panel del webview
 * @returns {Object} - Objeto con todas las URIs de imágenes
 */
function getAllToolImageUris(context, panel) {
    const imageUris = {};
    
    // Mapear las claves EXACTAMENTE como aparecen en el HTML
    // El HTML usa ${puttyImage}, ${winscpImage}, etc.
    const toolImageMapping = {
        'putty': '${puttyImage}',
        'winscp': '${winscpImage}', 
        'soapui': '${soapuiImage}',
        'isqlw': '${isqlwImage}',
        'cobis': '${cobisImage}'
    };
    
    Object.entries(toolImageMapping).forEach(([toolName, htmlKey]) => {
        const imageFileName = config.TOOL_IMAGES[toolName];
        if (imageFileName) {
            const imagePath = vscode.Uri.file(
                path.join(context.extensionPath, 'media', imageFileName)
            );
            imageUris[htmlKey] = panel.webview.asWebviewUri(imagePath);
        }
    });
    
    return imageUris;
}

/**
 * Obtiene las URIs de los archivos CSS y JavaScript
 * @param {vscode.ExtensionContext} context - Contexto de la extensión
 * @param {vscode.WebviewPanel} panel - Panel del webview
 * @returns {Object} - Objeto con las URIs de los archivos
 */
function getAssetUris(context, panel) {
    const stylesPath = vscode.Uri.file(
        path.join(context.extensionPath, 'src', 'webview', 'styles.css')
    );
    const scriptPath = vscode.Uri.file(
        path.join(context.extensionPath, 'src', 'webview', 'script.js')
    );
    
    return {
        stylesUri: panel.webview.asWebviewUri(stylesPath),
        scriptUri: panel.webview.asWebviewUri(scriptPath)
    };
}

/**
 * Lee y procesa el contenido HTML del webview
 * @param {vscode.ExtensionContext} context - Contexto de la extensión
 * @param {vscode.WebviewPanel} panel - Panel del webview
 * @returns {string} - Contenido HTML procesado
 */
function getWebviewHtml(context, panel) {
    const htmlPath = path.join(context.extensionPath, 'src', 'webview', 'index.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Obtener todas las URIs necesarias
    const logoUri = getLogoUri(context, panel);
    const toolImageUris = getAllToolImageUris(context, panel);
    const assetUris = getAssetUris(context, panel);
    
    // Debug detallado para Extension Debugger
    console.log('=== ACCUEXTENSION DEBUG ===');
    console.log('Context extensionPath:', context.extensionPath);
    console.log('Logo URI:', logoUri);
    console.log('Tool Image URIs:', toolImageUris);
    console.log('Asset URIs:', assetUris);
    
    // Reemplazar todas las variables en el HTML
    const replacements = {
        '${imageSrc}': logoUri,
        '${stylesUri}': assetUris.stylesUri,
        '${scriptUri}': assetUris.scriptUri,
        ...toolImageUris
    };
    
    console.log('Replacements object:', replacements);
    console.log('HTML content before replacement length:', htmlContent.length);
    
    // Verificar que las variables estén en el HTML
    Object.keys(replacements).forEach(placeholder => {
        const count = (htmlContent.match(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        console.log(`Placeholder ${placeholder} found ${count} times in HTML`);
    });
    
    Object.entries(replacements).forEach(([placeholder, value]) => {
        if (value) {
            const beforeCount = (htmlContent.match(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
            htmlContent = htmlContent.replace(placeholder, value);
            const afterCount = (htmlContent.match(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
            console.log(`Replaced ${placeholder}: ${beforeCount} ? ${afterCount} occurrences`);
        } else {
            console.warn(`AccuExtension: Missing value for placeholder: ${placeholder}`);
        }
    });
    
    console.log('HTML content after replacement length:', htmlContent.length);
    console.log('=== END ACCUEXTENSION DEBUG ===');
    
    return htmlContent;
}

/**
 * Configura el contenido HTML del webview
 * @param {vscode.ExtensionContext} context - Contexto de la extensión
 * @param {vscode.WebviewPanel} panel - Panel del webview
 */
function setupWebviewContent(context, panel) {
    const htmlContent = getWebviewHtml(context, panel);
    panel.webview.html = htmlContent;
}

module.exports = {
    createWebviewPanel,
    getLogoUri,
    getToolImageUri,
    getAllToolImageUris,
    getAssetUris,
    getWebviewHtml,
    setupWebviewContent
}; 