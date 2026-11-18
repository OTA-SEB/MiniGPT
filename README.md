# MiniGPT 3.0 🤖

**English-first experimental browser chatbot** with a small statistical intent model, local learning, persistent memory, and bounded symbolic reasoning.

MiniGPT runs on GitHub Pages without requiring an API key. It is **not** Qwen or another pretrained neural language model. It doesn't generate arbitrary code yet.

**Live site:** https://ota-seb.github.io/MiniGPT/

## What's new

- **200 topics**: the original 100 general topics plus exactly **100 new technical topics** covering programming fundamentals, data structures, algorithms, software design, web, databases, and security concepts.
- Old user-specific subjects and examples in the *default model* have been replaced with neutral creative-design topics and ordinary arithmetic or decision-making topics.
- **English-focused training** in `docs/default-model.js`: approximately 14,460 synthetic phrase examples, with 10,807 English examples (about 75% of training); lighter Spanish, Portuguese, Japanese and romaji support. Phrase counts are generated dynamically and may evolve.
- **Short factual explanations** for technical concepts, rather than only generic conversation openers.
- **Bounded reasoning** for arithmetic (with operator precedence), arithmetic sequences, numeric comparisons, basic logical implication, and static recognition of simple code constructs/errors. The engine does not execute code and will not invent an answer if a pattern isn't supported.
- Confidence selector (80 / 90 / 95): the percentage is a **heuristic match score, not calibrated certainty**.
- Inspect local learned topic weights, trained-response model features, and remembered conversation facts from the **Memory** panel.
- Optional access to external APIs and links to model download pages. Download links do **not** load neural models into the app.

## Examples to try

- `Hello, how are you today?`
- `What is recursion?`
- `Explain a stack and a queue`
- `What is an API?`
- `Calculate (8+4)/3`
- `Next number: 2,4,6,8`
- `If it rains, then the ground is wet. it rains. What follows?`
- `Explain this Python code: for i in range(3): print(i)`
- `Hola, ¿cómo estás?`, `Oi como voce esta hoje`, `こんにちは`, `konnichiwa`

## Architecture

- `docs/index.html` and `docs/style.css`: responsive interface for phones and desktops.
- `docs/app.js`: conversation, model selection, topic routing, and memory inspector.
- `docs/extra-topics.js`: the 100 additional technical topics and their English explanatory notes.
- `docs/fallback.js`: topic aliases and localized response combinations.
- `docs/i18n.js`: English-first detection with ES/PT/JA support and romaji matching.
- `docs/default-model.js`: English-weighted synthetic training, matching, confidence heuristic, and topic answers.
- `docs/reasoning.js`: bounded deterministic reasoning; no use of eval and no execution of user-submitted code.
- `docs/learning.js`: trainable local associations, OPFS/localStorage persistence, memory, import/export and privacy controls.
- `docs/personality.js`: general-purpose assistant instructions for optional external APIs.

### Saved data and privacy

Local learning and remembered conversation facts are stored in the user's browser, **not committed to GitHub**. Personal weight JSON files are never used as public seed data. You can inspect, export, import, or clear local data in the UI.

The **v1 and v2 weight formats remain importable**. Topic IDs 0, 32–41, and 73 were repurposed in v3, so obsolete saved topic associations for those IDs are not carried over. Other learned associations may be retained. To delete any personal memories left from older conversations, use **Clear learned memory & weights**.

External API usage is optional. When enabled, messages and relevant memory are sent to that provider; API keys are not persisted in localStorage or GitHub. Browser-based keys can still be exposed: use an appropriately restricted key.

### Running the site

GitHub Pages: select **Settings → Pages → Deploy from a branch → main → /docs**. No build step is needed for the source.

Model download references:
- [Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
- [Qwen2.5 GGUF](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF)
- [SmolLM2 135M](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
- [Qwen2.5 0.5B on Ollama](https://ollama.com/library/qwen2.5:0.5b)

## Next milestone (not implemented)

**Local code construction/generation** with parsing, constraints, examples, safety checks and tests. This version is dedicated to understanding technical language and simple verifiable reasoning first.
