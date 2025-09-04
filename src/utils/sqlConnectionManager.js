/**
 * Gestor de conexiones SQL para AccuExtension
 * @module utils/sqlConnectionManager
 */

const vscode = require('vscode');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { validateInput } = require('./pathValidator');
const config = require('../constants/config');

/**
 * Obtiene todas las conexiones SQL configuradas
 * @returns {Object} - Objeto con todas las conexiones
 */
function getSqlConnections() {
    try {
        const sqlConfig = vscode.workspace.getConfiguration('accuextension.sql');
        const connections = sqlConfig.get('connections', {});
        
        // Filtrar solo conexiones habilitadas y con datos válidos
        const enabledConnections = {};
        Object.keys(connections).forEach(key => {
            const conn = connections[key];
            if (conn.enabled && conn.server && conn.user) {
                enabledConnections[key] = {
                    name: conn.name || key,
                    server: conn.server,
                    user: conn.user,
                    hasPassword: !!(conn.password && conn.password.length > 0)
                };
            }
        });
        
        return enabledConnections;
    } catch (error) {
        vscode.window.showErrorMessage(`Error al obtener conexiones SQL: ${error.message}`);
        return {};
    }
}

/**
 * Obtiene una conexión específica con credenciales
 * @param {string} connectionKey - Clave de la conexión
 * @returns {Object|null} - Datos completos de la conexión o null
 */
function getConnectionDetails(connectionKey) {
    try {
        const sqlConfig = vscode.workspace.getConfiguration('accuextension.sql');
        const connections = sqlConfig.get('connections', {});
        
        if (connections[connectionKey]) {
            return connections[connectionKey];
        }
        
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Guarda o actualiza una conexión SQL
 * @param {string} connectionKey - Clave de la conexión
 * @param {Object} connectionData - Datos de la conexión
 */
async function saveSqlConnection(connectionKey, connectionData) {
    try {
        const sqlConfig = vscode.workspace.getConfiguration('accuextension.sql');
        const connections = sqlConfig.get('connections', {});
        
        connections[connectionKey] = {
            name: connectionData.name || connectionKey,
            server: connectionData.server,
            user: connectionData.user,
            password: connectionData.password || '',
            enabled: connectionData.enabled !== false
        };
        
        await sqlConfig.update('connections', connections, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Conexión ${connectionKey} guardada correctamente`);
    } catch (error) {
        vscode.window.showErrorMessage(`Error al guardar conexión: ${error.message}`);
    }
}

/**
 * Ejecuta una consulta SQL usando ISQL
 * @param {string} connectionKey - Clave de la conexión
 * @param {string} query - Consulta SQL a ejecutar
 * @returns {Promise<Object>} - Resultado de la consulta
 */
async function executeSqlQuery(connectionKey, query) {
    return new Promise(async (resolve, reject) => {
        try {
            // Obtener configuración
            const sqlConfig = vscode.workspace.getConfiguration('accuextension.sql');
            const isqlPath = sqlConfig.get('isqlPath', 'C:/ISQL/MSSQL/BINN/ISQL.EXE');
            const outputWidth = sqlConfig.get('outputWidth', 5000);
            
            // Validar ruta de ISQL
            const pathValidation = validateInput(isqlPath, 'file');
            if (!pathValidation.isValid) {
                reject(new Error(`Ruta de ISQL inválida o archivo no encontrado: ${isqlPath}. Verifica que el archivo existe y configura la ruta correcta en Configuración > AccuExtension > SQL`));
                return;
            }
            
            // Obtener detalles de conexión
            const connection = getConnectionDetails(connectionKey);
            if (!connection) {
                reject(new Error(`Conexión ${connectionKey} no encontrada`));
                return;
            }
            
            if (!connection.user || !connection.password) {
                reject(new Error(`Credenciales incompletas para ${connectionKey}`));
                return;
            }
            
            // Crear archivo temporal para la consulta en AppData del usuario
            const tempDir = path.join(os.homedir(), 'AppData', 'Roaming', 'Cursor', 'User', 'temp');
            
            // Crear directorio si no existe
            try {
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
            } catch (dirError) {
                reject(new Error(`Error creando directorio temporal: ${dirError.message}. Directorio: ${tempDir}`));
                return;
            }
            
            // Crear archivo temporal
            const tempFile = path.join(tempDir, `query_${Date.now()}.sql`);
            try {
                fs.writeFileSync(tempFile, query, 'utf8');
                
                // Verificar que el archivo se creó correctamente
                if (!fs.existsSync(tempFile)) {
                    reject(new Error(`Error: No se pudo crear el archivo temporal en: ${tempFile}`));
                    return;
                }
            } catch (fileError) {
                reject(new Error(`Error escribiendo archivo temporal: ${fileError.message}. Archivo: ${tempFile}`));
                return;
            }
            
            // Construir comando ISQL con rutas normalizadas
            const normalizedIsqlPath = path.normalize(isqlPath);
            const normalizedTempFile = path.normalize(tempFile);
            const command = `"${normalizedIsqlPath}" -i"${normalizedTempFile}" -w ${outputWidth} -n -U "${connection.user}" -P "${connection.password}" -S "${connection.server}"`;
            
            const startTime = Date.now();
            
            exec(command, { 
                maxBuffer: 1024 * 1024 * 10, // 10MB buffer
                timeout: 60000, // 60 segundos timeout
                cwd: path.dirname(normalizedIsqlPath), // Establecer directorio de trabajo
                env: { ...process.env } // Preservar variables de entorno
            }, (error, stdout, stderr) => {
                // Limpiar archivo temporal
                try {
                    if (fs.existsSync(tempFile)) {
                        fs.unlinkSync(tempFile);
                    }
                } catch (cleanupError) {
                    // Ignorar errores de limpieza pero registrar para debug
                    console.warn('Error limpiando archivo temporal:', cleanupError.message);
                }
                
                const executionTime = Date.now() - startTime;
                
                if (error) {
                    let errorMessage = `Error ejecutando consulta ISQL:\n`;
                    errorMessage += `Comando: ${command}\n`;
                    errorMessage += `Error: ${error.message}\n`;
                    if (stderr) {
                        errorMessage += `STDERR: ${stderr}\n`;
                    }
                    errorMessage += `Código de salida: ${error.code || 'desconocido'}`;
                    
                    reject(new Error(errorMessage));
                    return;
                }
                
                // Procesar resultado
                const result = {
                    success: true,
                    output: stdout,
                    error: stderr,
                    executionTime: executionTime,
                    timestamp: new Date().toISOString(),
                    connection: connectionKey,
                    query: query.substring(0, 200) + (query.length > 200 ? '...' : '')
                };
                
                // Guardar en historial
                saveQueryToHistory(result);
                
                resolve(result);
            });
            
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Guarda una consulta en el historial
 * @param {Object} queryResult - Resultado de la consulta
 */
function saveQueryToHistory(queryResult) {
    try {
        const context = getExtensionContext();
        if (!context) return;
        
        const history = context.globalState.get('sqlQueryHistory', []);
        
        // Agregar nueva consulta al inicio del historial
        history.unshift({
            id: Date.now(),
            timestamp: queryResult.timestamp,
            connection: queryResult.connection,
            query: queryResult.query,
            success: queryResult.success,
            executionTime: queryResult.executionTime,
            hasOutput: !!(queryResult.output && queryResult.output.length > 0)
        });
        
        // Mantener solo los últimos 50 registros
        if (history.length > 50) {
            history.splice(50);
        }
        
        context.globalState.update('sqlQueryHistory', history);
    } catch (error) {
        // Error silencioso para no interrumpir la ejecución
    }
}

/**
 * Obtiene el historial de consultas
 * @returns {Array} - Array con el historial de consultas
 */
function getQueryHistory() {
    try {
        const context = getExtensionContext();
        if (!context) return [];
        
        return context.globalState.get('sqlQueryHistory', []);
    } catch (error) {
        return [];
    }
}

/**
 * Exporta resultados a archivo
 * @param {string} data - Datos a exportar
 * @param {string} format - Formato de exportación ('csv', 'json', 'txt')
 * @returns {Promise<string>} - Ruta del archivo exportado
 */
async function exportResults(data, format = 'txt') {
    return new Promise((resolve, reject) => {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `sql_results_${timestamp}.${format}`;
            
            // Mostrar diálogo para guardar archivo
            vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file(fileName),
                filters: {
                    'Text Files': ['txt'],
                    'CSV Files': ['csv'],
                    'JSON Files': ['json'],
                    'All Files': ['*']
                }
            }).then(uri => {
                if (!uri) {
                    reject(new Error('Exportación cancelada'));
                    return;
                }
                
                let exportData = data;
                
                // Procesar según formato
                if (format === 'csv' && typeof data === 'string') {
                    // Convertir salida de ISQL a CSV básico
                    exportData = convertIsqlToCsv(data);
                } else if (format === 'json') {
                    exportData = JSON.stringify({
                        timestamp: new Date().toISOString(),
                        data: data
                    }, null, 2);
                }
                
                fs.writeFileSync(uri.fsPath, exportData, 'utf8');
                vscode.window.showInformationMessage(`Resultados exportados a: ${uri.fsPath}`);
                resolve(uri.fsPath);
            });
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Convierte salida de ISQL a formato CSV básico
 * @param {string} isqlOutput - Salida de ISQL
 * @returns {string} - Datos en formato CSV
 */
function convertIsqlToCsv(isqlOutput) {
    try {
        const lines = isqlOutput.split('\n');
        const csvLines = [];
        let headerProcessed = false;
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Saltar líneas vacías, líneas de separación (----), mensajes de filas afectadas y espacios
            if (!trimmedLine || 
                trimmedLine.match(/^-+$/) || 
                trimmedLine.includes('rows affected') ||
                trimmedLine.includes('row affected') ||
                trimmedLine.match(/^\s*\(\d+\s+rows?\s+affected\)/) ||
                trimmedLine.match(/^\s*$/) ||
                trimmedLine.match(/^=+$/)) {
                continue;
            }
            
            // Separar por espacios múltiples y limpiar
            const columns = line.split(/\s{2,}/).map(col => col.trim()).filter(col => col);
            
            if (columns.length > 0) {
                // Escapar comillas y agregar comillas si contiene comas, saltos de línea o comillas
                const csvColumns = columns.map(col => {
                    if (col.includes(',') || col.includes('"') || col.includes('\n') || col.includes('\r')) {
                        return `"${col.replace(/"/g, '""')}"`;
                    }
                    return col;
                });
                csvLines.push(csvColumns.join(','));
            }
        }
        
        return csvLines.join('\n');
    } catch (error) {
        return isqlOutput; // Fallback a texto plano
    }
}

/**
 * Obtiene el contexto de la extensión
 * @returns {vscode.ExtensionContext|null}
 */
function getExtensionContext() {
    try {
        if (global.extensionContext) {
            return global.extensionContext;
        }
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Prueba la conexión ISQL con un comando simple
 * @param {string} connectionKey - Clave de la conexión a probar
 * @returns {Promise<Object>} - Resultado de la prueba
 */
async function testSqlConnection(connectionKey) {
    return new Promise((resolve) => {
        try {
            const sqlConfig = vscode.workspace.getConfiguration('accuextension.sql');
            const isqlPath = sqlConfig.get('isqlPath', 'C:/ISQL/MSSQL/BINN/ISQL.EXE');
            const connection = getConnectionDetails(connectionKey);
            
            if (!connection) {
                resolve({ success: false, error: 'Conexión no encontrada' });
                return;
            }
            
            // Comando simple para probar la conexión
            const testCommand = `"${isqlPath}" -Q"SELECT GETDATE()" -w 100 -n -U "${connection.user}" -P "${connection.password}" -S "${connection.server}"`;
            
            exec(testCommand, { 
                timeout: 10000, // 10 segundos timeout para prueba
                env: { ...process.env }
            }, (error, stdout, stderr) => {
                if (error) {
                    resolve({
                        success: false,
                        error: error.message,
                        stderr: stderr,
                        exitCode: error.code
                    });
                } else {
                    resolve({
                        success: true,
                        output: stdout,
                        message: 'Conexión exitosa'
                    });
                }
            });
            
        } catch (error) {
            resolve({ success: false, error: error.message });
        }
    });
}

/**
 * Diagnóstica la configuración SQL
 * @returns {Object} - Información de diagnóstico
 */
function diagnoseSqlConfiguration() {
    const sqlConfig = vscode.workspace.getConfiguration('accuextension.sql');
    const isqlPath = sqlConfig.get('isqlPath', 'C:/ISQL/MSSQL/BINN/ISQL.EXE');
    const tempDir = path.join(os.homedir(), 'AppData', 'Roaming', 'Cursor', 'User', 'temp');
    
    const diagnosis = {
        isqlPath: isqlPath,
        isqlExists: fs.existsSync(isqlPath),
        tempDir: tempDir,
        tempDirExists: fs.existsSync(tempDir),
        tempDirWritable: false,
        homeDir: os.homedir(),
        platform: os.platform(),
        connections: Object.keys(getSqlConnections()).length,
        outputWidth: sqlConfig.get('outputWidth', 5000)
    };
    
    // Verificar si el directorio temporal es escribible
    try {
        const testFile = path.join(tempDir, 'test.txt');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        diagnosis.tempDirWritable = true;
    } catch (error) {
        diagnosis.tempDirWritableError = error.message;
    }
    
    return diagnosis;
}

/**
 * Limpia archivos temporales antiguos
 */
function cleanupTempFiles() {
    try {
        const tempDir = path.join(os.homedir(), 'AppData', 'Roaming', 'Cursor', 'User', 'temp');
        if (fs.existsSync(tempDir)) {
            const files = fs.readdirSync(tempDir);
            const now = Date.now();
            
            files.forEach(file => {
                const filePath = path.join(tempDir, file);
                const stats = fs.statSync(filePath);
                const ageInMinutes = (now - stats.mtime.getTime()) / (1000 * 60);
                
                // Eliminar archivos más antiguos de 30 minutos
                if (ageInMinutes > 30) {
                    fs.unlinkSync(filePath);
                }
            });
        }
    } catch (error) {
        // Error silencioso
    }
}

// Limpiar archivos temporales al cargar el módulo
cleanupTempFiles();

module.exports = {
    getSqlConnections,
    getConnectionDetails,
    saveSqlConnection,
    executeSqlQuery,
    getQueryHistory,
    exportResults,
    cleanupTempFiles,
    diagnoseSqlConfiguration,
    testSqlConnection
}; 