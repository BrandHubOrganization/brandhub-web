# Local Unicode emoji data

`emoji-test-17.0.txt` is the unmodified Unicode Emoji 17.0 dataset:
https://www.unicode.org/Public/17.0.0/emoji/emoji-test.txt

SHA-256: `1d8a944f88d7952f7ef7c5167fef3c67995bcae24543949710231b03a201acda`.

Copyright Unicode, Inc.; distributed under Unicode License v3 included in
`UNICODE-LICENSE.txt` (https://www.unicode.org/license.txt).

The picker loads this file from the web application's own origin, never from a
public API at runtime. Keep the version pinned; parser tests cover all nine groups,
ZWJ sequences and base-only skin-tone filtering. Labels are Unicode's English
names, so emoji search remains English, as in the original picker.
