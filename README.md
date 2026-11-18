# OtaAI 1.0

OtaAI is a multi-theme, local-first browser AI workspace with conversations, Markdown, basic reasoning, persistent memories, chat folders, and optional Google Drive backups.

**Website:** https://ota-seb.github.io/MiniGPT/

The repository and GitHub Pages address keep the old path for backward compatibility. The product's new name is **OtaAI**.

## OtaAI 1.0 interface

- **Official OtaAI star logo**, adapted from the supplied artwork, used in the app header and favicon.
- **Default theme:** deep crimson, dark pink and charcoal. Two different palettes, **blue with purple accents** and **yellow with orange accents**, are also available. All three have **dark and light** versions.
- Responsive layout for desktop, tablet and phone, including a collapsible workspace sidebar on mobile.
- **Edit a conversation name directly** by clicking its title at the top of the chat. Press Enter or click elsewhere to save; Escape cancels. The rename icon in the sidebar selects the conversation and focuses that title field. No rename popup.
- Conversation folders, shared memories, learned weights, API keys, personalization and Google Drive remain in the sidebar.
- **Automatic Markdown** for messages from both user and assistant: type the raw syntax such as **, *, backticks, code fences, lists and tables. Rendered messages display formatting automatically; the compose box needs no formatting toolbar or preview switch. Raw HTML stays plain text and HTTP(S) links are restricted.
- **Compact source indicator on assistant messages** (top-left): 🧠 for trained local model answers or external AI; tap for estimated match confidence or the chosen API model. 🧩 for automatic/reference/memory/rule-based responses; tap for the keyword or specific rule that triggered the response. Exact detected keywords are surfaced when present. Older saved replies without provenance are labeled accordingly rather than guessed.
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

OtaAI is a lightweight statistical intent-matching model, **not** Qwen or a full neural text generator. It retains 200 topics, English-focused synthetic training, smaller ES/PT/JA support, romaji, and bounded arithmetic/logic reasoning. Confidence scores are heuristic match scores, not guaranteed probabilities. General code generation is planned for a later version.

## Files

- docs/index.html: branded workspace, sidebar and Google Sign-In script.
- docs/style.css: full responsive 6-mode appearance and Markdown styling.
- docs/app.js: chat, folders, automatic Markdown display, source indicators, inline chat titles, personalization, optional API, Google backup UI.
- docs/markdown.js: safe Markdown DOM renderer.\n- docs/otaai-logo.svg: compact embedded rendition of the supplied official OtaAI star artwork.
- docs/google-drive.js: Google OAuth token flow and appDataFolder REST backup.
- docs/learning.js: local model persistence, memory, chats, folders, import/export and cloud snapshots.
- docs/default-model.js, docs/fallback.js, docs/extra-topics.js, docs/i18n.js, docs/reasoning.js: existing model logic.
- docs/personality.js: optional external AI personality prompt.

## Compatibility and data safety

Old MiniGPT v1–v3 local history and learning formats migrate to the current OtaAI workspace. Legacy internal storage keys are intentionally retained for compatibility; current downloaded local backups are named **otaai-local-data.json**.

Deleting a chat does not delete global memories or learned associations. Use the individual memory controls or the explicit full reset. Keep backup copies outside a single browser for important data.
