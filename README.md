SportNest — Sports Club Management Platform.

A full-stack web app for managing a sports club:
memberships, sports/events, training sessions, shop & inventory, orders, payments, reviews, sponsorships, suppliers and more.
Built with React + Vite on the frontend and Node.js + Express + MongoDB on the backend.



Features
	•	🔐 Member & Admin authentication (JWT)
	•	👥 Membership plans (student / ordinary / lifetime) + plan confirmation flow
	•	🏅 Sports catalog & registration UI
	•	📅 Events (approved, mine) & quick registration, trainings with registration
	•	🛒 Shop items, inventory, preorders & suppliers
	•	🧺 Cart, checkout, shipping order handler
	•	💳 Saved payment methods (default, update, delete)
	•	⭐ Member reviews (featured), emerald/glass UI
	•	🤝 Sponsorship application + PDF details
	•	📊 Admin dashboards (members by plan/status, exports)



Tech Stack

Frontend
	•	React (Vite), React Router
	•	TailwindCSS (+ shadcn/ui, react-icons)
	•	Axios

Backend
	•	Node.js, Express
	•	MongoDB, Mongoose
	•	JWT auth (member/admin)
	•	Nodemailer (emails) (optional)


SportNest/
├── Backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
└── Frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── context/
    │   ├── api/ (services)
    │   └── main.jsx
    ├── index.html
    └── package.json


Membership Plans
	•	GET /members/membership-plans → list plans
	•	(Frontend route) /confirm-membership/:planName → confirmation flow

⸻

Sports
	•	GET /sports → list sports
	•	GET /sports/:id → details
	•	POST /sports (admin) → create
	•	PUT /sports/:id (admin) → update
	•	DELETE /sports/:id (admin) → delete

⸻

### 📅 Events Management Module  Branch - Sujan_lakdin
This module provides a complete lifecycle for managing club events, from submission by members to approval by admins and registration by the public.

*   **Role-Based Access Control (RBAC):** A secure system where Admins have full control, while Members can only submit, view, and manage their own non-approved events.
*   **Automated Email Notifications:** Using a utility built with `nodemailer`, the system automatically sends emails to members when their submitted event is `approved` or `rejected`, ensuring seamless communication.
*   **Advanced Reporting & Data Export:** An admin-facing reporting dashboard, powered by the **MongoDB Aggregation Pipeline**, provides key metrics and data visualizations. Admins can export these reports as professionally formatted **PDF** (`pdfkit`) or **CSV** (`json2csv`) files.
*   **Robust Server-Side Validation:** The Mongoose model includes `pre('validate')` hooks to enforce critical business rules, such as preventing events from being scheduled in the past or ensuring end times are after start times.

### 🏋️‍♂️ Training Sessions Module  Branch - Sujan_lakdin
This module offers an intuitive and error-proof system for coaches to manage their training schedules and for players to register.

*   **Automatic Scheduling Conflict Prevention (Core Feature):** This is the module's most critical feature. A `pre('save')` Mongoose middleware runs before any session is saved. It performs a database-level check to see if another session already exists at the **same venue, on the same date, and with an overlapping time**. This makes scheduling conflicts **impossible**, guaranteeing a reliable schedule.
*   **Interactive Calendar UI for Coaches:** Built using `react-big-calendar`, this interface allows coaches to visually create, view, and manage their schedules. They can create new sessions by simply clicking and dragging on a time slot.
*   **Strict Ownership Control:** The backend ensures that a coach can only update or delete the sessions they have personally created, preventing unauthorized modifications.
*   **Client-Side PDF Report Generation:** Coaches can instantly generate and download a PDF report of their schedule directly from the browser, powered by `jsPDF` and `jspdf-autotable`.

## 🛠️ Technologies Used

*   **Frontend:** React, React Router, Axios, TailwindCSS
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB with Mongoose
*   **Authentication:** JSON Web Tokens (JWT)
*   **Key Libraries:**
    *   `react-big-calendar` (for the interactive training scheduler)
    *   `recharts` (for data visualization in reports)
    *   `pdfkit` & `jsPDF` (for PDF generation)
    *   `json2csv` (for CSV export)
    *   `nodemailer` (for sending automated emails)

## ⚙️ API Endpoints Branch - Sujan_lakdin

The system follows a RESTful API structure. Here are some key endpoints for these modules:

| Method | Endpoint                       | Description                               | Access       |
| :----- | :----------------------------- | :---------------------------------------- | :----------- |
| `POST` | `/api/events/submit`           | A member submits a new event.             | Member       |
| `PATCH`| `/api/events/:id/approve`      | An admin approves a pending event.        | Admin        |
| `GET`  | `/api/events/report/summary`   | Fetches aggregated data for the report.   | Admin        |
| `POST` | `/api/trainings`               | A coach creates a new training session.   | Coach        |
| `DELETE`| `/api/trainings/:id`          | A coach deletes their own session.        | Coach (Owner)|
| `POST` | `/api/trainings/:id/register`  | A player registers for a session.         | Player       |
⸻

Shop / Inventory / Suppliers / Preorders

Items/Inventory
	•	GET /items → list
	•	POST /items (admin) → create
	•	PUT /items/:id (admin) → update
	•	DELETE /items/:id (admin) → delete

Suppliers
	•	GET /suppliers
	•	POST /suppliers (admin)
	•	PUT /suppliers/:id (admin)
	•	DELETE /suppliers/:id (admin)
Validation note: supplier phone is digits-only (10).

Preorders
	•	GET /preorders
	•	PUT /preorders/:id/status (admin)
Body:
	•	Always: { "status": "received" }
	•	Supplements/consumables only: add { "expiryDate": "YYYY-MM-DD" }
(expiry required is conditional by item type)

⸻

Cart & Orders (Shipping/Checkout)

Cart (auth)
	•	GET /cart → get my cart
	•	POST /cart/add → add to cart
Body (safe shape):
{ "itemId": "<ObjectId>", "productId": "<ObjectId>", "quantity": 1 }
	•	PUT /cart/:cartItemId → update line quantity
Body: { "quantity": 2 }
	•	DELETE /cart/:cartItemId → remove line

Backend expects req.user._id. If you see
“Cart validation failed: userId is required”, ensure:
	•	route is protected: router.use(protect)
	•	frontend sends auth header
	•	send both itemId and productId (if controller maps either)

Checkout / Shipping
	•	POST /shipping/process (auth) → create order / process shipping
Recommended payload shape:

Payment Methods

Model fields: userId, type, cardName, cardNumber, expiryMonth, expiryYear, isDefault, isActive

Routes (auth) (/api/payments)
	•	GET   /methods → list my active methods (mask in responses)
	•	POST  /methods → save method
	•	PUT   /methods/:methodId → update method
	•	PUT   /methods/:methodId/default → set default
	•	DELETE /methods/:methodId → delete (or soft-delete)

Controller tip: derive user id with
const userId = req.user?._id || req.user?.id;

⸻

Reviews
	•	GET /reviews/featured → featured list
	•	POST /reviews (auth) → create/update my review
Body: { "title":"...", "message":"...", "rating": 1..5 }
	•	PUT /reviews/:id (auth), DELETE /reviews/:id (auth/admin)

Frontend page ReviewsPage.jsx uses a glass/emerald UI and a MyReview form.

⸻

Sponsorships
	•	POST /sponsorships → submit application
Body includes: contact details, organization, plan, dates, terms
	•	GET /sponsorships/:id (token) → view/manage (if implemented)

UI includes a PDF download of sponsorship details.


License

This project is licensed under the MIT License.
© SportNest contributors.




  
