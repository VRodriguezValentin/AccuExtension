const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Variable global para rastrear si el panel ya está abierto
let currentPanel = undefined;

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

        // Crear el panel del webview
        const panel = vscode.window.createWebviewPanel(
            'accuExtensionView',
            'AccuExtension',
            vscode.ViewColumn.One,
            {
                // Habilitar scripts en el webview
                enableScripts: true,
                // Restringir el webview a solo cargar contenido del directorio media y webview
                localResourceRoots: [
                    vscode.Uri.file(path.join(context.extensionPath, 'media')),
                    vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview'))
                ]
            }
        );

        // Guardar referencia al panel actual
        currentPanel = panel;

        // Limpiar la referencia cuando el panel se cierre
        panel.onDidDispose(() => {
            currentPanel = undefined;
        }, null, context.subscriptions);

        // Obtener el tema actual del editor y seleccionar el logo apropiado
        const currentTheme = vscode.window.activeColorTheme;
        const isDarkTheme = currentTheme.kind === vscode.ColorThemeKind.Dark;
        const logoFileName = isDarkTheme ? 'accusys-logo.png' : 'accusys-logo-negativo.png';
        
        // Obtener la ruta de la imagen
        const imagePath = vscode.Uri.file(
            path.join(context.extensionPath, 'media', logoFileName)
        );
        const imageSrc = panel.webview.asWebviewUri(imagePath);

        // Obtener las rutas de las imágenes de herramientas
        const puttyImagePath = vscode.Uri.file(
            path.join(context.extensionPath, 'media', 'PuTTY_icon.png')
        );
        const puttyImage = panel.webview.asWebviewUri(puttyImagePath);

        const winscpImagePath = vscode.Uri.file(
            path.join(context.extensionPath, 'media', 'WinSCP_Logo.png')
        );
        const winscpImage = panel.webview.asWebviewUri(winscpImagePath);

        const soapuiImagePath = vscode.Uri.file(
            path.join(context.extensionPath, 'media', 'SoapUI_logo.png')
        );
        const soapuiImage = panel.webview.asWebviewUri(soapuiImagePath);

        const isqlwImagePath = vscode.Uri.file(
            path.join(context.extensionPath, 'media', 'sql_logo.png')
        );
        const isqlwImage = panel.webview.asWebviewUri(isqlwImagePath);

        const cobisImagePath = vscode.Uri.file(
            path.join(context.extensionPath, 'media', 'Cobis_logo.jpg')
        );
        const cobisImage = panel.webview.asWebviewUri(cobisImagePath);

        // Obtener la ruta del archivo CSS
        const stylesPath = vscode.Uri.file(
            path.join(context.extensionPath, 'src', 'webview', 'styles.css')
        );
        const stylesUri = panel.webview.asWebviewUri(stylesPath);

        // Obtener la ruta del archivo JavaScript
        const scriptPath = vscode.Uri.file(
            path.join(context.extensionPath, 'src', 'webview', 'script.js')
        );
        const scriptUri = panel.webview.asWebviewUri(scriptPath);

        // Leer el archivo HTML
        const htmlPath = path.join(context.extensionPath, 'src', 'webview', 'index.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Reemplazar las variables en el HTML
        htmlContent = htmlContent.replace('${imageSrc}', imageSrc);
        htmlContent = htmlContent.replace('${puttyImage}', puttyImage);
        htmlContent = htmlContent.replace('${winscpImage}', winscpImage);
        htmlContent = htmlContent.replace('${soapuiImage}', soapuiImage);
        htmlContent = htmlContent.replace('${isqlwImage}', isqlwImage);
        htmlContent = htmlContent.replace('${cobisImage}', cobisImage);
        htmlContent = htmlContent.replace('${stylesUri}', stylesUri);
        htmlContent = htmlContent.replace('${scriptUri}', scriptUri);



        // Establecer el contenido HTML del webview
        panel.webview.html = htmlContent;

        // Manejar mensajes del webview
        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'openAST':
                        openASTManager();
                        return;
                    case 'openTFS':
                        openTFS(message.url);
                        return;
                    case 'searchAST':
                        openTFS(message.url);
                        return;
                    case 'openTool':
                        openTool(message.path, message.name);
                        return;
                    case 'checkAndOpenTool':
                        checkAndOpenTool(message.path, message.name, message.toolName);
                        return;
                    case 'getToolPath':
                        handleGetToolPath(panel, message.toolName);
                        return;
                    case 'showError':
                        vscode.window.showErrorMessage(message.message);
                        return;
                                            case 'openSettings':
                            vscode.commands.executeCommand('workbench.action.openSettings', 'accuextension.tools');
                            return;
                        case 'openThemeSettings':
                            vscode.commands.executeCommand('workbench.action.selectTheme');
                            return;
                        case 'updateLogo':
                            updateLogoForTheme(panel, context);
                            return;


                }
            },
            undefined,
            context.subscriptions
        );
    });

    // Registrar el comando de configuración
    let settingsDisposable = vscode.commands.registerCommand('accuextension.openSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'accuextension.tools');
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(settingsDisposable);

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
            updateLogoForTheme(currentPanel, context);
        }
    });
}

/**
 * Abre AST-Activities Manager usando la ruta configurada
 */
function openASTManager() {
    const toolPaths = getToolPaths();
    const astPath = toolPaths.ast;
    
    if (!astPath) {
        vscode.window.showErrorMessage('Ruta de AST no configurada. Ve a Configuración > AccuExtension para configurar la ruta.');
        return;
    }
    
    // Usar la función unificada openTool para consistencia
    openTool(astPath, 'AST-Activities Manager', true);
}

/**
 * Abre una URL en el navegador predeterminado con validación
 * @param {string} url - URL a abrir
 */
function openTFS(url) {
    // Validar que la URL no esté vacía
    if (!url || typeof url !== 'string') {
        vscode.window.showErrorMessage('URL inválida proporcionada para abrir TFS.');
        return;
    }
    
    // Validar formato básico de URL
    try {
        const uri = vscode.Uri.parse(url);
        if (!uri.scheme || !uri.authority) {
            throw new Error('URL malformada');
        }
        vscode.env.openExternal(uri);
    } catch (error) {
        vscode.window.showErrorMessage(`URL inválida: ${url}. Error: ${error.message}`);
    }
}

/**
 * Valida una ruta de archivo
 * @param {string} path - Ruta a validar
 * @returns {boolean} - True si la ruta es válida
 */
function isValidPath(path) {
    if (!path || typeof path !== 'string') {
        return false;
    }
    
    // Verificar que sea una ruta absoluta en Windows
    if (!path.match(/^[A-Za-z]:\\/)) {
        return false;
    }
    
    return true;
}

/**
 * Abre una herramienta externa con validación completa
 * @param {string} path - Ruta al ejecutable
 * @param {string} name - Nombre de la herramienta para mostrar en mensajes
 * @param {boolean} checkExistence - Si debe verificar que el archivo existe
 */
function openTool(path, name, checkExistence = false) {
    // Validar que la ruta esté configurada
    if (!path) {
        vscode.window.showErrorMessage(`Ruta de ${name} no configurada. Ve a Configuración > AccuExtension para configurar la ruta.`);
        return;
    }
    
    // Validar formato de la ruta
    if (!isValidPath(path)) {
        vscode.window.showErrorMessage(`Ruta inválida para ${name}: ${path}. La ruta debe ser absoluta y no contener caracteres especiales.`);
        return;
    }
    
    // Verificar existencia del archivo si se solicita
    if (checkExistence && !fs.existsSync(path)) {
        vscode.window.showErrorMessage(`El archivo ${name} no existe en: ${path}. Verifica la ruta en Configuración > AccuExtension.`);
        return;
    }
    
    // Ejecutar la herramienta
    exec(`"${path}"`, (error) => {
        if (error) {
            vscode.window.showErrorMessage(`Error al abrir ${name}: ${error.message}. Verifica la ruta en Configuración > AccuExtension.`);
        } else {
            console.log(`${name} abierto correctamente.`);
        }
    });
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
 * Maneja la solicitud de ruta de herramienta desde el webview
 * @param {vscode.WebviewPanel} panel - Panel del webview
 * @param {string} toolName - Nombre de la herramienta solicitada
 */
function handleGetToolPath(panel, toolName) {
    const toolPaths = getToolPaths();
    const path = toolPaths[toolName];

    if (path) {
        panel.webview.postMessage({ command: 'toolPath', path: path });
    } else {
        panel.webview.postMessage({ command: 'toolPath', path: null });
    }
}

/**
 * Actualiza el logo del webview basado en el tema actual
 * @param {vscode.WebviewPanel} panel - Panel del webview
 * @param {vscode.ExtensionContext} context - Contexto de la extensión
 */
function updateLogoForTheme(panel, context) {
    const currentTheme = vscode.window.activeColorTheme;
    const isDarkTheme = currentTheme.kind === vscode.ColorThemeKind.Dark;
    const logoFileName = isDarkTheme ? 'accusys-logo.png' : 'accusys-logo-negativo.png';
    
    const imagePath = vscode.Uri.file(
        path.join(context.extensionPath, 'media', logoFileName)
    );
    const imageSrc = panel.webview.asWebviewUri(imagePath);
    
    panel.webview.postMessage({
        command: 'updateLogo',
        imageSrc: imageSrc.toString()
    });
}



function deactivate() {}

module.exports = {
    activate,
    deactivate
} 