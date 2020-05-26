const faker = require('faker');
const Post = require('./models/post');
const cities = require('./cities');

async function seedPosts() {
	await Post.deleteMany({});
	for(const i of new Array(600)) {
		const random1000 = Math.floor(Math.random() * 1000);
		const random5 = Math.floor(Math.random() * 6);
		const title = faker.lorem.word();
		const description = faker.lorem.text();
		const postData = {
			title,
			description,
			currency: 'USD',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			geometry: {
				type: 'Point',
				coordinates: [cities[random1000].longitude, cities[random1000].latitude],
			},
			price: random1000,
			avgRating: random5,
			author:'5bb27cd1f986d278582aa58c',
			images: [
				{
					url: 'https://res.cloudinary.com/dvjsq7rnx/image/upload/v1588601938/cookshare/stocking_filler_wzrnul.jpg'
				}
			],
			amount: 10
		}
		let post = new Post(postData);
		post.properties.description = `<strong><a href="/posts/${post._id}">${title}</a></strong><p>${post.location}</p><p>${description.substring(0, 20)}...</p>`;
		await post.save();
	}
	console.log('600 new posts created');
}

module.exports = seedPosts;