/**
 * Configuración centralizada de AccuExtension
 * @module constants/config
 */

module.exports = {
    // URLs base
    TFS_BASE_URL: 'http://tfs2018:8080/tfs/Accusys',
    
    // Timeouts
    THEME_UPDATE_TIMEOUT: 1000,
    
    // Extensiones soportadas
    SUPPORTED_EXTENSIONS: ['sql', 'sp', 'js', 'ts', 'html', 'css', 'xml', 'json'],
    
    // Nombres de herramientas
    TOOL_NAMES: {
        putty: 'PuTTY',
        winscp: 'WinSCP',
        soapui: 'SoapUI',
        isqlw: 'ISQLW',
        cobis: 'CobisExplorer',
        ast: 'AST-Activities Manager'
    },
    
    // Mapeo de imágenes por herramienta
    TOOL_IMAGES: {
        putty: 'PuTTY_icon.png',
        winscp: 'WinSCP_Logo.png',
        soapui: 'SoapUI_logo.png',
        isqlw: 'sql_logo.png',
        cobis: 'Cobis_logo.jpg'
    },
    
    // Logos por tema
    LOGO_BY_THEME: {
        dark: 'accusys-logo.png',
        light: 'accusys-logo-negativo.png'
    },
    
    // Mensajes de error estándar
    ERROR_MESSAGES: {
        TOOL_NOT_CONFIGURED: 'Ruta no configurada. Ve a Configuración > AccuExtension para configurar la ruta.',
        INVALID_PATH: 'Ruta inválida proporcionada.',
        FILE_NOT_FOUND: 'El archivo no existe en la ruta especificada.',
        INVALID_URL: 'URL inválida proporcionada.',
        TOOL_OPEN_ERROR: 'Error al abrir la herramienta. Verifica la ruta en Configuración > AccuExtension.'
    },
    
    // Comandos de mensajes
    MESSAGE_COMMANDS: {
        OPEN_AST: 'openAST',
        OPEN_TFS: 'openTFS',
        SEARCH_AST: 'searchAST',
        OPEN_TOOL: 'openTool',
        CHECK_AND_OPEN_TOOL: 'checkAndOpenTool',
        GET_TOOL_PATH: 'getToolPath',
        SHOW_ERROR: 'showError',
        OPEN_SETTINGS: 'openSettings',
        OPEN_THEME_SETTINGS: 'openThemeSettings',
        UPDATE_LOGO: 'updateLogo',
        TOOL_PATH: 'toolPath',
        UPDATE_LOGO_VIEW: 'updateLogo',
        OPEN_CUSTOM_URL: 'openCustomUrl',
        OPEN_SHORTCUTS_SETTINGS: 'openShortcutsSettings'
    },
    
    // Configuración de accesos directos
    SHORTCUT_CONFIG_KEYS: {
        CUSTOM1: 'accuextension.shortcuts.custom1',
        CUSTOM2: 'accuextension.shortcuts.custom2',
        CUSTOM3: 'accuextension.shortcuts.custom3',
        CUSTOM4: 'accuextension.shortcuts.custom4',
        CUSTOM5: 'accuextension.shortcuts.custom5'
    }
}; 