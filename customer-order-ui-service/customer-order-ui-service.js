const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.argv.slice(2)[0];
const axios = require('axios');
app.use(bodyParser.json());

const fleetService = "http://localhost:5001";

const taxiOrders = [
    // { id: 1, zip: "60077", assignedTaxi: 0},
    // { id: 2, zip: "60637", assignedTaxi: 0},
    // { id: 3, zip: "60657", assignedTaxi: 0}
];

let orderCount = taxiOrders.length;

// @route   GET /orders
// @desc    Get list of existing orders.
// @access  Public
app.get("/orders", (req, res) => {
    console.log("Returning taxi orders...");
    console.log(taxiOrders);
    res.send(taxiOrders);
});

// @route   POST /order
// @desc    Create a taxi order.
//          POST because server sets identifier.
// @access  Public
app.post("/order/", async (req, res) => {
    const zip  = req.body["zip"];
    if (!zip) {
        console.log("Failed to add new order.");
        res.status(404).send("Please provide zip.");
    } else {
        const newOrder = {
            id: ++orderCount,
            zip,
            assignedTaxi: 0
        };

        try {
            // Send order info to fleet service to check if taxi can be assigned to order.
            const resp = await axios.post(`${fleetService}/assignment/`, 
            { id: `${newOrder.id}`, zip: `${newOrder.zip}`}, 
            {headers: { 'Content-Type': 'application/json' }});
            
            if (resp.status === 202) {
                if (!resp.data) {
                    // No taxi allocated to order.
                    taxiOrders.push(newOrder);
                    console.log(`Added new taxi order: ${JSON.stringify(newOrder)}, no taxi allocated.`);
                    res.status(202).send("Taxi order created but no taxi allocated.");
                } else {
                    // Taxi allocated to order.
                    newOrder.assignedTaxi = resp.data.id;
                    taxiOrders.push(newOrder);
                    console.log(`Added new taxi order: ${JSON.stringify(newOrder)}`);
                    res.status(202)
                    .header({ Location: `http://localhost:${port}/order/${orderCount}` })
                    .send(newOrder);
                }
            } 
        } catch (error) {
            // Error handling.
            taxiOrders.push(newOrder);
            console.log(`Added new taxi order: ${JSON.stringify(newOrder)}`);
            res.status(400).send({
                problem: `Order created but fleet service responded with issue ${error}`,
            });
        }
    }
});

app.listen(port);
console.log(`Customer order and UI service listening on port ${port}...`);