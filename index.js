const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ejds7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  jwt.sign(
    { foo: "bar" },
    process.env.ACCESS_TOKEN,
    { algorithm: "RS256" },
    function (err, token) {
      console.log(token);
    }
  );
}
verifyJWT();

async function run() {
  try {
    await client.connect();
    const partCollection = client.db("mars_technology").collection("parts");
    const orderCollection = client.db("mars_technology").collection("orders");

    // GET
    app.get("/parts", async (req, res) => {
      const parts = await partCollection.find({}).toArray();
      res.send(parts);
    });

    app.get("/parts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await partCollection.findOne(query);
      res.send(result);
    });

    app.get("/myOrder/:email", async (req, res) => {
      const email = req.params.email;
      const result = await orderCollection.find({ email: email }).toArray();
      res.send(result);
    });

    // POST
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    // DELETE
    app.delete("/myOrder/:id", async (req, res) => {
      const id = req.params.id;
      const result = await orderCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Mars tech server running");
});

app.listen(port, (req, res) => {
  console.log("listening", port);
});
