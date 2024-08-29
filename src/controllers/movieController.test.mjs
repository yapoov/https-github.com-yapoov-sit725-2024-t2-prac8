import { expect } from 'chai';
import { createStubInstance, stub } from 'sinon';
import MovieController from '../controllers/movieController.js';
import MovieModel from '../models/movie.js';
import CommentModel from '../models/comment.js';

describe('MovieController', function () {
    let movieController, movieModelMock, commentModelMock, reqMock, resMock;

    beforeEach(function () {
        movieModelMock = createStubInstance(MovieModel);
        commentModelMock = createStubInstance(CommentModel);
        movieController = new MovieController({});

        // Inject mocks
        movieController.movieModel = movieModelMock;
        movieController.commentModel = commentModelMock;

        // Mock request and response objects
        reqMock = { params: {}, body: {} };
        resMock = {
            json: stub(),
            render: stub(),
            status: stub().returnsThis(),
            redirect: stub()
        };
    });

    describe('getTopMovies', function () {
        it('should return top movies as JSON', async function () {
            const movies = [{ id: 1, title: 'Movie 1' }];
            movieModelMock.getTopMovies.resolves(movies);

            await movieController.getTopMovies(reqMock, resMock);

            expect(movieModelMock.getTopMovies.calledOnce).to.be.true;
            expect(resMock.json.calledOnceWith(movies)).to.be.true;
        });

        it('should return 500 if an error occurs', async function () {
            const error = new Error('Something went wrong');
            movieModelMock.getTopMovies.rejects(error);

            await movieController.getTopMovies(reqMock, resMock);

            expect(movieModelMock.getTopMovies.calledOnce).to.be.true;
            expect(resMock.status.calledOnceWith(500)).to.be.true;
            expect(resMock.json.calledOnceWith(error)).to.be.true;
        });
    });

    describe('getMovie', function () {
        it('should render movie with comments', async function () {
            const movie = { id: 1, title: 'Movie 1' };
            const comments = [{ id: 1, text: 'Great movie!' }];
            reqMock.params.id = 1;
            movieModelMock.getMovieById.resolves(movie);
            commentModelMock.getCommentsForMovie.resolves(comments);

            await movieController.getMovie(reqMock, resMock);

            expect(movieModelMock.getMovieById.calledOnceWith(1)).to.be.true;
            expect(commentModelMock.getCommentsForMovie.calledOnceWith(1)).to.be.true;
            expect(resMock.render.calledOnceWith('movie', { movie, comments })).to.be.true;
        });

        it('should return error as JSON if an error occurs', async function () {
            const error = new Error('Something went wrong');
            reqMock.params.id = 1;
            movieModelMock.getMovieById.rejects(error);

            await movieController.getMovie(reqMock, resMock);

            expect(movieModelMock.getMovieById.calledOnceWith(1)).to.be.true;
            expect(resMock.json.calledOnceWith(error)).to.be.true;
        });
    });

    describe('addComment', function () {
        it('should add a comment and redirect', async function () {
            reqMock.params.id = 1;
            reqMock.body = { text: 'Great movie!', username: 'user1' };
            commentModelMock.addComment.resolves();

            await movieController.addComment(reqMock, resMock);

            expect(commentModelMock.addComment.calledOnceWith(1, 'user1', 'Great movie!')).to.be.true;
            expect(resMock.redirect.calledOnceWith(`/api/movie/1`)).to.be.true;
        });

        it('should return 500 if an error occurs while adding a comment', async function () {
            const error = new Error('Something went wrong');
            reqMock.params.id = 1;
            reqMock.body = { text: 'Great movie!', username: 'user1' };
            commentModelMock.addComment.rejects(error);

            await movieController.addComment(reqMock, resMock);

            expect(commentModelMock.addComment.calledOnceWith(1, 'user1', 'Great movie!')).to.be.true;
            expect(resMock.status.calledOnceWith(500)).to.be.true;
            expect(resMock.json.calledOnceWith(error)).to.be.true;
        });
    });
});
