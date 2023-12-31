const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {

    res.send("server running");
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.kkcmbk1.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const coffeeCollection = client.db("CoffeeDb").collection("coffee");

        // add coffee
        app.post("/coffee", async (req, res) => {
            const newCoffee = req.body;

            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);
        });
        // get all coffee item
        app.get("/coffee", async (req, res) => {
            const result = await coffeeCollection.find().toArray();
            res.send(result);
        });
        // get singel coffee item
        app.get("/coffee/:id", async (req, res) => {
            const coffeeId = req.params.id;
            const filter = { _id: new ObjectId(coffeeId) };
            const result = await coffeeCollection.findOne(filter);
            res.send(result);
        });
        // update coffee
        app.put("/coffee/:id", async (req, res) => {
            const coffeeId = req.params.id;
            const updatedCoffee = req.body;
            const filter = { _id: new ObjectId(coffeeId) };
            const options = { upsert: true };
            const updatedDocument = {
                $set: {
                    ...updatedCoffee
                }
            };
            const result = await coffeeCollection.updateOne(filter, updatedDocument, options);
            res.send(result);

        });
        // delete coffee
        app.delete("/coffee/:id", async (req, res) => {
            const coffeeId = req.params.id;
            const query = { _id: new ObjectId(coffeeId) };
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`server is running on port :${port}`);
});