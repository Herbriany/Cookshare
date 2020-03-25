const Post = require('../models/post');
const Review = require('../models/review');

module.exports = {

    async reviewCreate(req, res, next) {
        let post = await Post.findById(req.params.id);
        let review = await Review.create(req.body.review);
        post.reviews.push(review);
        post.save();
        console.log(post)
        req.session.success = 'Review created successfully';
        res.redirect(`/posts/${post.id}`);
    },

    async reviewUpdate(req, res, next) {
    },

    async reviewDestroy(req, res, next) {
    }

}