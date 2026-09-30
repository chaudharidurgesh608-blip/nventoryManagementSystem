# 📦 Inventory Management System (IMS)

[![.NET 8](https://img.shields.io/badge/.NET-8.0%20LTS-purple.svg)](https://dotnet.microsoft.com/)
[![SQL Server](https://img.shields.io/badge/Database-SQL%20Server%202022-red.svg)](https://www.microsoft.com/sql-server)
[![Bootstrap](https://img.shields.io/badge/Frontend-Bootstrap%205.3-blue.svg)](https://getbootstrap.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

> A full-stack, enterprise-ready web-based **Inventory Management System** developed as a **Final Year BCA Major Project**. It streamlines warehouse inventory tracking, automates financial stock valuation, enforces negative-stock issuance prevention, and maintains a complete transaction audit trail.

---

## 🌟 Key Features

* **🏠 Public Landing Page:** Clean overview with live database statistics counter.
* **🔐 Role-Based Authentication:** ASP.NET Core Identity with PBKDF2 password hashing & JWT Bearer token authorization (`Admin` and `User` roles).
* **📊 Executive Dashboard:** Real-time metrics for total products, categories, suppliers, physical stock count, financial inventory valuation ($\sum \text{Price} \times \text{Quantity}$), and automated low-stock re-order alerts.
* **📦 Product Catalog:** Multi-field product creation with unique SKU enforcement, price formatting, and linked category/vendor relationships.
* **🔍 Search & Filtering:** Instant multi-criteria search by keyword, category, and health status (*In Stock*, *Low Stock*, *Out of Stock*).
* **🏷️ Category & Vendor Management:** Classification hierarchy and complete supplier contact directory.
* **🔄 Stock In / Stock Out Engine:** Dedicated warehouse receipt and issuance workflow with double-layer validation stopping negative inventory.
* **📜 Transaction Audit Trail:** Timestamped historical log of every stock movement including operator names and remarks.

---

## 🛠️ Technology Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3, Bootstrap Icons.
* **Backend:** ASP.NET Core 8 Web API, C#.
* **Database & ORM:** Microsoft SQL Server 2022, Entity Framework Core 8 (Code-First Approach).
* **Security:** ASP.NET Core Identity, JWT (JSON Web Tokens), CORS policy.
* **API Documentation:** Swagger / OpenAPI.

---

## 📁 Project Structure

```text
InventoryManagementSystem/
│
├── Backend/
│   └── InventoryManagement.API/
│       ├── Controllers/          # REST API endpoints (Auth, Products, Stock, etc.)
│       ├── Data/                 # ApplicationDbContext & DbInitializer
│       ├── Models/               # C# Entity Models (Product, Category, Supplier, etc.)
│       ├── DTOs/                 # Data Transfer Objects (Validation & Safe Payloads)
│       ├── Migrations/           # EF Core Database Schema Migrations
│       ├── appsettings.json      # Connection string & JWT configuration
│       └── Program.cs            # Dependency Injection & Middleware Pipeline
│
├── Frontend/
│   ├── index.html                # Public Landing Page
│   ├── login.html                # Sign In Page
│   ├── register.html             # User Registration Page
│   ├── dashboard.html            # Admin Executive Dashboard
│   ├── products.html             # Product Catalog & Management
│   ├── categories.html           # Category Management
│   ├── suppliers.html            # Supplier Directory
│   ├── stock.html                # Stock IN and Stock OUT Operations
│   ├── transactions.html         # Audit History Log
│   ├── users.html                # User & Role Management
│   ├── css/style.css             # Custom Theme Stylesheet
│   └── js/                       # Modular Client Scripts (api.js, auth.js, etc.)
│
├── Docs/
│   ├── PROJECT_REPORT.md         # Full 36-Chapter BCA Academic Project Report
│   ├── PROJECT_PRESENTATION_PPT.md # 17-Slide Presentation Structure with Scripts
│   └── VIVA_PREPARATION_GUIDE.md # 25+ Viva Q&A and Professor Demo Script
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* Windows 10 or 11 (64-bit)
* [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
* [Microsoft SQL Server 2022 Express](https://www.microsoft.com/sql-server)
* [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/sql/ssms/)
* Modern Web Browser (Chrome / Edge)

---

### Step-by-Step Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/InventoryManagementSystem.git
   cd InventoryManagementSystem
   ```

2. **Configure Database Connection:**
   Open `Backend/InventoryManagement.API/appsettings.json` and ensure the connection string points to your local SQL Server:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=InventoryManagementDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
   }
   ```

3. **Apply Database Migrations:**
   ```bash
   cd Backend/InventoryManagement.API
   dotnet ef database update
   ```
   *(This automatically creates the `InventoryManagementDb` database and all required tables in your SQL Server).*

4. **Run the Application:**
   ```bash
   dotnet run --urls "http://localhost:5177"
   ```

5. **Open in Browser:**
   * **Web Application:** `http://localhost:5177/`
   * **Swagger API Documentation:** `http://localhost:5177/swagger`

---

## 🔑 Default Credentials

For evaluation and testing, a default System Administrator account is seeded on first startup:

* **Email:** `admin@ims.com`
* **Password:** `Admin@123`
* **Role:** `Admin`

---

## 🎓 Academic Deliverables Included

This repository contains ready-to-submit documentation for college evaluation:
* **[PROJECT_REPORT.md](Docs/PROJECT_REPORT.md):** Complete 36-chapter formal report with ER diagrams, DFDs, UML diagrams, test cases, and academic references.
* **[PROJECT_PRESENTATION_PPT.md](Docs/PROJECT_PRESENTATION_PPT.md):** 17-slide presentation structure with speaking scripts.
* **[VIVA_PREPARATION_GUIDE.md](Docs/VIVA_PREPARATION_GUIDE.md):** Comprehensive technical Q&A for project defense.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
