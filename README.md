# 🏟️ SportNest - Smart Sport Club Management System

**SportNest** is a comprehensive web application designed to digitize operations for modern sports clubs. This repository focuses on the **Attendance, Salary, and Feedback Management** modules, built using the **MERN Stack**.

It streamlines administrative tasks such as automated salary calculations based on attendance, PDF report generation, and facilitates instant communication between coaches and players via email notifications.

---

## 💻 Tech Stack

*   **Frontend:** React (Vite), TailwindCSS, shadcn/ui, React Router, Axios
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB, Mongoose
*   **Authentication:** JWT (Role-Based: Admin, Coach, Member, Player)
*   **Services:** Nodemailer (Email Notifications), PDF Generation

---

## ✨ Key Features

### 1. 📅 Attendance & Salary Management (Automated)
*   **Coach Attendance:** Coaches can mark attendance, which is then verified (Approved/Rejected) by the Admin.
*   **Automated Salary Calculation:** System automatically calculates monthly salaries based on approved attendance, basic salary, and allowances.
*   **Admin Controls:** Admins can update basic salaries and manage payroll records.
*   **Reporting:** Generate and **download Salary Reports as PDFs**.

### 2. 💬 Feedback & Notification System
*   **Coach-to-Player Feedback:** Coaches can provide performance feedback to players.
*   **Instant Notifications:** Players receive an **automatic email** via Nodemailer immediately after receiving feedback.

### 3. ⭐ Member Reviews & Content Moderation
*   **User Reviews:** Members can write reviews about the club.
*   **Approval Workflow:** Reviews are submitted to the Admin dashboard. Only **Admin-approved reviews** are published to the Home Page for public viewing.

---

## 👥 Role-Based Access Control

The system implements secure JWT authentication for different user roles:
*   **Admin:** Full control over Salaries, Attendance approval, and Review moderation.
*   **Coach:** Mark attendance, Send feedback to players.
*   **Member:** Submit club reviews.

---


## 🤝 Contribution

This module was developed by **Yomali Senevirathne** as part of the SportNest group project.
*   **Focus Areas:** Salary Logic, Attendance Tracking, Feedback System, Email Services.

---
*SportNest - Elevating Sports Management* 🏆
