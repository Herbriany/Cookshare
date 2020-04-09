const User = require('../models/user');
const Post = require('../models/post');
const passport = require('passport');
const mapBoxToken = process.env.MAPBOX_TOKEN;

module.exports = {

  async landingPage(req, res, next) {
    const posts = await Post.find({});
    res.render('index', { posts, mapBoxToken, title: 'Cookshare - Home' });
  },

  getRegister(req, res, next) {
    res.render('register.ejs', { title: 'Register' } )
  },

  async postRegister(req, res, next) {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      image: req.body.image
    });
    let user = await User.register(newUser, req.body.password);
    req.login(user, function(err) {
      if (err) return next(err);
      req.session.success = `You successfully logged in ${user.username}!` 
      res.redirect('/');
    })
  },

  getLogin(req, res, next) {
    res.render('login.ejs', { title: 'Login' } )
  },

  postLogin(req, res, next) {
    passport.authenticate('local', {
      successRedirect: '/', 
      failureRedirect: '/login'
    })(req, res, next);
  },

  getLogout(req, res, next) {
      req.logout();
      res.redirect('/');
  }
}
