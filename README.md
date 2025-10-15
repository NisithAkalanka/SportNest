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

Events & Trainings
	•	GET /events/approved → public list
	•	GET /events/mine (auth) → my events
	•	POST /events (auth/admin) → submit/create
	•	GET /events/:id → details
	•	PUT /events/:id (admin) → update
	•	DELETE /events/:id (admin) → delete

Trainings
	•	GET /trainings → list
	•	POST /trainings/:id/register (auth) → register
Body: {} (or registration data as required)

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




  
