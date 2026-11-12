# BrandHub Video Space editor

Private workspace editor, delivered as a separate static Vite application inside the authenticated BrandHub iframe. It preserves the reviewed timeline, renderer, transitions, masks, filters, fonts and resource catalog. The parent supplies protocol-v1 context and owns authenticated network requests. Opening this artifact directly does not create an anonymous editor session.

From the brandhub-web root after the normal npm workspace installation:

```sh
npm run typecheck --workspace @brandhub/video-space-editor
npm run verify --workspace @brandhub/video-space-editor
npm run build --workspace @brandhub/video-space-editor
```

Build output is `../../public/video-space` relative to this package; the host production build copies it into `dist/video-space`. No Next, FastAPI or Rust service runs with the editor. The source uses its own `@` alias and CSS document. The host must recreate the iframe when user/workspace/source changes and must await the `flush` command result before return navigation.

Cloud project and original-media GET/PUT calls cross the same-origin, source/session-bound message bridge. Multipart uploads are logical `{file: File, metadata: string}` requests; the host performs provider upload sessions. Local drafts, migration databases, OPFS originals and persisted editor settings are scoped before editor imports execute. Theme and locale may change within the same session.

`resources/manifest.json` and `public/library/assets` contain the 85 reviewed resource inputs. `scripts/build-library.mjs` emits the public schema and 24 local font URLs without an API service. `scripts/verify-source.mjs` checks resource SHA-256 hashes/licenses, storage/bridge boundaries and the real WASM entry.

See [UPSTREAM.md](UPSTREAM.md) for source provenance, renderer rebuild instructions and licenses. Source tests are kept in `tests`, outside `src`.
