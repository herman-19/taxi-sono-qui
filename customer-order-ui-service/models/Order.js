const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  zip: {
    type: String,
    required: true,
  },
  assignedTaxi: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Model name: "order"
module.exports = Order = mongoose.model("order", OrderSchema, "Orders");
