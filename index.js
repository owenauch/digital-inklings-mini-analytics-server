const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;

console.log("Starting mini analytics server -- bye bye Google!");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

var db;

const server = require("http").createServer();
const port = process.env.PORT || 3000;

MongoClient.connect(process.env.MONGO_URL, (err, client) => {
  if (err) return console.log(err);
  db = client.db("freeanalytics");

  app.listen(port, () => {
    console.log(`listening on ${port}`);

    app.get("/", (_, res) => {
      res.send("Server is running!");
    });

    app.post("/pageload", (req, res) => {
      const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
      db.collection("pageload").insertOne(
        {
          pageload_date: new Date(req.body.pageload_date),
          pathname: req.body.pathname,
          ip: ip,
        },
        (err) => {
          if (err) return console.log(err);

          console.log("Pageload data:", { ...req.body, ip: ip });
          console.log("Saved pageload to database!");
          res.send("Success!");
        }
      );
    });
  });
});
