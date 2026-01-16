const mongoose = require("mongoose");

const lotterySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    prizeType: {
      type: String,
      required: true   // TV, MOBILE, BIKE
    },
    ticketPrice: {
      type: Number,
      required: true
    },
    totalTickets: {
      type: Number,
      required: true
    },
    soldTickets: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "DRAWN"],
      default: "OPEN"
    },
    winnerTicket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lottery", lotterySchema);
