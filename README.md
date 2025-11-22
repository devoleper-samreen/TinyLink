# 🔗 TinyLink - URL Shortener

A modern, full-featured URL shortener built with **Next.js 15**, **TypeScript**, **Prisma**, and **Tailwind CSS**. Create custom short links, track analytics, and manage your URLs with a beautiful, responsive interface.

---

## ✨ Features

### 🎯 Core Functionality
- **Custom Short Codes**: Create memorable links with custom 6-8 character codes
- **Random Generation**: Auto-generate unique short codes if no custom code is provided
- **Smart Redirects**: 302 redirects with automatic click tracking
- **Link Management**: Full CRUD operations - Create, Read, Update, Delete

### 📊 Analytics & Tracking
- **Click Tracking**: Real-time click count for every link
- **Last Clicked**: Track when your links were last accessed
- **Stats Dashboard**: Detailed statistics page for each link
- **Creation Timestamps**: Know exactly when each link was created

### 🎨 User Interface
- **Beautiful Design**: Clean, modern UI with Tailwind CSS
- **Fully Responsive**: Optimized for desktop, tablet, and mobile
- **Toast Notifications**: Real-time feedback for all actions
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

### 🔍 Advanced Features
- **Search & Filter**: Find links by code or target URL
- **Table Sorting**: Sort by code, URL, clicks, or last clicked
- **Copy to Clipboard**: One-click copy for short URLs
- **Custom Modals**: Beautiful confirmation dialogs
- **404 Handling**: Elegant error page for invalid links

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **PostgreSQL** database

### Installation

**Clone the repository**
   ```bash
   git clone https://github.com/devoleper-samreen/TinyLink.git
   ```
 ----  



## 📁 Project Structure

```
TinyLink/
├── app/                      # Next.js App Router
│   ├── [code]/              # Dynamic redirect route
│   │   └── route.ts         # Redirect handler
│   ├── api/                 # API routes
│   │   └── links/           # Links CRUD endpoints
│   │       ├── route.ts     # GET all, POST create
│   │       └── [code]/      # GET stats, DELETE link
│   ├── code/[code]/         # Stats page
│   │   └── page.tsx
│   ├── health/              # Health check UI
│   │   └── page.tsx
│   ├── healthz/             # Health check API
│   │   └── route.ts
│   ├── page.tsx             # Dashboard (main page)
│   └── layout.tsx           # Root layout
├── lib/
│   ├── prisma.ts            # Prisma client
│   └── utils.ts             # Utility functions
├── prisma/
│   └── schema.prisma        # Database schema
├── public/                  # Static assets
├── .env.example             # Environment template
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Reliable database


---

## 📡 API Endpoints

### Links Management

| Method   | Endpoint              | Description                    | Response       |
|----------|-----------------------|--------------------------------|----------------|
| `POST`   | `/api/links`          | Create a new short link        | `201` / `409`  |
| `GET`    | `/api/links`          | Get all links                  | `200`          |
| `GET`    | `/api/links/:code`    | Get stats for a specific link  | `200` / `404`  |
| `DELETE` | `/api/links/:code`    | Delete a link                  | `200` / `404`  |

### Redirect & Health

| Method | Endpoint      | Description                | Response      |
|--------|---------------|----------------------------|---------------|
| `GET`  | `/:code`      | Redirect to target URL     | `302` / `404` |
| `GET`  | `/healthz`    | Health check API           | `200`         |

---

## 🎯 Routes

| Path              | Description                     |
|-------------------|---------------------------------|
| `/`               | Dashboard - List all links      |
| `/code/:code`     | Stats page for a specific link  |
| `/health`         | System health UI                |
| `/healthz`        | Health check API endpoint       |
| `/:code`          | Redirect to original URL        |

---

## 💾 Database Schema

```prisma
model Link {
  id          String    @id @default(cuid())
  code        String    @unique
  targetUrl   String
  clicks      Int       @default(0)
  lastClicked DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

---

## 🔒 Validation Rules

- **Short Codes**: 6-8 alphanumeric characters `[A-Za-z0-9]{6,8}`
- **Target URLs**: Valid HTTP/HTTPS URLs only
- **Uniqueness**: Short codes are globally unique
- **Conflict Handling**: Returns `409` if code already exists

---

## 🎨 UI Features

### Dashboard
- Searchable table with all links
- Click tracking and analytics
- One-click copy to clipboard
- Sort by any column
- Add/Delete actions
- Mobile-optimized card view

### Modals
- **Add Link**: Create new short links with optional custom codes
- **Delete Confirmation**: Beautiful modal with link details
- **Click-outside-to-close**: Intuitive UX

### States
- ✅ **Empty State**: Helpful prompt to create first link
- ⏳ **Loading State**: Spinner while fetching data
- ✅ **Success State**: Toast notifications
- ❌ **Error State**: User-friendly error messages

---

## 🧪 Testing Checklist

- ✅ Create link with custom code
- ✅ Create link with random code
- ✅ Duplicate code returns 409
- ✅ Redirect increments click count
- ✅ Delete stops redirect (404)
- ✅ Search/filter works
- ✅ Table sorting works
- ✅ Mobile responsive
- ✅ Health check returns 200

---


