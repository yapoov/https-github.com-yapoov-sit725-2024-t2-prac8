const express = require('express')
const bodyParser = require('body-parser')
const app = express()
let port = 3000

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine', 'ejs');
app.set('views', __dirname + '/src/views');
 
const movieRouter = require('./src/router')
app.use('/api/movie',movieRouter)

app.listen(port,()=>{
    console.log(`listening at http://localhost:${port}`)
})
