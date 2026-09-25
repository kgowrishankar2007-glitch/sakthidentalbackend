# Sakthi Dental Clinic - Backend API

Production-ready REST API built with Node.js, Express, and MongoDB for the Sakthi Dental Clinic web application (Full Stack Development Internship Project).

---

## 🚀 Tech Stack
- **Runtime:** Node.js (v20+ LTS)
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose ODM (with seamless in-memory fallback for local dev & testing)
- **Security & Utilities:** CORS, Dotenv

---

## 📁 Project Structure
```
sakthi-dental-backend/
├── models/
│   ├── Appointment.js   # Mongoose model for patient appointment bookings
│   └── Contact.js       # Mongoose model for website inquiries
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
└── server.js            # Express server, routes, and database configuration
```

---

## ⚙️ Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (.env)
Create or review `.env`:
```env
PORT=5000
# For MongoDB Atlas:
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sakthiDental?retryWrites=true&w=majority
# Admin Passcode:
ADMIN_PASSWORD=sakthi@123
```

### 3. Run the Server
```bash
# Production mode
npm start

# Development mode (with auto-restart)
npm run dev
```

The server runs on: `http://localhost:5000`

---

## 📡 API Reference

### Health Check
- `GET /` - Returns API status and available endpoints.

### Appointments (`/api/appointments`)
- `POST /api/appointments` - Book a new appointment
  - **Body (JSON):**
    ```json
    {
      "patientName": "Priya",
      "email": "priya@example.com",
      "phone": "+91 9876543210",
      "doctor": "Dr. Anupriya (Founder & Dental Surgeon)",
      "treatment": "Root Canal Treatment",
      "preferredDate": "2026-10-05",
      "preferredTime": "11:00 AM",
      "notes": "Mild tooth sensitivity"
    }
    ```
- `GET /api/appointments` - Retrieve appointments (Supports query filters: `?status=Pending&doctor=Dr.+Anupriya`)
- `PATCH /api/appointments/:id` - Update status (`Pending`, `Confirmed`, `Completed`, `Cancelled`)
- `DELETE /api/appointments/:id` - Delete an appointment

### Contact Inquiries (`/api/contact`)
- `POST /api/contact` - Submit a message / inquiry
  - **Body (JSON):**
    ```json
    {
      "name": "Ramesh",
      "email": "ramesh@example.com",
      "phone": "+91 9876543210",
      "message": "Do you accept insurance?"
    }
    ```
- `GET /api/contact` - Retrieve all inquiries
- `PATCH /api/contact/:id` - Update status (`New`, `In Progress`, `Replied`, `Archived`)
- `DELETE /api/contact/:id` - Delete an inquiry

### Dashboard & Admin (`/api/stats`, `/api/admin/login`)
- `GET /api/stats` - Summary counts of total appointments, pending, confirmed, and inquiries.
- `POST /api/admin/login` - Authenticates admin passcode (`ADMIN_PASSWORD`).
