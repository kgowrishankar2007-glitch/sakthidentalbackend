const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
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
    message: {
      type: String,
      default: "",
      trim: true
    },
    status: {
      type: String,
      enum: ["New", "In Progress", "Replied", "Archived"],
      default: "New"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Contact", ContactSchema);
