require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5000"],
  })
);
app.use(express.json());

const uri = `mongodb+srv://foursquareBD:B32NbWD2WdOtDfSn@cluster0.bnfq1is.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const newProjectCollection = client
      .db("foursquareBD")
      .collection("newProjects");

    const bannerProjectCollection = client
      .db("foursquareBD")
      .collection("bannerProjects");

    app.get("/dashboard-all-project", async (req, res) => {
      const result = await newProjectCollection.find().toArray();
      res.send(result);
    });

    app.get("/dashboard-all-project/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await newProjectCollection.findOne(query);
      res.send(result);
    });

    app.post("/add-new-project", async (req, res) => {
      const newProject = req.body;
      const result = await newProjectCollection.insertOne(newProject);
      res.send(result);
    });

    app.get("/banner-projects", async (req, res) => {
      const result = await bannerProjectCollection.find().toArray();
      res.send(result);
    });

    app.get("/banner-projects/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bannerProjectCollection.findOne(query);
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
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

app.get("/", async (req, res) => {
  res.send("foursquare BD server is running...");
});

app.listen(port, () => {
  console.log("server is on port :", port);
});
