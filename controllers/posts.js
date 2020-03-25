const Post = require('../models/post');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dvjsq7rnx',
    api_key: '274757371774276',
    api_secret: process.env.CLOUDINARY_SECRET
})

module.exports = {
    async postIndex(req, res, next) {
        let posts = await Post.find({});
        res.render('posts/index', { posts, title: 'Post Index' });
    },


    postNew(req, res, next) {
        res.render('posts/new', { title: 'Post New'});
    },


    async postCreate(req, res, next) {
        req.body.post.images = [];
        for(const file of req.files) {
            let image = await cloudinary.v2.uploader.upload(file.path)
            req.body.post.images.push({
                url: image.secure_url,
                public_id: image.public_id
            })
        }

        let response = await geocodingClient.forwardGeocode({
            query: req.body.post.location,
            limit: 2
        })
        .send()
        let parsed_response = JSON.parse(response.rawBody).features[1].center
        req.body.post.coordinates = parsed_response;

        let post = await Post.create(req.body.post);
        req.session.success = "Post created successfully!"
        res.redirect(`/posts/${post.id}`);
    },


    async postShow(req, res, next) {
        let post = await Post.findById(req.params.id).populate({
            path: 'reviews',
            options: { sort: { '_id': -1} }
        });
        console.log(post)
        res.render('posts/show', { post });
    },


    async postEdit(req, res, next) {
        let post = await Post.findById(req.params.id);
        res.render('posts/edit', { post, title:'Edit Post' });
    },


    async postUpdate(req, res, next) {
        let post = await Post.findById(req.params.id);

        if (req.body.deleteImages && req.body.deleteImages.length) {
            let deleteImages = req.body.deleteImages;
            for (const public_id of deleteImages) {
                await cloudinary.v2.uploader.destroy(public_id);
                for (const image of post.images) {
                    if (image.public_id === public_id) {
                        let index = post.images.indexOf(image);
                        post.images.splice(index, 1);
                    }
                }
            }
        }

        if(req.files) {
            for(const file of req.files) {
                let image = await cloudinary.v2.uploader.upload(file.path);
                post.images.push({
                    url: image.secure_url,
                    public_id: image.public_id
                })
            }
        }

        if (post.location !== req.body.post.location) {
            let response = await geocodingClient.forwardGeocode({
                query: req.body.post.location,
                limit: 2
            })
            .send()
            let parsed_response = JSON.parse(response.rawBody).features[1].center
            post.coordinates = parsed_response;
            post.location = req.body.post.location;
        }

        post.title = req.body.post.title;
        post.price = req.body.post.price;
        post.description = req.body.post.description;

        post.save();
        res.redirect(`/posts/${post.id}`);
    },


    async postDestroy(req, res, next) {
        let post = await Post.findById(req.params.id);
        for (const image of post.images) {
            await cloudinary.v2.uploader.destroy(image.public_id);
        }
        await post.remove();
        res.redirect('/posts');
    }

}