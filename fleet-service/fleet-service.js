const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.argv.slice(2)[0];
app.use(bodyParser.json());

const fleet  = [
    // { id: 1, zip: "60606", busy: false},
    // { id: 2, zip: "60619", busy: false}
];
let taxiId = fleet.length;

// @route   GET /fleet
// @desc    Get fleet of taxis.
// @access  Public
app.get("/fleet", (req, res) => {
    console.log("Returning taxi fleet...");
    console.log(fleet);
    res.send(fleet);
});

// @route   POST /taxi
// @desc    Create a taxi to add to fleet.
//          POST because server sets identifier.
// @access  Public
app.post("/taxi/", (req, res) => {
    const zip  = req.body["zip"];
    if (!zip) {
        console.log("Failed to add new taxi.");
        res.status(404).send("Please provide zip.");
    } else {
        const newTaxi = {
            id: ++taxiId,
            zip,
            busy: false
        };

        fleet.push(newTaxi);
        console.log(`Added new taxi: ${JSON.stringify(newTaxi)}`);
        res.status(202)
        .header({ Location: `http://localhost:${port}/taxi/${taxiId}` })
        .send(newTaxi);
    }
});

// @route   POST /taxi/:id
// @desc    Update a fleet taxi's location.
// @access  Public
app.post("/taxi/:id", (req, res) => {
    const taxiId = parseInt(req.params.id);
    const foundTaxi = fleet.find(subject => subject.id === taxiId);
    if (foundTaxi) {
        for (let attribute in foundTaxi) {
            if (req.body[attribute]) {
              foundTaxi[attribute] = req.body[attribute];
              console.log(
                `Updated ${attribute} to ${req.body[attribute]} in taxi: ${taxiId}.`
              );
            }
        }
        res.status(202).send();
    } else {
        console.log("Taxi order not found.");
        res.status(404).send();
    }
});

// @route   POST /assignment/
// @desc    Determine if taxi from fleet can be
//          allocated to order.
// @access  Public
app.post("/assignment", (req, res) => {
    const orderId  = req.body["id"];
    const orderZip = req.body["zip"];

    console.log(`Assignment request: id:${orderId}, zip:${orderZip}`);

    if (!orderId || !orderZip)
    {
        console.log("Failed to service order.");
        res.status(404).send("Please provide order id and zip.");
    } else {
        // From fleet, find taxi that is not busy and 
        // that is closest to order's zip.
        // TODO: Do actual calculations. For now, allocate first non-busy taxi.
        let  allocatedTaxi;
        for (let i in fleet) {
            let taxi = fleet[i];
            if (!taxi.busy) {
                taxi.busy = true;
                allocatedTaxi = taxi;
                break;
            }
        }

        if (allocatedTaxi) {
            // Return success to order-ui-service.
            console.log(`Taxi id: ${allocatedTaxi.id} is now busy.`);
            res.status(202).send(JSON.stringify(allocatedTaxi));

        } else {
            // Return failed to order-ui-service.
            console.log("No taxi available.");
            res.status(202).send();
        }
    }
  });

app.listen(port);
console.log(`Taxi fleet service listening on port ${port}...`);