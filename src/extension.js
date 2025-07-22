const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('AccuExtension esta activa!');

    // Registrar el comando
    let disposable = vscode.commands.registerCommand('accuextension.showImage', () => {
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

        // Obtener la ruta de la imagen
        const imagePath = vscode.Uri.file(
            path.join(context.extensionPath, 'media', 'accusys-logo.png')
        );
        const imageSrc = panel.webview.asWebviewUri(imagePath);

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
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
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

function deactivate() {}

module.exports = {
    activate,
    deactivate
} 