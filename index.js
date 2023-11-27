require('dotenv').config()
const express = require('express')
const cors = require('cors')
const stripe = require("stripe")(`${process.env.PAYNENT_SECRET_KEY}`)
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.get('/', (req, res) => {
    res.send('Hello World!')
})


// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nc6s3b6.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        // await client.connect();

        // review collection
        const reviewsCollections = client.db("skillMindsDB").collection("reviews")

        // courses collection
        const allCoursesCollections = client.db("skillMindsDB").collection("courses")

        //    user collections
        const usersCollections = client.db("skillMindsDB").collection("users")

        //   teacher request collections
        const teacherRequestCollections = client.db("skillMindsDB").collection("teachers")

        // payments collections
        const paymentCollections = client.db("skillMindsDB").collection("payment and class")

        // courseCount get api
        app.get('/api/v1/courseCount', async (req, res) => {
            const allCourses = await allCoursesCollections.estimatedDocumentCount()
            // console.log(allCourses);
            res.send({ allCourses })
        })

        // enrolment count get api
        app.get('/api/v1/enrolmentCount', async (req, res) => {
            const enroledCount = await paymentCollections.estimatedDocumentCount()
            console.log(enroledCount);
            res.send({ enroledCount })
        })

        // //single course enrolment count get api
        // app.get('/api/v1/enrolmentCount/:id', async (req, res) => {
        //     const id = req.params.id
        //     const query = { _id: new ObjectId(id) }
        //     const singleCourseEnroledCount = await paymentCollections.find(query).toArray()
        //     console.log(singleCourseEnroledCount);
        //     res.send(singleCourseEnroledCount)
        // })

        // payment for enrolment history get api
        app.get('/api/v1/paymentAndCourseInfo/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const payments = await paymentCollections.findOne(query)
            console.log('payyyyy', payments);
            res.send({ payments })
        })

        // payment history details get api
        app.get('/api/v1/paymentAndCourse/details/:id', async (req, res) => {
            const paymentsDetails = await paymentCollections.findOne()
            console.log(paymentsDetails);
            res.send({ payments })
        })

        // course get api
        app.get('/api/v1/allCourses', async (req, res) => {
            const allCourses = await allCoursesCollections.find().toArray()
            // console.log(allCourses);
            res.send(allCourses)
        })

        // teacher request get api
        app.get('/api/v1/teacherRequest/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const myRequest = await teacherRequestCollections.findOne(query)
            // console.log(allRequest);
            res.send({ myRequest })
        })

        // teacher request get api
        app.get('/api/v1/teacherRequest', async (req, res) => {
            const allRequest = await teacherRequestCollections.find().toArray()
            // console.log(allRequest);
            res.send(allRequest)
        })

        // course get api by id
        app.get('/api/v1/course/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const course = await allCoursesCollections.findOne(query)
            // console.log(course);
            res.send([course])
        })

        // reviews get api
        app.get('/api/v1/reviews', async (req, res) => {
            const reviews = await reviewsCollections.find().toArray()
            // console.log(reviews);
            res.send(reviews)
        })

        // users get api
        app.get('/api/v1/getUsers', async (req, res) => {
            const users = await usersCollections.find().toArray()
            // console.log(users);
            res.send(users)
        })

        // users get api
        app.get('/api/v1/getUsers/count', async (req, res) => {
            const usersCount = await usersCollections.estimatedDocumentCount()
            const couresCount = await allCoursesCollections.estimatedDocumentCount()
            res.send({ usersCount, couresCount })
        })

        // admin get api
        app.get('/api/v1/getUsers/admin/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollections.findOne(query)
            let admin = false
            if (user) {
                admin = user?.role === 'admin'
            }
            // console.log(admin);
            res.send({ admin })
        })

        // admin get api
        app.get('/api/v1/getCourses/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await allCoursesCollections.find(query).toArray()
            res.send(result)
        })

        // course deletet api
        app.delete('/api/v1/deleteCourse/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await allCoursesCollections.deleteOne(query)
            res.send(result)
        })

        // teacher's course update api
        app.patch('/api/v1/updateCourse/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const course = req.body
            const updatedCourse = {
                $set: {
                    email: course.email,
                    image: course.image,
                    title: course.title,
                    email: course.email,
                    price: course.price,
                    description: course.description
                }
            }
            const result = await allCoursesCollections.updateOne(filter, updatedCourse)
            res.send(result)
        })

        // users profile get api
        app.get('/api/v1/getUser/profile/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollections.findOne(query)
            res.send(user)
        })

        // teacher get api
        app.get('/api/v1/getUser/teacher/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollections.findOne(query)
            let teacher = false
            if (user) {
                teacher = user.role === 'teacher'
            }
            console.log('tttttt', teacher);
            res.send({ teacher })
        })

        // courses post api
        app.post('/api/v1/teacherRequestPost', async (req, res) => {
            const request = req.body
            const result = await teacherRequestCollections.insertOne(request)
            // console.log(result);
            res.send(result)
        })

        // users post api
        app.post('/api/v1/createUsers', async (req, res) => {
            const user = req.body
            const result = await usersCollections.insertOne(user)
            // console.log(result);
            res.send(result)
        })

        // add course post api
        app.post('/api/v1/addCourse', async (req, res) => {
            const user = req.body
            const result = await allCoursesCollections.insertOne(user)
            // console.log(result);
            res.send(result)
        })

        // update admin api 
        app.patch('/api/v1/makeAdmin/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollections.updateOne(filter, updatedDoc)
            // console.log(result);
            res.send(result)
        })

        // update course by admin rejected api 
        app.patch('/api/v1/courseRejected/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    status: 'rejected'
                }
            }
            const result = await allCoursesCollections.updateOne(filter, updatedDoc)
            // console.log(result);
            res.send(result)
        })

        // update course by admin accepted api 
        app.patch('/api/v1/courseAccepted/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    status: 'accepted'
                }
            }
            const result = await allCoursesCollections.updateOne(filter, updatedDoc)
            // console.log(result);
            res.send(result)
        })

        // update as teacher accepted api
        app.patch('/api/v1/requestAccepted/:email', async (req, res) => {
            const email = req.params.email

            const filter = { email: email }
            console.log('filter', filter);
            const updateTeacher = {
                $set: {
                    status: "accepted"
                }
            }
            const updateUser = {
                $set: {
                    role: "teacher"
                }
            }
            // console.log(updateUser);
            const updatedTeacher = await teacherRequestCollections.updateOne(filter, updateTeacher)
            const updatedUser = await usersCollections.updateOne(filter, updateUser)

            // console.log('uuuutttttt', updatedTeacher);
            res.send({ updatedTeacher, updatedUser })
        })

        // update as teacher rejected api
        app.patch('/api/v1/requestRejected/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    status: 'rejected'
                }
            }
            const result = await teacherRequestCollections.updateOne(filter, updatedDoc)
            // console.log(result);
            res.send(result)
        })

        app.post("/create-payment-intent", async (req, res) => {
            const { price } = req.body;

            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: parseInt(price * 100),
                currency: "usd",
                "payment_method_types": [
                    "card"
                ],
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        // pament history
        app.post("/api/v1/payment", async (req, res) => {
            const payment = req.body;
            const paymentResult = await paymentCollections.insertOne(payment)
            // console.log(paymentResult);
            res.send({ paymentResult });
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})