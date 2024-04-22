const express = require("express");

const jwtAuth = require("../lib/jwtAuth");
const Log = require("../db/Log");

const router = express.Router();

router.get("/", jwtAuth, (req, res) => {
  Log.find()
    .then((content) => {
      res.json(content);
    })
    .catch((err) => {
      res.status(404).json(err);
    });
});

router.get("/lastlog", jwtAuth, (req, res) => {
  Log.findOne({}, {}, { sort: { date: -1 } })
    .then((content) => {
      res.json(content);
    })
    .catch((err) => {
      res.status(404).json(err);
    });
});

module.exports = router;
