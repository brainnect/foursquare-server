const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
const fs = require('fs');
require("dotenv").config();
const multer  = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
    console.log(file.originalname);
  }
})
// create a folder
const upload = multer({ storage: storage })

app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// const uri = `mongodb+srv://foursquareBD:B32NbWD2WdOtDfSn@cluster0.bnfq1is.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const uri = "mongodb+srv://foursquare:7Kp7Vt06L8SrLJO3@cluster0.ehpra6o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
     client.connect();
    // Send a ping to confirm a successful connection
     client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );


    const dashboardProjectsCollection = client
      .db("foursquareBD")
      .collection("dashboardProjects");

    const projectsCollection = client
      .db("foursquareBD")
      .collection("bannerProjects");

    const productsCollection = client.db("foursquareBD").collection("products");
    const reviewsCollection = client.db("foursquareBD").collection("reviews");

    app.get("/dashboard-projects", async (req, res) => {
      const result = await dashboardProjectsCollection.find().toArray();
      res.send(result);
    });

    app.get("/dashboard-projects/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await dashboardProjectsCollection.findOne(query);
      res.send(result);
    });

    app.post("/dashboard-projects", async (req, res) => {
      const newProject = req.body;
      const result = await dashboardProjectsCollection.insertOne(newProject);
      res.send(result);
    });

    app.delete("/dashboard-projects/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const images = req.body.images;
      console.log('Deleting images are',images);
      // delete files
      const basePath = 'uploads/';

      images.forEach((filename) => {
      const imagePath = basePath + filename;

      fs.stat(imagePath, (err, stats) => {
        if (err) {
          console.error(err);
          return;
        }

        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(err);
          }
            console.log(`Deleted image: ${filename}`);
          });
        });
      });

      const result = await dashboardProjectsCollection.deleteOne(query);
      res.send(result);

    });

    app.patch("/dashboard-projects/:id", async (req, res) => {
      const id = req.params.id;
      const newInfo = req.body;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          title: newInfo.title,
          startDate: newInfo.startDate,
          endDate: newInfo.endDate,
          category: newInfo.category,
          image: newInfo.image,
        },
      };
      const result = await newTrainersCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    app.get("/projects", async (req, res) => {
      const result = await projectsCollection.find().toArray();
      res.send(result);
    });

    // app.get("/products", async (req, res) => {
    //   const result = await productsCollection.find().toArray();
    //   res.send(result);
    // });

    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    app.post("/add-projects", upload.array('images', 12), async(req, res) => {
      try {
        const projectInfo = req.body;
      const imagesArry = req?.files.map(img => img?.filename);
      const newProject = {
        title: projectInfo?.title,
        startDate: projectInfo?.startDate,
        endDate: projectInfo?.endDate,
        category: projectInfo?.category,
        images: imagesArry
      }
  
      const result = await dashboardProjectsCollection.insertOne(newProject)
      res.send(result)
      } catch (error) {
        res.status(500).send(error);
      }
    })

    app.put("/update-project/:id", upload.array('images', 12), async(req, res) => {
      try {
        const updateId = req?.params?.id;
        const projectInfo = req.body;
        const imagesArry = req?.files.map(img => img?.filename);
        const oldImages = projectInfo?.oldImages.split(',');
        const modifyProject = {
          title: projectInfo?.title,
          startDate: projectInfo?.startDate,
          endDate: projectInfo?.endDate,
          category: projectInfo?.category,
          images: imagesArry?.length > 0 ? imagesArry : oldImages
        }
        if(imagesArry?.length > 0){
          const basePath = 'uploads/';

          oldImages.forEach((filename) => {
           const imagePath = basePath + filename;

          fs.stat(imagePath, (err, stats) => {
             if (err) {
             console.error(err);
            //  return;
          }

          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error(err);
            }
              console.log(`Deleted image: ${filename}`);
          });
        });
      });
        }
        const options = { upsert: true };
        const updateDoc = {
          $set: modifyProject,
        };
      const result = await dashboardProjectsCollection.updateOne({_id: new ObjectId(updateId)}, updateDoc, options)
      res.send(result)
      } catch (error) {
        res.status(500).send(error);
      }
    })


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
