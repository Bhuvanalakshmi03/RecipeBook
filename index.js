const express = require('express')
const sqlite3 =require('sqlite3')
const app = express()
const port = 4040

// ejs config
app.set('view engine','ejs')

app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))

app.post('/', (req, res) => {
    const { name, age, email, password } = req.body
  
    // Insert data into the 'users' table
    
    db.run(
        'INSERT INTO auth (name, age, email, password) VALUES (?, ?, ?, ?)',
        [name, age, email, password], 
        (err) => {
        if (err) {
        return res.render('index',{error:"Some issues"})
      }
  
      // Respond with the ID of the inserted row
      res.redirect('/')
    })
  })

  app.post('/',(req,res) => {
       const{email,password} = req.body
       console.log(email,password)

       db.get('SELECT * FROM auth WHERE email=? AND password = ?',
       [email,password] ,
       (err,user)=>{
        if(err|| !user){
            return res.render('index',{error:'Invalid user'})
        }
        res.redirect('/login')
       }
       )
  }
  )

//db config
const db = new sqlite3.Database('./db/database.db')

app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.get('/register',(req,res)=>{
    res.render('register')
})

app.listen(port,()=>{
    console.log('Server is running at http://localhost:4040')
})