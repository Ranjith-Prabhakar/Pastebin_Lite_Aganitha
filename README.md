# Pastebin Lite

Pastebin Lite is a lightweight paste-sharing application built using **Next.js**, **PostgreSQL**, and **Neon DB**.

It allows users to create and share text or rich-text pastes via unique URLs, with optional **expiration time** and **view limits**.

The application focuses on simplicity, performance, and security, making it ideal for quickly sharing code snippets, notes, or formatted text without authentication.

## 🔄 System Workflow

The workflow of **Pastebin Lite** is designed to securely create, store, and serve shared pastes with optional expiration and view limits:

1. The frontend allows users to create a new paste using plain text or rich-text (TipTap editor).
2. On submission, a `POST` request is sent to the backend API with:
   - Paste content
   - Optional expiration timestamp
   - Optional maximum view count
3. The backend validates the request and stores the paste in **PostgreSQL (Neon DB)** with:
   - A unique UUID
   - `view_count` initialized to `0`
   - Optional `expires_at` and `max_views`
4. A unique shareable URL (`/p/[id]`) is generated.
5. When the shared link is opened:
   - The backend performs an **atomic SQL operation** to:
     - Check expiration
     - Check remaining views
     - Increment `view_count`
6. If the paste is expired or exceeds the view limit, a **404 Not Found** response is returned.
7. If valid, the paste is rendered in **read-only rich-text mode**, preserving formatting such as lists, tables, links, and code blocks.
8. Once expired or exhausted, the paste becomes permanently inaccessible.

## 🛠️ Tech Stack

- **Next.js (App Router)** – Full-stack React framework
- **PostgreSQL** – Relational database
- **Neon DB** – Serverless PostgreSQL hosting
- **TipTap** – Rich-text editor
- **Tailwind CSS** – UI styling
- **JavaScript** – Core application logic

## 🚀 Running Locally

### ✅ Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL database** (local or Neon DB)

---

### 🔧 Installation & Setup

1. **Clone the repository**

   ```bash
   https://github.com/Ranjith-Prabhakar/Pastebin_Lite_Aganitha
   cd Pastebin_Lite_Aganitha
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file:

   ```bash
    DATABASE_URL=postgresql://<username>:<password>@<host>/<dbname>
    TEST_MODE=1
    HOST = <host> eg:http://localhost:3000
   ```

### 🌐 REST Endpoint

1.  **Health check:** this end point will check the health of the server and database.

    - **Endpoint:** `GET /api/healthz`
    - **Content-Type:** `application/json`
    - **Example Response Body:**

      ```json
      { "ok": true }
      ```

2.  **Create a paste:** use to create new pastes

    - **Endpoint:** `POST /api/pastes`
    - **Content-Type:** `application/json`
    - **Example Request Body:**

      ```json
      {
        "content": "string",
        "ttl_seconds": 60,
        "max_views": 5
      }
      ```

    - **Example Response Body:**

      ```json
      {
        "id": "string",
        "url": "https://your-host/p/<id>"
      }
      ```

3.  **Fetch a paste (API):** use to get a paste in json format

    - **Endpoint:** `GET /api/pastes/:id`
    - **Content-Type:** `application/json`
    - **Example Response Body:**

      ```json
      {
        "content": "string",
        "remaining_views": 4,
        "expires_at": "2026-01-01T00:00:00.000Z"
      }
      ```

4.  **View a paste (HTML):** use to get a paste in html format

    - **Endpoint:** `GET /p/:id`
    - **Content-Type:** `text/html`
    - **Example Response Body:** html page

## 🌍 Deployment

- This service is currently deployed at `https://pastebin-lite-aganitha-tan.vercel.app/`
