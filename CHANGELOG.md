# 📝 Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

---

## [1.0.6] - 2025-08-13

### 🏗️ **Refactorización Mayor**
- **Arquitectura modular** - Código reorganizado en módulos especializados para mejor mantenibilidad
- **Separación de responsabilidades** - Lógica dividida en módulos específicos

### 🌟 **Nuevos Módulos**
- **`src/constants/config.js`** - Configuración centralizada de la extensión
- **`src/utils/configManager.js`** - Gestión de configuración y temas
- **`src/utils/pathValidator.js`** - Validación unificada de rutas y URLs
- **`src/utils/toolManager.js`** - Gestión de herramientas externas
- **`src/utils/webviewManager.js`** - Gestión del webview y recursos
- **`src/utils/messageHandler.js`** - Manejo de mensajes entre webview y extensión

### 🔧 **Mejoras Técnicas**
- **Sistema de constantes** - URLs, mensajes de error y comandos centralizados
- **Validación robusta** - Sistema unificado de validación de entrada
- **Manejo de mensajes optimizado** - Sistema basado en mapeo de comandos
- **Helpers para imágenes** - Código más limpio y reutilizable para recursos
- **Gestión de errores mejorada** - Mensajes consistentes y manejo centralizado

### ✨ Agregado: 
- **Accesos Directos Personalizados** - 5 botones “+” para agregar accesos directos. - Modal: Selección de emoji predefinido, campos para URL y nombre. Botones: Guardar, Cancelar y ⚙️ (abre `accuextension.shortcuts`).

---

## [1.0.5] - 2025-08-05

### ✨ Agregado
- **4 nuevos snippets SQL** para desarrollo COBIS avanzado:
  - `ERROR_TRAP` - Estructura estándar para error trap con manejo de transacciones
  - `exec_stored_procedure` - Ejemplo completo para execute de stored procedure
  - `select_cl_parametro` - Select a la tabla cobis..cl_parametro
  - `select_cl_catalogo_cl_tabla` - Select a la tabla cobis..cl_catalogo / cobis..cl_tabla
  - `cursor_standard` - Estructura estándar para cursor
- **Nuevas áreas y equipos** en TFS

---

## [1.0.4] - 2025-07-30

### ✨ Agregado
- **Sistema de Snippets SQL** - 12 snippets predefinidos para desarrollo COBIS
- **Autocompletado inteligente** - Snippets disponibles en archivos .sql y .sp
- **Prefijos de snippets**:
  - `insert_generico` - Insert genérico con 18 columnas
  - `insert_tran_servicio724` - Insert para transacciones de servicio 724
  - `update_generico` - Update genérico con 6 columnas
  - `delete_generico` - Delete genérico con 6 condiciones
  - `select_generico` - Select genérico con ordenamiento
  - `control_error_generico1/2/3` - Controles de error estándar
  - `sp_standard` - Estructura de stored procedure COBIS
  - `catalogo_standard` - Creación de catálogos COBIS
  - `create_table_standard` - Estructura de tablas
  - `create_view_standard` - Estructura de vistas

- **Botón de configuración de tema** - Botón 🎨 en la esquina superior derecha del webview para cambiar el tema del editor
- **Actualización dinámica del logo** - El logo se actualiza en tiempo real al cambiar el tema

---

## [1.0.3] - 2025-07-29

### ✨ Agregado
- **Botón de configuración de rutas de herramientas** integrado en el menú de herramientas (esquina superior derecha)
- **Comando dedicado** para abrir configuración: "AccuExtension: Configurar Rutas de Herramientas"

### 🔒 Seguridad
- **Eliminado CDN externo** - Reemplazado Font Awesome con iconos Unicode nativos
- **Validación de entrada** mejorada para URLs y rutas de archivos
- **Sanitización de rutas** para prevenir inyección de comandos

### 🔧 Mejorado
- **Flexibilidad** para diferentes configuraciones de sistema
- **Código consolidado** - Eliminada duplicación en manejo de rutas
- **Documentación JSDoc** agregada a todas las funciones principales
- **Validación robusta** de rutas de archivos con verificación de caracteres peligrosos
- **Manejo de errores** unificado y consistente

### 🐛 Corregido
- **Rutas hardcodeadas** reemplazadas por configuración dinámica
- **Función openASTManager** ahora usa la función unificada openTool
- **Validación de URLs** en openTFS para prevenir errores
- **Función openASTManager** ahora usa la función unificada openTool

---

## [1.0.2] - 2025-07-25

### ✨ Agregado
- **Botón de StatusBar** para acceso rápido a la extensión
- **Menú de herramientas** con 5 aplicaciones: PuTTY, WinSCP, SoapUI, ISQLW, CobisExplorer
- **Enlace "Abrir AST Web"** para acceso directo al time report
- **Tooltip explicativo** en el checkbox "Literal" de búsqueda avanzada
- **Manejo de errores** mejorado para herramientas no instaladas
- **Verificación de existencia** de archivos antes de ejecutar herramientas

### 🔧 Mejorado
- **Interfaz de usuario** más limpia y organizada
- **Prevención de múltiples paneles** webview (elimina titileo de pantalla)
- **Activación automática** de la extensión al iniciar Cursor

### 🐛 Corregido
- **Problema de titileo** de pantalla al abrir la extensión
- **Manejo de errores** para herramientas con rutas específicas

---

## [1.0.1] - 2025-07-21

### ✨ Agregado
- **Icono de la extensión** usando el logo de Accusys

### 🐛 Corregido
- **URL del repositorio** actualizada a: https://github.com/VRodriguezValentin/AccuExtension
- **URLs de homepage y bugs** corregidas

---

## [1.0.0] - 2025-07-18

### ✨ Agregado
- **Funcionalidad básica** de AccuExtension
- **Acceso rápido** a AST-Activities Manager
- **Búsqueda de elementos AST** por número
- **Búsqueda avanzada** en TFS con filtros
- **Interfaz moderna** con colores corporativos de Accusys
- **Líneas divisorias** para mejor organización visual
- **Soporte para extensiones** de archivo personalizadas
- **Checkbox "Literal"** para búsquedas exactas

---

## 🔗 Enlaces

- [GitHub Repository](https://github.com/VRodriguezValentin/AccuExtension)
- [Open VSX Marketplace](https://open-vsx.org/extension/accusys-technology/accuextension)
- [Issues](https://github.com/VRodriguezValentin/AccuExtension/issues)

---
