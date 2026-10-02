# Canteen Management System

Frontend prototype for a college canteen management system.

## Pages
- `index.html` — landing page
- `login.html` — demo login
- `student.html` — student dashboard
- `student-menu.html` — student food menu and cart
- `student-orders.html` — student order history
- `staff.html` — staff dashboard
- `staff-orders.html` — staff order management
- `staff-menu.html` — staff menu management
- `staff-stock.html` — staff inventory

## Run
Open the project in VS Code and use Live Server on `index.html`.

## Important
This version is frontend-only. Login, orders, stock and menu changes are demo interactions using JavaScript/localStorage. A backend and MySQL database can be connected later.

## New live-order features
- Staff gets an in-app notification when a student places an order.
- Students get an in-app notification when staff changes the order to Ready.
- Every order receives a unique student-linked token such as `VAT-482`.
- Estimated wait time is calculated from the active queue and item preparation time.
- Staff can update order status from Pending → Preparing → Ready → Completed.
- Student order tracking shows token, items, amount, status and estimated wait.
- The prototype synchronizes through `localStorage` and the browser `storage` event. A real multi-device deployment should move notifications/orders to a Node.js + MySQL backend (and WebSocket/SSE or push notifications) later.

## Super Admin & Analytics
- Super Admin login: `admin` / `admin123`
- Staff demo: `staff` / `staff123`
- Super Admin dashboard: `super-admin.html`
- Revenue periods: today, week, month, 6 months, year, all time
- Food-wise quantity/revenue analytics
- Completed/cancelled order statistics
- Staff account management
- Stock management with low-stock status
- Frontend prototype uses localStorage; Node.js + MySQL should replace this for production.
