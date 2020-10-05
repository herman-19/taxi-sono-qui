const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.argv.slice(2)[0];
app.use(bodyParser.json());

const taxiOrders = [
    // { id: 1, zip: "60077"},
    // { id: 2, zip: "60637"},
    // { id: 3, zip: "60657"}
];

const taxis = [];

let orderCount = taxiOrders.length;
let taxiId     = taxis.length;

// @route   GET /taxiorders
// @desc    Get list of existing taxi orders.
// @access  Public
app.get("/taxiorders", (req, res) => {
    console.log("Returning taxi orders...");
    console.log(taxiOrders);
    res.send(taxiOrders);
});

// @route   GET /taxis
// @desc    Get fleet of taxis.
// @access  Public
app.get("/taxis", (req, res) => {
    console.log("Returning taxi fleet...");
    console.log(taxis);
    res.send(taxis);
});

// @route   POST /order
// @desc    Create a taxi order.
//          POST because server sets identifier.
// @access  Public
app.post("/order/", (req, res) => {
    console.log("Creating taxi order...");
    const zip  = req.body["zip"];
    if (!zip) {
        console.log("Failed to add new order.");
        res.status(404).send("Please provide zip.");
    } else {
        const newOrder = {
            id: ++orderCount,
            zip
        };

        taxiOrders.push(newOrder);
        console.log(`Added new taxi order: ${JSON.stringify(newOrder)}`);
        res.status(202)
        .header({ Location: `http://localhost:${port}/taxiorder/${orderCount}` })
        .send(newOrder);
    }
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

        taxis.push(newTaxi);
        console.log(`Added new taxi: ${JSON.stringify(newTaxi)}`);
        res.status(202)
        .header({ Location: `http://localhost:${port}/taxi/${orderCount}` })
        .send(newTaxi);
    }
});

// @route   POST /taxi/:id
// @desc    Update a fleet taxi's location.
// @access  Public
app.post("/taxi/:id", (req, res) => {
    const taxiId = parseInt(req.params.id);
    const foundTaxi = taxis.find(subject => subject.id === taxiId);
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

app.listen(port);
console.log(`Taxi fleet service listening on port ${port}...`);