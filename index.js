const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.get('/', (req, res) => {
    res.send('Hello World!')
})


// middleware
app.use(cors())
app.use(express.json())



// const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nc6s3b6.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
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
        await client.connect();
        const reviewsCollections = client.db("skillMindsDB").collection("reviews")
        const allCoursesCollections = client.db("skillMindsDB").collection("courses")
        const usersCollections = client.db("skillMindsDB").collection("users")

        // course get api
        app.get('/api/v1/allCourses', async (req, res) => {
            const allCourses = await allCoursesCollections.find().toArray()
            console.log(allCourses);
            res.send(allCourses)
        })

        // course get api by id
        app.get('/api/v1/course/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const course = await allCoursesCollections.findOne(query)
            console.log(course);
            res.send(course)
        })

        // reviews get api
        app.get('/api/v1/reviews', async (req, res) => {
            const reviews = await reviewsCollections.find().toArray()
            console.log(reviews);
            res.send(reviews)
        })

        // users get api
        app.get('/api/v1/getUsers', async (req, res) => {
            const users = await usersCollections.find().toArray()
            console.log(users);
            res.send(users)
        })

        // users get api
        app.get('/api/v1/getUsers/admin/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollections.findOne(query)
            const admin = user?.role === 'admin'
            console.log(admin);
            res.send({ admin })
        })
        // users post api
        app.post('/api/v1/createUsers', async (req, res) => {
            const user = req.body
            const result = await usersCollections.insertOne(user)
            console.log(result);
            res.send(result)
        })

        // make admin api api
        app.patch('/api/v1/makeAdmin/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollections.updateOne(filter, updatedDoc)
            console.log(result);
            res.send(result)
        })

        // make teacher api
        app.patch('/api/v1/makeTeacher/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    role: 'teacher'
                }
            }
            const result = await usersCollections.updateOne(filter, updatedDoc)
            console.log(result);
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})