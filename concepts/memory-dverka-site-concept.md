---
name: dverka-site-concept
description: Direction the user chose for their dverka.sk business-card site (cozy pixel 3D flat + door mascot) and what they rejected
metadata: 
  node_type: memory
  type: project
  originSessionId: 61fa427d-2bf9-4d8f-a434-2f28531a660c
  modified: 2026-09-15T20:39:08.242Z
---

The user is exploring a business-card site for their domain dverka.sk. As of 2026-09-15, the chosen direction is a **pixel-rendered 3D diorama of a default Russian flat** with a cozy "сычевальня"/imageboard vibe on New Year's Eve: characters hang out at a festive table, the nick **DverkaSK** stands in the centre as voxel letters, and a small, nimble door mascot ("Дверка") runs and jumps over the letters. Hovering the mascot makes it stop and creak open onto darkness, which is a hook for a future "enter the door" feature (not built yet). Prototype published at https://claude.ai/artifact/UsKxMUnPpZPifUz8GJqeUG (Three.js r128, low-res render).

**Why:** the user wants the site to feel cozy and comfortable, like the games they feel at home in (CS 1.6, The Binding of Isaac), with memorable characters that can later wear seasonal outfits.

**Update 2026-09-15 (latest):** every code-generated scene got rejected ("какой-то фреймворк, что-то типа игры"), including Three.js 3D and procedural pixel art. The target is illustration-quality art: Isaac-style hand-drawn pixel art, or a painterly digital illustration (a двачер in a bathrobe with a paper bag, a sphynx cat, a snowy window). The honest path is **art assets from an artist or an AI image generator, with the site built around them** (layers, parallax, small animations, the mascot, links). Say this limitation up front instead of rebuilding procedurally.

**Masyanya direction (2026-09-15):** the user asked for the feast room in a **Масяня-style flat Flash cartoon**: thick wobbly "boiling" ink outlines, flat fills, a canvas 2D drawing and no 3D engine. Published as a new artifact: https://claude.ai/artifact/EkoFnVTtGAsLB9nLwycM3L. The feedback on it isn't in yet. A code-drawn flat cartoon is the style that is actually achievable at good quality.

**How to apply:**
- The user loves the **Press Start 2P** font. Keep it.
- They rejected several concepts as "not what I want": a CS 1.6 GoldSrc menu site, a Binding of Isaac room-with-doors game, and an illustrated "street of living doors". Don't drift back to those.
- For now they asked for no seasons and no complex logic.
- Characters: the cat must stay. Everyone else is a faceless male anon, wearing either a fast-food paper bag or a troll-face-style grin mask (never both on one character). No women or grandmothers.
- They want **real, instantly readable meme faces** (the actual trollface, rage faces). Redrawn look-alikes that don't read were rejected. They were told once about the trollface copyright risk and still want it.
- Latest direction (2026-09-15): back to a **3D feast scene** with a static camera, the characters sitting and hanging out, plus the nick and the Dverka mascot. It should carry **CS 1.6 / GoldSrc vibes** (low-poly, soft low-res textures, a cosy New Year flat like the CS "olivier pot" map). References are for vibe only: **no playable CS copy, no running around, no game HUD**. The 3D-blocky version was preferred over the 2D pixel-art one. Characters: Ghostface (Scream) in a black robe; a двачер in a bathrobe and slippers with a paper bag on his head; a trollfacer with the real trollface; the cat.
- Pixel look: low-res 3D (Three.js) and dithered 3D shaders were rejected as "weird pixel". Since 2026-09-15 the concept is hand-placed 2D pixel art at 384×216 with whole-number scaling. It uses a one-point-perspective room, mouse parallax layers, and dithered ("рябистый") lighting, with faces drawn on top without dither.
