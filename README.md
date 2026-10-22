# deadlock_stats

Сайт со статистикой по игре **Deadlock**: таблица героев с винрейтом и пикрейтом, страница героя (контр-пики и синергии), поиск игроков, профиль игрока и табло любого матча по ID.

Все данные берутся из публичного [Deadlock API](https://api.deadlock-api.com). Своей базы данных у проекта нет: это Next.js, который ходит в чужое API, считает проценты и рисует страницы.

- Сайт: http://194.38.11.126:3000/
- Репозиторий: https://github.com/ystinlk/deadlock_stats_r
- Как всё устроено внутри (роуты, сервисы, формулы, известные проблемы): [ARCHITECTURE.md](./ARCHITECTURE.md)

## Стек

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, lucide-react.

## Быстрый старт

Нужен Node.js 20 или новее.

```bash
git clone https://github.com/ystinlk/deadlock_stats_r.git
cd deadlock_stats_r
npm install
npm run dev
```

Открой http://localhost:3000. Переменные окружения не нужны: API открытое, ключей нет.

## Команды

| Команда | Что делает |
| --- | --- |
| `npm run dev` | Режим разработки с автообновлением |
| `npm run build` | Собирает продакшен-версию в `.next/` |
| `npm start` | Запускает собранную версию (по умолчанию порт 3000) |
| `npm run lint` | Проверка кода через ESLint |

## Деплой на VPS (PM2)

Ниже типовой порядок. Сверь с тем, как у тебя реально настроено, и поправь имя процесса.

```bash
git pull
npm install
npm run build
pm2 restart deadlock-stats      # первый раз: pm2 start npm --name deadlock-stats -- start
pm2 save
```

Важно: `npm start` работает только после `npm run build`. Если забыть сборку, на сервере останется старая версия сайта.

## Структура проекта

```
app/            страницы и компоненты (роуты задаются папками)
service/        по одному файлу на каждый запрос к API
utils/api.ts    общая обёртка над fetch (таймаут + повторы)
public/         статика
```

Подробная карта страниц и сервисов лежит в [ARCHITECTURE.md](./ARCHITECTURE.md).
