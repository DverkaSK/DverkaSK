"""CPU-профиль страницы через CDP: топ функций по собственному времени."""
import json, subprocess, sys, time, urllib.request, os, shutil, websocket, collections
SP = os.path.dirname(os.path.abspath(__file__))
CH = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
url, secs = sys.argv[1], float(sys.argv[2])
ud = os.path.join(SP, 'udprof'); shutil.rmtree(ud, ignore_errors=True)
p = subprocess.Popen([CH, '--headless=new', '--remote-debugging-port=9335', '--remote-allow-origins=*', '--enable-unsafe-swiftshader',
                      f'--user-data-dir={ud}', '--window-size=1600,1000', 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    for _ in range(50):
        try: tabs = json.load(urllib.request.urlopen('http://127.0.0.1:9335/json')); break
        except Exception: time.sleep(.2)
    ws = websocket.create_connection([t for t in tabs if t['type'] == 'page'][0]['webSocketDebuggerUrl'], timeout=120)
    n = [0]
    def call(method, **params):
        n[0] += 1; ws.send(json.dumps({'id': n[0], 'method': method, 'params': params}))
        while True:
            m = json.loads(ws.recv())
            if m.get('id') == n[0]: return m.get('result', {})
    call('Page.navigate', url=url); time.sleep(8)
    call('Profiler.enable'); call('Profiler.setSamplingInterval', interval=200); call('Profiler.start')
    time.sleep(secs)
    prof = call('Profiler.stop')['profile']
    nodes = {nd['id']: nd for nd in prof['nodes']}
    dts = prof['timeDeltas']; self_t = collections.Counter()
    for sid, dt in zip(prof['samples'], dts):
        cf = nodes[sid]['callFrame']; self_t[(cf['functionName'] or '(anon)', cf['lineNumber'] + 1, cf['url'][-25:])] += dt
    total = sum(dts)
    for (fn, ln, u), t in self_t.most_common(22):
        print(f'{t / total * 100:5.1f}%  {fn[:40]:40} line {ln:5}  {u}')
finally:
    p.kill()
