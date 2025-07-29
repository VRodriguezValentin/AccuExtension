# 📝 Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

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
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=valentin.rodriguez.accuextension)
- [Issues](https://github.com/VRodriguezValentin/AccuExtension/issues)

---
