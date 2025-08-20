# 🚀 AccuExtension

**AccuExtension** es una extensión personalizada para desarrolladores de **Accusys Technology**, diseñada específicamente para **Cursor** para mejorar tu flujo de trabajo diario.

[![Version](https://img.shields.io/badge/version-1.0.6-blue.svg)](https://open-vsx.org/extension/accusys-technology/accuextension)
[![Cursor](https://img.shields.io/badge/Cursor-1.3.9+-black.svg)](https://cursor.com/?from=home)
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

### 💻 **Snippets SQL**
- **16 snippets predefinidos** para desarrollo COBIS
- **Autocompletado inteligente** en archivos .sql y .sp
- **Estructuras estándar** para stored procedures, tablas, vistas, catálogos, cursores y manejo de errores

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
- Escribe por ejemplo nombres de archivos, tablas o líneas de código → "Buscar"

### Snippets SQL
Los snippets están disponibles automáticamente en archivos `.sql` y `.sp`. Escribe el prefijo y presiona `Tab`:

| Prefijo | Descripción |
|---------|-------------|
| `insert_generico` | Insert genérico con 18 columnas |
| `insert_tran_servicio724` | Insert para transacciones de servicio 724 |
| `update_generico` | Update genérico con 6 columnas |
| `delete_generico` | Delete genérico con 6 condiciones |
| `select_generico` | Select genérico con ordenamiento |
| `select_cl_parametro` | Select a la tabla cobis..cl_parametro |
| `select_cl_catalogo_cl_tabla` | Select a la tabla cobis..cl_catalogo / cobis..cl_tabla |
| `cursor_standard` | Estructura estándar para cursor |
| `control_error_generico1` | Control de error básico |
| `control_error_generico2` | Control de error con @@rowcount |
| `control_error_generico3` | Control solo @@rowcount |
| `sp_standard` | Estructura de stored procedure COBIS |
| `ERROR_TRAP` | Estructura estándar para error trap |
| `exec_stored_procedure` | Ejemplo para execute de stored procedure |
| `catalogo_standard` | Creación de catálogos COBIS |
| `create_table_standard` | Estructura de tablas |
| `create_view_standard` | Estructura de vistas | 

---

## 🔗 Accesos Directos Personalizados (Funcionalidad 1)

Añade hasta 5 accesos directos con una URL.

- Cómo usarlos:
  - Haz clic en el botón "+" para abrir el modal.
  - Elige un emoji de la lista, ingresa la URL y (opcional) un nombre.
  - Presiona "Guardar". "Cancelar" cierra el modal y "⚙️" abre la configuración del editor para estos accesos.

### ⚙️ Configuración en el Editor (Settings UI)

Los accesos se configuran desde Settings en el apartado `AccuExtension > Shortcuts` (o con el botón ⚙️ del modal). Cada acceso tiene 3 campos editables:

- `accuextension.shortcuts.custom{1..5}.character`  Carácter/emoji a mostrar
- `accuextension.shortcuts.custom{1..5}.url`        URL de destino
- `accuextension.shortcuts.custom{1..5}.name`       Nombre opcional a mostrar

También hay un enlace "Vaciar" en cada `character` para limpiar los tres campos del acceso correspondiente.

Ejemplo rápido (settings.json equivalente):

```json
{
  "accuextension.shortcuts.custom1.character": "🚀",
  "accuextension.shortcuts.custom1.url": "https://cursor.com/dashboard",
  "accuextension.shortcuts.custom1.name": "Cursor"
}
```

---

## ⏰ Recordatorios de Horas

Sistema automático de recordatorios para cargar las horas de trabajo en el time report de Accusys.

### 🔔 **Características:**
- **Notificaciones automáticas** según el intervalo configurado
- **Al tocar la notificación** se abre directamente el [Time Report de Accusys](https://timereport.accusys.com.ar/web/login.aspx)

### ⚙️ **Configuración:**

Los recordatorios se configuran desde Settings en el apartado `AccuExtension > Reminders`:

- **`accuextension.reminders.enabled`** - Activar/desactivar recordatorios
- **`accuextension.reminders.interval`** - Intervalo entre notificaciones:
  - `30min` - Cada 30 minutos
  - `1hr` - Cada 1 hora  
  - `2hrs` - Cada 2 horas (por defecto)
  - `4hrs` - Cada 4 horas
  - `Desactivado` - Sin recordatorios

### 🔧 **Ejemplo de configuración (settings.json):**

```json
{
  "accuextension.reminders.enabled": true,
  "accuextension.reminders.interval": "2hrs"
}
```

**Nota**: Los cambios en la configuración se aplican inmediatamente sin necesidad de reiniciar la extensión.

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
│   ├── constants/
│   │   └── config.js        # Configuración centralizada
│   ├── utils/
│   │   ├── configManager.js # Gestión de configuración
│   │   ├── pathValidator.js # Validación de rutas y URLs
│   │   ├── toolManager.js   # Gestión de herramientas
│   │   ├── webviewManager.js # Gestión del webview
│   │   └── messageHandler.js # Manejo de mensajes
│   └── webview/
│       ├── index.html       # Interfaz HTML
│       ├── styles.css       # Estilos CSS
│       └── script.js        # Lógica del webview
├── snippets/
│   └── sql.json            # Configuración de snippets SQL
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
