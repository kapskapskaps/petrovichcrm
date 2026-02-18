# 🛠️ PetrovichCRM

**PetrovichCRM** — это современная система управления отношениями с клиентами, построенная на передовом стеке технологий. Проект полностью контейнеризирован и готов к развертыванию.

## 🚀 Стек технологий

| Слой | Технология |
| :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org/) (React, Tailwind CSS) |
| **Backend** | [NestJS](https://nestjs.com/) (Node.js) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **База данных** | [PostgreSQL](https://www.postgresql.org/) |
| **Инфраструктура** | [Docker](https://www.docker.com/), Docker Compose |

---

## 📂 Структура проекта

*   `backend/` — API-сервер на NestJS.
*   `frontend/` — Пользовательский интерфейс на Next.js.
*   `docker-compose.yml` — Описание сервисов и их связей.

---

## ⚙️ Настройка окружения

Создайте файл `.env` в корневой директории проекта:

```env
# Database
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=petrovich_crm

# JWT & API Secrets
JWT_SECRET=super_secret_key
```

> **Примечание:** Для работы Frontend в режиме Docker убедитесь, что в `frontend/next.config.js` добавлена настройка:
> ```js
> module.exports = { output: 'standalone' }
> ```

---

## 🛠️ Быстрый запуск

1.  **Клонируйте репозиторий**:
    ```bash
    git clone https://github.com/your-repo/petrovich-crm.git
    cd petrovich-crm
    ```

2.  **Запустите контейнеры**:
    ```bash
    docker-compose up -d --build
    ```

3.  **Примените миграции базы данных**:
    ```bash
    docker exec -it petrovich-api npx prisma migrate deploy
    ```

---

## 🔍 Полезные команды

*   **Просмотр логов**:
    ```bash
    docker-compose logs -f
    ```
*   **Остановка проекта**:
    ```bash
    docker-compose down
    ```
*   **Доступ к Prisma Studio** (локально):
    Внутри папки `backend` выполните `npx prisma studio` (потребуется проброс портов).

## 🌐 Доступ к приложению

*   **Frontend**: [http://localhost:3001](http://localhost:3001)
*   **Backend API**: [http://localhost:3000](http://localhost:3000)
*   **PostgreSQL**: `localhost:5432`

---
🎨 *Разработано с душой для эффективного бизнеса.*
