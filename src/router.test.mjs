import { should } from 'chai';
import { createStubInstance, stub, match } from 'sinon';
import supertest from 'supertest';
import express, { json } from 'express';

import MovieController from './controllers/movieController.js';
import movieRouter from './router.js'; 

should();

describe('Movie Router', function () {
    let app, movieControllerStub, request;

    beforeEach(function () {
        app = express();
        app.use(json());

        movieControllerStub = createStubInstance(MovieController);
        const clientStub = { db: stub().returns({}) };
        
        const router = require('express').Router();
        const movieController = new MovieController(clientStub.db());

        router.get('/', (req, res) => movieControllerStub.getTopMovies(req, res));
        router.get('/:id', (req, res) => movieControllerStub.getMovie(req, res));
        router.post('/:id/addcomment', (req, res) => movieControllerStub.addComment(req, res));
        
        app.use('/api/movies', router);
        request = supertest(app);
    });

    describe('GET /api/movies/', function () {
        it('should call getTopMovies', async function () {
            movieControllerStub.getTopMovies.resolves([{ id: 1, title: 'Movie 1' }]);

            await request.get('/api/movies/')
                .expect(200);

            movieControllerStub.getTopMovies.calledOnce.should.be.true;
        });

        it('should return 500 if getTopMovies throws an error', async function () {
            movieControllerStub.getTopMovies.rejects(new Error('Error fetching movies'));

            await request.get('/api/movies/')
                .expect(500);

            movieControllerStub.getTopMovies.calledOnce.should.be.true;
        });
    });

    describe('GET /api/movies/:id', function () {
        it('should call getMovie with the correct ID', async function () {
            movieControllerStub.getMovie.resolves();

            await request.get('/api/movies/1')
                .expect(200);

            movieControllerStub.getMovie.calledOnce.should.be.true;
            movieControllerStub.getMovie.calledWithMatch(match.has('params', match.has('id', '1'))).should.be.true;
        });

        it('should return 500 if getMovie throws an error', async function () {
            movieControllerStub.getMovie.rejects(new Error('Error fetching movie'));

            await request.get('/api/movies/1')
                .expect(500);

            movieControllerStub.getMovie.calledOnce.should.be.true;
        });
    });

    describe('POST /api/movies/:id/addcomment', function () {
        it('should call addComment with the correct ID and body', async function () {
            movieControllerStub.addComment.resolves();

            await request.post('/api/movies/1/addcomment')
                .send({ text: 'Great movie!', username: 'user1' })
                .expect(302); 

            movieControllerStub.addComment.calledOnce.should.be.true;
            movieControllerStub.addComment.calledWithMatch(
                match.has('params', match.has('id', '1')),
                match.has('body', match.has('text', 'Great movie!').and(match.has('username', 'user1')))
            ).should.be.true;
        });

        it('should return 500 if addComment throws an error', async function () {
            movieControllerStub.addComment.rejects(new Error('Error adding comment'));

            await request.post('/api/movies/1/addcomment')
                .send({ text: 'Great movie!', username: 'user1' })
                .expect(500);

            movieControllerStub.addComment.calledOnce.should.be.true;
        });
    });
});
