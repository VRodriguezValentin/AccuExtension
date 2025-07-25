# ?? AccuExtension

**AccuExtension** es una extensi�n personalizada para desarrolladores de **Accusys Technology**, pensada para integrarse con **Cursor** o **Visual Studio Code** y mejorar tu flujo de trabajo diario.

---

## ? Funcionalidades

- ?? **Acceso r�pido a AST-Activities Manager**
- ?? **Integraci�n con TFS** para acceder f�cilmente a tus **backlogs** y realizar b�squedas sin salir del editor

---

## ?? Estructura del proyecto

```
accuextension/
??? media/
?   ??? accusys-isotipo.png
?   ??? accusys-logo.png
??? src/
?   ??? extension.js         # L�gica principal de la extensi�n
?   ??? webview/
?       ??? index.html       # Estructura HTML del panel webview
?       ??? styles.css       # Estilos personalizados
?       ??? script.js        # Comportamiento del webview
??? CHANGELOG.md
??? package.json
??? README.md
```

---

## ?? �C�mo se usa?

1. Presion� `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
2. Escrib�: `AccuExtension: Inicio`
3. Presion� `Enter` y listo, �ya est�s dentro!

---

## ??? Modo desarrollo

- Presion� `F5` para lanzar la extensi�n en modo debug.
- Los archivos del `webview` est�n separados para facilitar la edici�n y el mantenimiento.

---

## ?? Requisitos

Para que funcione correctamente el acceso al AST:

?? Asegurate de que el ejecutable `Administrador.exe` est� ubicado en:

```
C:\Accusys Technology\AST-Activities Manager\ejecutable\Administrador.exe
```

Para que funcione correctamente el acceso al PuTTy:

?? Asegurate de que el ejecutable `putty.exe` est� ubicado en:

```
C:\Program Files\PuTTY\putty.exe
```

Para que funcione correctamente el acceso al WinSCP:

?? Asegurate de que el ejecutable `WinSCP.exe` est� ubicado en:

```
C:\Program Files (x86)\WinSCP\WinSCP.exe
```

Para que funcione correctamente el acceso al SoapUI:

?? Asegurate de que el ejecutable `SoapUI-5.7.2.exe` est� ubicado en:

```
C:\Program Files\SmartBear\SoapUI-5.7.2\bin\SoapUI-5.7.2.exe
```

Para que funcione correctamente el acceso al ISQLW:

?? Asegurate de que el ejecutable `Administrador.exe` est� ubicado en:

```
C:\Program Files (x86)\ISQL\MSSQL\BINN\ISQLW.EXE
```

Para que funcione correctamente el acceso al COBISExplorer:

?? Asegurate de que el ejecutable `COBISCorp.eCOBIS.COBISExplorer.Shell.exe` est� ubicado en:

```
C:\ProgramData\COBIS\COBISExplorer\COBISCorp.eCOBIS.COBISExplorer.Shell.exe
```

---

## ?? Contacto

Para dudas, sugerencias o mejoras:

**valentin.rodriguez@accusys.com.ar**
