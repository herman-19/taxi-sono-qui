const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.argv.slice(2)[0];
app.use(bodyParser.json());

const carService = "http://localhost:5000/";

const taxiOrders = [
    { id: 1, zip: "60077", location: "Skokie", assignedTaxi: 0 },
    { id: 2, zip: "60637", location: "Washington Park", assignedTaxi: 0 },
    { id: 3, zip: "60657", location: "Lakeview East", assignedTaxi: 0}
];
let orderCount = taxiOrders.length;

// @route   GET /taxiorders
// @desc    Get list of existing taxi orders.
// @access  Public
app.get("/taxiorders", (req, res) => {
    console.log("Returning taxi orders...");
    res.send(taxiOrders);
});

// @route   GET /taxiorder/:id
// @desc    Get existing taxi order.
// @access  Public
app.get("/taxiorder/:id", (req, res) => {
    const orderId = parseInt(req.params.id);
    const foundOrder = taxiOrders.find(subject => subject.id === orderId);
    if (foundOrder) {
        console.log(`Returning taxi order ${orderId}...`);
        res.status(202).send(foundOrder);
    } else {
        console.log("Taxi order not found.");
        res.status(404).send();
    }
});

// @route   POST /order
// @desc    Create a taxi order.
//          POST because server sets identifier.
// @access  Public
app.post("/order/", (req, res) => {
    console.log("Creating taxi order...");
    const { zip, location } = req.body;
    if (!zip || !location) {
        console.log("Failed to add new order.");
        res.status(404).send("Please provide zip and location.");
    } else {
        const newOrder = {
            id: ++orderCount,
            zip,
            location,
            assignedTaxi: 0
        };

        taxiOrders.push(newOrder);
        console.log(`Added new taxi order: ${JSON.stringify(newOrder)}`);
        res.status(202)
        .header({ Location: `http://localhost:${port}/taxiorder/${orderCount}` })
        .send(newOrder);
    }
});

// @route   POST /order/:id
// @desc    Update a taxi order.
// @access  Public
app.post("/order/:id", (req, res) => {
    const orderId = parseInt(req.params.id);
    const foundOrder = taxiOrders.find(subject => subject.id === orderId);
    if (foundOrder) {
        for (let attribute in foundOrder) {
            if (req.body[attribute]) {
              foundOrder[attribute] = req.body[attribute];
              console.log(
                `Set ${attribute} to ${req.body[attribute]} in order: ${orderId}.`
              );
            }
        }
        res.status(202)
        .header({ Location: `http://localhost:${port}/taxiorder/${foundOrder.id}` })
        .send(foundOrder);
    } else {
        console.log("Taxi order not found.");
        res.status(404).send();
    }
});

app.listen(port);
console.log(`Taxi fleet service listening on port ${port}...`);