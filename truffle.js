module.exports = {
  build: {
    "index.html": "index.html",
    "app.js": [
      "javascripts/app.js"
    ],
    "images/": "images/"
  },
  deploy: [
  ],
  rpc: {
    host: "localhost",
    port: 8545
  }
};
