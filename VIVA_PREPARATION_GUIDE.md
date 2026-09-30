# INVENTORY MANAGEMENT SYSTEM (IMS)
## COMPREHENSIVE VIVA VOCE PREPARATION GUIDE & MODEL ANSWERS

---

### PART 1: HOW TO INTRODUCE YOUR PROJECT TO PROFESSORS (IN SIMPLE ENGLISH)

> *"Good morning respected external examiners and professors. My name is [Your Name], and I am presenting my BCA Final Year Major Project: **Inventory Management System (IMS)**.*
>
> *Our project is a full-stack, enterprise web application built using **ASP.NET Core 8 Web API** and **C#** on the backend, **Microsoft SQL Server 2022** with **Entity Framework Core 8** for data storage, and a responsive **Bootstrap 5** and **JavaScript** frontend.*
>
> *The system manages products, categories, suppliers, warehouse receipts (Stock IN), sales issuances (Stock OUT), real-time financial inventory valuation, and an immutable transaction audit log. It features automated low-stock warnings, double-layer negative-stock prevention, and role-based security using ASP.NET Core Identity and JWT tokens.*
>
> *I would be delighted to demonstrate the live working project and answer your questions."*

---

### PART 2: FREQUENTLY ASKED VIVA QUESTIONS & ANSWERS

#### 1. What is the architecture of your project?
* **Simple Answer:** It is a 3-tier Client-Server architecture: Frontend $\rightarrow$ REST Web API $\rightarrow$ Database.
* **Detailed Answer:** The presentation layer is built with HTML5, CSS3, JavaScript, and Bootstrap 5. The application layer is built using ASP.NET Core 8 Web API implementing RESTful design principles. The data access layer uses Entity Framework Core 8 Code-First ORM communicating with Microsoft SQL Server 2022.

---

#### 2. Why did you choose ASP.NET Core 8 instead of standard ASP.NET MVC or PHP?
* **Simple Answer:** ASP.NET Core 8 is modern, cross-platform, extremely fast, and standard for enterprise software.
* **Detailed Answer:** Unlike traditional ASP.NET Framework, .NET 8 is an open-source, high-performance, cross-platform framework. Developing with Web API allows us to completely decouple the backend from the frontend. The same API can serve our web frontend, a future mobile app, or external warehouse barcode scanners without rewriting business logic.

---

#### 3. What is an ORM and why use Entity Framework Core?
* **Simple Answer:** ORM stands for Object-Relational Mapper. It translates C# objects into database SQL tables automatically.
* **Detailed Answer:** EF Core eliminates the need to write repetitive raw SQL queries (`INSERT`, `UPDATE`, `SELECT`). It enables the **Code-First Approach**, where we define domain models as C# classes, and EF Core creates the schema via Migrations. Furthermore, it protects against SQL Injection attacks through automatic query parameterization.

---

#### 4. How did you create the database? Did you write SQL scripts manually?
* **Simple Answer:** No, we used Entity Framework Core Code-First Migrations.
* **Detailed Answer:** We created our Model classes (`Category`, `Supplier`, `Product`, `StockTransaction`, `ApplicationUser`) in C# and registered them in `ApplicationDbContext`. We then ran:
  1. `dotnet ef migrations add InitialCreate` (which created the migration snapshot).
  2. `dotnet ef database update` (which executed the DDL commands in SQL Server to create the database and tables).

---

#### 5. How does your system prevent negative stock?
* **Simple Answer:** By validating that `availableQuantity >= requestedQuantity` both on the client-side and server-side.
* **Detailed Answer:** In `StockController.cs`, before deducting stock in the `POST /api/stock/out` endpoint, the system checks:
  ```csharp
  if (product.Quantity < dto.Quantity) {
      return BadRequest(new { message = "Insufficient stock!" });
  }
  ```
  If requested quantity exceeds available stock, the request is rejected immediately with an HTTP 400 Bad Request error, ensuring database integrity.

---

#### 6. What is a REST API? Which HTTP methods did you use?
* **Simple Answer:** REST (Representational State Transfer) is a standard architectural style for exchanging JSON data over HTTP.
* **Detailed Answer:** We used standard HTTP verbs corresponding to CRUD actions:
  * **GET:** Retrieve records (`GET /api/products`, `GET /api/dashboard/summary`)
  * **POST:** Create new records (`POST /api/products`, `POST /api/stock/in`)
  * **PUT:** Update existing records (`PUT /api/products/{id}`)
  * **DELETE:** Delete records (`DELETE /api/products/{id}`)

---

#### 7. How does authentication and authorization work in your application?
* **Simple Answer:** Using ASP.NET Core Identity with password hashing and JSON Web Tokens (JWT).
* **Detailed Answer:** User credentials and passwords are managed by ASP.NET Core Identity, which hashes passwords using the PBKDF2 algorithm (never plain text). Upon successful login, the server generates a cryptographically signed **JSON Web Token (JWT)** containing user claims and assigned roles (`Admin` or `User`). The client browser stores this token and sends it in the `Authorization: Bearer <token>` header for protected endpoints.

---

#### 8. What is the difference between Authentication and Authorization?
* **Simple Answer:** Authentication is verifying *who you are*; Authorization is determining *what you are allowed to do*.
* **Detailed Answer:**
  * **Authentication:** Checking email and password during login to confirm the user's identity.
  * **Authorization:** Role-based permission checking (e.g., only a user with the `Admin` role is authorized to access `/users.html` or delete products).

---

#### 9. How do you calculate total inventory valuation in real-time?
* **Simple Answer:** By calculating the sum of `Price * Quantity` across all products.
* **Detailed Answer:** In `DashboardController.cs`, we use the LINQ expression:
  ```csharp
  var totalInventoryValue = products.Sum(p => p.Price * p.Quantity);
  ```
  Every time stock is added or removed, this aggregate valuation updates dynamically to give management an exact financial asset figure.

---

#### 10. How does the Low-Stock Alert system work?
* **Simple Answer:** By comparing the current `Quantity` against the product's `MinimumStockLevel`.
* **Detailed Answer:** Each product has an admin-configurable `MinimumStockLevel` (default: 5). The system evaluates:
  * If `Quantity == 0` $\rightarrow$ Status: **"Out of Stock"** (Red badge)
  * If `Quantity <= MinimumStockLevel` $\rightarrow$ Status: **"Low Stock"** (Yellow badge)
  * If `Quantity > MinimumStockLevel` $\rightarrow$ Status: **"In Stock"** (Green badge)
  These items are aggregated into the Re-Order Alerts panel on the dashboard.

---

#### 11. What is CORS and why was it configured?
* **Simple Answer:** Cross-Origin Resource Sharing is a browser security mechanism.
* **Detailed Answer:** Modern browsers restrict JavaScript from making AJAX requests to a different domain or port. Because our frontend runs in the browser while the backend API runs on port 5177, we configured CORS in `Program.cs` (`AddCors` and `UseCors("AllowAll")`) to permit the frontend to communicate with the API securely.

---

#### 12. What are Primary Keys and Foreign Keys in your database?
* **Simple Answer:** A Primary Key uniquely identifies a row in a table. A Foreign Key references a Primary Key in another table to establish a link.
* **Detailed Answer:**
  * **Primary Key:** `ProductId` in the `Products` table uniquely identifies each product.
  * **Foreign Key:** `CategoryId` in the `Products` table links to `CategoryId` in the `Categories` table. Similarly, `SupplierId` links each product to a vendor.

---

#### 13. What is Eager Loading in Entity Framework?
* **Simple Answer:** Loading related data together in a single database query.
* **Detailed Answer:** In our `ProductsController`, we use `.Include(p => p.Category).Include(p => p.Supplier)` so that Entity Framework Core generates an SQL `JOIN` query, fetching category and supplier names alongside the product details in a single efficient database roundtrip.

---

#### 14. What are DTOs and why are they used?
* **Simple Answer:** Data Transfer Objects are custom classes used to pass data between client and server without exposing internal database entities.
* **Detailed Answer:** Directly exposing EF Core database models can lead to security vulnerabilities (Over-Posting attacks) or circular reference errors during JSON serialization. DTOs (e.g., `ProductCreateUpdateDto`, `RegisterDto`) allow us to accept and return only the exact fields needed.

---

#### 15. What are the future enhancements for your project?
* **Answer:**
  1. Barcode and QR code scanner integration via camera.
  2. Automated email notifications to suppliers when stock reaches re-order level.
  3. Exporting reports to Excel and PDF formats.
  4. Multi-branch warehouse transfers.
