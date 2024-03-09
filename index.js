const express = require('express');
const app = express();
const cors = require('cors');
const env = require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const UserSchema = require('./schema/user.js');
const User = UserSchema.User;
//import User from './schema/user.js';

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());


app.listen(3000, () => console.log('Server listening to 3000 port'));
mongoose.connect(process.env.MONGODBURL, {}).then(
    console.log('Successfully connected to mongodb')
).catch(error => console.error(error));

app.post('/api/Users', (req,res) =>{
    const username = req.body.username;
    const user = new User({username: username});
    User.create(user, (done, err) => {
        
    });
    
    

  //  const user = new User({username: username});
    //
    res.json({username: "", _id: ""});
}); 



app.use(cors({optionsSuccessStatus: 200}));