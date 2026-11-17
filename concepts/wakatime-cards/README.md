# WakaTime card concepts (not in use)

Saved for later. Nothing here is wired into `scripts/wakatime_cards.py`.

- **IntelliJ editor card** (`card_e` in `proto2.py`): stats shown as a `Languages.java` tab in IntelliJ,
  with the data written as real Java code: `"Java", hours(1763), // 77%`, a coloured bar next to it,
  lines typing in one by one and a blinking caret. Light and dark themes follow the IDE's own themes.
  Liked as the most unusual idea, but it needs to read faster before it goes live.
  Rendered examples: `intellij-languages-dark.svg`, `intellij-languages-light.svg`.

`proto.py` holds the shared data loading, icons and chips that `proto2.py` uses. The prototypes were run from a
scratch folder and expect the extra language icons in `ic/` and `PressStart2P.ttf` next to them.

## Terminal cards (`terminal/`)

Second-favourite direction, kept for later:

- **T2 · htop** (`t2` in `terminal.py`): htop-style `Java[|||||| 76.4%]` meters on top with a Total / Langs / Since
  summary, then a process-list table with a green header and the first row selected.
- **T4 · powerline** (`t4`): a `❯ wakatime --languages --all-time` prompt, then a powerline segment chain per
  language: name → hours → thin share bar.

Rendered examples: `t2-*.svg`, `t4-*.svg`. `common.py` loads the data from `cards/wakatime.json`.

## YOBA (`yoba/`)

The real YOBA face (classic laughing one, `yoba.png`; smug PeKa in `peka.png`), cut to a circle from the
Know Your Meme gallery (original art by 3-Angled-Blue, DeviantArt 2008 — no clear licence). He pops in after the
rings draw and shakes with laughter every couple of seconds.

- **A** (`yoba-a-*.svg`): the Apple activity rings card with YOBA in the middle of the rings.
- **B** (`yoba-b-*.svg`): YOBA is the circle, wrapped in one 80% AI / 20% human ring, big "80%" on the right.

`yoba_cards.py` imports `rings.py` (the activity rings card) for data, colours and ring drawing.
