const ObjectId = require("mongodb").ObjectId;

class CommentModel {
  constructor(db) {
    this.collection = db.collection("comments");
  }
  async getCommentsForMovie(movieId) {
    return this.collection
      .find({ movie_id: new ObjectId(movieId) }, { sort: { date: -1 } })
      .limit(20)
      .toArray();
  }
  async addComment(movieId, username, text) {
    const newComment = {
      movie_id: new ObjectId(movieId),
      name: username || "Anonymous",
      text,
      date: new Date(),
    };
    return this.collection.insertOne(newComment);
  }
}

module.exports = CommentModel;
