# AccuExtension

Extension personalizada para Accusys Technology en Cursor/VS Code.

## Funcionalidades
- Muestra logo de Accusys en webview
- Acceso rapido a AST-Activities Manager
- Integracion con TFS para acceder a backlogs y busquedas
- Interfaz moderna con colores corporativos

## Estructura del proyecto
```
accuextension/
??? media/
?   ??? accusys-logo.png
??? src/
?   ??? extension.js      # Logica principal de la extension
?   ??? webview/
?       ??? index.html    # Estructura HTML del webview
?       ??? styles.css    # Estilos CSS
?       ??? script.js     # Logica JavaScript del webview
??? package.json
??? README.md
```

## Uso
1. Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
2. Busca "AccuExtension: Inicio"
3. Presiona Enter

## Desarrollo
- `F5` para ejecutar en modo debug
- Los archivos del webview estan separados para facilitar el mantenimiento

## Aclaraciones

1. Para abrir el AST, el archivo "Administrador.exe" debe estar ubicado en la siguiente ruta: C:\Accusys Technology\AST-Activities Manager\ejecutable\Administrador.exe


