"""Real-time screenshots of preview-player.html (card shown as <img>, like GitHub) via Chrome DevTools."""
import base64, json, subprocess, sys, time, urllib.request
from pathlib import Path
import websocket

out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
page = (Path(__file__).resolve().parent / "preview-player.html").as_uri()
proc = subprocess.Popen([r"C:/Program Files/Google/Chrome/Application/chrome.exe", "--headless=new",
                         f"--user-data-dir={out / 'profile'}", "--remote-debugging-port=9333",
                         "--window-size=920,620", "--hide-scrollbars", page])
try:
    for _ in range(50):
        try:
            tabs = json.load(urllib.request.urlopen("http://127.0.0.1:9333/json"))
            tab = next(t for t in tabs if t["type"] == "page")
            break
        except Exception:
            time.sleep(.2)
    ws = websocket.create_connection(tab["webSocketDebuggerUrl"], suppress_origin=True)
    n = 0
    def call(method, **params):
        global n
        n += 1
        ws.send(json.dumps({"id": n, "method": method, "params": params}))
        while True:
            m = json.loads(ws.recv())
            if m.get("id") == n:
                return m.get("result", {})
    time.sleep(2)
    for i in range(6):
        r = call("Page.captureScreenshot", format="png")
        (out / f"live{i}.png").write_bytes(base64.b64decode(r["data"]))
        time.sleep(.7)
    print("ok")
finally:
    proc.kill()
