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
    User.create(user)
    .then(savedUser => { 
      console.log(`New user created ${savedUser}`);
      res.json({username: savedUser.username, _id: savedUser._id});
    })
    .catch(error => {
      console.error(`Encountered error while creating a new user ${error}`)
      res.json({error: error});
    });    
}); 


/*
{"_id":"65eccbf40b80b70013c990c9","username":"e","date":"Sat Aug 03 2024","duration":1,"description":"1"}
*/
app.post('/api/users/:id/exercises', (req,res) => {
  const body = req.body;

  User.findOneAndUpdate({_id: req.params.id}, {log: [{  duration: body.duration,
    description: body.description,
    date: body.date}]})
  .then(savedUser => { 
    console.log(`New Exercise created ${savedUser}`);
    const log = savedUser.log[0];
    res.json({ _id: savedUser._id, username: savedUser.username, date: log.date,
    duration: log.duration, description: log.description});
  })
  .catch(error => {
    console.error(`Encountered error while creating a new exercise ${error}`)
    res.json({error: error});
  });   
});
///api/users/:_id/logs?[from][&to][&limit]
/*
{
  username: "fcc_test",
  count: 1,
  _id: "5fb5853f734231456ccb3b05",
  log: [{
    description: "test",
    duration: 60,
    date: "Mon Jan 01 1990",
  }]
}
*/
app.get('/api/users/:id/logs?', (req,res) => {
  console.log(req.params.id);
    const id = req.params.id.toString();
    const from = req.query.from;
    const to = req.query.to;
    const limit = req.query.limit;
    let query = User.findById(id).where({date: "08/03/2024"}).limit(limit);
    //User.findById(id)
    query.then(user => {
      console.log(`found user : ${user}`);
      res.json({user});
    }).catch(error => {
      console.log(`No user found with id ${id}`);
      res.json({error: error});
    });
});

app.use(cors({optionsSuccessStatus: 200}));