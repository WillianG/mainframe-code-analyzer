import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// DOM Elements
const tabPaste = document.getElementById('tab-paste');
const tabUpload = document.getElementById('tab-upload');
const panelPaste = document.getElementById('panel-paste');
const panelUpload = document.getElementById('panel-upload');
const codeInput = document.getElementById('code-input');
const fileInput = document.getElementById('file-input');
const fileNameSpan = document.getElementById('file-name');
const analyzeButton = document.getElementById('analyze-button');
const clearButton = document.getElementById('clear-button');
const resultsSection = document.getElementById('results-section');
const analysisOutput = document.getElementById('analysis-output');
const flowchartContainer = document.getElementById('flowchart-container');
const buttonText = analyzeButton.querySelector('.button-text');
const spinner = analyzeButton.querySelector('.spinner');

let fileContent = null;
let activeTab = 'paste';
let cy = null; // Cytoscape instance

function switchTab(targetTab) {
    activeTab = targetTab;
    if (targetTab === 'paste') {
        tabPaste.classList.add('active');
        tabPaste.setAttribute('aria-selected', 'true');
        panelPaste.classList.add('active');

        tabUpload.classList.remove('active');
        tabUpload.setAttribute('aria-selected', 'false');
        panelUpload.classList.remove('active');
    } else {
        tabUpload.classList.add('active');
        tabUpload.setAttribute('aria-selected', 'true');
        panelUpload.classList.add('active');
        
        tabPaste.classList.remove('active');
        tabPaste.setAttribute('aria-selected', 'false');
        panelPaste.classList.remove('active');
    }
}

function handleFileSelect(event) {
    const target = event.target;
    const file = target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            fileContent = e.target?.result;
            fileNameSpan.textContent = file.name;
        };
        reader.onerror = () => {
            fileNameSpan.textContent = "Error al leer el archivo.";
            fileContent = null;
        };
        reader.readAsText(file);
    }
}

function setLoading(isLoading) {
    if (isLoading) {
        analyzeButton.disabled = true;
        clearButton.disabled = true;
        buttonText.style.display = 'none';
        spinner.style.display = 'block';
    } else {
        analyzeButton.disabled = false;
        clearButton.disabled = false;
        buttonText.style.display = 'inline';
        spinner.style.display = 'none';
    }
}

function renderFlowchart(flowchartData) {
    if (cy) {
        cy.destroy();
    }

    const elements = [
        ...flowchartData.nodes.map(node => ({ data: node })),
        ...flowchartData.edges.map(edge => ({ data: edge }))
    ];

    // @ts-ignore
    cy = cytoscape({
        container: flowchartContainer,
        elements: elements,
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#BDE0FE', // Pastel Blue
                    'border-color': '#A2A2A2',
                    'border-width': 1,
                    'label': 'data(label)',
                    'color': '#333',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '10px',
                    'text-wrap': 'wrap',
                    'text-max-width': '80px',
                    'width': '90px',
                    'height': '60px',
                    'shape': 'round-rectangle'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#A2A2A2',
                    'target-arrow-color': '#A2A2A2',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'label': 'data(label)',
                    'color': '#555',
                    'font-size': '9px',
                    'text-rotation': 'autorotate'
                }
            },
            {
                selector: 'node[type="start"]',
                style: { 'background-color': '#C1E1C1' } // Pastel Green
            },
            {
                selector: 'node[type="end"]',
                style: { 'background-color': '#FFB6C1' } // Pastel Red/Pink
            },
            {
                selector: 'node[type="decision"]',
                style: { 'background-color': '#FFFACD', 'shape': 'diamond' } // Pastel Yellow
            },
            {
                selector: 'node[type="io"]',
                style: { 'background-color': '#D8BFD8', 'shape': 'parallelogram' } // Pastel Purple
            }
        ],
        layout: {
            name: 'breadthfirst',
            directed: true,
            padding: 30,
            spacingFactor: 1.1,
            fit: true,
        }
    });

    cy.maxZoom(2);
    cy.minZoom(0.5);
}

function renderResults(data) {
    analysisOutput.innerHTML = ''; // Clear previous results
    
    const createSection = (title, items, emptyMessage) => {
        const section = document.createElement('div');
        section.innerHTML = `<h4>${title}</h4>`;
        const list = document.createElement('ul');
        if (items && items.length > 0) {
            items.forEach((item) => {
                const li = document.createElement('li');
                li.textContent = item;
                list.appendChild(li);
            });
        } else {
            list.innerHTML = `<li>${emptyMessage}</li>`;
        }
        section.appendChild(list);
        analysisOutput.appendChild(section);
    };

    // Description
    const descriptionSection = document.createElement('div');
    descriptionSection.innerHTML = `
        <h4>Descripción Funcional</h4>
        <p>${data.description?.replace(/\n/g, '<br>') || 'No se proporcionó descripción.'}</p>
    `;
    analysisOutput.appendChild(descriptionSection);

    // Inputs, Outputs, Dependencies
    createSection('Entradas', data.inputs, 'No se identificaron entradas específicas.');
    createSection('Salidas', data.outputs, 'No se identificaron salidas específicas.');
    createSection('Dependencias', data.dependencies, 'No se identificaron dependencias.');

    // Flowchart
    if (data.flowchart && data.flowchart.nodes && data.flowchart.edges) {
        renderFlowchart(data.flowchart);
    } else {
        flowchartContainer.innerHTML = '<p>No se pudo generar el diagrama de flujo.</p>';
    }

    resultsSection.style.display = 'block';
}

function renderError(message) {
    analysisOutput.innerHTML = `<p style="color: #d9534f;">${message}</p>`;
    flowchartContainer.innerHTML = '';
    if (cy) {
        cy.destroy();
        cy = null;
    }
    resultsSection.style.display = 'block';
}

function clearInputs() {
    codeInput.value = '';
    fileInput.value = ''; // Resets the file input
    fileNameSpan.textContent = 'Seleccionar un archivo...';
    fileContent = null;
}

function handleClear() {
    clearInputs();
    resultsSection.style.display = 'none';
    analysisOutput.innerHTML = '';
    flowchartContainer.innerHTML = '';
    if (cy) {
        cy.destroy();
        cy = null;
    }
}

async function handleAnalyze() {
    const code = activeTab === 'paste' ? codeInput.value : fileContent;

    if (!code || code.trim() === '') {
        alert('Por favor, pegue código o suba un archivo para analizar.');
        return;
    }

    setLoading(true);
    resultsSection.style.display = 'none';
    analysisOutput.innerHTML = '';
    flowchartContainer.innerHTML = '';
     if (cy) {
        cy.destroy();
        cy = null;
    }

    const systemInstruction = `Eres un analista de sistemas mainframe experto, con profundo conocimiento de múltiples versiones de COBOL (incluyendo COBOL-85 y Enterprise COBOL) y dialectos de JCL (incluyendo z/OS JCL). Tu tarea es analizar código heredado y proporcionar documentación clara.
**Si puedes analizar el código con éxito**: Rellena las propiedades 'description', 'inputs', 'outputs', 'dependencies' y 'flowchart'.
**Si NO puedes analizar el código** (debido a sintaxis irreconocible, código incompleto o cualquier otro error): Deja los demás campos vacíos o nulos y rellena **únicamente** el campo 'error' con una explicación detallada y útil del problema que encontraste.
Responde únicamente con el objeto JSON que se ajusta al esquema proporcionado.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            description: { type: Type.STRING, description: "Un resumen de alto nivel del propósito del programa." },
            inputs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de todos los archivos de entrada o fuentes de datos." },
            outputs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de todos los archivos de salida o informes." },
            dependencies: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de cualquier copybooks, subprogramas o procedimientos JCL de los que depende." },
            flowchart: {
                type: Type.OBJECT,
                description: "Una estructura de datos de gráfico compatible con Cytoscape.js que representa el flujo del programa. Debe contener 'nodes' y 'edges'.",
                properties: {
                    nodes: {
                        type: Type.ARRAY,
                        description: "Una lista de nodos en el gráfico.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING, description: "ID único para el nodo." },
                                label: { type: Type.STRING, description: "El texto que se mostrará en el nodo. Mantenlo conciso." },
                                type: { type: Type.STRING, description: "El tipo de nodo para darle estilo: 'start', 'end', 'process', 'decision', o 'io'." }
                            },
                            required: ["id", "label", "type"]
                        }
                    },
                    edges: {
                        type: Type.ARRAY,
                        description: "Una lista de bordes que conectan los nodos.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                source: { type: Type.STRING, description: "El ID del nodo de origen." },
                                target: { type: Type.STRING, description: "El ID del nodo de destino." },
                                label: { type: Type.STRING, description: "Etiqueta opcional para el borde (ej: 'Sí'/'No' para una decisión)." }
                            },
                            required: ["source", "target"]
                        }
                    }
                }
            },
            error: { type: Type.STRING, description: "Si el análisis falla, describe el problema aquí." }
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: "Analiza el siguiente código mainframe:" },
                    { text: code }
                ]
            },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);

        if (data.error) {
            renderError(`Análisis fallido: ${data.error}`);
            clearInputs();
            return;
        }

        if (!data.description && (!data.flowchart || !data.flowchart.nodes || data.flowchart.nodes.length === 0)) {
            renderError("El modelo no pudo generar un análisis para el código proporcionado. Intente con un fragmento de código diferente o más completo.");
            clearInputs();
            return;
        }

        renderResults(data);

    } catch (error) {
        console.error("Error during API call:", error);
        let errorMessage = "Ocurrió un error inesperado al contactar el servicio de análisis. ";
        if (error instanceof Error) {
            errorMessage += `Detalles: ${error.message}`;
        }
        errorMessage += " Por favor, revise la consola para más detalles e inténtelo de nuevo más tarde.";
        renderError(errorMessage);
    } finally {
        setLoading(false);
    }
}

function init() {
    // Event listeners
    tabPaste.addEventListener('click', () => switchTab('paste'));
    tabUpload.addEventListener('click', () => switchTab('upload'));
    fileInput.addEventListener('change', handleFileSelect);
    analyzeButton.addEventListener('click', handleAnalyze);
    clearButton.addEventListener('click', handleClear);
}

init();
