# BrandHub UI and UX work

Read `CLAUDE.md`, `rule.md`, and `STRUCTURE.md` before changing this frontend. Follow the feature workflow in `../brandhub-infrastructure/docs/rule/feature-workflow.md`.

- Preserve the system's existing design. Reuse `src/globals.css`, `src/theme/colors.ts`, and shared `src/components/ui` components for colors, typography, spacing and controls.
- Treat skill design suggestions as subordinate to BrandHub's established design and the user's requirements. Improve task completion, clarity and feedback without replacing the visual identity or generating a new palette.
- Minimize modals. In Media Campaign and Media Package, show long forms, detail views and review workflows in the page's full available width with a visible return action. Reserve dialogs for short confirmations such as discarding unsaved changes. Do not expand the current work into Task screens without a new user instruction.
- Use the installed UI/UX and React skills where relevant. Use React guidance applicable to this Vite SPA; Next.js-specific examples do not justify framework or data-library migrations.
- Reuse existing route access checks. Explain prerequisites and provide permitted recovery actions; avoid controls that imply unsupported behavior.
- Keep Vietnamese/English translation keys parallel under `src/i18n/locales/{vi,en}/`. Verify light/dark mode, keyboard operation and responsive behavior for changed interfaces.
- User policy: do not create or commit test files under `src`; do not force-add ignored test files. Keep local verification artifacts out of commits.
- Run `npm run ci` (lint, type-check, and production build) and resolve all errors before committing or pushing.
