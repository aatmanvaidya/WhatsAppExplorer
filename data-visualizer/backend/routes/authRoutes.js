const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const authKeys = require("../lib/authKeys");

const User = require("../db/User");

const router = express.Router();

router.post("/signup", (req, res) => {
  const data = req.body;
  let user = new User({
    name: data.name,
    email: data.email,
    password: data.password,
    type: data.type,
    section: data.section,
    platform: data.platform,
    restricted: data.restricted ? data.restricted : false,
  });

  user
    .save()
    .then(() => {
      // Token
      const token = jwt.sign({ _id: user._id }, authKeys.jwtSecretKey);
      res.json({
        token: token,
        type: user.type,
        section: user.section,
        platform: user.platform,
        restricted: user.restricted,
      });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.post("/login", (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.status(401).json(info);
        return;
      }
      // Token
      const token = jwt.sign({ _id: user._id }, authKeys.jwtSecretKey);
      res.json({
        token: token,
        type: user.type,
        section: user.section,
        platform: user.platform,
        restricted: user.restricted,
      });
    },
  )(req, res, next);
});

module.exports = router;
