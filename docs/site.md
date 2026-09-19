# dverka.sk

Сайт-визитка. Статика без бэкенда и без сборки: что лежит в `site/`, то и уезжает на хостинг.

## Где что

```
site/                    ← весь сайт, публикуется как есть
  index.html             3D-комната de_zastolye (three.js r128 с cdnjs)
  assets/*.gz            модели и карта комнаты, страница качает и распаковывает их сама
  pc/index.html          сайт «на компьютере» в стиле рунета 2000-х (открывается кликом по компу)
  404.html, favicon.*, apple-touch-icon.png, og.jpg (превью для ссылок), robots.txt
scripts/
  wakatime_cards.py      карточки WakaTime для README + cards/wakatime.json для cmd.exe на сайте
  steam_shots.py         мои скрины MineStickman из Steam → cards/steam-shots.json для фотоальбома
cards/                   результат скриптов; сайт читает JSON отсюда через raw.githubusercontent.com
docs/site-plan.md        план и история окон на странице компьютера
concepts/                архив поиска стиля (прототипы, HANDOFF.md), на сайт не попадает
```

Живые данные на сайте:
- **WakaTime** и **фотоальбом** — `cards/*.json`, их раз в 6 часов пересобирает Action `wakatime-cards.yml`.
  Не загрузилось — страница показывает вшитый снимок.
- **Winamp** — YouTube-плеер во фрейме; работает только на настоящем https-домене, не на localhost.
- Скин Minecraft — `api.mineatar.io`, запасные варианты вшиты.

## Посмотреть локально

```
cd site
python -m http.server 8000
```

Открыть http://127.0.0.1:8000/ (комната) или http://127.0.0.1:8000/pc/ (сразу страница компьютера).
Двойным кликом по `index.html` не заработает: браузер не даст `fetch` из `file://`.

## Деплой

Свой сервер `82.21.150.38` (Debian 12, тот же, где тестовый Minecraft), Caddy.
Workflow `.github/workflows/deploy.yml`: любой пуш в `main`, который меняет `site/`, заливает папку по rsync
в `/var/www/dverka.sk`. Руками — Actions → Deploy dverka.sk → Run workflow.

На сервере:
- конфиг — `/etc/caddy/Caddyfile`; `www` редиректит на голый домен;
  `assets/*.gz` отдаются как есть, без `Content-Encoding` — страница распаковывает их сама;
- HTTPS (Let's Encrypt), продление и редирект с http Caddy делает сам; HTTP/3 — через открытый 443/udp;
- заливает пользователь `site-deploy`; его ключ в `authorized_keys` прибит к
  `rrsync /var/www/dverka.sk`, так что шелла и других каталогов у него нет.

Секреты репозитория (Settings → Secrets and variables → Actions):
- `SITE_DEPLOY_KEY` — приватный ключ `site-deploy`;
- `SITE_KNOWN_HOSTS` — строка `ssh-keyscan -t ed25519 82.21.150.38`.

DNS у Netim: A-записи `dverka.sk` и `www.dverka.sk` → `82.21.150.38`. MX, SPF и NS не трогать — это почта и сам домен.
