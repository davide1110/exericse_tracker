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
  User.find().then(users => {
    let returnedUsers = [];
    users.forEach(user => returnedUsers.push({_id: user._id, username: user.username}));
    res.json({users: returnedUsers})
    //res.se
  }).catch(error =>  {console.error(error); res.json({error})});
})


app.post('/api/users/:id/exercises', (req, res) => {
  const body = req.body;
  const id = req.params.id !== "1" ? req.params.id : body.id;
  User.findById(id).then(foundUser => {
    let count = foundUser.count + 1;
    let logs = foundUser.log === undefined ? [] : foundUser.log;
    logs.push({
      description: body.description,
      duration: body.duration,
      date: body.date
     });
    User.findByIdAndUpdate(foundUser._id, {count: count},{log: logs}).then(user => res.json({user}))
    .catch(error => res.json({error}));
  })
   //console.log(user);
  //handle better logs array
 // User.findByIdAndUpdate(id, )
 /* 
  console.log(id);
  User.findById(id).then(foundUser => {
    console.log(foundUser)
    console.log("useeeer: " + foundUser);
    const logs = foundUser.log !== undefined ? foundUser.log : [];
    console.log("logs:" + logs)
    logs.push({
      duration: body.duration,
      description: body.description,
      date: body.date
    });
    User.updateOne({_id: id}, {log: logs}, {new}).then(updatedUser => res.json(updatedUser));
  });
});*/

 /* User.findOneAndUpdate({ _id: id }, {
    logs
  })
    .then(savedUser => {
      console.log(`New Exercise created ${savedUser}`);
      const log = savedUser.log[0];
      res.json({
        _id: savedUser._id, username: savedUser.username, date: log.date,
        duration: log.duration, description: log.description
      });
    })
    .catch(error => {
      console.error(`Encountered error while creating a new exercise ${error}`)
      res.json({ error: error });
    });*/
});

app.get('/api/users/:id/logs?', (req, res) => {
  const id = req.params.id.toString();
  let query = getCriteriaQuery(id, req.query);

  query.then(user => {
    if(user === null) {
      res.json({error: `No user found with id ${id}`});
      return;
    }
    console.log(`found user : ${user}`);
    res.json({ user });
  }).catch(error => {
    res.json({ error: error });
  });
});
/*app.get('/api/users/logs?', (req, res) => {
  //const id = req.params.id.toString();
  //let query = getCriteriaQuery(id, req.query);
  let usersList;
User.find().then(users => {
    res.render("log", {users: users});
  }).catch(error => {
    console.log(`No users found`);
    res.json({ error: error });
  });
});*/
//TODO: TABELLA con dati principali
//TODO: Dettaglio con i logs
function getCriteriaQuery(id, queryParams) {
  let query = User.findById(id);
  if (Object.values(queryParams).length === 0) {
    return query;
  }
  console.log(`use of optional parameters: ${queryParams.from}, ${queryParams.to}, ${queryParams.limit}`);
  return query.where("log.date", queryParams.from)
    .where("log.date", queryParams.to).limit(queryParams.limit);


}

