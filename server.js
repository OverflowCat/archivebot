// server.js
// where your node app starts

// init project
var Twit = require("twit");
const express = require("express");
const app = express();
const http = require("http");
var Crawler = require("simplecrawler");

var T = new Twit({
  consumer_key: process.env.T1,
  consumer_secret: process.env.T2,
  access_token: process.env.T3,
  access_token_secret: process.env.T4,
  timeout_ms: 7 * 1000, // optional HTTP request timeout to apply to all requests.
  strictSSL: true // optional - requires SSL certificates to be valid.
});
//var jb = require("nodejieba");
//var simplify = require("hanzi-tools").simplify;

var Datastore = require("nedb"),
  db1 = new Datastore({ filename: "db/1.db", autoload: true });
// You can issue commands right away

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  app.get("/", (request, response) => {
    console.log(Date.now() + " Ping Received");
    response.sendStatus(200);
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + process.env.PORT);
});
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

const telegraf = require("telegraf");
var bot = new telegraf(process.env.BOT_TOKEN);

function cmd(t, c) {
  if (c.substring(0, 1) != "/") c = "/" + c;
  const l = c.length;
  if (t.substring(0, l + 1) == c + " " || t == c) return t.substring(l + 1);
  return false;
}

function arc(url) {
  var c = Crawler(url);
  c.interval = 3333;
  c.maxConcurrency = 3;
  c.maxDepth = 1; // Etc.
  c.on("fetchcomplete", function(queueItem, responseBuffer, response) {
    console.log(
      "I just received %s (%d bytes)",
      queueItem.url,
      responseBuffer.length
    );
    console.log(
      "It was a resource of type %s",
      response.headers["content-type"]
    );
  });
  c.start();
}

bot.on("text", ctx => {
  var t = ctx.message.text;
  T.get("followers/list", { screen_name: t }, function(err, data, response) {
    var username = data.users[2].screen_name
    console.log(username);
    console.log(data.users.length)
    var users = data.users
    users.forEach(ele => {
      arc("https://web.archive.org/save/twitter.com/" + ele.screen_name)
    })
  });
});
 bot.on("forward", ctx => console.log(ctx))
bot.launch();
