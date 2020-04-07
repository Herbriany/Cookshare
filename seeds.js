const faker = require('faker');
const Post = require('./models/post');

async function seedPosts() {
    await Post.remove({});
    for (const i of new Array(40)) {
        const post = {
            title : faker.lorem.word(),
            description : faker.lorem.text(),
            coordinates: [-122.084, 37.422],
            author : { 
                "_id" : "5e7c9f8810d0e57309bb6a31", 
                "username" : "Brian"
              }
        }
        await Post.create(post);
    }
    console.log('40 posts created');
}

module.exports = seedPosts;