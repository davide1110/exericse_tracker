const express = require('express');
const app = express();
const cors = require('cors');
const env = require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const UserSchema = require('./schema/user.js');
const User = UserSchema.User;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("public"))

app.get('/', (req,res) => {
  res.sendFile(`${__dirname}/views/index.html`);
})
app.listen(3000, () => console.log('Server listening to 3000 port'));
mongoose.connect(process.env.MONGODBURL, {}).then(
  console.log('Successfully connected to mongodb')
).catch(error => console.error(error));

app.post('/api/Users', (req, res) => {
  const username = req.body.username;
  const user = new User({ username: username });
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


app.post('/api/users/:id/exercises', (req, res) => {
  const body = req.body;

  User.findOneAndUpdate({ _id: req.params.id }, {
    log: [{
      duration: body.duration,
      description: body.description,
      date: body.date
    }]
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
    });
});

app.get('/api/users/:id/logs?', (req, res) => {
  const id = req.params.id.toString();
  let query = getCriteriaQuery(id, req.query);

  query.then(user => {
    console.log(`found user : ${user}`);
    res.json({ user });
  }).catch(error => {
    console.log(`No user found with id ${id}`);
    res.json({ error: error });
  });
});

function getCriteriaQuery(id, queryParams) {
  let query = User.findById(id);
  if (Object.values(queryParams).length === 0) {
    return query;
  }
  console.log(`use of optional parameters: ${queryParams}`);
  return query.where("log.date", queryParams.from)
    .where("log.date", queryParams.to).limit(queryParams.limit);


}

app.use(cors({ optionsSuccessStatus: 200 }));