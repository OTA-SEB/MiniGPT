# MiniGPT 🤖

MiniGPT es una web de chat con un cerebro opcional de IA y **más de 70 temas de respuesta automática** con tres variantes y fusiones. Funciona sin servidor.

## Abrir desde el móvil
El sitio para GitHub Pages está en la carpeta [docs/](docs/). Para publicarlo, entra a **Settings → Pages → Build and deployment → Deploy from a branch → main → /docs → Save**. Una vez publicado, estará en:
https://ota-seb.github.io/MiniGPT/

**Importante:** GitHub Free solo ofrece Pages en repositorios públicos. Los repositorios privados requieren GitHub Pro/Team/Enterprise. El sitio de Pages será público incluso cuando el repositorio sea privado (excepto configuraciones empresariales especiales). Si no aparece la opción Pages, puedes publicar docs en otro hosting o cambiar la visibilidad del repositorio si decides hacer público el código.

## Usar el cerebro real
1. Toca **🧠 Cerebro**.
2. Elige OpenRouter, OpenAI o Gemini y un modelo disponible para tu cuenta.
3. Pega tu API key en el campo. No hay que editar archivos ni salir de la web.
4. Si la clave falta, el proveedor falla o el navegador bloquea CORS, MiniGPT usa sus respuestas automáticas. Para temas desconocidos: "No puedo responder ahora mismo".

OpenRouter utiliza por defecto el modelo `openrouter/free`, sujeto a los límites del proveedor. Otros proveedores pueden cobrar por uso.

### Seguridad
La clave **no se guarda en GitHub ni en localStorage** y solo vive durante la sesión actual. La web la envía directamente al proveedor elegido. **Una API key usada en un navegador puede quedar expuesta**, incluso si la ocultas visualmente; conviene usar una clave con límites de gasto y no compartirla. No pegues ninguna clave en el código del repositorio.

## Archivos
- `docs/index.html`: interfaz móvil.
- `docs/app.js`: conexión a modelo real y modo de emergencia.
- `docs/fallback.js`: respuestas automáticas y combinaciones.
- `docs/personality.js`: personalidad y referencias creativas (el chiste de los panes, "ax", anime, videojuegos y Broken Threads).
- `docs/style.css`: estilos.

No almacenes información privada en los archivos del sitio. MiniGPT es un experimento creativo, no una IA entrenada desde cero.