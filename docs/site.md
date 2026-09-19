# dverka.sk

Сайт-визитка. Статика без бэкенда и без сборки: что лежит в `site/`, то и уезжает на хостинг.

## Где что

```
site/                    ← весь сайт, публикуется как есть
  index.html             3D-комната de_zastolye (three.js r128 с cdnjs)
  assets/*.gz            модели и карта комнаты, страница качает и распаковывает их сама
  pc/index.html          сайт «на компьютере» в стиле рунета 2000-х (открывается кликом по компу)
  404.html, favicon.*, apple-touch-icon.png, og.jpg (превью для ссылок), CNAME, robots.txt
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

GitHub Pages, workflow `.github/workflows/pages.yml`: любой пуш в `main`, который меняет `site/`,
выкладывает папку на https://dverka.sk. Руками — Actions → Deploy dverka.sk → Run workflow.

### Один раз при подключении

1. GitHub → репозиторий DverkaSK → Settings → Pages → Source: **GitHub Actions**.
2. У регистратора (Netim) в DNS зоны `dverka.sk` удалить старые A/AAAA/CNAME для `@` и `www` и добавить:

   | Тип   | Имя   | Значение              |
   |-------|-------|-----------------------|
   | A     | @     | 185.199.108.153       |
   | A     | @     | 185.199.109.153       |
   | A     | @     | 185.199.110.153       |
   | A     | @     | 185.199.111.153       |
   | AAAA  | @     | 2606:50c0:8000::153   |
   | AAAA  | @     | 2606:50c0:8001::153   |
   | AAAA  | @     | 2606:50c0:8002::153   |
   | AAAA  | @     | 2606:50c0:8003::153   |
   | CNAME | www   | dverkask.github.io.   |

3. Settings → Pages → Custom domain: `dverka.sk` → Save. Когда проверка DNS пройдёт и выпустится сертификат
   (от минут до суток), включить **Enforce HTTPS**.
4. По желанию: GitHub → Settings (аккаунта) → Pages → Add a verified domain. GitHub даст TXT-запись
   `_github-pages-challenge-DverkaSK`; с ней никто другой не сможет привязать dverka.sk к своему репозиторию.
