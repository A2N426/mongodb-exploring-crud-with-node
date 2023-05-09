const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("from tea making")
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a5mfktt.mongodb.net/?retryWrites=true&w=majority`;

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

        const teasCollections = client.db('teasDB').collection("teas");

        app.get('/teas',async(req,res)=>{
            const cursor = teasCollections.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/teas/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const result = await teasCollections.findOne(query);
            res.send(result);
        })

        app.put('/teas/:id',async(req,res)=>{
            const id = req.params.id;
            const updatedTea = req.body;
            const options = {upsert:true};
            const filter = { _id : new ObjectId(id)};
            const tea = {
                $set:{
                    name:updatedTea.name, quantity:updatedTea.quantity, supplier:updatedTea.supplier, taste:updatedTea.taste, category:updatedTea.category, details:updatedTea.details, 
                    photo:updatedTea.photo
                }
            }
            const result = await teasCollections.updateOne(filter,tea,options)
            res.send(result);
        })

        app.post('/teas',async(req,res)=>{
            const newTea = req.body
            console.log(newTea);
            const result = await teasCollections.insertOne(newTea);
            res.send(result)
        })

        app.delete('/teas/:id',async(req,res)=>{
            const id = req.params.id;
            const query = { _id : new ObjectId(id)};
            const result = await teasCollections.deleteOne(query);
            res.send(result); 
        })



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
    console.log(`Tea making server is running port, ${port}`)
})