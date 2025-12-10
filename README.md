# Smart Sports Club Management System (SportNest)

SportNest is a comprehensive, full-stack MERN application designed to streamline the operations of a modern sports club. It provides a digital platform for managing memberships, sponsorships, finances, and deliveries. This document specifically details the advanced features of the **Events Management** and **Training Sessions** modules.

## ✨ Key Features

### 📅 Events Management Module
This module provides a complete lifecycle for managing club events, from submission by members to approval by admins and registration by the public.

*   **Role-Based Access Control (RBAC):** A secure system where Admins have full control, while Members can only submit, view, and manage their own non-approved events.
*   **Automated Email Notifications:** Using a utility built with `nodemailer`, the system automatically sends emails to members when their submitted event is `approved` or `rejected`, ensuring seamless communication.
*   **Advanced Reporting & Data Export:** An admin-facing reporting dashboard, powered by the **MongoDB Aggregation Pipeline**, provides key metrics and data visualizations. Admins can export these reports as professionally formatted **PDF** (`pdfkit`) or **CSV** (`json2csv`) files.
*   **Robust Server-Side Validation:** The Mongoose model includes `pre('validate')` hooks to enforce critical business rules, such as preventing events from being scheduled in the past or ensuring end times are after start times.

### 🏋️‍♂️ Training Sessions Module
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

## ⚙️ API Endpoints

The system follows a RESTful API structure. Here are some key endpoints for these modules:

| Method | Endpoint                       | Description                               | Access       |
| :----- | :----------------------------- | :---------------------------------------- | :----------- |
| `POST` | `/api/events/submit`           | A member submits a new event.             | Member       |
| `PATCH`| `/api/events/:id/approve`      | An admin approves a pending event.        | Admin        |
| `GET`  | `/api/events/report/summary`   | Fetches aggregated data for the report.   | Admin        |
| `POST` | `/api/trainings`               | A coach creates a new training session.   | Coach        |
| `DELETE`| `/api/trainings/:id`          | A coach deletes their own session.        | Coach (Owner)|
| `POST` | `/api/trainings/:id/register`  | A player registers for a session.         | Player       |
