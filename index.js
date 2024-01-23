const express = require('express')
const app = express()
const port = 4040

app.get('/',(req,res)=>{
    res.send('Hello World')
})

app.listen(port,()=>{
    console.log('Server is running at http://localhost:4040')
})