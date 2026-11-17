"""Нагрузка страницы во времени через CDP: CPU главного потока, память JS, DOM-узлы, пересчёты стилей/раскладки."""
import json, subprocess, sys, time, urllib.request, os, shutil, websocket
SP = os.path.dirname(os.path.abspath(__file__))
CH = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
url, dur, step = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
setup = sys.argv[4] if len(sys.argv) > 4 else ''
ud = os.path.join(SP, 'udperf'); shutil.rmtree(ud, ignore_errors=True)
p = subprocess.Popen([CH, '--headless=new', '--remote-debugging-port=9334', '--remote-allow-origins=*', '--enable-unsafe-swiftshader',
                      '--js-flags=--expose-gc', f'--user-data-dir={ud}', '--window-size=1600,1000', 'about:blank'],
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    for _ in range(50):
        try: tabs = json.load(urllib.request.urlopen('http://127.0.0.1:9334/json')); break
        except Exception: time.sleep(.2)
    ws = websocket.create_connection([t for t in tabs if t['type'] == 'page'][0]['webSocketDebuggerUrl'], timeout=60)
    n = [0]
    def call(method, **params):
        n[0] += 1; ws.send(json.dumps({'id': n[0], 'method': method, 'params': params}))
        while True:
            m = json.loads(ws.recv())
            if m.get('id') == n[0]: return m.get('result', {})
    call('Performance.enable', timeDomain='timeTicks')
    call('Page.navigate', url=url)
    time.sleep(6)
    if setup: call('Runtime.evaluate', expression=setup, awaitPromise=True)
    def metrics():
        call('HeapProfiler.collectGarbage')
        m = {x['name']: x['value'] for x in call('Performance.getMetrics')['metrics']}
        return m
    prev = metrics(); t0 = time.time(); prevT = t0
    print(f"{'t':>5} {'CPU%':>5} {'script%':>7} {'heapMB':>7} {'nodes':>6} {'listen':>6} {'style/s':>7} {'layout/s':>8} {'frames?':>7}")
    while time.time() - t0 < dur:
        time.sleep(step)
        m = metrics(); now = time.time(); dt = now - prevT
        cpu = (m['TaskDuration'] - prev['TaskDuration']) / dt * 100
        scr = (m['ScriptDuration'] - prev['ScriptDuration']) / dt * 100
        print(f"{now - t0:5.0f} {cpu:5.1f} {scr:7.1f} {m['JSHeapUsedSize'] / 1e6:7.1f} {int(m['Nodes']):6d} {int(m['JSEventListeners']):6d} "
              f"{(m['RecalcStyleCount'] - prev['RecalcStyleCount']) / dt:7.1f} {(m['LayoutCount'] - prev['LayoutCount']) / dt:8.1f}", flush=True)
        prev, prevT = m, now
finally:
    p.kill()
