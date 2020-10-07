const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.argv.slice(2)[0];
const connectDB = require("./config/db");
const Taxi = require("./models/Taxi");
app.use(bodyParser.json());

// @route   GET /fleet
// @desc    Get fleet of taxis.
// @access  Public
app.get("/fleet", async (req, res) => {
    console.log("Returning fleet...");
    try {
        const fleet = await Taxi.find({});
        console.log(fleet);
        res.json(fleet);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// @route   POST /taxi
// @desc    Create a taxi to add to fleet.
//          POST because server sets identifier.
// @access  Public
app.post("/taxi/", async (req, res) => {
    const zip  = req.body["zip"];
    if (!zip) {
        console.log("Failed to add new taxi.");
        res.status(404).send("Please provide zip.");
    } else {
        const newTaxi = new Taxi({
            zip,
            busy: false
        });

        await newTaxi.save();
        console.log(`Added new taxi: ${newTaxi}`);
        res.status(202)
        .header({ Location: `http://localhost:${port}/taxi/${newTaxi._id}` })
        .json(newTaxi);
    }
});

// @route   POST /taxi/:id
// @desc    Update a fleet taxi's location.
// @access  Public
app.post("/taxi/:id", async (req, res) => {
    try {
        const taxiId = req.params.id;
        const { zip, busy } = req.body;
        const fields = {};

        if (zip) fields.zip = zip;
        if (busy) fields.busy = busy;

        if ((!zip) && (!busy)) {
            res.status(400).json({ msg: "Please provide fields."});
            return;
        }

        let foundTaxi = await Taxi.findOne({ _id: taxiId });
        
        if (foundTaxi) {
            // Update
            foundTaxi = await Taxi.findOneAndUpdate(
                { _id: taxiId },
                { $set : fields },
                { new: true }
            );
            res.status(202).send(foundTaxi);
        } else {
            console.log("Taxi not found.");
            res.status(400).json({ msg: "Taxi not found."});
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error.");
    }
});

// @route   POST /assignment/
// @desc    Determine if taxi from fleet can be
//          allocated to order.
// @access  Public
app.post("/assignment", async (req, res) => {
    const { id, zip } = req.body;
    console.log(`Assignment request: Order id:${id}, zip:${zip}`);

    if (!id || !zip)
    {
        console.log("Failed to service order.");
        res.status(400).send("Please provide order id and zip.");
    } else {
        // From fleet, find taxi that is not busy and 
        // that is closest to order's zip.
        // TODO: Do actual calculations. For now, allocate first non-busy taxi.
        let  allocatedTaxi = await Taxi.findOne( { busy: false });

        if (allocatedTaxi) {
            // Return success to order-ui-service.
            allocatedTaxi = await Taxi.findOneAndUpdate(
                { _id: allocatedTaxi._id },
                { $set : { busy: true }},
                { new: true }
            );
            console.log(`Taxi id: ${allocatedTaxi._id} is now busy.`);
            res.status(202).json(allocatedTaxi);

        } else {
            // Return failed to order-ui-service.
            console.log("No taxi available.");
            res.status(202).json({ msg: "No taxi available."});
        }
    }
  });

// Connect database.
connectDB();

require("../eureka/eureka-registry-helper").registerWithEureka(
  "fleet-service",
  port
);
app.listen(port);
console.log(`Taxi fleet service listening on port ${port}...`);