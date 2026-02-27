# 🍽️ Restaurant Cafe Billing System

A full-stack Restaurant Billing System built with Spring Boot, Next.js, and PostgreSQL.

![Java](https://img.shields.io/badge/Java-25-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.2-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## 📸 Features

- 🍛 **Menu Management** — Add, edit, delete menu items with categories
- 👥 **Customer Management** — Manage customer records
- 🧾 **Billing System** — Create bills with multiple items, tax and discount
- 💵 **Payment Methods** — Cash, Card, UPI
- 🗄️ **Database** — PostgreSQL with pgAdmin support
- 🔗 **REST API** — Tested with Postman

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java + Spring Boot 4.0.2 |
| Frontend | Next.js 15 + TypeScript |
| Database | PostgreSQL 16 |
| ORM | Hibernate / Spring Data JPA |
| Styling | Tailwind CSS |
| API Testing | Postman |
| Version Control | GitHub |

---

## 📁 Project Structure
```
restaurant-billing/
├── billing/                          # Spring Boot Backend
│   └── src/main/java/com/resturant/billing/
│       ├── controller/
│       │   ├── MenuController.java
│       │   ├── CustomerController.java
│       │   └── OrderController.java
│       ├── model/
│       │   ├── MenuItem.java
│       │   ├── Customer.java
│       │   ├── Order.java
│       │   └── OrderItem.java
│       ├── repository/
│       │   ├── MenuItemRepository.java
│       │   ├── CustomerRepository.java
│       │   └── OrderRepository.java
│       └── BillingApplication.java
│
├── frontend/                         # Next.js Frontend
│   └── app/
│       ├── page.tsx                  # Dashboard
│       ├── menu/page.tsx             # Menu Management
│       ├── customers/page.tsx        # Customer Management
│       └── billing/page.tsx          # Billing & Invoice
│
└── README.md
```

---

## 🗄️ Database Schema
```sql
users        → Staff and Admin accounts
menu_items   → Food and Beverage items
customers    → Customer records
orders       → Bills and Invoices
order_items  → Items inside each bill
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 16
- Maven

### 1️⃣ Database Setup
```bash
psql postgres
CREATE DATABASE restaurant_billing;
```

### 2️⃣ Backend Setup
```bash
cd billing
./mvnw spring-boot:run
```
Backend runs on: `http://localhost:8080`

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000`

---

## 🌐 API Endpoints

### Menu
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get all menu items |
| POST | `/api/menu` | Add new menu item |
| PUT | `/api/menu/{id}` | Update menu item |
| DELETE | `/api/menu/{id}` | Delete menu item |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | Get all customers |
| POST | `/api/customers` | Add new customer |
| PUT | `/api/customers/{id}` | Update customer |
| DELETE | `/api/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders |
| POST | `/api/orders` | Create new bill |

---

## 🧪 Postman Examples

### Add Menu Item
```json
POST http://localhost:8080/api/menu
{
  "name": "Masala Dosa",
  "description": "Crispy dosa with chutney",
  "price": 80.00,
  "category": "Main Course",
  "available": true
}
```

### Create Bill
```json
POST http://localhost:8080/api/orders
{
  "customerId": 1,
  "tableNumber": 5,
  "paymentMethod": "cash",
  "discount": 20.00,
  "items": [
    { "menuItemId": 1, "quantity": 2 },
    { "menuItemId": 3, "quantity": 1 }
  ]
}
```

---

## 📱 Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/` | Home with navigation |
| Menu | `/menu` | Manage food items |
| Customers | `/customers` | Manage customers |
| Billing | `/billing` | Create bills and invoices |

---

## 👨‍💻 Developer

**W.A. Paramith Kavisha**
- GitHub: [@Paramith2004](https://github.com/Paramith2004)

---

## 📄 License

This project is for educational purposes.
