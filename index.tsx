import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// DOM Elements
const tabPaste = document.getElementById('tab-paste')!;
const tabUpload = document.getElementById('tab-upload')!;
const panelPaste = document.getElementById('panel-paste')!;
const panelUpload = document.getElementById('panel-upload')!;
const codeInput = document.getElementById('code-input') as HTMLTextAreaElement;
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const fileNameSpan = document.getElementById('file-name')!;
const analyzeButton = document.getElementById('analyze-button') as HTMLButtonElement;
const clearButton = document.getElementById('clear-button') as HTMLButtonElement;
const resultsSection = document.getElementById('results-section')!;
const analysisOutput = document.getElementById('analysis-output')!;
const flowchartContainer = document.getElementById('flowchart-container') as HTMLDivElement;
const buttonText = analyzeButton.querySelector('.button-text') as HTMLElement;
const spinner = analyzeButton.querySelector('.spinner') as HTMLElement;

let fileContent: string | null = null;
let activeTab: 'paste' | 'upload' = 'paste';
let cy: any = null; // Cytoscape instance

function switchTab(targetTab: 'paste' | 'upload') {
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

function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            fileContent = e.target?.result as string;
            fileNameSpan.textContent = file.name;
        };
        reader.onerror = () => {
            fileNameSpan.textContent = "Error al leer el archivo.";
            fileContent = null;
        };
        reader.readAsText(file);
    }
}

function setLoading(isLoading: boolean) {
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

function renderFlowchart(flowchartData: { nodes: any[], edges: any[] }) {
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

function renderResults(data: any) {
    analysisOutput.innerHTML = ''; // Clear previous results
    
    const createSection = (title: string, items: string[], emptyMessage: string) => {
        const section = document.createElement('div');
        section.innerHTML = `<h4>${title}</h4>`;
        const list = document.createElement('ul');
        if (items && items.length > 0) {
            items.forEach((item: string) => {
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
        <p>${data.description.replace(/\n/g, '<br>')}</p>
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

function renderError(message: string) {
    analysisOutput.innerHTML = `<p style="color: #d9534f;">${message}</p>`;
    flowchartContainer.innerHTML = '';
    if (cy) {
        cy.destroy();
        cy = null;
    }
    resultsSection.style.display = 'block';
}

function handleClear() {
    codeInput.value = '';
    fileInput.value = ''; // Resets the file input
    fileNameSpan.textContent = 'Seleccionar un archivo...';
    fileContent = null;
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
                },
                required: ["nodes", "edges"]
            }
        },
        required: ["description", "inputs", "outputs", "dependencies", "flowchart"]
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
                systemInstruction: "Eres un analista de sistemas mainframe experto en COBOL, JCL y tecnologías relacionadas. Tu tarea es analizar código heredado y proporcionar documentación clara y estructurada. Genera una estructura de datos de gráfico compatible con Cytoscape.js para el diagrama de flujo. Responde únicamente con el objeto JSON que se ajusta al esquema proporcionado.",
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        renderResults(data);

    } catch (error) {
        console.error("Error during API call:", error);
        renderError("Ocurrió un error al analizar el código. Por favor, revise la consola para más detalles e inténtelo de nuevo.");
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