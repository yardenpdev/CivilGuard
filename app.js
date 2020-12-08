'use strict';

const express = require('express');
const app = express()
const http = require('http');
const swaggerTools = require('swagger-tools');
const fetch = require('node-fetch');

var serverPort = 3000;
app.use(express.static('./public'))

app.get('/knesset/:query*', async (req, res, next) => {
  const {query} = req.params
  try {
    const url = `http://knesset.gov.il/Odata/ParliamentInfo.svc/${query}?${Object.keys(req.query).map(k => `${k}=${encodeURIComponent(req.query[k])}`)}`
    const response = await fetch(url, 
      {headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}})
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

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
const swaggerDoc = require('./api/swagger.json');

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