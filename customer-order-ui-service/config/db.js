const mongoose = require("mongoose");
const config   = require("config");
const dbURI    = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("MongoDB Connection Established...");
  } catch (err) {
    // Exit process with failure.
    console.log(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
