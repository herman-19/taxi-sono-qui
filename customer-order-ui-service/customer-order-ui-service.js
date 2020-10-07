const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.argv.slice(2)[0];
const axios = require('axios');
const connectDB = require("./config/db");
const Order = require("./models/Order");
app.use(bodyParser.json());

const fleetService = 'http://localhost:8080/fleet-service';

// @route   GET /orders
// @desc    Get list of existing orders.
// @access  Public
app.get("/orders", async (req, res) => {
    console.log("Returning taxi orders...");
    try {
        const orders = await Order.find({});
        console.log(orders);
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// @route   POST /order
// @desc    Create a taxi order.
//          POST because server sets identifier.
// @access  Public
app.post("/order/", async (req, res) => {
    const zip  = req.body["zip"];
    if (!zip) {
        console.log("Failed to add new order. Not enough information.");
        res.status(404).json({msg: "Please provide zip."});
    } else {
        const newOrder = new Order({
            zip,
            assignedTaxi: 0
        });

        try {
            // Send order info to fleet service to check if taxi can be assigned to order.
            const resp = await axios.post(`${fleetService}/assignment/`, 
            { id: `${newOrder._id}`, zip: `${newOrder.zip}`},
            {headers: { 'Content-Type': 'application/json' }});
            
            if (resp.status === 202) {
                if (!resp.data._id) {
                    // No taxi allocated to order.
                    await newOrder.save();
                    console.log(`Stored new taxi order: ${newOrder}. No taxi assigned.`);
                    res.status(202)
                    .header({ Location: `http://localhost:${port}/order/${newOrder._id}`})
                    .json({msg:"Taxi order created but no taxi assigned."});
                } else {
                    // Taxi allocated to order.
                    newOrder.assignedTaxi = resp.data._id;
                    await newOrder.save();
                    console.log(`Stored new taxi order: ${newOrder}. Taxi assigned.`);
                    res.status(202)
                    .header({ Location: `http://localhost:${port}/order/${newOrder._id}`})
                    .send(newOrder);
                }
            }
        } catch (error) {
            // Error handling.
            newOrder.save();
            console.log(`Added new taxi order: ${newOrder}. But error with fleet service.`);
            res.status(400)
            .header({ Location: `http://localhost:${port}/order/${newOrder._id}`})
            .json({
                msg: `Order created but fleet service responded with issue: ${error.response.data.msg}`,
            });
        }
    }
});

// Connect database.
connectDB();

// Add service to registry.
require("../eureka/eureka-registry-helper").registerWithEureka(
  "customer-order-ui-service",
  port
);

app.listen(port);
console.log(`Customer order and UI service listening on port ${port}...`);