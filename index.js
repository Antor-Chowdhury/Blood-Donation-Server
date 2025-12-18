const express = require("express");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const database = client.db("Blood-Donation");
    const userCollections = database.collection("user");
    const donationRequestsCollection = db.collection("donation-requests");

    // Create a new user
    app.post("/users", async (req, res) => {
      try {
        const userInfo = req.body;

        // checking if user exists or not
        const existingUser = await userCollections.findOne({
          email: userInfo.email,
        });
        if (existingUser) {
          return res.status(400).send({ message: "User already exists" });
        }

        // setting default value
        userInfo.role = userInfo.role || "donor";
        userInfo.status = userInfo.status || "active";
        userInfo.createdAt = new Date();

        const result = await userCollections.insertOne(userInfo);
        res.status(201).send(result);
      } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send({ message: "Failed to create user" });
      }
    });

    // fetching role of the user
    app.get("/users/:email/role", async (req, res) => {
      try {
        const { email } = req.params;
        const query = { email: email };
        const user = await userCollections.findOne(query);

        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }

        res.send({ role: user.role, status: user.status });
      } catch (error) {
        console.error("Error fetching user role:", error);
        res.status(500).send({ message: "Failed to fetch user role" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("From Assignment 11");
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
