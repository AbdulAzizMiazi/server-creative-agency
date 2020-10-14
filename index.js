const express = require('express');
const app = express();
const port = 5000;

const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());

const user = 'creativeAgency';
const password = '230hl7hd1ukrpdxR';
const database = 'creative-agency';
const service = 'services';

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${user}:${password}@cluster0.wyeds.mongodb.net/${database}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const serviceCollection = client.db(database).collection(service);
    app.post("/addServices", (req, res) =>{
        // const title = req.body.serviceTitle;
        // const description = req.body.description;
        const file = req.files;
        
        console.log(req.body, file);
        // serviceCollection.insertOne(req.body)
        // .then(result => result.insertedCount > 0 && result)
    })

  
    console.log("database has connected successfully");
});


app.get("/", (req, res)=> {
    res.send("Server is active.....!!!");
})

app.listen(port, ()=> console.log(`Listening to ${port}`));