const express = require('express');
const app = express();
const cors = require('cors');
const env = require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const UserSchema = require('./schema/user.js');
const User = UserSchema.User;
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.use(express.static("public"))

app.get('/', (req, res) => {
  res.render("index");
})
app.listen(3000, () => console.log('Server listening to 3000 port'));
mongoose.connect(process.env.MONGODBURL, {}).then(
  console.log('Successfully connected to mongodb')
).catch(error => console.error(error));

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const user = new User({ username: username, count: 0,logs: [] });
  User.create(user)
    .then(savedUser => {
      console.log(`New user created ${savedUser}`);
      res.json({ username: savedUser.username, _id: savedUser._id });
    })
    .catch(error => {
      console.error(`Encountered error while creating a new user ${error}`)
      res.json({ error: error });
    });
});

app.delete('/api/users', (req,res) => {
  User.deleteMany().then(result => res.json({result}));
})

app.get('/api/users', (req, res) => {
  User.find().select("username").select("id").exec().then(users => {
    res.json(users)
  }).catch(error =>  {console.error(error); res.json({error})});
})


app.post('/api/users/:id/exercises', (req, res) => {
  const body = req.body;
  const id = req.params.id !== "1" ? req.params.id : body.id;
  User.findById(id).then(foundUser => {
    if(foundUser === null){
      return;
    }
    let count = foundUser.count + 1;
    let logs = foundUser.log === undefined ? [] : foundUser.log;
    const date =  body.date !== undefined ? new Date(body.date) : new Intl.DateTimeFormat('sv-SE').format(new Date());
    logs.push({
      description: body.description,
      duration: body.duration,
      date: date
     });
    User.findByIdAndUpdate(foundUser._id, {count: count,log: logs}, {new: true}).then(user => {
     const log = user.log[user.log.length -1];
      res.json({
        username: user.username,
        description: log.description,
        duration: log.duration,
        date: new Date(log.date).toDateString(),
        _id: user._id
      })
    })
    .catch(error => res.json({error}));
  })
});

app.get('/api/users/:id/logs', (req, res) => {
  const id = req.params.id.toString();
  
  User.findById(id).then(user => {
    if(user === null) {
      res.json({error: `No user found with id ${id}`});
      return;
    }
    console.log(`found user : ${user}`);
    if(user.log !== undefined && user.log.length > 0) {
      
      let logs = filterLogsByParams(user.log, req.query);
      logs = formatLogsDate(logs);
    
      console.log("logs:" + logs);
      user.log = logs;
      user.count = logs.length;
    }
    //use user.logs.length to return count
    res.json( user);
  }).catch(error => {
    res.json({ error: error });
  });
});



function filterLogsByParams(logs, queryParams) {
  if(queryParams.limit !== undefined) {
    console.log('use of limit' + queryParams.limit);
   logs = logs.slice(logs.length - parseInt(queryParams.limit));
   console.log(logs);
  }
  if(queryParams.to !== undefined) {
    console.log('use of to' + queryParams.to);
   logs = logs.filter(log => new Date(log.date) <= new Date(queryParams.to))
   console.log(logs);
  }
  if(queryParams.from !== undefined) {
    console.log('use of from' + queryParams.from);
    logs = logs.filter(log => new Date(log.date) >= new Date(queryParams.from))
    console.log(logs);
  }
  return logs;

}
function formatLogsDate(logs) {
  logs.forEach(el => {
        
    el.date = new Date(el.date).toDateString();
  })
  return logs;
}
app.get('/api/users/logs', (req, res) => {
//  const id = req.params.id.toString();
  
  User.find().select("log.description").exec().then(logs => {
    console.log("looooogs: " + logs);
    if(logs.length === 0) {
      res.json({error: `No logs available`});
      return;
    }
  
      
   //   let logs = filterLogsByParams(logs, req.query);
      //logs = formatLogsDate(logs);
    
      console.log("logs:" + logs[0]);
   
    
    //use user.logs.length to return count
    res.render("log", {logs});
  }).catch(error => {
    res.json({ error: error });
  });
});
//TODO: TABELLA con dati principali
//TODO: Dettaglio con i logs

