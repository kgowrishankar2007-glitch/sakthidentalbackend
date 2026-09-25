const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Contact = require("./models/Contact");
const Appointment = require("./models/Appointment");

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "sakthi@123";

let isMongoConnected = false;

// In-memory fallback stores for offline testing / development
let memoryContacts = [
  {
    _id: "demo-cnt-1",
    name: "Sneha Reddy",
    email: "sneha.reddy@example.com",
    phone: "+91 9845123456",
    message: "Inquiry about root canal procedure duration and charges.",
    status: "New",
    createdAt: new Date(Date.now() - 3600000 * 4)
  },
  {
    _id: "demo-cnt-2",
    name: "Rajesh Kannan",
    email: "rajesh.k@example.com",
    phone: "+91 9443211234",
    message: "Do you offer teeth whitening consultations on weekends?",
    status: "Replied",
    createdAt: new Date(Date.now() - 3600000 * 24)
  }
];

let memoryAppointments = [
  {
    _id: "demo-app-1",
    patientName: "Meenakshi Sundaram",
    email: "meenakshi.s@example.com",
    phone: "+91 9876543210",
    doctor: "Dr. Anupriya (Founder & Dental Surgeon)",
    treatment: "Root Canal Treatment",
    preferredDate: new Date(Date.now() + 86400000),
    preferredTime: "11:00 AM",
    notes: "Mild toothache on lower molar for past 3 days.",
    status: "Confirmed",
    createdAt: new Date(Date.now() - 3600000 * 2)
  },
  {
    _id: "demo-app-2",
    patientName: "Karthik Raja",
    email: "karthik.raja@example.com",
    phone: "+91 9789012345",
    doctor: "Dr. Srinivas Rohit Ramanujam (Implantologist)",
    treatment: "Dental Implants",
    preferredDate: new Date(Date.now() + 86400000 * 2),
    preferredTime: "04:30 PM",
    notes: "Consultation for single tooth replacement implant.",
    status: "Pending",
    createdAt: new Date(Date.now() - 3600000 * 8)
  }
];

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Root Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    clinic: "Sakthi Dental Clinic API",
    status: "Operational",
    database: isMongoConnected ? "MongoDB Atlas / Connected" : "Local Memory Store (Ready)",
    timestamp: new Date().toISOString(),
    endpoints: {
      contacts: "GET, POST /api/contact",
      appointments: "GET, POST, PATCH, DELETE /api/appointments",
      stats: "GET /api/stats",
      adminLogin: "POST /api/admin/login"
    }
  });
});

/* =========================================================
   CONTACT INQUIRIES API
   ========================================================= */

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message = "" } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email and phone number are required."
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    if (isMongoConnected) {
      const contact = await Contact.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        message: message.trim()
      });
      return res.status(201).json({
        success: true,
        message: "Your message has been submitted successfully.",
        data: contact
      });
    }

    // In-memory fallback
    const newContact = {
      _id: "cnt-" + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      message: message.trim(),
      status: "New",
      createdAt: new Date()
    };
    memoryContacts.unshift(newContact);

    res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully.",
      data: newContact
    });
  } catch (error) {
    console.error("Error creating contact inquiry:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to submit message." });
  }
});

app.get("/api/contact", async (req, res) => {
  try {
    if (isMongoConnected) {
      const contacts = await Contact.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: contacts.length, data: contacts });
    }
    res.json({ success: true, count: memoryContacts.length, data: memoryContacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve inquiries." });
  }
});

app.patch("/api/contact/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["New", "In Progress", "Replied", "Archived"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(", ")}`
      });
    }

    if (isMongoConnected) {
      const updated = await Contact.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      );
      if (!updated) return res.status(404).json({ success: false, message: "Inquiry not found." });
      return res.json({ success: true, message: "Contact status updated.", data: updated });
    }

    const item = memoryContacts.find(c => c._id === req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Inquiry not found." });
    item.status = status;
    res.json({ success: true, message: "Contact status updated.", data: item });
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ success: false, message: "Failed to update contact." });
  }
});

app.delete("/api/contact/:id", async (req, res) => {
  try {
    if (isMongoConnected) {
      const deleted = await Contact.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, message: "Inquiry not found." });
      return res.json({ success: true, message: "Inquiry deleted successfully." });
    }

    const idx = memoryContacts.findIndex(c => c._id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: "Inquiry not found." });
    memoryContacts.splice(idx, 1);
    res.json({ success: true, message: "Inquiry deleted successfully." });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ success: false, message: "Failed to delete contact." });
  }
});

/* =========================================================
   APPOINTMENT BOOKINGS API
   ========================================================= */

app.post("/api/appointments", async (req, res) => {
  try {
    const {
      patientName,
      email,
      phone,
      doctor,
      treatment,
      preferredDate,
      preferredTime,
      notes = ""
    } = req.body;

    if (!patientName || !email || !phone || !doctor || !treatment || !preferredDate || !preferredTime) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required appointment fields."
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    if (isMongoConnected) {
      const appointment = await Appointment.create({
        patientName: patientName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        doctor: doctor.trim(),
        treatment: treatment.trim(),
        preferredDate: new Date(preferredDate),
        preferredTime: preferredTime.trim(),
        notes: notes.trim(),
        status: "Pending"
      });

      return res.status(201).json({
        success: true,
        message: "Appointment booked successfully! Our clinic will contact you to confirm.",
        bookingId: appointment._id.toString(),
        data: appointment
      });
    }

    // In-memory fallback
    const newAppointment = {
      _id: "app-" + Date.now(),
      patientName: patientName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      doctor: doctor.trim(),
      treatment: treatment.trim(),
      preferredDate: new Date(preferredDate),
      preferredTime: preferredTime.trim(),
      notes: notes.trim(),
      status: "Pending",
      createdAt: new Date()
    };
    memoryAppointments.unshift(newAppointment);

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully! Our clinic will contact you to confirm.",
      bookingId: newAppointment._id,
      data: newAppointment
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to book appointment." });
  }
});

app.get("/api/appointments", async (req, res) => {
  try {
    const { status, doctor } = req.query;

    if (isMongoConnected) {
      const filter = {};
      if (status) filter.status = status;
      if (doctor) filter.doctor = doctor;

      const appointments = await Appointment.find(filter).sort({ preferredDate: 1, createdAt: -1 });
      return res.json({ success: true, count: appointments.length, data: appointments });
    }

    let results = [...memoryAppointments];
    if (status) results = results.filter(a => a.status.toLowerCase() === status.toLowerCase());
    if (doctor) results = results.filter(a => a.doctor.toLowerCase().includes(doctor.toLowerCase()));

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve appointments." });
  }
});

app.patch("/api/appointments/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Confirmed", "Completed", "Cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(", ")}`
      });
    }

    if (isMongoConnected) {
      const updated = await Appointment.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      );
      if (!updated) return res.status(404).json({ success: false, message: "Appointment not found." });
      return res.json({ success: true, message: `Appointment status updated to ${status}.`, data: updated });
    }

    const item = memoryAppointments.find(a => a._id === req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Appointment not found." });
    item.status = status;
    res.json({ success: true, message: `Appointment status updated to ${status}.`, data: item });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ success: false, message: "Failed to update appointment." });
  }
});

app.delete("/api/appointments/:id", async (req, res) => {
  try {
    if (isMongoConnected) {
      const deleted = await Appointment.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, message: "Appointment not found." });
      return res.json({ success: true, message: "Appointment deleted successfully." });
    }

    const idx = memoryAppointments.findIndex(a => a._id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: "Appointment not found." });
    memoryAppointments.splice(idx, 1);
    res.json({ success: true, message: "Appointment deleted successfully." });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ success: false, message: "Failed to delete appointment." });
  }
});

/* =========================================================
   DASHBOARD STATS & ADMIN AUTH API
   ========================================================= */

app.get("/api/stats", async (req, res) => {
  try {
    if (isMongoConnected) {
      const [
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        totalContacts,
        newContacts
      ] = await Promise.all([
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: "Pending" }),
        Appointment.countDocuments({ status: "Confirmed" }),
        Appointment.countDocuments({ status: "Completed" }),
        Contact.countDocuments(),
        Contact.countDocuments({ status: "New" })
      ]);

      return res.json({
        success: true,
        stats: {
          totalAppointments,
          pendingAppointments,
          confirmedAppointments,
          completedAppointments,
          totalContacts,
          newContacts
        }
      });
    }

    // In-memory stats
    const totalAppointments = memoryAppointments.length;
    const pendingAppointments = memoryAppointments.filter(a => a.status === "Pending").length;
    const confirmedAppointments = memoryAppointments.filter(a => a.status === "Confirmed").length;
    const completedAppointments = memoryAppointments.filter(a => a.status === "Completed").length;
    const totalContacts = memoryContacts.length;
    const newContacts = memoryContacts.filter(c => c.status === "New").length;

    res.json({
      success: true,
      stats: {
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        totalContacts,
        newContacts
      }
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard stats." });
  }
});

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: "Password is required." });
  }

  if (password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      message: "Admin authentication successful.",
      token: "sakthi-dental-admin-session-token"
    });
  }

  res.status(401).json({
    success: false,
    message: "Invalid admin password."
  });
});

/* =========================================================
   SERVER START & DATABASE CONNECTION
   ========================================================= */

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sakthiDental";

console.log("Connecting to MongoDB with 2.5s timeout...");

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 2500 })
  .then(() => {
    isMongoConnected = true;
    console.log("✅ MongoDB connected successfully.");
  })
  .catch((error) => {
    isMongoConnected = false;
    console.log("ℹ️ MongoDB connection not active (" + error.message + ").");
    console.log("⚡ Seamlessly using in-memory clinic datastore for instant full-stack testing.");
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Sakthi Dental Clinic Server running on http://localhost:${PORT}`);
    });
  });

module.exports = app;