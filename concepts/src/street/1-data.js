const ICONS = __ICONS__;
const MODRINTH = "__MODRINTH__";
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS = 'http://www.w3.org/2000/svg';
const GROUND = 720, FEET = 782;

const store = {
  get(k, d) { try { const v = localStorage.getItem('dverka.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('dverka.' + k, JSON.stringify(v)); } catch (e) {} },
};

const STR = {
  ru: {
    sub: 'улочка дверок · концепт',
    hint: 'веди курсор — Дверка побежит следом',
    seasons: { winter: 'Зима', autumn: 'Осень', spring: 'Весна', summer: 'Лето' },
    seasonLine: { winter: 'С наступающим! Я в колпаке!', autumn: 'Шуршу листьями!', spring: 'Пахнет весной!', summer: 'Смотри, светлячки!' },
    wardrobe: 'Гардероб', wTitle: 'Гардероб Дверки', rows: { hat: 'Голова', neck: 'Шея', face: 'Лицо' }, none: 'Ничего',
    items: { santa: 'Колпак', beanie: 'Шапочка', party: 'Праздник', pumpkin: 'Тыква', crown: 'Корона', headphones: 'Наушники', propeller: 'Пропеллер', flower: 'Цветок', scarf: 'Шарф', bowtie: 'Бабочка', garland: 'Гирлянда', glasses: 'Очки', sunglasses: 'Тёмные' },
    enter: 'Зайти ↗', write: 'Написать ↗',
    hello: 'Привет! Я Дверка. Веди курсор — побегу следом!',
    idle: ['Тук-тук!', 'Скрип-скрип…', 'Меня можно переодеть. Кнопка внизу!', 'Все дверки открыты, заходи куда хочешь.', 'Смотри, как я быстро!', 'Люблю, когда в окнах горит свет.', 'Там за углом — замок. Настоящий!'],
    poke: ['Хи-хи, щекотно!', 'Опа!', 'Вжух!', 'Ещё разок?', 'Я прыгучая!'],
    wake: 'Ой! Я не сплю, я думаю.',
    dress: ['Ну как я?', 'Красота!', 'Мне идёт?', 'Обновочка!'],
    doors: {
      waka: { name: 'WakaTime', line: 'Часы считают часы. 1 758 на Java!', desc: 'Сколько и на чём я пишу код. Обновляется само.' },
      gh: { name: 'GitHub', line: 'Это ГитХаб. Ворчит, но код хранит.', desc: 'Код, этот README и карточки статистики.' },
      spigot: { name: 'SpigotMC', line: 'Тут плагины для Майнкрафта!', desc: 'Мои плагины для серверов Minecraft.' },
      home: { name: 'dverka.sk', line: 'А это мой дом! Заходи.' },
      modrinth: { name: 'Modrinth', line: 'И тут плагины. Зелёненькие!', desc: 'Ещё плагины — на Modrinth.' },
      shop: { name: 'Мастерская', line: 'Мастерская! Тут все инструменты.' },
      tg: { name: 'Telegram', line: 'Сюда можно написать. Я передам!', desc: 'Написать напрямую. Адрес пока заглушка.' },
    },
    home: {
      t: 'Проходи, располагайся',
      p: 'Я — <b>DverkaSK</b>, Java-бэкендер. Днём Kafka, Kubernetes и ClickHouse, вечером — плагины для Minecraft. С 2026 пишу в паре с ИИ: на прошлой неделе 86% строк были AI-driven.',
      facts: [['1 758 ч', 'на Java'], ['2 111 ч', 'в IntelliJ IDEA'], ['213 ч', 'в Claude Code'], ['86%', 'AI за неделю']],
      cozy: 'Уютные игры хозяина: CS 1.6 и The Binding of Isaac.',
      src: 'Цифры — из WakaTime, как в README.',
    },
    shop: { t: 'Мастерская', p: 'Всё, чем я работаю. Инструменты висят на стене, новые — справа.', old: 'До 2026', neu: 'С 2026' },
  },
  en: {
    sub: 'a street of little doors · concept',
    hint: 'move the cursor — Dverka will run after it',
    seasons: { winter: 'Winter', autumn: 'Autumn', spring: 'Spring', summer: 'Summer' },
    seasonLine: { winter: 'Happy holidays! Look at my hat!', autumn: 'Crunchy leaves!', spring: 'Smells like spring!', summer: 'Look, fireflies!' },
    wardrobe: 'Wardrobe', wTitle: 'Dverka’s wardrobe', rows: { hat: 'Head', neck: 'Neck', face: 'Face' }, none: 'Nothing',
    items: { santa: 'Santa hat', beanie: 'Beanie', party: 'Party', pumpkin: 'Pumpkin', crown: 'Crown', headphones: 'Headphones', propeller: 'Propeller', flower: 'Flower', scarf: 'Scarf', bowtie: 'Bow tie', garland: 'Garland', glasses: 'Glasses', sunglasses: 'Shades' },
    enter: 'Go inside ↗', write: 'Write ↗',
    hello: 'Hi! I’m Dverka. Move the cursor — I’ll run after it!',
    idle: ['Knock knock!', 'Creak, creak…', 'You can dress me up. Button below!', 'Every door is open. Go anywhere.', 'Watch how fast I am!', 'I love it when the windows glow.', 'There’s a castle round the corner. A real one!'],
    poke: ['Hehe, that tickles!', 'Whee!', 'Zoom!', 'Again?', 'Boing!'],
    wake: 'Oh! I wasn’t sleeping, I was thinking.',
    dress: ['How do I look?', 'Gorgeous!', 'Suits me?', 'New look!'],
    doors: {
      waka: { name: 'WakaTime', line: 'The clock counts hours. 1,758 in Java!', desc: 'How much I code and in what. Updates itself.' },
      gh: { name: 'GitHub', line: 'That’s GitHub. Grumpy, but keeps the code safe.', desc: 'Code, this README and the stats cards.' },
      spigot: { name: 'SpigotMC', line: 'Minecraft plugins in here!', desc: 'My plugins for Minecraft servers.' },
      home: { name: 'dverka.sk', line: 'And this is my home! Come in.' },
      modrinth: { name: 'Modrinth', line: 'More plugins. The green ones!', desc: 'More plugins, on Modrinth.' },
      shop: { name: 'Workshop', line: 'The workshop! All the tools live here.' },
      tg: { name: 'Telegram', line: 'Write here. I’ll pass it on!', desc: 'Message me directly. Handle is a placeholder for now.' },
    },
    home: {
      t: 'Come in, make yourself at home',
      p: 'I’m <b>DverkaSK</b>, a Java backend developer. Kafka, Kubernetes and ClickHouse by day, Minecraft plugins by night. Since 2026 I code in a pair with AI: last week 86% of my lines were AI-driven.',
      facts: [['1,758 h', 'in Java'], ['2,111 h', 'in IntelliJ IDEA'], ['213 h', 'in Claude Code'], ['86%', 'AI last week']],
      cozy: 'The owner’s cozy games: CS 1.6 and The Binding of Isaac.',
      src: 'Numbers from WakaTime, same as the README.',
    },
    shop: { t: 'Workshop', p: 'Everything I work with. Tools hang on the wall, the new ones on the right.', old: 'Before 2026', neu: 'Since 2026' },
  },
};
let lang = store.get('lang', 'ru');
const L = () => STR[lang];

const STACK_OLD = ['java', 'kotlin', 'gradle', 'git', 'maven', 'vault', 'kubernetes', 'docker', 'clickhouse', 'postgresql', 'kafka', 'rabbitmq', 'sql', 'redis', 'mongodb', 'swagger', 'openapi', 'elasticsearch', 'python', 'javascript', 'go', 'typescript', 'react'];
const STACK_NEW = ['openai', 'gemini', 'claude', 'deepseek', 'grok', 'qwen', '1c'];
const NAMES = { java: 'Java', kotlin: 'Kotlin', gradle: 'Gradle', git: 'Git', maven: 'Maven', vault: 'Vault', kubernetes: 'Kubernetes', docker: 'Docker', clickhouse: 'ClickHouse', postgresql: 'PostgreSQL', kafka: 'Kafka', rabbitmq: 'RabbitMQ', sql: 'SQL', redis: 'Redis', mongodb: 'MongoDB', swagger: 'Swagger', openapi: 'OpenAPI', elasticsearch: 'Elastic', python: 'Python', javascript: 'JavaScript', go: 'Go', typescript: 'TypeScript', react: 'React', openai: 'OpenAI', gemini: 'Gemini', claude: 'Claude', deepseek: 'DeepSeek', grok: 'Grok', qwen: 'Qwen', '1c': '1C' };

/* houses along the street: x, width, height, facade colour, roof type, door */
const HOUSES = [
  { id: 'waka', x: 0, w: 200, h: 440, col: '#56607e', roof: 'gable', door: { style: 'charcoal', w: 66, h: 118 }, url: 'https://wakatime.com/@DverkaSK', clock: true },
  { id: 'gh', x: 220, w: 210, h: 470, col: '#66796a', roof: 'step', door: { style: 'oak', w: 70, h: 122 }, url: 'https://github.com/DverkaSK', chimney: true },
  { id: 'spigot', x: 450, w: 200, h: 420, col: '#86688a', roof: 'mansard', door: { style: 'metal', w: 66, h: 118 }, url: 'https://www.spigotmc.org/members/dverkask.1954357/' },
  { id: 'home', x: 670, w: 260, h: 520, col: '#c08650', roof: 'gable', door: { style: 'home', w: 92, h: 150 }, chimney: true, cat: true },
  { id: 'modrinth', x: 950, w: 200, h: 450, col: '#5a7c86', roof: 'step', door: { style: 'green', w: 66, h: 118 }, url: 'https://modrinth.com/user/DverkaSK' },
  { id: 'shop', x: 1170, w: 210, h: 410, col: '#9a6556', roof: 'gable', door: { style: 'plank', w: 64, h: 116, off: -48 }, shopWin: true, chimney: true },
  { id: 'tg', x: 1400, w: 200, h: 460, col: '#676c9e', roof: 'mansard', door: { style: 'blue', w: 66, h: 118 }, ph: 't.me/your_handle' },
];
