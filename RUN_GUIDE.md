# LabLedger — AI Lab Report Assistant (Project 54)

A premium midnight-blue, ivory and copper workspace with animated researcher login, new accounts, experiment templates, verified calculations, editable report drafts, account-based saved reports and print/PDF/Markdown export.

## Start locally
Install Node.js 24 or newer. Double-click Start-LabLedger.cmd, or run `npm run dev` in this folder. Open http://localhost:8903. No dependencies need installation.

Create a new account using your name, email and a password of 10–128 characters. Choose an experiment, enter the actual objective, equipment, procedure and readings, then generate. Edit the writing in the report preview, Save to your account, or download Markdown. PDF opens the browser print dialog; choose Save as PDF.

## AI configuration
The current local installation uses the previously saved Groq setup. The source ZIP excludes its .env and all account data. For an extracted copy, create `.env` using .env.example and set GROQ_API_KEY. GROQ_MODEL defaults to qwen/qwen3.8-27b. Keys stay on the server. The Groq provider receives the experiment details and verified calculations to draft theory, discussion, conclusion and limitations. Template mode works without an API key and is labelled clearly. Hosted deployment needs its own server secret; local keys/accounts do not transfer automatically.

## Calculations
- Ohm’s law: R = V/I; voltage in V, current in A. Current must be positive. Individual values and arithmetic mean are calculated.
- Pendulum: T = t/n; g = 4π²L/T²; length in m, total time in s, positive whole oscillations. Assumes small angular displacement.
- Density: ρ = m/V; mass in g, volume in cm³ (equivalent to mL). Both must be positive.
- Custom: supplied observations are organized; no numeric calculation is claimed as automatically verified.

Up to 30 readings per report. Results are stored at full JavaScript precision and displayed with up to six significant figures. Instrument uncertainty is not inferred. Sample data are explicitly marked in preview and export. AI prose is a draft requiring student review, not proof of experimental validity. No citations or instrument readings are fabricated by the template engine. If source fields change after generation, regenerate to update the report. Preview narrative fields can be edited and saved directly.

## Accounts and data
Local accounts and reports use data/labledger.sqlite and persist after server restarts. Passwords use salted PBKDF2-SHA256. Sessions use random tokens stored hashed on the server, HttpOnly cookies and origin checks. Password attempts are throttled. APIs enforce report ownership. The archive view shows the latest 100 reports. Email verification and password recovery are not implemented. Hosted accounts use a separate D1 database.

## Verification
`npm test` checks known formula results and invalid readings, account signup/login/logout, report save/update/read/delete, cross-account isolation, independent recalculation on save, AI response parsing and provider errors, and browser script syntax. `npm run build` and `npm run validate` verify the Worker artifact. Browser QA covers signup, AI report generation, editing, saving/reopening, export and responsive layout. Live AI availability remains subject to Groq key, model access and rate limits.

## Source map
worker/engine.js: validation, verified calculations and AI/template drafting. worker/app.js: protected report APIs. worker/auth.js: accounts/sessions. worker/ui.js: premium UI and print layout. scripts/dev.mjs: local server. scripts/database.mjs: SQLite adapter. drizzle/: schema migrations. scripts/test.mjs: automated tests. .openai/hosting.json: hosted Site identity.

Groq documentation: https://console.groq.com/docs/text-chat and https://console.groq.com/docs/structured-outputs
