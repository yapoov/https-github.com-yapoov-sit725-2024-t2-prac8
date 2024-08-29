import { expect } from 'chai';
import { stub, match } from 'sinon';
import { ObjectId } from 'mongodb';
import CommentModel from './comment.js';

describe('CommentModel', function() {
    let db, collection, commentModel;

    beforeEach(function() {
        collection = {
            find: stub().returns({ limit: stub().returns({ toArray: stub().resolves([]) }) }),
            insertOne: stub().resolves({ insertedId: new ObjectId() })
        };

        db = {
            collection: stub().returns(collection)
        };

        commentModel = new CommentModel(db);
    });

    describe('getCommentsForMovie', function() {
        it('should call find with the correct movieId and return the comments', async function() {
            const mockMovieId = new ObjectId();
            const mockComments = [
                { movie_id: mockMovieId, text: "Great movie!", date: new Date() },
                { movie_id: mockMovieId, text: "Loved it!", date: new Date() }
            ];
            collection.find().limit().toArray.resolves(mockComments);

            const result = await commentModel.getCommentsForMovie(mockMovieId);
            expect(result).to.deep.equal(mockComments);
        });
    });

    describe('addComment', function() {
        it('should insert a new comment with the correct details', async function() {
            const mockMovieId = new ObjectId();
            const username = "JohnDoe";
            const text = "Amazing movie!";
            const mockComment = {
                movie_id: mockMovieId,
                name: username,
                text,
                date: match.date
            };

            const result = await commentModel.addComment(mockMovieId, username, text);

            const insertedComment = collection.insertOne.firstCall.args[0];
            expect(insertedComment).to.deep.equal(result);
        });

        it('should default the username to "Anonymous" if not provided', async function() {
            const mockMovieId = new ObjectId();
            const text = "Anonymous comment!";
            const mockComment = {
                movie_id: mockMovieId,
                name: "Anonymous",
                text,
                date: match.date
            };

            const result = await commentModel.addComment(mockMovieId, undefined, text);

            const insertedComment = collection.insertOne.firstCall.args[0];
            expect(insertedComment).to.include(mockComment);
            expect(result).to.have.property('insertedId');
        });
    });
});
