const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"]
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true
    },
    doctor: {
      type: String,
      required: [true, "Doctor selection is required"],
      trim: true
    },
    treatment: {
      type: String,
      required: [true, "Treatment selection is required"],
      trim: true
    },
    preferredDate: {
      type: Date,
      required: [true, "Preferred appointment date is required"]
    },
    preferredTime: {
      type: String,
      required: [true, "Preferred appointment time is required"],
      trim: true
    },
    notes: {
      type: String,
      default: "",
      trim: true
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Appointment", AppointmentSchema);
