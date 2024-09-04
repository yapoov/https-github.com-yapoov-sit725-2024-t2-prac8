const MovieModel = require("../models/movie");
const CommentModel = require("../models/comment");

class MovieController {
  constructor(db) {
    this.movieModel = new MovieModel(db);
    this.commentModel = new CommentModel(db);
  }

  async getTopMovies(req, res) {
    try {
      const movies = await this.movieModel.getTopMovies();
      res.json(movies);
    } catch (e) {
      res.status(500).json(e);
    }
  }

  async getMovie(req, res) {
    try {
      const movie = await this.movieModel.getMovieById(req.params.id);
      const comments = await this.commentModel.getCommentsForMovie(
        req.params.id
      );

      res.render("movie", { movie, comments });
    } catch (e) {
      console.log(e);
      res.json(e);
    }
  }

  async addComment(req, res) {
    try {
      const { text, username } = req.body;
      await this.commentModel.addComment(req.params.id, username, text);
      res.redirect(`/api/movie/${req.params.id}`);
    } catch (e) {
      res.status(500).json(e);
    }
  }
}

module.exports = MovieController;
