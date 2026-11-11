# Local editing resources

This is a usable starter editing library for the isolated Video Space lab. It is
not a CapCut dataset and includes no CapCut-owned content, extracted packs,
third-party recordings, or copied music.

| Kind | Count | Format |
| --- | ---: | --- |
| Sound effects | 24 | Stereo, 44.1 kHz, 16-bit PCM WAV; 0.22–3.2 s |
| Music beds | 5 | Original instrumental sketches, stereo PCM WAV; about 19–29 s |
| Stickers | 16 | Transparent 640 × 640 PNG + editable SVG source |
| Fonts | 24 families | Full original TTF files, with Vietnamese character support |
| Text templates | 16 | Editable JSON recipes: title, lower third, product callout, outro |

The sound effects are synthetic: airy sweeps, clicks, pops, notifications,
impacts, typing rhythms and transition accents. The music beds contain original
procedurally composed chord voices, melodies, bass and light percussion. The
beds have natural openings and tails; they are not promised to loop seamlessly.

All original audio, sticker artwork, template recipes and generation scripts in
this resources directory are offered under CC0 1.0 Universal. See
[ORIGINAL-ASSETS.txt](ORIGINAL-ASSETS.txt) and [CC0-1.0.txt](CC0-1.0.txt).
The fonts retain their own SIL Open Font License 1.1, copyright notices and
metadata under `assets/fonts/<family>/OFL.txt` and `METADATA.pb`. Font licenses
are not replaced by the original asset license.

The font source is Google's official `google/fonts` repository, pinned to
commit `e7db6ca603fd4862010383ff17ffd6cc4ffac1c0`:

- [Inter](https://github.com/google/fonts/tree/e7db6ca603fd4862010383ff17ffd6cc4ffac1c0/ofl/inter): variable weight/optical size, upright.
- [Be Vietnam Pro](https://github.com/google/fonts/tree/e7db6ca603fd4862010383ff17ffd6cc4ffac1c0/ofl/bevietnampro): regular upright, designed for Vietnamese.
- [Montserrat](https://github.com/google/fonts/tree/e7db6ca603fd4862010383ff17ffd6cc4ffac1c0/ofl/montserrat): variable weight, upright.
- [Roboto](https://github.com/google/fonts/tree/e7db6ca603fd4862010383ff17ffd6cc4ffac1c0/ofl/roboto): variable weight/width, upright.

`manifest.json` retains each file's source, license, SHA-256 digest, size, kind
and display metadata. The API deliberately omits local filenames and provenance
paths from its public response, serving only manifest-registered IDs. It returns
same-origin `/api/lab/api/v1/library/assets/{id}` URLs through the existing Next
rewrite. Templates are recipes and have no file URL.

Rebuild from the lab root:

```powershell
.\.tools\python312\python.exe resources/generate.py
.\.tools\python312\python.exe resources/validate.py
```

An offline rebuild reuses the bundled font files. To fetch the exact original
font files, OFL texts and source metadata again, use `--download-fonts`. The
sticker renderer reuses Sharp already installed with the editor. Generation
adds no Python package and does not run when serving or editing a project.

The lab launcher currently uses its portable Python 3.12 because the old venv's
base interpreter moved. A working Python 3.12 venv can run the same two scripts.
The catalog totals 85 entries. The six template additions on 28 October are Product
Launch, Feature Focus, Product Caption, Creator Tip, Shop Callout and Contact
Card; each inserts editable text/accent layers rather than a flattened video.

The 24 font families are grouped in the library:

- Sans serif: Inter, Be Vietnam Pro, Montserrat, Roboto, Open Sans, Nunito,
  Nunito Sans, Quicksand, Oswald, Barlow, Roboto Condensed, Noto Sans, Fira Sans,
  Chakra Petch.
- Serif: Bitter, Source Serif 4, Lora, Merriweather, Playfair Display, Noto Serif.
- Handwriting: Pacifico, Patrick Hand.
- Display: Lobster, Bangers.

Every family has its own unchanged font, OFL text and METADATA.pb under
`assets/fonts/<family>/`. Each manifest entry points to its exact directory in
the same pinned Google Fonts commit. The offline validator checks 98 Vietnamese
codepoints in each binary. Roboto Serif was excluded because its pinned file
lacks U+1EC8/U+1EC9; Source Serif 4 passes the same validation.

The generator also writes `opencut-classic/apps/web/src/fonts/bundled-fonts.json`
with local asset IDs and supported weight ranges from metadata. Both the text
library and the properties font picker use those local files. Existing upstream
font choices outside these 24 families still require Google Fonts connectivity.

These are starting materials for editing, not an automatic editing model or a
large production media service. Every template's copy, font, accent, position,
duration and animation remains editable in the editor.
