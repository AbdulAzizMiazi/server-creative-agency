const express = require("express");
const app = express();
const port = 5000;

require('dotenv').config();
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const fs = require("fs-extra");

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wyeds.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect((err) => {
  const serviceCollection = client.db(`${process.env.DB_NAME}`).collection('services');
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection('orders');
  const commentCollection = client.db(`${process.env.DB_NAME}`).collection('comments'); 
  const adminsCollection = client.db(`${process.env.DB_NAME}`).collection('admins');
  //Posting New Service
  app.post("/addServices", (req, res) => {
    const title = req.body.serviceTitle;
    const description = req.body.description;
    const file = req.files.image;
    const filePath = `${__dirname}/images/${file.name}`;

    file.mv(filePath, (err) => {
        const newImg = fs.readFileSync(filePath);
        const encodedImg = newImg.toString("base64");
        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer(encodedImg, "base64"),
        };
        if(err){
          return res.status(500).send("File Send Failed...!!");
        }
        serviceCollection.insertOne({ title, description, image })
        .then((result) => {
            fs.remove(filePath, error => {
                if(error){
                  console.log(error);
                }
            })
            result.insertedCount > 0 && res.send(result);
        });
    });
  });
  //Posting New Service Ends here....

  //receiving all posts
  app.get("/allServices", (req, res) =>{
    serviceCollection.find({})
    .toArray((error, documents) => res.send(documents))
  })

  app.post("/addOrder" ,(req, res)=> {
    const customerName = req.body.customerName;
    const email = req.body.email;
    const service = req.body.service;
    const description = req.body.description;
    const status = req.body.status;
    console.log({customerName, email, service, description, status});
    orderCollection.insertOne({customerName, email, service, description, status})
    .then(result => console.log(`Successfully inserted item with _id: ${result.insertedId}`))
    .catch(err => console.error(`Failed to insert item: ${err}`))
    //.then(result => console.log(`Successfully inserted item with _id: ${result.insertedId}`))
  // .catch(err => console.error(`Failed to insert item: ${err}`))
  })

  app.get("/userServicesList", (req, res)=>{
    const email = req.query.email;
    orderCollection.find({email: email})
    .toArray((error, documents) => {
      const customerOrders = documents.map(eachOrderTitle => eachOrderTitle.service);
      serviceCollection.find({title: {$in: customerOrders}})
      .toArray((err, docs)=>{
        docs.map((eachOrder, index) => eachOrder.orderStatus = documents[index].status);
        res.send(docs);
      });
    })
  })

  app.get("/allOrders",(req, res)=>{
    orderCollection.find({})
    .toArray((error, docs)=>res.send(docs))
  })

  app.post("/submitComment", (req, res)=>{
    const name = req.body.name;
    const company = req.body.company;
    const img = req.body.img;
    const comment = req.body.comment;
    commentCollection.insertOne({name, company, img, comment})
    .then(result=>{ result.insertedCount > 0 && res.send(result)})
  })

  app.get("/comments", (req, res)=>{
    commentCollection.find({})
    .toArray((error, documents)=> res.send(documents))
  })

  app.post("/addAdmin", (req, res)=> {
    const email = req.body.admin;
    adminsCollection.insertOne({email})
    .then(result=>{ result.insertedCount > 0 && res.send(result)})
  })
  
  app.get("/isAdmin", (req, res)=>{
    const userEmail = req.query.email;
    adminsCollection.find({email: userEmail})
    .toArray((error,docs)=>{
      if (docs.length !== 0) {
        res.send(true);
      }else if (docs.length === 0) {
        res.send(false);
      }
    })
  })

  console.log("database has connected successfully");
});

app.get("/", (req, res) => {
  res.send("Server is active.....!!!");
});
// app.listen(process.env.PORT || port);
app.listen(port);