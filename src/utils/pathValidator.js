/**
 * Utilidades de validación para AccuExtension
 * @module utils/pathValidator
 */

const vscode = require('vscode');
const fs = require('fs');

/**
 * Valida una ruta de archivo
 * @param {string} path - Ruta a validar
 * @returns {boolean} - True si la ruta es válida
 */
function isValidPath(path) {
    if (!path || typeof path !== 'string') {
        return false;
    }
    
    // Verificar que sea una ruta absoluta en Windows (acepta tanto \ como /)
    if (!path.match(/^[A-Za-z]:[\\\/]/)) {
        return false;
    }
    
    // Verificar que no contenga caracteres peligrosos
    const dangerousChars = /[<>"|*?]/;
    if (dangerousChars.test(path)) {
        return false;
    }
    
    return true;
}

/**
 * Valida una URL
 * @param {string} url - URL a validar
 * @returns {boolean} - True si la URL es válida
 */
function isValidUrl(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }
    
    try {
        const uri = vscode.Uri.parse(url);
        return uri.scheme && uri.authority;
    } catch (error) {
        return false;
    }
}

/**
 * Valida que un archivo exista
 * @param {string} path - Ruta del archivo a verificar
 * @returns {boolean} - True si el archivo existe
 */
function fileExists(path) {
    if (!isValidPath(path)) {
        return false;
    }
    
    try {
        return fs.existsSync(path);
    } catch (error) {
        return false;
    }
}

/**
 * Valida entrada según el tipo especificado
 * @param {*} input - Entrada a validar
 * @param {string} type - Tipo de validación ('url', 'path', 'file')
 * @param {Object} options - Opciones adicionales
 * @returns {Object} - Resultado de la validación
 */
function validateInput(input, type, options = {}) {
    const result = {
        isValid: false,
        error: null,
        value: input
    };
    
    switch (type) {
        case 'url':
            result.isValid = isValidUrl(input);
            if (!result.isValid) {
                result.error = 'URL inválida proporcionada';
            }
            break;
            
        case 'path':
            result.isValid = isValidPath(input);
            if (!result.isValid) {
                result.error = 'Ruta inválida proporcionada';
            }
            break;
            
        case 'file':
            result.isValid = fileExists(input);
            if (!result.isValid) {
                result.error = 'El archivo no existe en la ruta especificada';
            }
            break;
            
        default:
            result.isValid = true;
            result.error = null;
    }
    
    return result;
}

module.exports = {
    isValidPath,
    isValidUrl,
    fileExists,
    validateInput
}; 