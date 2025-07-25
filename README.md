# 🚀 AccuExtension

**AccuExtension** es una extensión personalizada para desarrolladores de **Accusys Technology**, diseñada para integrarse con **Visual Studio Code** y **Cursor** para mejorar tu flujo de trabajo diario.

[![Version](https://img.shields.io/badge/version-1.0.3-blue.svg)](https://marketplace.visualstudio.com/items?itemName=valentin.rodriguez.accuextension)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.60+-blue.svg)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## ✨ Características

### 🔧 **Herramientas de Desarrollo**
- **PuTTY**
- **WinSCP**
- **SoapUI**
- **ISQLW**
- **CobisExplorer**

### 📋 **Gestión de Proyectos**
- **AST-Activities Manager** - Acceso directo al gestor de actividades
- **AST Web** - Enlace directo al time report
- **TFS Integration** - Búsqueda y acceso a backlogs de TFS

---


## 📖 Uso

### Acceso Rápido
- **Botón de StatusBar**: Haz clic en el ícono `🚀AccuExtension` en la barra de estado
- **Comando Paleta**: `Ctrl+Shift+P` → "AccuExtension: Inicio"

### Configuración de Herramientas
1. Abre la extensión
2. Haz clic en el ícono ⚙️ en la esquina superior derecha del menú de herramientas
3. Configura las rutas de las herramientas según tu instalación

### Búsqueda en TFS
- Selecciona el equipo y área
- Ingresa el número de AST → Buscar AST
- Usa ext: para definir el tipo de archivo
- Usa "Literal" para búsquedas exactas
- Escribe por ejemplo nombres de archivos, tablas o lineas de codigo → "Buscar" 

---

## ⚙️ Configuración

### Rutas Predeterminadas
```json
{
  "accuextension.tools.putty": "C:\\Program Files\\PuTTY\\putty.exe",
  "accuextension.tools.winscp": "C:\\Program Files (x86)\\WinSCP\\WinSCP.exe",
  "accuextension.tools.soapui": "C:\\Program Files\\SmartBear\\SoapUI-5.7.2\\bin\\SoapUI-5.7.2.exe",
  "accuextension.tools.isqlw": "C:\\Program Files (x86)\\ISQL\\MSSQL\\BINN\\ISQLW.EXE",
  "accuextension.tools.cobis": "C:\\ProgramData\\COBIS\\COBISExplorer\\COBISCorp.eCOBIS.COBISExplorer.Shell.exe",
  "accuextension.tools.ast": "C:\\Accusys Technology\\AST-Activities Manager\\ejecutable\\Administrador.exe"
}
```

### Personalización
`Ctrl+Shift+P` → "AccuExtension: Configurar Rutas de Herramientas"

---

## 🛠️ Desarrollo

### Requisitos
- Node.js 14+
- VS Code Extension Development Host

### Configuración del entorno
```bash
# Clonar el repositorio
git clone https://github.com/VRodriguezValentin/AccuExtension.git
cd AccuExtension

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
F5
```

### Estructura del proyecto
```
AccuExtension/
├── src/
│   ├── extension.js         # Lógica principal
│   └── webview/
│       ├── index.html       # Interfaz HTML
│       ├── styles.css       # Estilos CSS
│       └── script.js        # Lógica del webview
├── media/                   # Imágenes y recursos
├── package.json            # Configuración de la extensión
└── README.md
```

---

## 👨‍💻 Contacto

**Valentín Rodríguez**
- GitHub: [@VRodriguezValentin](https://github.com/VRodriguezValentin)
- Mail Corporativo: [valentin.rodriguez@accusys.com.ar](mailto:valentin.rodriguez@accusys.com.ar)

---
