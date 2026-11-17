import json, subprocess, sys, time, urllib.request, os, shutil, websocket
SP = os.path.dirname(os.path.abspath(__file__))
CH = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
url = sys.argv[1]; waits = [float(x) for x in sys.argv[2].split(',')]; expr = sys.argv[3]
ud = os.path.join(SP, 'udcdp'); shutil.rmtree(ud, ignore_errors=True)
p = subprocess.Popen([CH, '--headless=new', '--remote-debugging-port=9333', '--remote-allow-origins=*', '--autoplay-policy=no-user-gesture-required',
                      '--enable-unsafe-swiftshader', f'--user-data-dir={ud}', '--window-size=1400,1000', 'about:blank'],
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    for _ in range(50):
        try:
            tabs = json.load(urllib.request.urlopen('http://127.0.0.1:9333/json')); break
        except Exception: time.sleep(.2)
    ws = websocket.create_connection([t for t in tabs if t['type'] == 'page'][0]['webSocketDebuggerUrl'], timeout=30)
    n = [0]
    def call(method, **params):
        n[0] += 1; ws.send(json.dumps({'id': n[0], 'method': method, 'params': params}))
        while True:
            m = json.loads(ws.recv())
            if m.get('id') == n[0]: return m
    call('Page.navigate', url=url)
    t0 = time.time()
    for w in waits:
        time.sleep(max(0, w - (time.time() - t0)))
        r = call('Runtime.evaluate', expression=expr, returnByValue=True)
        print(f'[{w:>5.1f}s]', r.get('result', {}).get('result', {}).get('value'), flush=True)
finally:
    p.kill()
