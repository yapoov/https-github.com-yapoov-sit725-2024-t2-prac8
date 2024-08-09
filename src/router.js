const client = require('../dbConnection');
const router = require('express').Router();
const MovieController = require('./controllers/movieController')
const movieController = new MovieController(client.db())
router.get('/',(req,res)=> movieController.getTopMovies(req,res))
router.get('/:id',(req,res)=>movieController.getMovie(req,res))
router.post('/:id/addcomment',(req,res)=>movieController.addComment(req,res))

module.exports = router;