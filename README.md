# ?? AccuExtension

**AccuExtension** es una extensión personalizada para desarrolladores de **Accusys Technology**, pensada para integrarse con **Cursor** o **Visual Studio Code** y mejorar tu flujo de trabajo diario.

---

## ? Funcionalidades

- ?? **Acceso rápido a AST-Activities Manager**
- ?? **Integración con TFS** para acceder fácilmente a tus **backlogs** y realizar búsquedas sin salir del editor

---

## ?? Estructura del proyecto

```
accuextension/
??? media/
?   ??? accusys-isotipo.png
?   ??? accusys-logo.png
??? src/
?   ??? extension.js         # Lógica principal de la extensión
?   ??? webview/
?       ??? index.html       # Estructura HTML del panel webview
?       ??? styles.css       # Estilos personalizados
?       ??? script.js        # Comportamiento del webview
??? CHANGELOG.md
??? package.json
??? README.md
```

---

## ?? ¿Cómo se usa?

1. Presioná `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
2. Escribí: `AccuExtension: Inicio`
3. Presioná `Enter` y listo, ¡ya estás dentro!

---

## ??? Modo desarrollo

- Presioná `F5` para lanzar la extensión en modo debug.
- Los archivos del `webview` están separados para facilitar la edición y el mantenimiento.

---

## ?? Requisitos

Para que funcione correctamente el acceso al AST:

?? Asegurate de que el ejecutable `Administrador.exe` esté ubicado en:

```
C:\Accusys Technology\AST-Activities Manager\ejecutable\Administrador.exe
```

Para que funcione correctamente el acceso al PuTTy:

?? Asegurate de que el ejecutable `putty.exe` esté ubicado en:

```
C:\Program Files\PuTTY\putty.exe
```

Para que funcione correctamente el acceso al WinSCP:

?? Asegurate de que el ejecutable `WinSCP.exe` esté ubicado en:

```
C:\Program Files (x86)\WinSCP\WinSCP.exe
```

Para que funcione correctamente el acceso al SoapUI:

?? Asegurate de que el ejecutable `SoapUI-5.7.2.exe` esté ubicado en:

```
C:\Program Files\SmartBear\SoapUI-5.7.2\bin\SoapUI-5.7.2.exe
```

Para que funcione correctamente el acceso al ISQLW:

?? Asegurate de que el ejecutable `Administrador.exe` esté ubicado en:

```
C:\Program Files (x86)\ISQL\MSSQL\BINN\ISQLW.EXE
```

Para que funcione correctamente el acceso al COBISExplorer:

?? Asegurate de que el ejecutable `COBISCorp.eCOBIS.COBISExplorer.Shell.exe` esté ubicado en:

```
C:\ProgramData\COBIS\COBISExplorer\COBISCorp.eCOBIS.COBISExplorer.Shell.exe
```

---

## ?? Contacto

Para dudas, sugerencias o mejoras:

**valentin.rodriguez@accusys.com.ar**
