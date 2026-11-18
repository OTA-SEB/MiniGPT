# MiniGPT 🤖

MiniGPT 2.0 es una web de chat con un **modelo local mejorado** y conexión opcional a proveedores externos. Incluye **100 temas de respuesta automática**, cinco variantes en español por tema y combinaciones de 2 a 5 temas. Incluye respuestas temáticas en inglés, portugués y japonés. Funciona sin servidor.

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

## Idiomas automáticos 🌐
MiniGPT 2.0 detecta el idioma de la conversación entre **español, inglés, portugués y japonés**, sin menú ni preguntas. Puede detectar varios temas incluso si aparecen en idiomas diferentes, como `Hola, chess と 猫`; combina respuestas por idioma y tema. En el modo automático, cada tema tiene cinco respuestas originales en español y mensajes localizados con cinco variantes localizadas en los otros tres idiomas. El detector es ligero y puede equivocarse con textos muy cortos o ambiguos.

En el modo con API, MiniGPT pide al proveedor que responda en el idioma predominante o conserve una mezcla natural cuando detecta varios. Ese comportamiento depende también del modelo externo.

La detección reconoce un vocabulario básico de **romaji** (`konnichiwa`, `neko`, `mizu`, `nihongo`, `arigatou`, etc.) y lo vincula a hiragana/katakana cuando es posible. No es un traductor universal. El aprendizaje local guarda los ejemplos con su idioma para no recuperar por accidente una respuesta en otro idioma. **No traduce cualquier texto ni aprende gramática general por sí solo**: el modo sin API usa un diccionario temático y un pequeño modelo de asociaciones.

## Aprendizaje local
El mini modelo estadístico inicializa **pesos predeterminados** para los 100 temas y aprende automáticamente asociaciones y respuestas útiles de cada conversación. Recupera el historial reciente entre sesiones, detecta algunas afirmaciones expresas del usuario (por ejemplo, `me gusta el anime` o `konnichiwa significa hola`) y puede responder preguntas sobre ellas. Guarda sus pesos en **minigpt-pesos.json** dentro del almacenamiento privado del navegador (OPFS, si está disponible), con respaldo en almacenamiento local. Puedes **exportar** e **importar** ese archivo desde 🧠 Cerebro. Se conserva entre sesiones en el mismo navegador, pero puede perderse si borras los datos del sitio; exporta una copia si quieres conservarlo. **Importar pesos v1** agrega lo aprendido sin borrar las asociaciones iniciales; el archivo nuevo usa `version: 2`. El botón **↻** borra la conversación visible y su historial guardado; **🗑️ Borrar recuerdos y aprendizaje** borra el aprendizaje y la memoria personal, manteniendo el vocabulario inicial.

**Límites:** este motor de asociaciones, memoria y recuperación contextual **no es una réplica de Qwen ni usa sus pesos**. Qwen2.5 de 0,5B tiene cientos de millones de parámetros y sus pesos entrenados no se pueden reconstruir con unas reglas. Sin un modelo descargado o un servidor, GitHub Pages no puede ejecutar Ollama. MiniGPT tampoco entrena un gran modelo generativo desde cero ni aprende automáticamente hechos verificados. Si se configura una API externa, las respuestas de esa API se usan como ejemplos locales. No sube las conversaciones ni los pesos al repositorio.

## Archivos
- `docs/index.html`: interfaz móvil.
- `docs/app.js`: conexión a modelo real y modo de emergencia.
- `docs/fallback.js`: cien conversaciones temáticas, cinco respuestas por tema y combinaciones.
- `docs/learning.js`: mini modelo local, pesos iniciales, asociaciones, recuerdos, historial y exportación/importación v1/v2.
- `docs/i18n.js`: detección de idiomas, diccionario multilingüe, mezclas y conversión romaji → kana.
- `docs/personality.js`: personalidad y referencias creativas (el chiste de los panes, "ax", anime, videojuegos y Broken Threads).
- `docs/style.css`: estilos.

No almacenes información privada en los archivos del sitio. MiniGPT es un experimento creativo, no una IA entrenada desde cero.