'use strict';

const express = require('express');
const app = express()
const http = require('http');
const swaggerTools = require('swagger-tools');
const fetch = require('node-fetch');
const passport = require('passport');
const {OAuth2Strategy} = require('passport-google-oauth');
const cookieSession = require('cookie-session');
const swaggerDoc = require('./api/swagger.json');
const User = require('./controllers/User')

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || `http://localhost:${PORT}`
// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Google profile), and
//   invoke a callback with a user object.

passport.use(new OAuth2Strategy({
    clientID: process.env.GOOG_CLIENT_ID,
    clientSecret: process.env.GOOG_CLIENT_SECRET,
    callbackURL: `${HOST}/auth/google/callback`
  }, async (token, tokenSecret, profile, done) => {
      const user_id = `goog://${profile.id}`
      const email = profile.emails[0]
      const photo = profile.photos[0]
      let user = {id: user_id, name: profile.displayName, photo: photo ? photo.value : '', email: email ? email.value : ''}
      try {
        user = await User.insertOrUpdateUser(user)
      } catch (e) {
        done(e)
      } finally {
        console.log(user)
        done(null, user)
      }
  }
))

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
var serverPort = PORT;
app.use(express.static('./public'))

app.use(cookieSession({maxAge: 30 * 24 * 60 * 60 * 1000, keys: [process.env.COOKIE_SECRET]}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/logout', function(req, res){
  req.logout()
  res.redirect('/')
});

app.get('/auth/google',
  passport.authenticate('google', 
  { scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']}));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });


app.get('/knesset/:query*', async (req, res, next) => {
  const {query} = req.params
  try {
    const url = `http://knesset.gov.il/Odata/ParliamentInfo.svc/${query}?${Object.keys(req.query).map(k => `${k}=${encodeURIComponent(req.query[k])}`)}`
    const response = await fetch(url, {headers: {'Accept': 'application/json'}})
    const contentType = response.headers.get('content-type')
    if (!contentType.startsWith('application/json')) {
      res.status(500).send({error: 'Knesset Service Error'})
      return
    }

    res.send(await response.text())
  } catch (e) {
    res.status(500).send(e.message)
  }
})

// swaggerRouter configuration
const options = {
  controllers: './controllers',
  useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // Start the server
  http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
  });
});

