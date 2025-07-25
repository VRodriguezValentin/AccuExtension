const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Variable global para rastrear si el panel ya está abierto
let currentPanel = undefined;

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
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);

    // Crear el botón en la StatusBar
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(rocket) AccuExtension';
    statusBarItem.tooltip = 'Abrir AccuExtension';
    statusBarItem.command = 'accuextension.showImage'; // El comando que ya tienes registrado
    statusBarItem.show();

    context.subscriptions.push(statusBarItem);
}

function openASTManager() {
    const astPath = 'C:\\Accusys Technology\\AST-Activities Manager\\ejecutable\\Administrador.exe';
    
    exec(`"${astPath}"`, (error) => {
        if (error) {
            vscode.window.showErrorMessage('No se pudo abrir AST-Activities Manager. Verifica que este instalado en: ' + astPath);
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
    exec(`"${path}"`, (error) => {
        if (error) {
            vscode.window.showErrorMessage(`Error al abrir ${name}: ${error.message}`);
        } else {
            console.log(`${name} abierto correctamente.`);
        }
    });
}

function checkAndOpenTool(path, name, toolName) {
    if (fs.existsSync(path)) {
        openTool(path, name);
    } else {
        vscode.window.showErrorMessage(`El archivo ${name} no existe en: ${path}`);
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
} 