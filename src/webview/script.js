const vscode = acquireVsCodeApi();

const equiposPorArea = {
    'Pasivas': ['Naranja', 'Gris', 'Celeste', 'Cobre', 'Amarillo'],
    'Activas': ['Rojo', 'Blanco', 'Violeta']
};

// Función para abrir herramientas
function openTool(toolName) {
    // Enviar mensaje para obtener la ruta desde la configuración
    vscode.postMessage({
        command: 'getToolPath',
        toolName: toolName
    });
}

function openAST() {
    vscode.postMessage({
        command: 'openAST'
    });
}

function updateEquipos() {
    const areaSelect = document.getElementById('area');
    const equipoSelect = document.getElementById('equipo');
    const tfsButton = document.getElementById('tfsButton');
    
    const selectedArea = areaSelect.value;
    
    // Limpiar opciones del select de equipo
    equipoSelect.innerHTML = '';
    
    if (selectedArea) {
        equipoSelect.disabled = false;
        
        // Agregar opcion por defecto
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Selecciona un equipo';
        equipoSelect.appendChild(defaultOption);
        
        // Agregar equipos correspondientes al area
        equiposPorArea[selectedArea].forEach(equipo => {
            const option = document.createElement('option');
            option.value = equipo;
            option.textContent = equipo;
            equipoSelect.appendChild(option);
        });
    } else {
        equipoSelect.disabled = true;
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Primero selecciona un area';
        equipoSelect.appendChild(defaultOption);
        tfsButton.disabled = true;
    }
    
    // Verificar si se puede habilitar el boton
    checkButtonStatus();
    checkSearchButtonStatus();
    checkAdvancedSearchStatus();
}

function checkButtonStatus() {
    const areaSelect = document.getElementById('area');
    const equipoSelect = document.getElementById('equipo');
    const tfsButton = document.getElementById('tfsButton');
    
    if (areaSelect.value && equipoSelect.value) {
        tfsButton.disabled = false;
    } else {
        tfsButton.disabled = true;
    }
}

function openTFSLink() {
    const area = document.getElementById('area').value;
    const equipo = document.getElementById('equipo').value;
    
    if (area && equipo) {
        const url = `http://tfs2018:8080/tfs/Accusys/${area}/Equipo%20${equipo}/_backlogs?level=Requirements&showParents=false&redirect=True&_a=backlog`;
        
        vscode.postMessage({
            command: 'openTFS',
            url: url
        });
    }
}

function checkSearchButtonStatus() {
    const areaSelect = document.getElementById('area');
    const equipoSelect = document.getElementById('equipo');
    const featureInput = document.getElementById('featureNumber');
    const searchButton = document.getElementById('searchButton');
    
    // Habilitar el boton solo si hay area, equipo y numero de feature
    if (areaSelect.value && equipoSelect.value && featureInput.value) {
        searchButton.disabled = false;
    } else {
        searchButton.disabled = true;
    }
}

function searchASTLink() {
    const area = document.getElementById('area').value;
    const equipo = document.getElementById('equipo').value;
    const feature = document.getElementById('featureNumber').value;
    
    if (area && equipo && feature) {
        const url = `http://tfs2018:8080/tfs/Accusys/${area}/Equipo%20${equipo}/_search?type=work%20item&lp=custom-Team&text=${feature}&filters=Projects%7B${area}%7D&_a=search`;
        
        vscode.postMessage({
            command: 'searchAST',
            url: url
        });
    }
}

function checkAdvancedSearchStatus() {
    const areaSelect = document.getElementById('area');
    const equipoSelect = document.getElementById('equipo');
    const searchText = document.getElementById('searchText');
    const advancedButton = document.getElementById('advancedSearchButton');
    const extSelect = document.getElementById('extSelect');
    const customExt = document.getElementById('customExt');
    
    // Verificar si se selecciono "otro" y hay extension personalizada
    let validExtension = true;
    if (extSelect.value === 'otro' && !customExt.value.trim()) {
        validExtension = false;
    }
    
    // Habilitar el boton solo si hay area, equipo, texto de busqueda y extension valida
    if (areaSelect.value && equipoSelect.value && searchText.value.trim() && validExtension) {
        advancedButton.disabled = false;
        
        // Auto-seleccionar "code" si hay mas de una palabra y no esta ya seleccionado
        const words = searchText.value.trim().split(' ');
        if (words.length > 1) {
            const codeCheckbox = document.getElementById('codeCheck');
            if (codeCheckbox && !codeCheckbox.checked) {
                codeCheckbox.checked = true;
            }
        }
    } else {
        advancedButton.disabled = true;
    }
}

function handleExtSelectChange() {
    const extSelect = document.getElementById('extSelect');
    const customExtGroup = document.getElementById('customExtGroup');
    
    if (extSelect.value === 'otro') {
        customExtGroup.style.display = 'block';
    } else {
        customExtGroup.style.display = 'none';
        document.getElementById('customExt').value = '';
    }
    
    checkAdvancedSearchStatus();
}

function advancedSearchLink() {
    const area = document.getElementById('area').value;
    const equipo = document.getElementById('equipo').value;
    const searchText = document.getElementById('searchText').value.trim();
    const extSelect = document.getElementById('extSelect').value;
    const customExt = document.getElementById('customExt').value.trim();
    const literalCheck = document.getElementById('literalCheck').checked;
    const codeCheck = document.getElementById('codeCheck').checked;
    
    if (area && equipo && searchText) {
        let searchQuery = '';
        
        // Determinar el tipo de busqueda
        // Si ambos estan seleccionados o solo literal, usar comillas
        if (literalCheck) {
            // Busqueda literal con comillas
            searchQuery = `"${searchText}"`;
        } else if (codeCheck) {
            // Busqueda code (espacios ya estan incluidos)
            searchQuery = searchText;
        } else {
            // Busqueda normal
            searchQuery = searchText;
        }
        
        // Agregar extension si esta seleccionada
        if (extSelect === 'otro' && customExt) {
            searchQuery += ` ext:${customExt}`;
        } else if (extSelect && extSelect !== 'otro') {
            searchQuery += ` ext:${extSelect}`;
        }
        
        // Codificar la consulta para URL
        const encodedQuery = encodeURIComponent(searchQuery);
        
        // Construir la URL
        const url = `http://tfs2018:8080/tfs/Accusys/${area}/Equipo%20${equipo}/_search?type=code&lp=custom-Team&text=${encodedQuery}&filters=ProjectFilters%7B${area}%7D&_a=search`;
        
        vscode.postMessage({
            command: 'searchAST',
            url: url
        });
    }
}

// Agregar listener al select de equipo cuando el DOM este listo
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('equipo').addEventListener('change', function() {
        checkButtonStatus();
        checkSearchButtonStatus();
        checkAdvancedSearchStatus();
    });
    
    // Listener para el select de area para actualizar busqueda avanzada
    document.getElementById('area').addEventListener('change', function() {
        checkAdvancedSearchStatus();
    });
});

// Manejador de mensajes del webview
window.addEventListener('message', event => {
    const message = event.data;
    
    switch (message.command) {
        case 'toolPath':
            if (message.path) {
                // Abrir la herramienta con la ruta recibida
                vscode.postMessage({
                    command: 'checkAndOpenTool',
                    path: message.path,
                    name: getToolDisplayName(message.toolName),
                    toolName: message.toolName
                });
            } else {
                // Mostrar mensaje de error si no hay ruta configurada
                vscode.postMessage({
                    command: 'showError',
                    message: `Ruta no configurada. Ve a Configuración > AccuExtension para configurar la ruta.`
                });
            }
            break;
    }
});

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
        command: 'openSettings'
    });
} 