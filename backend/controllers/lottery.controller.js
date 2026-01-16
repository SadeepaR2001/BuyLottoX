const Lottery = require("../models/Lottery");
const Ticket = require("../models/Ticket");
const generateTicketNumber = require("../utils/generateTicketNumber");

exports.buyTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lotteryId } = req.params;

    // 1️⃣ Find lottery
    const lottery = await Lottery.findById(lotteryId);
    if (!lottery)
      return res.status(404).json({ message: "Lottery not found" });

    // 2️⃣ Check status
    if (lottery.status !== "OPEN")
      return res.status(400).json({ message: "Lottery is not open" });

    // 3️⃣ Check availability
    if (lottery.soldTickets >= lottery.totalTickets)
      return res.status(400).json({ message: "Tickets sold out" });

    // 4️⃣ Generate unique ticket number
    let ticketNumber;
    let exists = true;

    while (exists) {
      ticketNumber = generateTicketNumber();
      exists = await Ticket.exists({ ticketNumber });
    }

    // 5️⃣ Create ticket
    const ticket = await Ticket.create({
      ticketNumber,
      user: userId,
      lottery: lotteryId
    });

    // 6️⃣ Update lottery count
    lottery.soldTickets += 1;

    // 7️⃣ Auto close if sold out
    if (lottery.soldTickets === lottery.totalTickets) {
      lottery.status = "CLOSED";
    }

    await lottery.save();

    // 8️⃣ Response
    res.status(201).json({
      message: "Ticket purchased successfully",
      ticket
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
