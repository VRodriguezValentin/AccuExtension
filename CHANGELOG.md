# 📝 Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

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
- **Activación automática** de la extensión al iniciar VS Code/Cursor

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
