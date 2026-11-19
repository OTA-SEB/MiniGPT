# OtaAI 1.0

OtaAI is a multi-theme, **generative-first** browser chat app. Its primary engine is a pretrained language model that writes original replies; automatic topic/reference/classifier responses are only a fallback if generation is unavailable. It retains Markdown, memory, chat folders, optional external AI and manual Google Drive backups.

**Website:** https://ota-seb.github.io/MiniGPT/

The repository and GitHub Pages address keep the old path for backward compatibility. The product's new name is **OtaAI**.

## OtaAI 1.0 interface

- **Official OtaAI star logo**, adapted from the supplied artwork, used in the app header and favicon.
- **Default theme:** deep crimson, dark pink and charcoal. Two different palettes, **blue with purple accents** and **yellow with orange accents**, are also available. All three have **dark and light** versions.
- Responsive layout for desktop, tablet and phone, including a collapsible workspace sidebar on mobile.
- **Edit a conversation name directly** by clicking its title at the top of the chat. Press Enter or click elsewhere to save; Escape cancels. The rename icon in the sidebar selects the conversation and focuses that title field. No rename popup.
- Conversation folders, shared memories, learned weights, API keys, personalization and Google Drive remain in the sidebar.
- **Desktop:** Enter sends, Shift+Enter inserts a line break, and Ctrl/Cmd+Enter also sends. **Phones/tablets:** Enter inserts a line break, and tapping Send submits the message.
- **Live Markdown as you type**: the editor itself turns completed `**bold**`, `*italic*`, `~~strikethrough~~`, inline backticks, Markdown links, `# ` headings and `- ` lists into visible formatting immediately. Typing three backticks and an optional language, then pressing Shift+Enter on desktop (or Enter on mobile), opens an editable code block. Both sent user messages and AI responses also render Markdown. HTML pasted into the editor is treated as text.
- **Compact source indicator on assistant messages** (top-left): 🧠 for genuinely generated replies (browser language model or external API) and 🧩 for automatic fallbacks, including the legacy classifier. Tap to see the actual source, reason for fallback, or model. Exact detected keywords are surfaced when present. Older saved replies without provenance are labeled accordingly rather than guessed.
- Response metadata is saved in local chat history and Drive backups, so the indicator still works after reopening a conversation.
- Removed suggested prompts, repeated response-status labels, and unused formatting controls to keep the interface uncluttered.

## Google Drive backup (without a custom database)

OtaAI uses **Google Identity Services** to request the narrow Google Drive scope:

https://www.googleapis.com/auth/drive.appdata

Data is saved as a JSON backup in the private **appDataFolder** of the user's Google account. This folder is not visible in the normal Drive file list. The application does **not** request access to ordinary Google Drive files.

### One-time Google Cloud setup

1. Go to https://console.cloud.google.com/apis/credentials and create/select a Google Cloud project.
2. Enable the **Google Drive API** in the project.
3. Configure the Google OAuth consent screen. If still in testing mode, add the Google accounts allowed as test users.
4. Create an **OAuth 2.0 Client ID** for a **Web application**.
5. Add **https://ota-seb.github.io** as an authorized **JavaScript origin**.
6. Open OtaAI's sidebar, select Google Drive, paste the **public Client ID**, then click Connect Google account and approve the permissions prompt.

Never paste a Google client secret, access token or service-account private key in the website. The public OAuth Client ID is not a secret.

### Manual save and restore

**Save to Drive** uploads the user's chats, folders, memories and learned weights. **Restore from Drive** downloads the backup and replaces local data after an explicit confirmation. Back up locally before restoring if unsure.

Backups are **manual**, not continuous real-time synchronization; this prevents silent overwrites between devices. Google access tokens remain in memory for the active browser session and are never saved to GitHub or local storage. The OAuth client ID may be remembered locally.

The Google connection becomes functional only after a real OAuth Client ID is configured in Google Cloud. A static site cannot invent the owner's Google project credentials. Broad/public Google OAuth usage may require Google review or verification.

Google backup files contain private user data under the selected Google account. OtaAI does not encrypt these files end-to-end; Google Drive's account protections apply.

## Model capabilities

### Generative-first routing (fixed architecture)

1. If the user supplies an external API key, the chosen external generative model writes the answer.
2. Otherwise, or if the external API fails, the app tries a **real pretrained browser-based generative language model** (new words generated token-by-token, not selected by topic).
3. **Only when neither model returns a usable response** does OtaAI call the old memory, rule-based reasoning, multilingual statistical matcher, classifier, or curated topics. The fallback reason is visible through the 🧩 icon.
   This policy is enforced centrally by `docs/response-router.js`, rather than relying on the order of unrelated chat handlers.
4. If the user cancels local generation, **no automatic topic answer is substituted**.

The browser models are hosted by Hugging Face, loaded with Transformers.js 4.3.2 from jsDelivr and cached when the browser supports caching. They are **not** invented/trained from scratch by this repository:

- **Auto (default):** Qwen2.5-0.5B-Instruct quantized in 4-bit on compatible **WebGPU** devices; on CPU-only devices with enough memory, Qwen also runs in quantized WASM mode (slower); on low-memory devices, the smaller CPU model is selected.
- **Qwen:** choose the stronger Qwen2.5 0.5B model, with a CPU option when WebGPU is unavailable and automatic fallback to the lightweight model if neither works.
- **Smol:** SmolLM2-135M-Instruct quantized in 4-bit, run through browser **WebAssembly**. It is lighter but has substantially weaker chat and multilingual ability; automatic selection favors multilingual Qwen on capable CPU-only devices for Spanish, Portuguese, and Japanese.

The **first sent message** initiates the large model download, so the interface displays download progress and a **Stop** button that can terminate the worker. On-device inference may be slow, fail for lack of memory, or be unavailable in older browsers. The app does not claim successful local generation if the model fails.

Downloaded weights and the Transformers.js runtime are fetched over HTTPS, but **chat prompts are not sent to the model hosts**: inference itself runs in a local worker. External API prompts, if configured, go to the selected provider. Models may generate mistakes; topic rules are not a substitute for fact checking.

### Legacy classifier (fallback only)

OtaAI also retains the previously implemented **400-topic** reference library, synthetic training data, symbolic reasoning and a 414,408-parameter intent classifier. These parts are **not** allowed to answer before the generative model gets a chance.

### Legacy fallback neural network

- **414,408 real trainable neural parameters**: separate language-specific hashed word/character embeddings (4 × 4096 × 24), a 48-unit tanh hidden layer and 408 intent/topic outputs. This network uses gradient descent, not an invented weight count.
- Optional fallback classifier training runs locally in a dedicated Web Worker, with 4 epochs on mobile and 6 on desktop. It is not started at page load: it activates only if the generative engine is unavailable, conserving resources.
- Where the browser permits it, model weights are cached in IndexedDB after training and reused on reload; otherwise the network retrains when opened again. Users can disable the network or request retraining from Settings.
- A held-out mobile worker test reported **53% top-one accuracy on 600 synthetic validation questions** after 31,980 gradient updates. This is *not* an external benchmark, reliable probability calibration or a guarantee on real conversations.
- The neural model is only allowed to suggest an answer when its margin and score meet strict thresholds and when no stronger verified result exists. It can abstain and fall back to other methods.
- **This is not a generative neural language model**, so it cannot freely write novel long answers or solve arbitrary research problems. It is a learned multilingual **intent classifier**, and its scores should not be treated as factual certainty.
- All training data comes from the app's synthetic topic templates. Conversations and private memory are **not** uploaded for training or stored in the neural cache.

### Existing components

- **34,904 synthetic training examples**, relatively balanced between EN (8,713), ES (8,955), PT (8,690), and JA (8,546).
- **249,790 sparse learned-style feature associations** in the static matcher (ES 70,712; EN 63,584; PT 67,241; JA 48,253), including **121,134 programming-topic associations**. These are **NOT neural-network parameters** or a pretrained language model.
- **17 language-specific programming templates** for hello-world, addition and loops, plus limited static code inspection: Python, C++, Rust, Kotlin, C#, JavaScript, TypeScript, Java, Go, Swift, Ruby, Lua, PHP, Bash, SQL, HTML and CSS.
- Rule-based reasoning includes arithmetic, sequences, comparisons, basic logical deduction, percentages, linear equations, primality tests and the Euclidean GCD algorithm. A separate multi-topic reasoning path composes verified reference explanations for compound queries. This is transparent symbolic calculation, **not general neural reasoning**.
- The original user-defined grammar marker **AX** is recognized as emphasizing choices following it in a list.

Confidence percentages remain heuristic similarity scores and must never be treated as calibrated probabilities. Unsupported requests may still receive a generic fallback.

### Regression tests

Run `node --test tests/response-router.test.mjs` to verify that API and local generative answers always outrank automatic fallbacks, that a fallback only runs on missing/failed generation, and that cancelling never produces an automatic replacement.

## OtaAI tag language (not XML/HTML)

OtaAI recognizes a small **custom tag syntax**, parsed as text rather than HTML. Rendering never inserts raw user HTML into the page:

- `<code="python">print("Hola")</code>` — colored code card. Also accepts `<code=rust>...</code>` and supported language names.
- `<code=javascript>console.log(2+2)</code>` — same card with a **Run JS** button.
- `<time d=60>` — counter increases from 60 seconds, tied to the original message time.
- `<time a=60>` — counter counts down from 60 seconds toward zero.
- `<time>` — the current local clock, updated every second.
- `<stime>` — the current Unix timestamp in seconds, updated every second.
- `<save>Favorite editor: VS Code</save>` — a memory block; user-authored messages save on sending. AI-authored memory blocks require a separate user click before they are stored.
- `<save name="Editor">VS Code</save>` — specify a memory label.
- `<color=red>red text</color>` or `<color=#eb5074>colored text</color>` — safely allowlisted text colors.
- `<mark>important</mark>` — emphasized text.
- `<spoiler>hidden text</spoiler>` — click to reveal.
- `<kbd>Ctrl+Enter</kbd>` — keyboard shortcut styling.
- `<notice>Heads up</notice>` — highlighted notice block.

**Execution limitation:** only JavaScript code can currently run locally, and only when the user clicks its Run button. That code executes in a time-limited Web Worker inside a sandboxed opaque-origin iframe with a restrictive Content Security Policy. Python, C++, Rust, Kotlin, C# and the other languages are supported for syntax display and curated examples, **not in-browser compilation/execution**. Running code is never automatic. Do not rely on the experimental runner for untrusted high-risk programs.

## Files

- docs/index.html: branded workspace, sidebar and Google Sign-In script.
- docs/style.css: full responsive 6-mode appearance and Markdown styling.
- docs/app.js: chat, folders, automatic Markdown display, source indicators, inline chat titles, personalization, optional API, Google backup UI.
- docs/markdown.js: safe Markdown DOM renderer and OTA tag integration.
- docs/ota-tags.js: custom tags, time counters, memory labels, colors, syntax highlighting and isolated JS runner.
- docs/code-knowledge.js: curated programming-language templates and static code inspection.
- docs/neural-core.js: 414,408-parameter neural embeddings, hidden layer, manual gradient descent and evaluation.
- docs/neural-worker.js: browser-based training, validation, inference and IndexedDB model cache.
- docs/neural.js: main-thread neural status, opt-out, retraining and asynchronous prediction bridge.
- docs/generative-worker.js: real generative model loading and token-by-token response generation on device.
- docs/generative.js: user-configurable generative model routing, progress and cancellation.
- docs/hybrid-reasoner.js: multi-topic retrieval and grounded response composition.
- docs/world-topics.js, docs/world-facts-local.js: 200 new topics with EN/ES/PT/JA descriptions.
- docs/composer.js: live contenteditable Markdown formatting and keyboard handling.
- docs/otaai-logo.svg: compact embedded rendition of the supplied official OtaAI star artwork.
- docs/google-drive.js: Google OAuth token flow and appDataFolder REST backup.
- docs/learning.js: local model persistence, memory, chats, folders, import/export and cloud snapshots.
- docs/default-model.js, docs/fallback.js, docs/extra-topics.js, docs/i18n.js, docs/reasoning.js: existing model logic.
- docs/response-router.js: single generative-first response policy; automatic responses run only as fallback.
- docs/generative.js and docs/generative-worker.js: pretrained browser models, download progress, streaming and cancellation.
- tests/response-router.test.mjs: regression checks for response priority and cancellation.
- docs/personality.js: optional external AI personality prompt.

## Compatibility and data safety

Old MiniGPT v1–v3 local history and learning formats migrate to the current OtaAI workspace. Legacy internal storage keys are intentionally retained for compatibility; current downloaded local backups are named **otaai-local-data.json**.

Deleting a chat does not delete global memories or learned associations. Use the individual memory controls or the explicit full reset. Keep backup copies outside a single browser for important data.
