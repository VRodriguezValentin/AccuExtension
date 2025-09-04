const vscode = acquireVsCodeApi();

// Constantes para comandos de mensajes
const COMMANDS = {
    OPEN_THEME_SETTINGS: 'openThemeSettings',
    GET_TOOL_PATH: 'getToolPath',
    CHECK_AND_OPEN_TOOL: 'checkAndOpenTool',
    OPEN_AST: 'openAST',
    OPEN_TFS: 'openTFS',
    SEARCH_AST: 'searchAST',
    SHOW_ERROR: 'showError',
    UPDATE_LOGO: 'updateLogo',
    TOOL_PATH: 'toolPath',
    OPEN_SETTINGS: 'openSettings',
    OPEN_CUSTOM_URL: 'openCustomUrl',
    OPEN_SHORTCUTS_SETTINGS: 'openShortcutsSettings',
    SAVE_TFS_SELECTION: 'saveTFSSelection',
    GET_TFS_SELECTION: 'getTFSSelection',
    EXECUTE_SQL_QUERY: 'executeSqlQuery',
    GET_SQL_CONNECTIONS: 'getSqlConnections',
    SAVE_SQL_CONNECTION: 'saveSqlConnection',
    GET_SQL_HISTORY: 'getSqlHistory',
    EXPORT_SQL_RESULTS: 'exportSqlResults',
    OPEN_SQL_SETTINGS: 'openSqlSpecificSettings'
};

// Constantes para URLs
const URLS = {
    TFS_BASE: 'http://tfs2018:8080/tfs/Accusys',
    BACKLOG_PATH: '/_backlogs?level=Requirements&showParents=false&redirect=True&_a=backlog',
    SEARCH_PATH: '/_search?type=work%20item&lp=custom-Team&text=',
    CODE_SEARCH_PATH: '/_search?type=code&lp=custom-Team&text=',
    SEARCH_FILTERS: '&filters=Projects%7B',
    CODE_SEARCH_FILTERS: '&filters=ProjectFilters%7B',
    SEARCH_SUFFIX: '%7D&_a=search'
};

// Configuración de equipos por área
const EQUIPOS_POR_AREA = {
    'Pasivas':   ['Naranja', 'Gris', 'Celeste', 'Cobre', 'Amarillo', 'Verde'],
    'Activas':   ['Rojo', 'Blanco', 'Violeta', 'Magenta'],
    'Centrales': ['Verde'],
    'Outsiders': ['Bordo'],
    'Redes':     ['Amarillo'],
    'Tradicionales': ['Oro', 'Plata'],
    'Virtuales': ['Amarillo', 'Azul', 'Bronce', 'Negro', 'Plata']
};

// Variables para accesos directos
let currentShortcutIndex = -1;
let shortcuts = [{}, {}, {}, {}, {}];

// Variables para SQL Editor
let sqlConnections = {};
let currentConnection = null;
let sqlHistory = [];
let lastQueryResult = null;

// Función para abrir la configuración de temas
function openThemeSettings() {
    vscode.postMessage({
        command: COMMANDS.OPEN_THEME_SETTINGS
    });
}

// Función para abrir herramientas
function openTool(toolName) {
    vscode.postMessage({
        command: COMMANDS.GET_TOOL_PATH,
        toolName: toolName
    });
}

function openAST() {
    vscode.postMessage({
        command: COMMANDS.OPEN_AST
    });
}

// Funciones para accesos directos personalizados
function editShortcut(index) {
    currentShortcutIndex = index;
    const shortcut = shortcuts[index] || {};
    
    // Limpiar selección previa de emoji
    document.querySelectorAll('.emoji-option').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Pre-seleccionar emoji si existe
    if (shortcut.emoji) {
        const emojiBtn = Array.from(document.querySelectorAll('.emoji-option')).find(btn => btn.textContent === shortcut.emoji);
        if (emojiBtn) {
            emojiBtn.classList.add('selected');
        }
    }
    
    // Llenar campos del modal
    document.getElementById('shortcutEmoji').value = shortcut.emoji || '';
    document.getElementById('shortcutUrl').value = shortcut.url || '';
    document.getElementById('shortcutName').value = shortcut.name || '';
    
    // Mostrar modal
    document.getElementById('shortcutModal').style.display = 'flex';
}

function selectEmoji(emoji) {
    // Limpiar selección previa
    document.querySelectorAll('.emoji-option').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Seleccionar nuevo emoji
    const emojiBtn = Array.from(document.querySelectorAll('.emoji-option')).find(btn => btn.textContent === emoji);
    if (emojiBtn) {
        emojiBtn.classList.add('selected');
    }
    
    document.getElementById('shortcutEmoji').value = emoji;
}

function saveShortcut() {
    const emoji = document.getElementById('shortcutEmoji').value;
    const url = document.getElementById('shortcutUrl').value;
    const name = document.getElementById('shortcutName').value;
    
    if (!emoji || !url) {
        alert('Por favor, selecciona un emoji y ingresa una URL');
        return;
    }
    
    if (!isValidUrl(url)) {
        alert('Por favor, ingresa una URL válida');
        return;
    }
    
    // Actualizar estado local para respuesta inmediata
    shortcuts[currentShortcutIndex] = {
        emoji: emoji,
        url: url,
        name: name
    };
    
    // Notificar a la extensión para sincronizar con Settings (fuente de verdad)
    vscode.postMessage({
        command: 'syncShortcutToSettings',
        index: currentShortcutIndex,
        data: { character: emoji, url, name }
    });
    
    // Actualizar interfaz
    updateShortcutDisplay(currentShortcutIndex);
    
    // Cerrar modal
    closeShortcutModal();
}

function deleteShortcut() {
    if (currentShortcutIndex >= 0) {
        // Eliminar acceso directo (estado local)
        shortcuts.splice(currentShortcutIndex, 1);
        // Actualizar interfaz
        updateShortcutDisplay(currentShortcutIndex);
        closeShortcutModal();
    }
}

function clearShortcut() {
    if (currentShortcutIndex >= 0) {
        // Vaciar acceso directo (estado local)
        shortcuts[currentShortcutIndex] = {
            emoji: '',
            url: '',
            name: ''
        };
        // Actualizar interfaz
        updateShortcutDisplay(currentShortcutIndex);
        closeShortcutModal();
    }
}

function closeShortcutModal() {
    document.getElementById('shortcutModal').style.display = 'none';
    currentShortcutIndex = -1;
}

function updateShortcutDisplay(index) {
    const shortcutItem = document.querySelector(`[data-index="${index}"]`);
    if (!shortcutItem) return;
    
    const shortcutButton = shortcutItem.querySelector('.shortcut-button');
    const shortcutInfo = shortcutItem.querySelector('.shortcut-info');
    const shortcut = shortcuts[index];
    
    if (shortcut && shortcut.emoji && shortcut.url) {
        // Mostrar información del acceso directo
        shortcutButton.style.display = 'none';
        shortcutInfo.style.display = 'flex';
        
        const emojiSpan = shortcutInfo.querySelector('.shortcut-emoji');
        const nameSpan = shortcutInfo.querySelector('.shortcut-name');
        
        emojiSpan.textContent = shortcut.emoji;
        nameSpan.textContent = shortcut.name || ' ';
        
        // Agregar evento click para abrir URL
        shortcutInfo.onclick = () => openCustomShortcut(shortcut);
    } else {
        // Mostrar botón de agregar
        shortcutButton.style.display = 'flex';
        shortcutInfo.style.display = 'none';
        shortcutInfo.onclick = null;
    }
}

function openCustomShortcut(shortcut) {
    if (shortcut && shortcut.url) {
        vscode.postMessage({
            command: COMMANDS.OPEN_CUSTOM_URL,
            url: shortcut.url
        });
    }
}

function loadShortcuts() {
    // Cargar accesos directos desde localStorage
    const saved = localStorage.getItem('accuextension-shortcuts');
    if (saved) {
        try {
            shortcuts = JSON.parse(saved);
        } catch (e) {
            shortcuts = [];
        }
    }
    
    // Actualizar interfaz para todos los accesos directos
    for (let i = 0; i < 5; i++) {
        updateShortcutDisplay(i);
    }
}

function loadShortcutsFromSettings(settingsShortcuts) {
    // settingsShortcuts: array de 5 objetos {character,url,name}
    shortcuts = shortcuts || [];
    for (let i = 0; i < 5; i++) {
        const fromSettings = settingsShortcuts[i] || {};
        shortcuts[i] = {
            emoji: fromSettings.character || '',
            url: fromSettings.url || '',
            name: fromSettings.name || ''
        };
    }
    for (let i = 0; i < 5; i++) updateShortcutDisplay(i);
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Función para actualizar la lista de equipos según el área seleccionada
function updateEquipos() {
    const areaSelect = document.getElementById('area');
    const equipoSelect = document.getElementById('equipo');
    const tfsButton = document.getElementById('tfsButton');
    
    const selectedArea = areaSelect.value;
    
    // Limpiar opciones del select de equipo
    equipoSelect.innerHTML = '';
    
    if (selectedArea) {
        equipoSelect.disabled = false;
        
        // Agregar opción por defecto
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Selecciona un equipo';
        equipoSelect.appendChild(defaultOption);
        
        // Agregar equipos correspondientes al área
        EQUIPOS_POR_AREA[selectedArea].forEach(equipo => {
            const option = document.createElement('option');
            option.value = equipo;
            option.textContent = equipo;
            equipoSelect.appendChild(option);
        });
    } else {
        equipoSelect.disabled = true;
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Primero selecciona un área';
        equipoSelect.appendChild(defaultOption);
        tfsButton.disabled = true;
    }
    
    // Verificar si se puede habilitar el botón
    checkButtonStatus();
    checkSearchButtonStatus();
    checkAdvancedSearchStatus();
}

// Función para verificar el estado del botón TFS
function checkButtonStatus() {
    const areaSelect = document.getElementById('area');
    const equipoSelect = document.getElementById('equipo');
    const tfsButton = document.getElementById('tfsButton');
    const saveButton = document.getElementById('saveButton');
    
    const isEnabled = areaSelect.value && equipoSelect.value;
    tfsButton.disabled = !isEnabled;
    saveButton.disabled = !isEnabled;
}

// Función para guardar la selección de TFS
function saveTFSSelection() {
    const area = document.getElementById('area').value;
    const equipo = document.getElementById('equipo').value;
    
    if (area && equipo) {
        // Enviar mensaje al backend para guardar la configuración
        vscode.postMessage({
            command: COMMANDS.SAVE_TFS_SELECTION,
            area: area,
            equipo: equipo
        });
    }
}

// Función para abrir enlace TFS
function openTFSLink() {
    const area = document.getElementById('area').value;
    const equipo = document.getElementById('equipo').value;
    
    if (area && equipo) {
        const url = `${URLS.TFS_BASE}/${area}/Equipo%20${equipo}${URLS.BACKLOG_PATH}`;
        
        vscode.postMessage({
            command: COMMANDS.OPEN_TFS,
            url: url
        });
    }
}

// Función para verificar el estado del botón de búsqueda
function checkSearchButtonStatus() {
    const areaSelect = document.getElementById('area');
    const equipoSelect = document.getElementById('equipo');
    const featureInput = document.getElementById('featureNumber');
    const searchButton = document.getElementById('searchButton');
    
    // Habilitar el botón solo si hay área, equipo y número de feature
    searchButton.disabled = !(areaSelect.value && equipoSelect.value && featureInput.value);
}

// Función para buscar en AST
function searchASTLink() {
    const area = document.getElementById('area').value;
    const equipo = document.getElementById('equipo').value;
    const feature = document.getElementById('featureNumber').value;
    
    if (area && equipo && feature) {
        const url = `${URLS.TFS_BASE}/${area}/Equipo%20${equipo}${URLS.SEARCH_PATH}${feature}${URLS.SEARCH_FILTERS}${area}${URLS.SEARCH_SUFFIX}`;
        
        vscode.postMessage({
            command: COMMANDS.SEARCH_AST,
            url: url
        });
    }
}

// Función para verificar el estado de la búsqueda avanzada
function checkAdvancedSearchStatus() {
    const searchText = document.getElementById('searchText').value.trim();
    const extSelect = document.getElementById('extSelect');
    const customExt = document.getElementById('customExt');
    const searchButton = document.getElementById('advancedSearchButton');
    
    // El botón se habilita solo si hay texto para buscar
    const hasText = searchText.length > 0;
    
    // Verificar si se necesita extensión personalizada
    if (extSelect.value === 'otro') {
        const hasCustomExt = customExt.value.trim().length > 0;
        searchButton.disabled = !hasText || !hasCustomExt;
    } else {
        searchButton.disabled = !hasText;
    }
}

// Función para manejar cambios en el select de extensión
function handleExtSelectChange() {
    const extSelect = document.getElementById('extSelect');
    const customExtGroup = document.getElementById('customExtGroup');
    
    if (extSelect.value === 'otro') {
        customExtGroup.style.display = 'block';
        customExtGroup.classList.add('show');
    } else {
        customExtGroup.style.display = 'none';
        customExtGroup.classList.remove('show');
        document.getElementById('customExt').value = '';
    }
    
    // Verificar el estado del botón después del cambio
    checkAdvancedSearchStatus();
}

// Función para búsqueda avanzada
function advancedSearchLink() {
    const area = document.getElementById('area').value;
    const equipo = document.getElementById('equipo').value;
    const searchText = document.getElementById('searchText').value.trim();
    const extSelect = document.getElementById('extSelect').value;
    const customExt = document.getElementById('customExt').value.trim();
    if (area && equipo && searchText) {
        let searchQuery = searchText;
        
        // Agregar extensión si está seleccionada
        if (extSelect === 'otro' && customExt) {
            searchQuery += ` ext:${customExt}`;
        } else if (extSelect && extSelect !== 'otro') {
            searchQuery += ` ext:${extSelect}`;
        }
        
        // Codificar la consulta para URL
        const encodedQuery = encodeURIComponent(searchQuery);
        
        // Construir la URL
        const url = `${URLS.TFS_BASE}/${area}/Equipo%20${equipo}${URLS.CODE_SEARCH_PATH}${encodedQuery}${URLS.CODE_SEARCH_FILTERS}${area}${URLS.SEARCH_SUFFIX}`;
        
        vscode.postMessage({
            command: COMMANDS.SEARCH_AST,
            url: url
        });
    }
}

// Función para obtener el nombre de visualización de la herramienta
function getToolDisplayName(toolName) {
    const toolNames = {
        'putty': 'PuTTY',
        'winscp': 'WinSCP',
        'soapui': 'SoapUI',
        'isqlw': 'ISQLW',
        'cobis': 'CobisExplorer'
    };
    return toolNames[toolName] || toolName;
}

// Función para abrir la configuración
function openSettings() {
    vscode.postMessage({
        command: COMMANDS.OPEN_SETTINGS
    });
}

// Función para abrir la configuración de accesos directos
function openShortcutsSettings() {
    vscode.postMessage({
        command: COMMANDS.OPEN_SHORTCUTS_SETTINGS
    });
}

// Función para cargar la configuración guardada de TFS
function loadTFSSelection() {
    vscode.postMessage({
        command: COMMANDS.GET_TFS_SELECTION
    });
}

// Función para aplicar la selección guardada a los selects
function applyTFSSelection(area, equipo) {
    if (area && equipo) {
        // Seleccionar el área
        const areaSelect = document.getElementById('area');
        areaSelect.value = area;
        
        // Actualizar la lista de equipos
        updateEquipos();
        
        // Después de un pequeño delay, seleccionar el equipo
        setTimeout(() => {
            const equipoSelect = document.getElementById('equipo');
            equipoSelect.value = equipo;
            
            // Verificar el estado de los botones
            checkButtonStatus();
            checkSearchButtonStatus();
            checkAdvancedSearchStatus();
        }, 100);
    }
}

// Agregar listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar UI con botones "+" hasta recibir settings
    for (let i = 0; i < 5; i++) {
        updateShortcutDisplay(i);
    }
    
    // Cargar la configuración guardada de TFS
    loadTFSSelection();
    
    document.getElementById('equipo').addEventListener('change', function() {
        checkButtonStatus();
        checkSearchButtonStatus();
        checkAdvancedSearchStatus();
    });
    
    // Listener para el select de área para actualizar búsqueda avanzada
    document.getElementById('area').addEventListener('change', function() {
        checkAdvancedSearchStatus();
    });
    
    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('shortcutModal');
        if (event.target === modal) {
            closeShortcutModal();
        }
    });
});

// Manejador de mensajes del webview
window.addEventListener('message', event => {
    const message = event.data;
    
    switch (message.command) {
        case COMMANDS.TOOL_PATH:
            if (message.path) {
                // Abrir la herramienta con la ruta recibida
                vscode.postMessage({
                    command: COMMANDS.CHECK_AND_OPEN_TOOL,
                    path: message.path,
                    name: getToolDisplayName(message.toolName),
                    toolName: message.toolName
                });
            } else {
                // Mostrar mensaje de error si no hay ruta configurada
                vscode.postMessage({
                    command: COMMANDS.SHOW_ERROR,
                    message: 'Ruta no configurada. Ve a Configuración > AccuExtension para configurar la ruta.'
                });
            }
            break;
        
        case COMMANDS.UPDATE_LOGO:
            // Actualizar el logo del webview
            const logoImg = document.querySelector('img[src*="accusys-logo"]');
            if (logoImg && message.imageSrc) {
                logoImg.src = message.imageSrc;
            }
            break;
        
        case 'initShortcutsFromSettings':
            if (Array.isArray(message.data)) {
                loadShortcutsFromSettings(message.data);
            }
            break;
            
        case 'tfsSelectionLoaded':
            // Aplicar la selección guardada de TFS
            applyTFSSelection(message.area, message.equipo);
            break;
            
        case 'sqlConnectionsLoaded':
            loadSqlConnectionsToUI(message.connections);
            break;
            
        case 'sqlQueryExecuted':
            displaySqlResults(message.result);
            break;
            
        case 'sqlHistoryLoaded':
            sqlHistory = message.history || [];
            break;
    }
});

// ==========================================
// FUNCIONES SQL EDITOR
// ==========================================

/**
 * Carga las conexiones SQL disponibles
 */
function loadSqlConnections() {
    vscode.postMessage({
        command: COMMANDS.GET_SQL_CONNECTIONS
    });
}

/**
 * Carga las conexiones en el selector UI
 */
function loadSqlConnectionsToUI(connections) {
    sqlConnections = connections;
    const select = document.getElementById('sqlConnection');
    
    // Limpiar opciones existentes excepto la primera
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    // Agregar conexiones disponibles
    Object.keys(connections).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = connections[key].name;
        
        // Marcar si no tiene contraseña configurada
        if (!connections[key].hasPassword) {
            option.textContent += ' (⚠️ Sin contraseña)';
            option.style.color = 'var(--vscode-terminal-ansiYellow)';
        }
        
        select.appendChild(option);
    });
    
    checkSqlExecuteButton();
}

/**
 * Maneja el cambio de conexión
 */
function handleConnectionChange() {
    const select = document.getElementById('sqlConnection');
    currentConnection = select.value || null;
    checkSqlExecuteButton();
}

/**
 * Verifica si se puede habilitar el botón ejecutar
 */
function checkSqlExecuteButton() {
    const executeButton = document.getElementById('sqlExecuteButton');
    const sqlEditor = document.getElementById('sqlEditor');
    const connectionSelect = document.getElementById('sqlConnection');
    
    const hasConnection = connectionSelect.value;
    const hasQuery = sqlEditor.value.trim().length > 0;
    
    executeButton.disabled = !hasConnection || !hasQuery;
}

/**
 * Ejecuta la consulta SQL
 */
async function executeSqlQuery() {
    const connectionKey = document.getElementById('sqlConnection').value;
    const query = document.getElementById('sqlEditor').value.trim();
    
    if (!connectionKey || !query) {
        alert('Selecciona una conexión e ingresa una consulta');
        return;
    }
    
    // Deshabilitar botón y mostrar estado de carga
    const executeButton = document.getElementById('sqlExecuteButton');
    const originalText = executeButton.innerHTML;
    executeButton.disabled = true;
    executeButton.innerHTML = '⏳ Ejecutando...';
    
    // Ocultar resultados anteriores
    document.getElementById('sqlResults').style.display = 'none';
    
    try {
        // Enviar consulta al backend
        const result = await sendSqlQueryToBackend(connectionKey, query);
        displaySqlResults(result);
    } catch (error) {
        displaySqlError(error.message);
    } finally {
        // Restaurar botón
        executeButton.disabled = false;
        executeButton.innerHTML = originalText;
        checkSqlExecuteButton();
    }
}

/**
 * Envía la consulta al backend y retorna una promesa
 */
function sendSqlQueryToBackend(connectionKey, query) {
    return new Promise((resolve, reject) => {
        const messageId = Date.now();
        
        // Listener temporal para esta consulta específica
        const messageListener = (event) => {
            const message = event.data;
            if (message.command === 'sqlQueryResult' && message.messageId === messageId) {
                window.removeEventListener('message', messageListener);
                
                if (message.success) {
                    resolve(message.result);
                } else {
                    reject(new Error(message.error));
                }
            }
        };
        
        window.addEventListener('message', messageListener);
        
        // Enviar consulta
        vscode.postMessage({
            command: COMMANDS.EXECUTE_SQL_QUERY,
            messageId: messageId,
            connectionKey: connectionKey,
            query: query
        });
        
        // Timeout después de 60 segundos
        setTimeout(() => {
            window.removeEventListener('message', messageListener);
            reject(new Error('Timeout: La consulta tardó más de 60 segundos'));
        }, 60000);
    });
}

/**
 * Muestra los resultados de la consulta
 */
function displaySqlResults(result) {
    lastQueryResult = result;
    
    const resultsContainer = document.getElementById('sqlResults');
    const resultsOutput = document.getElementById('sqlResultsOutput');
    const executionTime = document.getElementById('sqlExecutionTime');
    
    // Mostrar tiempo de ejecución
    executionTime.textContent = `Ejecutado en ${result.executionTime}ms`;
    
    // Limpiar clases de estado previas
    resultsContainer.classList.remove('success', 'error', 'warning');
    
    if (result.success) {
        resultsContainer.classList.add('success');
        resultsOutput.textContent = result.output || 'Consulta ejecutada exitosamente (sin resultados)';
    } else {
        resultsContainer.classList.add('error');
        resultsOutput.textContent = result.error || 'Error desconocido';
    }
    
    // Mostrar contenedor de resultados
    resultsContainer.style.display = 'block';
    
    // Scroll hacia los resultados
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Muestra error de SQL
 */
function displaySqlError(errorMessage) {
    const resultsContainer = document.getElementById('sqlResults');
    const resultsOutput = document.getElementById('sqlResultsOutput');
    const executionTime = document.getElementById('sqlExecutionTime');
    
    executionTime.textContent = 'Error en ejecución';
    resultsContainer.classList.remove('success', 'warning');
    resultsContainer.classList.add('error');
    resultsOutput.textContent = errorMessage;
    resultsContainer.style.display = 'block';
}

/**
 * Formatea la consulta SQL (básico)
 */
function formatQuery() {
    const editor = document.getElementById('sqlEditor');
    let query = editor.value;
    
    // Formateo básico de SQL en minúsculas
    query = query
        .replace(/\bSELECT\b/gi, '\nselect')
        .replace(/\bFROM\b/gi, '\nfrom')
        .replace(/\bWHERE\b/gi, '\nwhere')
        .replace(/\bAND\b/gi, '\n  and')
        .replace(/\bOR\b/gi, '\n  or')
        .replace(/\bORDER BY\b/gi, '\norder by')
        .replace(/\bGROUP BY\b/gi, '\ngroup by')
        .replace(/\bHAVING\b/gi, '\nhaving')
        .replace(/\bINSERT INTO\b/gi, '\ninsert into')
        .replace(/\bVALUES\b/gi, '\nvalues')
        .replace(/\bUPDATE\b/gi, '\nupdate')
        .replace(/\bSET\b/gi, '\nset')
        .replace(/\bDELETE FROM\b/gi, '\ndelete from')
        .replace(/\bINNER JOIN\b/gi, '\n  inner join')
        .replace(/\bLEFT JOIN\b/gi, '\n  left join')
        .replace(/\bRIGHT JOIN\b/gi, '\n  right join')
        .replace(/\bFULL JOIN\b/gi, '\n  full join')
        .replace(/\bON\b/gi, '\n    on')
        .replace(/,/g, ',\n  ')
        .replace(/^\s+/gm, '') // Remover espacios al inicio
        .replace(/\n\s*\n/g, '\n') // Remover líneas vacías múltiples
        .trim();
    
    editor.value = query;
    checkSqlExecuteButton();
}

/**
 * Limpia la consulta
 */
function clearQuery() {
    try {
        const editor = document.getElementById('sqlEditor');
        if (!editor) {
            alert('Error: No se encontró el editor SQL');
            return;
        }
        
        // Simplificar: limpiar directamente sin preguntar si hay poco texto
        const currentValue = editor.value.trim();
        
        if (currentValue.length === 0) {
            // Si ya está vacío, solo hacer focus
            editor.focus();
            return;
        }
        
        // Si hay menos de 50 caracteres, limpiar directamente
        if (currentValue.length < 50) {
            editor.value = '';
            editor.focus();
            checkSqlExecuteButton();
            return;
        }
        
        // Si hay mucho texto, preguntar
        if (confirm('¿Estás seguro de que quieres limpiar la consulta?')) {
            editor.value = '';
            editor.focus();
            checkSqlExecuteButton();
        }
    } catch (error) {
        alert('Error al limpiar la consulta: ' + error.message);
    }
}

/**
 * Muestra el historial de consultas
 */
function showQueryHistory() {
    // Cargar historial desde el backend
    vscode.postMessage({
        command: COMMANDS.GET_SQL_HISTORY
    });
    
    // Esperar un momento para que se cargue el historial
    setTimeout(() => {
        if (sqlHistory.length === 0) {
            alert('No hay consultas en el historial.\n\nEjecuta algunas consultas SQL para ver el historial aquí.');
            return;
        }
        
        const historyText = sqlHistory
            .slice(0, 15) // Mostrar las últimas 15 consultas
            .map((item, index) => {
                const date = new Date(item.timestamp).toLocaleString('es-ES');
                const status = item.success ? '✅ Exitosa' : '❌ Error';
                const query = item.query.length > 60 ? item.query.substring(0, 60) + '...' : item.query;
                return `${index + 1}. ${date}\n   Conexión: ${item.connection}\n   ${status} (${item.executionTime}ms)\n   Consulta: ${query}\n`;
            })
            .join('\n');
        
        const action = confirm(`📋 HISTORIAL DE CONSULTAS SQL\n\nÚltimas ${Math.min(sqlHistory.length, 15)} consultas:\n\n${historyText}\n\n¿Quieres abrir la configuración de SQL para gestionar el historial?`);
        
        if (action) {
            openSqlSettings();
        }
    }, 200); // Pequeño delay para asegurar que el historial se haya cargado
}



/**
 * Exporta resultados
 */
function exportResults(format) {
    if (!lastQueryResult || !lastQueryResult.output) {
        alert('No hay resultados para exportar');
        return;
    }
    
    vscode.postMessage({
        command: COMMANDS.EXPORT_SQL_RESULTS,
        data: lastQueryResult.output,
        format: format
    });
}

/**
 * Copia los resultados al portapapeles
 */
function copyResults() {
    if (!lastQueryResult || !lastQueryResult.output) {
        alert('No hay resultados para copiar');
        return;
    }
    
    try {
        // Usar la API del navegador para copiar al portapapeles
        navigator.clipboard.writeText(lastQueryResult.output).then(() => {
            // Mostrar feedback visual
            const button = event.target;
            const originalText = button.innerHTML;
            button.innerHTML = '✅';
            button.style.background = '#28a745';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
            }, 1500);
        }).catch(() => {
            // Fallback para navegadores que no soportan clipboard API
            fallbackCopyToClipboard(lastQueryResult.output);
        });
    } catch (error) {
        // Fallback para navegadores que no soportan clipboard API
        fallbackCopyToClipboard(lastQueryResult.output);
    }
}

/**
 * Fallback para copiar al portapapeles
 */
function fallbackCopyToClipboard(text) {
    try {
        // Crear un elemento temporal
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        // Intentar copiar
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            alert('Resultado copiado al portapapeles');
        } else {
            alert('No se pudo copiar al portapapeles. Selecciona y copia manualmente el texto.');
        }
    } catch (error) {
        alert('No se pudo copiar al portapapeles. Selecciona y copia manualmente el texto.');
    }
}

/**
 * Limpia los resultados
 */
function clearResults() {
    document.getElementById('sqlResults').style.display = 'none';
    document.getElementById('sqlResultsOutput').textContent = '';
    document.getElementById('sqlExecutionTime').textContent = '';
    lastQueryResult = null;
}

/**
 * Abre configuración de SQL
 */
function openSqlSettings() {
    vscode.postMessage({
        command: COMMANDS.OPEN_SQL_SETTINGS
    });
}



// Event listeners para SQL Editor
document.addEventListener('DOMContentLoaded', function() {
    const sqlEditor = document.getElementById('sqlEditor');
    if (sqlEditor) {
        sqlEditor.addEventListener('input', checkSqlExecuteButton);
        
        // Cargar conexiones al inicializar
        loadSqlConnections();
        
        // Atajos de teclado
        sqlEditor.addEventListener('keydown', function(e) {
            // Ctrl+Enter para ejecutar
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                executeSqlQuery();
            }
            
            // Tab para indentación
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                
                this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + 2;
            }
        });
    }
    
    // Verificar que los botones de la toolbar estén funcionando
    const clearButton = document.querySelector('button[onclick="clearQuery()"]');
    if (clearButton) {
        // Agregar event listener adicional por si el onclick no funciona
        clearButton.addEventListener('click', function(e) {
            e.preventDefault();
            clearQuery();
        });
    }
});




 
 