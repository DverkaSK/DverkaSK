#!/bin/sh
# usage: shot.sh NAME [budget_ms]  -> scratchpad/NAME.png of preview-player.html
S="C:/Users/Admin/AppData/Local/Temp/claude/eba8126a199683a8/b8585e6e-b6a8-4878-a620-c57e933e1e87/scratchpad"
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless --disable-gpu --hide-scrollbars --window-size=920,1150 --virtual-time-budget=${2:-3000} --screenshot="$S/$1.png" "file:///C:/Users/Admin/IdeaProjects/DverkaSK/concepts/koloboks/preview-player.html" >/dev/null 2>&1
