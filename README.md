# MiniGPT 🤖

MiniGPT es una web de chat con un cerebro opcional de IA y **100 temas de respuesta automática**, cuatro variantes por tema y combinaciones de 2 a 5 temas. Funciona sin servidor.

## Abrir desde el móvil
El sitio para GitHub Pages está en la carpeta [docs/](docs/). Para publicarlo, entra a **Settings → Pages → Build and deployment → Deploy from a branch → main → /docs → Save**. Una vez publicado, estará en:
https://ota-seb.github.io/MiniGPT/

**Importante:** GitHub Free solo ofrece Pages en repositorios públicos. Los repositorios privados requieren GitHub Pro/Team/Enterprise. El sitio de Pages será público incluso cuando el repositorio sea privado (excepto configuraciones empresariales especiales). Si no aparece la opción Pages, puedes publicar docs en otro hosting o cambiar la visibilidad del repositorio si decides hacer público el código.

## Usar el cerebro real
1. Toca **🧠 Cerebro**.
2. Elige OpenRouter, OpenAI o Gemini y un modelo disponible para tu cuenta.
3. Pega tu API key en el campo. No hay que editar archivos ni salir de la web.
4. Si la clave falta, el proveedor falla o el navegador bloquea CORS, MiniGPT usa sus respuestas automáticas. Para temas desconocidos, el mini modelo local prueba primero lo que ha aprendido de conversaciones previas; si no tiene información suficiente, responde "No puedo responder ahora mismo".

OpenRouter utiliza por defecto el modelo `openrouter/free`, sujeto a los límites del proveedor. Otros proveedores pueden cobrar por uso.

### Seguridad
La clave **no se guarda en GitHub ni en localStorage** y solo vive durante la sesión actual. La web la envía directamente al proveedor elegido. **Una API key usada en un navegador puede quedar expuesta**, incluso si la ocultas visualmente; conviene usar una clave con límites de gasto y no compartirla. No pegues ninguna clave en el código del repositorio.

## Aprendizaje local
El mini modelo estadístico aprende automáticamente asociaciones y respuestas de cada conversación. Guarda sus pesos en **minigpt-pesos.json** dentro del almacenamiento privado del navegador (OPFS, si está disponible), con respaldo en almacenamiento local. Puedes **exportar** e **importar** ese archivo desde 🧠 Cerebro. Se conserva entre sesiones en el mismo navegador, pero puede perderse si borras los datos del sitio; exporta una copia si quieres conservarlo.

**Límites:** el aprendizaje local ajusta pesos de temas y recuerda respuestas, pero no entrena un gran modelo de lenguaje desde cero ni aprende automáticamente hechos verificados. Si se configura una API externa, las respuestas de esa API se usan como ejemplos locales. No sube las conversaciones ni los pesos al repositorio.

## Archivos
- `docs/index.html`: interfaz móvil.
- `docs/app.js`: conexión a modelo real y modo de emergencia.
- `docs/fallback.js`: cien conversaciones temáticas, cuatro respuestas por tema y combinaciones.
- `docs/learning.js`: mini modelo autoentrenable, pesos persistentes y exportación/importación.
- `docs/personality.js`: personalidad y referencias creativas (el chiste de los panes, "ax", anime, videojuegos y Broken Threads).
- `docs/style.css`: estilos.

No almacenes información privada en los archivos del sitio. MiniGPT es un experimento creativo, no una IA entrenada desde cero.