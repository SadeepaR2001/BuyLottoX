const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const lotteryController = require("../controllers/lottery.controller");

router.post(
  "/buy/:lotteryId",
  auth,
  lotteryController.buyTicket
);

module.exports = router;
