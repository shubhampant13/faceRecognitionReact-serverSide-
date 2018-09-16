const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var cors = require('cors');
var knex = require('knex')


const db= knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'root',
    database : 'smart-brain'
  }
});



app = express();
app.use(bodyParser.json());
app.use(cors());



app.get('/' , (req,res) =>{
    res.send(database.users); 
});

app.post('/signin' , (req,res)=>{
         db.select('email','hash').from('login')
         .where('email', '=' , req.body.email)
         .then(data => {
                 const isValid = bcrypt.compareSync(req.body.password , data[0].hash);
                 if(isValid){
                    return db.select('*').from('users').where('email','=',req.body.email)
                    .then(user => {
                        res.json(user[0]);
                    }).catch(err => {
                        res.status(400).json("unable to get user");
                    })
                 }else{
                        res.status(400).json("Wrong Credentials");
                 }
         }).catch(err => res.status(400).json("Wrong credentials"));
    });



app.post('/register' , (req,res)=>{
	const {email,name,password} = req.body;
    
    var hash = bcrypt.hashSync(password,saltRounds);
            
            db.transaction(trx => {
                  trx.insert({
                    hash: hash,
                    email : email
                  })
                  .into('login')
                  .returning('email')
                  .then(loginEmail => {
                                      return trx('users').returning('*').insert({
                                          name : name,
                                          email : loginEmail[0],
                                          joined : new Date(),
                                      }).then(user => {
                                                      res.json(user[0]);
                                                      }
                                             )
                                     })
                  .then(trx.commit)
                  .catch(trx.rollback)
            })
            .catch(err => res.status(400).json("Unable to register"));
});


app.get('/profile/:id', (req,res)=>{
         const {id} = req.params;
 
         db.select('*').from('users').where({
            id : id,
            }).then(user => {  
            if(user.length)
            { 
                res.json(user[0])
            }
            else {
                res.status(400).json(err)
            }
         }).catch(err => res.status(400).json("error getting user"));
});


app.put('/image', (req,res)=>{
         const {id} = req.body;
         db('users').where('id','=',id)
         .increment('entries',1)
         .returning('entries')
         .then(entries => {
            res.json(entries[0]);
         }).catch(err => res.status(400).json("Unable to get count"))
})



app.listen(3000 , ()=>{
	console.log("Running on Port 3000");
});