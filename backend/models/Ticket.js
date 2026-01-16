const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: Number,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    lottery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lottery",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
