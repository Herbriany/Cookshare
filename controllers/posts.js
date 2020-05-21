const Post = require('../models/post');
const fixerToken = process.env.FIXER_API_KEY
const mapBoxToken = process.env.MAPBOX_TOKEN;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');
const currencies = require('../currencies');
const fetch = require("node-fetch");

module.exports = {
    async postIndex(req, res, next) {
        let { dbQuery, sort, postAmount } = res.locals;
        delete res.locals.dbQuery;
        postAmount = Number(postAmount);
        let posts = await Post.paginate(dbQuery, {
            page: req.query.page || 1,
            limit: postAmount || 10,
            sort: sort || '-_id'
        });
        posts.page = Number(posts.page);
        if (!posts.docs.length && res.locals.query) {
            res.locals.error = 'No results match your search'
        }

        // convert currency
        var newPrices = [];
        if (!req.user) {
           var userCurrency = 'USD';
        }
        else {
           var userCurrency = req.user.currency;
        }
        var symbol = currencies[userCurrency]['symbol_native'];

        // posts.docs.forEach(post => {
        //     if (userCurrency !== post.currency) {
        //         newPrices.push(fetch(`http://data.fixer.io/api/latest?access_key=${fixerToken}&symbols=${userCurrency},${post.currency}&format=1`)
        //                 .then(response => {
        //                     if (response.ok) {
        //                         return response.json();
        //                     }
        //                     else {
        //                         res.locals.error = 'Error retrieving posts';
        //                         return res.redirect('/');
        //                     }
        //                 })
        //                 .then(result =>{
        //                     let postCurrency = result.rates[post.currency];
        //                     let currentUserCurrency = result.rates[userCurrency];
        //                     let convertedCurrencyFloat = ((currentUserCurrency/postCurrency)*post.price);
        //                     let finalPrice = convertedCurrencyFloat.toFixed(currencies[userCurrency]['decimal_digits']);
        //                     return (finalPrice);
        //                 })
        //         )
        //     }
        //     else {
        //         newPrices.push(post.price.toFixed(currencies[post.currency]['decimal_digits']))
        //     }
        // })

        // Promise.all(newPrices).then(prices => res.render('posts/index', { posts, mapBoxToken, prices, symbol, title: 'Posts Index' }));
        var fetchURL = `http://data.fixer.io/api/latest?access_key=${fixerToken}&symbols=${userCurrency},`
        posts.docs.forEach(post => {
            fetchURL += post.currency + ',';
        })
        fetchURL = fetchURL.slice(0, -1);

        var newPrices = await fetch(fetchURL)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                else {
                    res.locals.error = 'Error retrieving posts';
                    return res.redirect('/');
                }
            })
            .then(result =>{
                var postPrices = [];
                posts.docs.forEach(post => {
                    let postCurrency = result.rates[post.currency];
                    let currentUserCurrency = result.rates[userCurrency];
                    let convertedCurrencyFloat = ((currentUserCurrency/postCurrency)*post.price);
                    postPrices.push(convertedCurrencyFloat.toFixed(currencies[userCurrency]['decimal_digits']));
                })
                return postPrices;
            })
        
        res.render('posts/index', { posts, mapBoxToken, newPrices, symbol, title: 'Posts Index' })
    },


    postNew(req, res, next) {        
        var step = res.locals.step
        res.render('posts/new', { title: 'Post New', step});
    },


    async postCreate(req, res, next) {
        if (req.body.price <= 0) {
            res.locals.error = 'Price must be a positive number';
            return res.redirect(`/posts/new`);
        }
        req.body.post.images = [];
        for(const file of req.files) {
            req.body.post.images.push({
                url: file.secure_url,
                public_id: file.public_id
            })
        }

        let response = await geocodingClient.forwardGeocode({
            query: req.body.post.location,
            limit: 2
        })
        .send()
        let parsed_response = JSON.parse(response.rawBody).features[0].geometry
        req.body.post.geometry = parsed_response;
        req.body.post.author = req.user._id;
        req.body.post.currency = req.user.currency;
        let post = new Post(req.body.post);
		post.properties.description = `<strong><a href="/posts/${post._id}">${post.title}</a></strong><p>${post.location}</p><p>${post.description.substring(0, 20)}...</p>`;
		await post.save();
        req.session.success = "Post created successfully!"
        res.redirect(`/posts/${post.id}`);
    },


    async postShow(req, res, next) {
        let post = await Post.findById(req.params.id).populate({
            path: 'reviews',
            options: { sort: { '_id': -1}},
            populate: { 
                path: 'author',
                model: 'User'
            }
        });
        // const floorRating = post.calculateAvgRating();
        const floorRating = post.avgRating;
        
        // convert currency if currentUser and post currencies are different
        var newPrice;
        var userCurrency;
        if (!req.user) {
            userCurrency = 'USD';
        }
        else {
            userCurrency = req.user.currency;
        }
        var symbol = currencies[userCurrency]['symbol_native'];

        if (userCurrency !== post.currency) {
            await fetch(`http://data.fixer.io/api/latest?access_key=${fixerToken}&symbols=${userCurrency},${post.currency}&format=1`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                else {
                    res.locals.error = 'Error retrieving posts';
                    return res.redirect('/');
                }
            })
            .then(result =>{
                let postCurrency = result.rates[post.currency];
                let currentUserCurrency = result.rates[userCurrency];
                let convertedCurrencyFloat = ((currentUserCurrency/postCurrency)*post.price);
                newPrice = convertedCurrencyFloat.toFixed(currencies[userCurrency]['decimal_digits']);
            })
        }
        else {
            newPrice = post.price.toFixed(currencies[post.currency]['decimal_digits']);
        }

        res.render('posts/show', { post, mapBoxToken, floorRating, symbol, newPrice });
    },


    postEdit(req, res, next) {
        var step = res.locals.step
        res.render('posts/edit', { title:'Edit Post', step });
    },

    async postUpdate(req, res, next) {

        if (req.body.price <= 0) {
            res.locals.error = 'Price must be a positive number';
            res.redirect(`/posts/${post.id}/edit`);
        }

        const { post } = res.locals;
        
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
                post.images.push({
                    url: file.secure_url,
                    public_id: file.public_id
                })
            }
        }

        if (post.location !== req.body.post.location) {
            let response = await geocodingClient.forwardGeocode({
                query: req.body.post.location,
                limit: 2
            })
            .send()
            let parsed_response = JSON.parse(response.rawBody).features[1].geometry
            post.geometry = parsed_response;
            post.location = req.body.post.location;
        }

        post.title = req.body.post.title;
        post.price = req.body.post.price;
        post.description = req.body.post.description;
        post.properties.description = `<strong><a href="/posts/${post._id}">${post.title}</a></strong><p>${post.location}</p><p>${post.description.substring(0, 20)}...</p>`;

        await post.save();
        res.redirect(`/posts/${post.id}`);
    },


    async postDestroy(req, res, next) {
        const { post } = res.locals;
        for (const image of post.images) {
            await cloudinary.v2.uploader.destroy(image.public_id);
        }
        await post.remove();
        req.session.success = 'Post destroyed successfully';
        res.redirect('/posts');
    }

}