import { stub } from 'sinon';
import { expect } from 'chai';
import { ObjectId } from 'mongodb';
import MovieModel from './movie.js';

describe('MovieModel', function () {
    let db, collection, movieModel;

    beforeEach(function () {
        collection = {
            aggregate: stub().returns({ toArray: stub().resolves([]) }),
            findOne: stub().resolves({})
        };

        db = {
            collection: stub().returns(collection)
        };

        movieModel = new MovieModel(db);
    });

    describe('getTopMovies', function () {
        it('should call aggregate with the correct pipeline and return the top movies', async function () {
            const mockMovies = [
                { title: "Movie 1", num_mflix_comments: 100 },
                { title: "Movie 2", num_mflix_comments: 95 },
            ];
            collection.aggregate().toArray.resolves(mockMovies);

            const result = await movieModel.getTopMovies();

            expect(collection.aggregate.calledOnce).to.be.true;
            expect(collection.aggregate.firstCall.args[0]).to.deep.equal([
                { $sort: { num_mflix_comments: -1 } },
                { $limit: 24 }
            ]);
            expect(result).to.deep.equal(mockMovies);
        });
    });

    describe('getMovieById', function () {
        it('should call findOne with the correct id and return the movie', async function () {
            const mockId = new ObjectId();
            const mockMovie = { _id: mockId, title: "Movie 1" };
            collection.findOne.resolves(mockMovie);

            const result = await movieModel.getMovieById(mockId);

            expect(collection.findOne.calledOnce).to.be.true;
            expect(collection.findOne.firstCall.args[0]).to.deep.equal({ "_id": mockId });
            expect(result).to.deep.equal(mockMovie);
        });
    });
});
