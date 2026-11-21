# Playlist card: 2006 MP3 player with Aiwan koloboks

- `player_card.py`: card generator (`card_svg(tracks, title, dark)`), needs only Pillow
- `assets/`: defringed kolobok APNGs and the Press Start 2P subset (OFL)
- `playlist-{dark,light}.svg`: a sample render
- `integration.patch`: wires it into `scripts/yandex_playlist.py`

To go live: move `player_card.py` and `assets/` into `scripts/`, apply the patch, and add the Aiwan footer to the README:
`Smileys: Copyright © Aiwan. Kolobok Smiles — kolobok.us`.
Edited (defringed and recoloured) koloboks need the author's permission (Aiwan@yandex.ru, subject "KOLOBOK").

Previews: `python ../preview_palettes.py 1 5 6` writes `../preview-palettes.html`.
