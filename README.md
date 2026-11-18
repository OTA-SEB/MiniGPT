# MiniGPT 🤖

MiniGPT 2.1 es una web de chat con un **modelo local mejorado** y conexión opcional a proveedores externos. Incluye **100 temas de respuesta automática**, cinco variantes en español por tema y combinaciones de 2 a 5 temas. Incluye respuestas temáticas en inglés, portugués y japonés. Funciona sin servidor.

## Abrir desde el móvil
El sitio para GitHub Pages está en la carpeta [docs/](docs/). Para publicarlo, entra a **Settings → Pages → Build and deployment → Deploy from a branch → main → /docs → Save**. Una vez publicado, estará en:
https://ota-seb.github.io/MiniGPT/

**Importante:** GitHub Free solo ofrece Pages en repositorios públicos. Los repositorios privados requieren GitHub Pro/Team/Enterprise. El sitio de Pages será público incluso cuando el repositorio sea privado (excepto configuraciones empresariales especiales). Si no aparece la opción Pages, puedes publicar docs en otro hosting o cambiar la visibilidad del repositorio si decides hacer público el código.

## Mejoras de MiniGPT 2.1

- **Interfaz adaptable:** panel lateral de inspección en PC y visor superpuesto en móvil, ajustes en tarjetas y chat cómodo en pantallas pequeñas.
- **Cerebro local entrenado:** 7.026 frases sintéticas preparadas en español, inglés, portugués y japonés (incluido romaji), con **18.351 conexiones de características** en la base del modelo de respuestas. Además conserva los 100 temas y sus propios pesos de aprendizaje. El entrenamiento sintético se genera localmente desde `docs/default-model.js`, no descarga un LLM.
- **Modo con confianza estimada:** selector 80 %, 90 % o 95 %. Cuando el clasificador encuentra una intención aprendida con confianza suficiente, MiniGPT responde mediante el motor local entrenado. De otro modo sigue el motor temático automático y la recuperación de memoria. **Ese porcentaje NO es una probabilidad estadística validada**, solo un indicador heurístico de similitud.
- **Visor local:** botón **🔎 Memoria**, pestañas *Memoria* y *Pesos*, búsqueda de recuerdos y características, historial reciente y conexiones entrenadas.
- **Idiomas:** pruebas funcionales con «Hola, cómo estás en el día de hoy», «Hello, how are you today?», «Oi, como você está hoje?», «こんにちは、今日は元気ですか？» y «konnichiwa kyou wa genki desu ka».
- **Privacidad:** los mensajes y pesos personalizados permanecen en tu navegador a menos que actives voluntariamente una API externa. El visor no publica información en el repositorio. La importación de pesos v1 y v2 sigue admitida.

### Enlaces para descargar modelos reales

Estos modelos **no se ejecutan automáticamente dentro de la web de MiniGPT**; los enlaces sirven para explorar y descargar archivos para herramientas compatibles.

- [Qwen2.5-0.5B-Instruct — Hugging Face](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
- [Qwen2.5-0.5B-Instruct — GGUF](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF)
- [SmolLM2-135M-Instruct — Hugging Face](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
- [Qwen2.5 0.5B — Ollama](https://ollama.com/library/qwen2.5:0.5b)

## Usar el cerebro real
1. Toca **🧠 Cerebro**.
2. Elige OpenRouter, OpenAI o Gemini y un modelo disponible para tu cuenta.
3. Pega tu API key en el campo. No hay que editar archivos ni salir de la web.
4. Si la clave falta, el proveedor falla o el navegador bloquea CORS, MiniGPT usa sus respuestas automáticas. Para temas desconocidos, el mini modelo local prueba primero lo que ha aprendido de conversaciones previas; si no tiene información suficiente, responde "No puedo responder ahora mismo".

OpenRouter utiliza por defecto el modelo `openrouter/free`, sujeto a los límites del proveedor. Otros proveedores pueden cobrar por uso.

### Seguridad
La clave **no se guarda en GitHub ni en localStorage** y solo vive durante la sesión actual. La web la envía directamente al proveedor elegido. **Una API key usada en un navegador puede quedar expuesta**, incluso si la ocultas visualmente; conviene usar una clave con límites de gasto y no compartirla. No pegues ninguna clave en el código del repositorio.

## Idiomas automáticos 🌐
MiniGPT 2.1 detecta el idioma de la conversación entre **español, inglés, portugués y japonés**, sin menú ni preguntas. Puede detectar varios temas incluso si aparecen en idiomas diferentes, como `Hola, chess と 猫`; combina respuestas por idioma y tema. En el modo automático, cada tema tiene cinco respuestas originales en español y mensajes localizados con cinco variantes localizadas en los otros tres idiomas. El detector es ligero y puede equivocarse con textos muy cortos o ambiguos.

En el modo con API, MiniGPT pide al proveedor que responda en el idioma predominante o conserve una mezcla natural cuando detecta varios. Ese comportamiento depende también del modelo externo.

La detección reconoce un vocabulario básico de **romaji** (`konnichiwa`, `neko`, `mizu`, `nihongo`, `arigatou`, etc.) y lo vincula a hiragana/katakana cuando es posible. No es un traductor universal. El aprendizaje local guarda los ejemplos con su idioma para no recuperar por accidente una respuesta en otro idioma. **No traduce cualquier texto ni aprende gramática general por sí solo**: el modo sin API usa un diccionario temático y un pequeño modelo de asociaciones.

## Aprendizaje local
El clasificador de intenciones entrenado se encuentra en `docs/default-model.js`. El mini modelo estadístico inicializa **pesos predeterminados** para los 100 temas y aprende automáticamente asociaciones y respuestas útiles de cada conversación. Recupera el historial reciente entre sesiones, detecta algunas afirmaciones expresas del usuario (por ejemplo, `me gusta el anime` o `konnichiwa significa hola`) y puede responder preguntas sobre ellas. Guarda sus pesos en **minigpt-pesos.json** dentro del almacenamiento privado del navegador (OPFS, si está disponible), con respaldo en almacenamiento local. Puedes **exportar** e **importar** ese archivo desde 🧠 Cerebro. Se conserva entre sesiones en el mismo navegador, pero puede perderse si borras los datos del sitio; exporta una copia si quieres conservarlo. **Importar pesos v1** agrega lo aprendido sin borrar las asociaciones iniciales; el archivo nuevo usa `version: 2`. El botón **↻** borra la conversación visible y su historial guardado; **🗑️ Borrar recuerdos y aprendizaje** borra el aprendizaje y la memoria personal, manteniendo el vocabulario inicial.

**Límites:** este motor de asociaciones, memoria y recuperación contextual **no es una réplica de Qwen ni usa sus pesos**. Qwen2.5 de 0,5B tiene cientos de millones de parámetros y sus pesos entrenados no se pueden reconstruir con unas reglas. Sin un modelo descargado o un servidor, GitHub Pages no puede ejecutar Ollama. MiniGPT tampoco entrena un gran modelo generativo desde cero ni aprende automáticamente hechos verificados. Si se configura una API externa, las respuestas de esa API se usan como ejemplos locales. No sube las conversaciones ni los pesos al repositorio.

## Archivos
- `docs/index.html`: interfaz móvil.
- `docs/app.js`: conexión a modelo real y modo de emergencia.
- `docs/fallback.js`: cien conversaciones temáticas, cinco respuestas por tema y combinaciones.
- `docs/learning.js`: mini modelo local, pesos iniciales, asociaciones, recuerdos, historial, inspección y exportación/importación v1/v2.
- `docs/default-model.js`: entrenamiento sintético multilingüe inicial, pesos del modelo de respuestas y confianza estimada.
- `docs/i18n.js`: detección de idiomas, diccionario multilingüe, mezclas y conversión romaji → kana.
- `docs/personality.js`: personalidad y referencias creativas (el chiste de los panes, "ax", anime, videojuegos y Broken Threads).
- `docs/style.css`: estilos.

No almacenes información privada en los archivos del sitio. MiniGPT es un experimento creativo, no una IA entrenada desde cero.