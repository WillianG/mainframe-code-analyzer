# Analizador de Código Mainframe

## 1. Descripción Funcional

Esta aplicación web es una herramienta diseñada para ayudar a los desarrolladores y analistas de sistemas a comprender y documentar código mainframe heredado (como COBOL, JCL, etc.). El objetivo es modernizar el proceso de análisis de software, haciéndolo más rápido, visual e intuitivo.

### Funcionalidades Principales

- **Entrada de Código Flexible**: El usuario puede pegar el código directamente en un área de texto o subir un archivo plano desde su equipo.
- **Análisis Inteligente con IA**: Utiliza la API de Google Gemini para "leer" y comprender el código proporcionado, con soporte para múltiples versiones de COBOL (ej. COBOL-85, Enterprise COBOL) y JCL (ej. z/OS JCL).
- **Documentación Textual Automática**: Genera un resumen claro que incluye:
    - **Descripción Funcional**: Explica en lenguaje natural qué hace el programa.
    - **Entradas y Salidas**: Identifica los archivos o fuentes de datos que el programa utiliza y genera.
    - **Dependencias**: Lista los subprogramas, copybooks o procedimientos de los que depende el código.
- **Visualización de Flujo de Proceso**: Crea un diagrama de flujo interactivo (usando Cytoscape.js) que representa la lógica del programa.
- **Manejo de Errores Inteligente**: Si el código no puede ser analizado (por errores de sintaxis, etc.), la herramienta informa al usuario con un mensaje detallado sobre el problema específico y limpia el área de entrada para un nuevo intento.

## 2. Diagrama de Arquitectura

La aplicación sigue una arquitectura de cliente ligero, donde el frontend se encarga de toda la lógica de la interfaz y la comunicación directa con la API de Google Gemini.

```mermaid
graph TD
    A[Usuario] --> B{Frontend (Browser)};
    B -- "1. Ingresa código" --> C[index.js];
    C -- "2. Prepara y envía petición" --> D[Google Gemini API];
    subgraph "Respuesta de la API"
        D -- "Análisis Exitoso" --> D1[JSON con Documentación]
        D -- "Análisis Fallido" --> D2[JSON con Mensaje de Error]
    end
    D1 --> C;
    D2 --> C;
    C -- "4a. Renderiza resultados" --> E[Análisis Textual y Diagrama];
    C -- "4b. Muestra error y limpia input" --> F[Mensaje de Error en UI];
    E --> B;
    F --> B;
```

**Flujo de Datos:**
1.  El usuario introduce el código.
2.  `index.js` envía la entrada a la API de Gemini con un esquema de respuesta que puede contener los datos del análisis o un mensaje de error.
3.  La API de Gemini procesa el código. Si tiene éxito, devuelve un JSON con la documentación. Si falla, devuelve un JSON con el motivo del error.
4.  `index.js` recibe la respuesta. Si es exitosa, renderiza la documentación y el diagrama. Si es un error, lo muestra en la UI y limpia el campo de entrada.

## 3. Componentes de la Aplicación

-   `index.html`: Define la estructura de la página. Incluye un layout de rejilla (`.results-grid`) en la sección de resultados para un diseño responsive.
-   `index.css`: Proporciona los estilos visuales con un enfoque "mobile-first", asegurando que la aplicación sea responsive en móviles, tablets y PCs.
-   `index.js`: Contiene toda la lógica de la aplicación, incluyendo el manejo de la UI, la llamada a la API de Gemini, el renderizado de resultados y el nuevo manejo de errores.
-   `README.md`: Este archivo.
-   `metadata.json`: Metadatos de la aplicación.

## 4. Stack Tecnológico

| Tecnología | Versión/Estándar | Propósito |
| :--- | :--- | :--- |
| **@google/genai** | `^1.10.0` | SDK para interactuar con la API de Google Gemini. |
| **Cytoscape.js** | `3.28.1` | Librería para la visualización de grafos interactivos. |
| **JavaScript (ES6)** | Estándar web | Lógica de la aplicación. |
| **HTML5 / CSS3** | Estándar web | Estructura y diseño de la aplicación. |

## 5. Historial de Versiones y Tecnologías

-   **v1.0 - Implementación Inicial**: Uso de `Mermaid.js` para diagramas.
-   **v1.1 - Mejora Visual del Diagrama**: Reemplazo de `Mermaid.js` por `Cytoscape.js` para mayor interactividad.
-   **v1.2 - Robustez y Manejo de Errores**:
    -   **Mejora de la IA**: Se actualizó la instrucción a la IA para soportar más dialectos de COBOL/JCL.
    -   **Manejo de Errores**: Se implementó un schema de respuesta flexible que permite a la IA devolver un error detallado.
-   **v1.3 - Diseño Responsive (Versión Actual)**:
    -   **CSS Mobile-First**: Se rediseñaron los estilos para garantizar una experiencia óptima en móviles.
    -   **Layout Adaptativo**: Se implementó un CSS Grid para que la sección de resultados se ajuste de 1 a 2 columnas según el ancho de la pantalla.

## 6. Mantenimiento y Extensibilidad

-   **Modificar el Análisis de la IA**: Ajuste el `systemInstruction` y el `responseSchema` en `index.js` para cambiar qué información se extrae.
-   **Cambiar el Estilo del Diagrama**: Modifique el objeto de estilo en la función `renderFlowchart` en `index.js`.

## 7. Despliegue (GitHub Pages)

Esta aplicación está diseñada para ser desplegada fácilmente como un sitio estático usando GitHub Pages.

1.  **Ve a tu Repositorio**: Abre la página principal de tu repositorio en GitHub.
2.  **Abre los Ajustes**: Haz clic en la pestaña de **"Settings"**.
3.  **Selecciona "Pages"**: En el menú lateral izquierdo, haz clic en **"Pages"**.
4.  **Configura la Fuente**:
    -   Bajo "Source", selecciona **"Deploy from a branch"**.
    -   Asegúrate de que la rama (`Branch`) esté configurada como `main`.
    -   Deja la carpeta como `/(root)` y haz clic en **"Save"**.
5.  **Espera la Publicación**: GitHub tardará unos minutos en desplegar tu sitio. La URL pública aparecerá en la misma página.