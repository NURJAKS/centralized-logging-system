# JSoft Monitor

Проект представляет собой простой мониторинг ошибок с UI, сервером сбора логов и тестовым клиентом, который генерирует ошибки для демонстрации.

## Что делает проект

- Собирает ошибки и исключения из тестового сервиса `jsoft-test-client`
- Сохраняет логи в PostgreSQL через центральный бэкенд `my-project`
- Отображает логи в реальном Angular-фронтенде `jsoft-dashboard`
- Позволяет искать, удалять и просматривать детальные данные по ошибкам
- Выполняет анализ ошибки через AI-сервис на основе OpenAI
- Отправляет уведомления в Telegram при критических ошибках (HTTP 500+)

## Какую проблему решает

Этот проект решает задачу централизованного мониторинга ошибок:

- агрегирует ошибки из сервиса в единую базу данных
- помогает быстро найти проблемный запрос, стек-трейс и payload
- даёт возможность анализировать причину ошибки автоматически
- уменьшает время реакции на критические инциденты благодаря уведомлениям

## Стек технологий

- `NestJS` — бэкенд мониторинга и тестовый клиент
- `TypeORM` + `PostgreSQL` — хранение логов
- `Angular` — фронтенд для просмотра и управления логами
- `OpenAI` — анализ стэков и кода
- `Telegram Bot API` — уведомления о серьёзных ошибках
- `Docker Compose` — оркестрация сервисов

## Структура проекта

- `my-project/` — центральный сервер мониторинга
  - `src/app.module.ts` — регистрация модулей и подключение TypeORM
  - `src/logs/` — логика приёма, сохранения, удаления, телеграм-оповещений
  - `src/ai/` — логика AI-анализа ошибок
- `jsoft-dashboard/` — Angular UI
  - `src/app/app.component.ts` — загрузка логов и управление интерфейсом
  - `src/app/app.component.html` — таблица логов и панель деталей
- `jsoft-test-client/` — демо-клиент, генерирующий исключения
  - `src/jsoft-monitor.filter.ts` — глобальный фильтр ошибок
  - `src/jsoft.transport.ts` — отправка логов на бэкенд
  - `src/app.controller.ts` — примеры падений `/checkout` и `/crash-test`
- `docker-compose.yml` — поднимает `db`, `redis`, `backend`, `frontend`, `test-client`

## Переменные окружения

В корне проекта есть файл `.env`.

Обязательные переменные:

- `TG_BOT_TOKEN` — токен Telegram-бота
- `TG_CHAT_ID` — ID чата, куда отправлять оповещения
- `OPENAI_API_KEY` — ключ OpenAI для AI-анализа

Пример:

```env
TG_BOT_TOKEN=ваш_телеграм_бот_токен
TG_CHAT_ID=ваш_chat_id
OPENAI_API_KEY=ваш_openai_api_key
```

## Запуск через Docker Compose

```bash
cd /home/nurjaks/Dev/Nest-pet-project
docker-compose up --build
```

После запуска:

- `http://localhost:4200` — фронтенд мониторинга
- `http://localhost:3005` — бэкенд мониторинга
- `http://localhost:3001` — тестовый клиент
- `http://localhost:3005/api` — Swagger UI

## Локальный ручной запуск

Если хочешь запускать без Docker:

### 1. Запустить базу данных PostgreSQL

Используй локальный PostgreSQL или Docker:

```bash
docker run --name project_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=jsoft_monitor -p 5435:5432 -d postgres:15
```

### 2. Backend

```bash
cd my-project
npm install
npm run start:dev
```

### 3. Frontend

```bash
cd ../jsoft-dashboard
npm install
npm run start
```

### 4. Тестовый клиент

```bash
cd ../jsoft-test-client
npm install
npm run start:dev
```

## Основные HTTP-эндпоинты

- `POST /api/logs` — приём логов ошибки
- `GET /api/logs?page=1&limit=50` — список логов
- `POST /api/logs/delete` — удаление логов
- `POST /ai/analyze` — AI-анализ выбранной ошибки
- `POST /checkout` — пример ошибки в тестовом клиенте
- `POST /crash-test` — пример аварийного падения

## Полезные советы

- Убедись, что `.env` доступен для сервиса `backend` через Docker `env_file`.
- Если OpenAI ключ не задан, анализ вернёт заглушку.
- Telegram уведомления работают только при `statusCode >= 500`.
- `TypeORM` в `my-project` использует `synchronize: true`, поэтому схема создаётся автоматически.

## Что проверить если что-то не работает

- `backend` должен видеть переменные окружения `TG_BOT_TOKEN`, `TG_CHAT_ID`, `OPENAI_API_KEY`
- `frontend` должен обращаться на `http://localhost:3005`
- `docker-compose` должен поднимать контейнер `db` прежде чем `backend`

---

Этот README описывает назначение проекта, его архитектуру и шаги запуска.
