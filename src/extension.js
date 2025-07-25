const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Variable global para rastrear si el panel ya está abierto
let currentPanel = undefined;

// Función para obtener las rutas de las herramientas desde la configuración
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

// Función para detectar automáticamente rutas de herramientas
function detectToolPaths() {
    const commonPaths = {
        putty: [
            'C:\\Program Files\\PuTTY\\putty.exe',
            'C:\\Program Files (x86)\\PuTTY\\putty.exe'
        ],
        winscp: [
            'C:\\Program Files\\WinSCP\\WinSCP.exe',
            'C:\\Program Files (x86)\\WinSCP\\WinSCP.exe'
        ],
        soapui: [
            'C:\\Program Files\\SmartBear\\SoapUI-5.7.2\\bin\\SoapUI-5.7.2.exe',
            'C:\\Program Files (x86)\\SmartBear\\SoapUI-5.7.2\\bin\\SoapUI-5.7.2.exe'
        ],
        isqlw: [
            'C:\\Program Files (x86)\\ISQL\\MSSQL\\BINN\\ISQLW.EXE',
            'C:\\Program Files\\ISQL\\MSSQL\\BINN\\ISQLW.EXE'
        ],
        cobis: [
            'C:\\ProgramData\\COBIS\\COBISExplorer\\COBISCorp.eCOBIS.COBISExplorer.Shell.exe'
        ],
        ast: [
            'C:\\Accusys Technology\\AST-Activities Manager\\ejecutable\\Administrador.exe'
        ]
    };

    const detectedPaths = {};
    
    for (const [tool, paths] of Object.entries(commonPaths)) {
        for (const toolPath of paths) {
            if (fs.existsSync(toolPath)) {
                detectedPaths[tool] = toolPath;
                break;
            }
        }
    }
    
    return detectedPaths;
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

        // Obtener la ruta de la imagen
        const imagePath = vscode.Uri.file(
            path.join(context.extensionPath, 'media', 'accusys-logo.png')
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
    statusBarItem.command = 'accuextension.showImage'; // El comando que ya tienes registrado
    statusBarItem.show();

    context.subscriptions.push(statusBarItem);
}

function openASTManager() {
    const toolPaths = getToolPaths();
    const astPath = toolPaths.ast;
    
    if (!astPath) {
        vscode.window.showErrorMessage('Ruta de AST no configurada. Ve a Configuración > AccuExtension para configurar la ruta.');
        return;
    }
    
    exec(`"${astPath}"`, (error) => {
        if (error) {
            vscode.window.showErrorMessage(`No se pudo abrir AST-Activities Manager. Verifica la ruta en Configuración > AccuExtension: ${astPath}`);
            console.error('Error al abrir AST:', error);
        } else {
            vscode.window.showInformationMessage('AST-Activities Manager abierto correctamente');
        }
    });
}

function openTFS(url) {
    // Abrir la URL en el navegador predeterminado
    vscode.env.openExternal(vscode.Uri.parse(url));
}

function openTool(path, name) {
    if (!path) {
        vscode.window.showErrorMessage(`Ruta de ${name} no configurada. Ve a Configuración > AccuExtension para configurar la ruta.`);
        return;
    }
    
    exec(`"${path}"`, (error) => {
        if (error) {
            vscode.window.showErrorMessage(`Error al abrir ${name}: ${error.message}. Verifica la ruta en Configuración > AccuExtension.`);
        } else {
            console.log(`${name} abierto correctamente.`);
        }
    });
}

function checkAndOpenTool(path, name, toolName) {
    if (!path) {
        vscode.window.showErrorMessage(`Ruta de ${name} no configurada. Ve a Configuración > AccuExtension para configurar la ruta.`);
        return;
    }
    
    if (fs.existsSync(path)) {
        openTool(path, name);
    } else {
        vscode.window.showErrorMessage(`El archivo ${name} no existe en: ${path}. Verifica la ruta en Configuración > AccuExtension.`);
    }
}

function handleGetToolPath(panel, toolName) {
    const toolPaths = getToolPaths();
    const path = toolPaths[toolName];

    if (path) {
        panel.webview.postMessage({ command: 'toolPath', path: path });
    } else {
        panel.webview.postMessage({ command: 'toolPath', path: null });
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
} 