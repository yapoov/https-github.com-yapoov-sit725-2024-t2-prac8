const ObjectId = require('mongodb').ObjectId

class MovieModel{
    constructor(db){
        this.collection = db.collection('movies');
    }

    async getTopMovies(){
        console.log("getting top movies")
        return await this.collection.aggregate([
            { $sort:{ num_mflix_comments: -1}},
            { $limit:24}
        ]).toArray()
    }

    async getMovieById(id) {
        return this.collection.findOne({"_id": new ObjectId(id)});
    }
}

module.exports = MovieModel

