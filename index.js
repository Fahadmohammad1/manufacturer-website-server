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
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const partCollection = client.db("mars_technology").collection("parts");
    const orderCollection = client.db("mars_technology").collection("orders");
    const userCollection = client.db("mars_technology").collection("users");
    const reviewCollection = client.db("mars_technology").collection("reviews");

    //===================== GET ======================
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

    app.get("/myOrder/order/:id", async (req, res) => {
      const id = req.params.id;
      const order = await orderCollection.findOne({ _id: ObjectId(id) });
      res.send(order);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const user = await userCollection.findOne({ email: email });
      res.send(user);
    });

    //============== POST ======================
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    //=============== DELETE ====================
    app.delete("/myOrder/:id", async (req, res) => {
      const id = req.params.id;
      const result = await orderCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });

    //=============== PUT ========================

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const options = { upsert: true };
      const filter = { email: email };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      res.send({ result, token });
    });

    app.put("/review/:email", async (req, res) => {
      const email = req.params.email;
      const review = req.body;
      const options = { upsert: true };
      const filter = { email: email };
      const updateReview = {
        $set: review,
      };
      const result = await reviewCollection.updateOne(
        filter,
        updateReview,
        options
      );
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
