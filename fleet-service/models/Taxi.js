const mongoose = require("mongoose");

const TaxiSchema = new mongoose.Schema({
  zip: {
    type: String,
    required: true,
  },
  busy: {
    type: Boolean,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Model name: "taxi"
module.exports = Taxi = mongoose.model("taxi", TaxiSchema, "Fleet");
