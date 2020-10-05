const express = require("express");
const app = express();
const axios = require('axios');
const bodyParser = require("body-parser");
const port = process.argv.slice(2)[0];
app.use(bodyParser.json())

const fleetService = "http://localhost:5001";

const taxis = [
  { id: 1, zip: "60606", assignedOrder: 0},
  { id: 2, zip: "60640", assignedOrder: 0},
  { id: 3, zip: "60666", assignedOrder: 0},
  { id: 4, zip: "60654", assignedOrder: 0}
];

// @route   GET /taxis
// @desc    Get taxis.
// @access  Public
app.get("/taxis", (req, res) => {
  console.log("Returning taxi list...");
  console.log(taxis);
  res.send(taxis);
});

// @route   POST /taxi/**
// @desc    Update a taxi car attribute.
//          If taxi car zip changes, then
//          fleet service must know.
// @access  Public
app.post("/taxi/**", async (req, res) => {
  const taxiId      = parseInt(req.params[0]);
  const foundTaxi   = taxis.find((subject) => subject.id === taxiId);
  let   zipModified = false;
  if (foundTaxi) {
    for (let attribute in foundTaxi) {
      if (req.body[attribute]) {
        let value = req.body[attribute];
        if ((attribute === "zip") && (foundTaxi.zip !== value)) {
          zipModified = true;
        }
        foundTaxi[attribute] = value;
        console.log(
          `Set ${attribute} to ${req.body[attribute]} in taxi: ${taxiId}.`
        );
      }
    }

    if (zipModified) {
      try {
        const resp = await axios.post(`${fleetService}/taxi/${taxiId}`, 
        { zip: `${foundTaxi.zip}`}, 
        {headers: { 'Content-Type': 'application/json' }});
        res
          .status(202)
          .header({ Location: `http://localhost:${port}/taxi/${foundTaxi.id}` })
          .send(foundTaxi);
        
      } catch (error) {
            console.log("Error updating fleet service.");
            res.status(404).send(error);
      }
    } else {
      res
        .status(202)
        .header({ Location: `http://localhost:${port}/taxi/${foundTaxi.id}` })
        .send(foundTaxi);
    }
  } else {
    console.log("Taxi not found.");
    res.status(404).send();
  }
});

app.listen(port);
console.log(`Taxi car service listening on port ${port}...`);

// Test data-Send taxi locations to fleet-service.
taxis.forEach( t => {
  axios.post(`${fleetService}/taxi/`, { zip: t.zip }, { headers: {'Content-Type': 'application/json'}});
});