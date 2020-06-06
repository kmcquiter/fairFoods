/*
Bonus: Success message
Create a new variable in your entry point called message, that starts as an empty string.  
When the user clicks "Save," the message should be updated to say something 
like Order accepted: Elizabeth Warren, 3 bags. Thanks for your order!  
Note: this variable must be passed to your EJS file from index.js as part of res.render(). 
You will also need to add EJS script tags to your EJS file.  You can use the Bootstrap 
class alert-success for some nice formatting.  
*/
const express = require('express');
const body_parser = require('body-parser');
const path = require('path');
const mongodb = require('mongodb');
const dotenv = require('dotenv');

const PORT = process.env.PORT || 3001;
// This initializes exress application
const app = express();

dotenv.config();
app.set('view engine', 'ejs');

// public folder for static CSS & image files
app.use(express.static(path.join(__dirname, 'public')));

// body-parser setup
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended:true }));

//Start of the database which data will be saved into Atlas cloud instead of local database
let db_handler; 
//Be sure to have the correct DB atlas url
const DB_URL = process.env.DB_URL;
const ORDER_COLLECTION =  process.env.ORDER_COLLECTION;
const FAIRFOODS_DB =  process.env.FAIRFOODS_DB;

let confirmation_message = "";

//acting as an event listener to render the page. "/"" is the action by the browser and what comes after is the callback function. 
app.get('/', (req, res) => {
    console.log("User went to /");
    res.render("index", {
        //ejs will access this key by the name "message"
        message: confirmation_message
    });
});

app.get('/allorders', (req, res) => {
    db_handler.collection(ORDER_COLLECTION).find({}).toArray((err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.render('allorders', {
                'all_orders': result
            });
        }
    });
});

// when form is submitted, this begins to execute
// we use post because it matches the method in the form
app.post('/order', (req, res) => {
    // req.body contains form information
    const form_data = req.body;
    console.log(form_data);
	const clientName = form_data['clientName'];
	const bags = parseInt(form_data['bags']);

	const my_object = {
        "clientName": clientName,
        "bags": bags
    }
    // Inserting object to database
    db_handler.collection(ORDER_COLLECTION).insertOne(my_object, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("order entered.");
            confirmation_message = `Ordered entered by ${clientName} for ${bags}!`;
            res.redirect('/');
        }
    });
    
});

// Starting the server and connecting to MongoDB Atlas to a DB called fairFoods
app.listen(PORT, () => {
    console.log(`Fair Foods server started on port ${PORT}!`);
    
    // connect to db
    let mongo_client = mongodb.MongoClient;
    mongo_client.connect(DB_URL, (err, db_client) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`connected to ${FAIRFOODS_DB} database.`);
            db_handler = db_client.db(FAIRFOODS_DB);
        }
    })

})