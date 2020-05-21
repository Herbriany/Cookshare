const Post = require('../models/post');
const Review = require('../models/review');

module.exports = {

    async reviewCreate(req, res, next) {
        let post = await Post.findById(req.params.id).populate('reviews').exec();
        if (post.author.equals(req.user._id)) {
            req.session.error = "You can't post a review for your own post!"
            return res.redirect(`/posts/${post.id}`)
        }
        let haveReviewed = post.reviews.filter(review => {
            return review.author.equals(req.user._id);
        });
        if(haveReviewed.length) {
            req.session.error = 'You can only have one review per post';
            return res.redirect(`/posts/${post.id}`);
        }
        req.body.review.author = req.user._id;
        let review = await Review.create(req.body.review);
        post.reviews.push(review);
        post.save();
        req.session.success = 'Review created successfully';
        res.redirect(`/posts/${post.id}`);
    },

    async reviewUpdate(req, res, next) {
        let review = await Review.findByIdAndUpdate(req.params.review_id, req.body.review);
        req.session.success = 'Review updated successfully!';
        res.redirect(`/posts/${req.params.id}`);
    },

    async reviewDestroy(req, res, next) {
        await Post.findByIdAndUpdate(req.params.id, {
            $pull: { reviews : req.params.review_id }
        });
        await Review.findByIdAndRemove(req.params.review_id);
        req.session.success = 'Review deleted successfully!';
        res.redirect(`/posts/${req.params.id}`);
    }

}