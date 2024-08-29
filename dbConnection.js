require('dotenv').config()

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSKEY}@cluster0.qlv8oyw.mongodb.net/sample_mflix`

const client = new MongoClient(uri)
client.connect()

module.exports = client
