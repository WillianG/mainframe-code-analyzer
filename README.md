# Analizador de Código Mainframe

## 1. Descripción Funcional

Esta aplicación web es una herramienta diseñada para ayudar a los desarrolladores y analistas de sistemas a comprender y documentar código mainframe heredado (como COBOL, JCL, etc.). El objetivo es modernizar el proceso de análisis de software, haciéndolo más rápido, visual e intuitivo.

### Funcionalidades Principales

- **Entrada de Código Flexible**: El usuario puede pegar el código directamente en un área de texto o subir un archivo plano desde su equipo.
- **Análisis Inteligente con IA**: Utiliza la API de Google Gemini para "leer" y comprender el código proporcionado.
- **Documentación Textual Automática**: Genera un resumen claro que incluye:
    - **Descripción Funcional**: Explica en lenguaje natural qué hace el programa.
    - **Entradas y Salidas**: Identifica los archivos o fuentes de datos que el programa utiliza y genera.
    - **Dependencias**: Lista los subprogramas, copybooks o procedimientos de los que depende el código.
- **Visualización de Flujo de Proceso**: Crea un diagrama de flujo interactivo (usando Cytoscape.js) que representa la lógica del programa, permitiendo al usuario explorar visualmente el flujo de ejecución.

## 2. Diagrama de Arquitectura

La aplicación sigue una arquitectura de cliente ligero, donde el frontend se encarga de toda la lógica de la interfaz y la comunicación directa con la API de Google Gemini. No se requiere un backend personalizado, lo que simplifica el despliegue y el mantenimiento.

```mermaid
graph TD
    A[Usuario] --> B{Frontend (Browser)};
    B -- "1. Ingresa código" --> C[index.tsx];
    C -- "2. Prepara y envía petición" --> D[Google Gemini API];
    D -- "3. Analiza código y genera JSON" --> C;
    C -- "4. Renderiza resultados" --> E[Análisis Textual (HTML)];
    C -- "5. Renderiza diagrama" --> F[Diagrama de Flujo (Cytoscape.js)];
    E --> B;
    F --> B;
```

**Flujo de Datos:**
1.  El usuario introduce el código en la interfaz web.
2.  El script `index.tsx` captura la entrada y la envía a la API de Gemini, junto con una instrucción detallada y un esquema de respuesta JSON.
3.  La API de Gemini procesa el código y devuelve la información analizada en el formato JSON solicitado.
4.  `index.tsx` recibe la respuesta JSON.
5.  Los datos textuales se renderizan en la sección de resultados.
6.  Los datos del diagrama se utilizan para generar un gráfico interactivo con la librería Cytoscape.js.

## 3. Componentes de la Aplicación

El proyecto está estructurado en los siguientes archivos principales:

-   `index.html`:
    -   **Propósito**: Define la estructura principal de la página web.
    -   **Contenido**: Incluye el encabezado, las pestañas para la entrada de código, el botón de análisis y los contenedores donde se mostrarán los resultados. También importa las librerías externas necesarias como Cytoscape.js y los estilos CSS.

-   `index.css`:
    -   **Propósito**: Proporciona los estilos visuales para todos los elementos de la interfaz.
    -   **Estilo**: Implementa un tema oscuro, moderno y profesional, asegurando que la aplicación sea responsiva y legible. Define la apariencia de las tarjetas, botones, área de texto y el contenedor del diagrama.

-   `index.tsx`:
    -   **Propósito**: Es el cerebro de la aplicación. Contiene toda la lógica de cliente.
    -   **Funciones Clave**:
        -   **Inicialización**: Configura el cliente de la API de Google GenAI.
        -   **Manejo de UI**: Controla el cambio entre pestañas (pegar vs. subir archivo) y la lectura del archivo subido.
        -   **Llamada a la API (`handleAnalyze`)**: Construye la petición a la API de Gemini, incluyendo la instrucción del sistema (le pide a la IA que actúe como un experto en mainframe) y el `responseSchema` que fuerza una salida JSON estructurada y predecible.
        -   **Renderizado de Resultados**: Procesa la respuesta JSON de la API y la muestra en el DOM. `renderResults` actualiza el texto y `renderFlowchart` dibuja el diagrama usando Cytoscape.js.
        -   **Manejo de Errores**: Captura y muestra errores de la API de forma clara para el usuario.

-   `README.md`:
    -   **Propósito**: Este archivo. Proporciona la documentación completa del proyecto para facilitar su comprensión y mantenimiento futuro.

-   `metadata.json`:
    -   **Propósito**: Contiene metadatos de la aplicación, como su nombre y descripción, que pueden ser utilizados por la plataforma de despliegue.

## 4. Stack Tecnológico

La aplicación está construida con un conjunto de tecnologías modernas de frontend, enfocadas en la eficiencia y la interactividad.

| Tecnología | Versión/Estándar | Propósito |
| :--- | :--- | :--- |
| **@google/genai** | `^1.10.0` | SDK oficial para interactuar con la API de Google Gemini. |
| **Cytoscape.js** | `3.28.1` | Librería para la visualización de grafos interactivos. |
| **TypeScript** | `~5.x` (implícito) | Lenguaje principal para la lógica de la aplicación. |
| **HTML5** | Estándar web | Estructura y semántica del contenido. |
| **CSS3** | Estándar web | Estilo y diseño visual de la aplicación. |
| **ESM via importmap**| Estándar web | Gestión de módulos de JavaScript directamente en el navegador. |

## 5. Historial de Versiones y Tecnologías

Este historial documenta las decisiones tecnológicas clave tomadas durante el desarrollo.

-   **v1.0 - Implementación Inicial**
    -   **Diagramas:** Se utilizó `Mermaid.js` para la generación inicial de diagramas de flujo.
    -   **Lógica:** Se estableció la arquitectura base de cliente ligero con comunicación directa a la API de Gemini.

-   **v1.1 - Mejora Visual del Diagrama (Versión Actual)**
    -   **Cambio Tecnológico:** Se reemplazó `Mermaid.js` por **`Cytoscape.js v3.28.1`**.
    -   **Motivo:** La necesidad de diagramas más interactivos (zoom, paneo) y un mayor control sobre el estilo visual de los nodos y conexiones para representar mejor la lógica del programa.
    -   **Impacto:** Se actualizó la petición a la API de Gemini (`responseSchema`) para solicitar una estructura de datos JSON compatible con Cytoscape, mejorando significativamente la experiencia del usuario al analizar los flujos.

## 6. Mantenimiento y Extensibilidad

Para mantener o extender la aplicación, considere los siguientes puntos:

-   **Modificar el Análisis de la IA**: Para cambiar qué información se extrae o cómo se interpreta, debe ajustar el `systemInstruction` y el `responseSchema` dentro de la función `handleAnalyze` en `index.tsx`.
-   **Cambiar el Estilo del Diagrama**: La apariencia del diagrama de flujo (colores, formas, fuentes) se define en el objeto de estilo dentro de la función `renderFlowchart` en `index.tsx`. Puede modificar los selectores de Cytoscape.js para ajustar el diseño.
-   **Actualizar Dependencias**: La aplicación utiliza dependencias externas como `@google/genai` y `cytoscape`. Se pueden actualizar sus versiones en `index.html`.
