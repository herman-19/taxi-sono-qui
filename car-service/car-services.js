const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const port = process.argv.slice(2)[0];
app.use(bodyParser.json());

const taxis = [
  { id: 1, zip: "60606", name: "Yellow Cab", offduty: false, occupied: false },
  { id: 2, zip: "60640", name: "Flash Cab", offduty: false, occupied: false },
  { id: 3, zip: "60666", name: "O'Hare Taxi", offduty: false, occupied: false },
  { id: 4, zip: "60654", name: "City Taxi", offduty: false, occupied: false },
];

app.get("/taxis", (req, res) => {
  console.log("Returning taxi list...");
  res.send(taxis);
});

app.post("/taxi/**", (req, res) => {
  const taxiId = parseInt(req.params[0]);
  const foundTaxi = taxis.find((subject) => subject.id === taxiId);
  if (foundTaxi) {
    for (let attribute in foundTaxi) {
      if (req.body[attribute]) {
        foundTaxi[attribute] = req.body[attribute];
        console.log(
          `Set ${attribute} to ${req.body[attribute]} in taxi: ${taxiId}.`
        );
      }
    }
    res
      .status(202)
      .header({ Location: `http://localhost:${port}/taxi/${foundTaxi.id}` })
      .send(foundTaxi);
  } else {
    console.log("Taxi not found.");
    res.status(404).send();
  }
});

app.listen(port);
console.log(`Taxi car service listening on port ${port}...`);
