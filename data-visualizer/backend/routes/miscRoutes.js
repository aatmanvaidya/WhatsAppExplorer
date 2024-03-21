const express = require("express");
const linkPreview = require("link-preview-js");
const Image = require("../db/Image");
const Message = require("../db/Message");
const Link = require("../db/Link");
const Video = require("../db/Video");
const jwtAuth = require("../lib/jwtAuth");

const router = express.Router();

router.post("/geturlmetadata", (req, res) => {
  if (req.body) {
    const url = req.body["url"];
    linkPreview
      .getLinkPreview(url)
      .then((data) => res.json(data))
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    res.status(400).json({ error: "Url Not Supplied" });
  }
});

router.post("/gettrending", (req, res) => {
  const startDate = new Date(req.body.dateMin);
  const endDate = new Date(req.body.dateMax);

  const platform = req.body.platform;
  const section = req.body.section;
  const type = req.body.type;
  const limit = parseInt(req.body.limit);

  if (type == "forward") {
    Message.aggregate([
      {
        $addFields: {
          contentType: {
            $cond: {
              if: { $not: "$contentType" },
              then: "message",
              else: "$contentType",
            },
          },
        },
      },
      { $unionWith: "images" },
      {
        $addFields: {
          contentType: {
            $cond: {
              if: { $not: "$contentType" },
              then: "image",
              else: "$contentType",
            },
          },
        },
      },
      { $unionWith: "links" },
      {
        $addFields: {
          contentType: {
            $cond: {
              if: { $not: "$contentType" },
              then: "link",
              else: "$contentType",
            },
          },
        },
      },
      {
        $match: {
          section: section,
          platform: platform,
          $and: [
            { "senderData.timestamp": { $gte: startDate } },
            { "senderData.timestamp": { $lte: endDate } },
            { "senderData.timestamp": { $not: { $lt: startDate } } },
            { "senderData.timestamp": { $not: { $gt: endDate } } },
          ],
        },
      },
      { $unwind: "$senderData" },
      { $match: { content: { $ne: null } } },
      { $match: { $expr: { $gte: [{ $strLenCP: "$content" }, 3] } } },
      {
        $group: {
          _id: {
            id: "$_id",
            content: "$content",
            contentType: "$contentType",
          },
          frequency: {
            $sum: 1,
          },
          maxForwardingScore: {
            $max: "$senderData.forwardingScore",
          },
          uniqueChatnames: { $addToSet: "$senderData.chatname" },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id.id",
          content: "$_id.content",
          contentType: "$_id.contentType",
          frequency: 1,
          maxForwardingScore: 1,
          uniqueChatnames: 1,
        },
      },
      { $addFields: { uniqueChatnamesCount: { $size: "$uniqueChatnames" } } },
      { $unset: ["uniqueChatnames"] },
      {
        $match: {
          maxForwardingScore: { $gte: 4 },
          frequency: { $gte: 3 },
          uniqueChatnamesCount: { $gte: 3 },
        },
      },
      {
        $sort: {
          maxForwardingScore: -1,
          uniqueChatnamesCount: -1,
          frequency: -1,
          id: -1,
        },
      },
      { $limit: limit },
    ])
      .then((data) => res.json(data))
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    let contentType = Image;
    if (type == "message") contentType = Message;
    else if (type == "link") contentType = Link;
    else if (type == "video") contentType = Video;

    contentType
      .aggregate([
        {
          $match: {
            section: section,
            platform: platform,
            $and: [
              { "senderData.timestamp": { $gte: startDate } },
              { "senderData.timestamp": { $lte: endDate } },
              { "senderData.timestamp": { $not: { $lt: startDate } } },
              { "senderData.timestamp": { $not: { $gt: endDate } } },
            ],
          },
        },
        { $unwind: "$senderData" },
        { $match: { content: { $ne: null } } },
        { $match: { $expr: { $gte: [{ $strLenCP: "$content" }, 3] } } },
        {
          $group: {
            _id: {
              id: "$_id",
              content: "$content",
            },
            frequency: {
              $sum: 1,
            },
            uniqueChatnames: { $addToSet: "$senderData.chatname" },
          },
        },
        {
          $project: {
            _id: 0,
            id: "$_id.id",
            content: "$_id.content",
            frequency: 1,
            uniqueChatnames: 1,
          },
        },
        { $addFields: { uniqueChatnamesCount: { $size: "$uniqueChatnames" } } },
        { $unset: ["uniqueChatnames"] },
        {
          $match: { frequency: { $gte: 3 }, uniqueChatnamesCount: { $gte: 3 } },
        },
        { $sort: { uniqueChatnamesCount: -1, frequency: -1, id: -1 } },
        { $limit: limit },
      ])
      .then((data) => res.json(data))
      .catch((err) => {
        res.status(400).json(err);
      });
  }
});

router.get("/nearmessages", jwtAuth, (req, res) => {
  const groupName = req.query.groupName;
  const timeStamp = new Date(req.query.timeStamp);

  const platform = req.user.platform;
  const section = req.user.section;

  Message.aggregate([
    {
      $addFields: {
        contentType: {
          $cond: {
            if: { $not: "$contentType" },
            then: "message",
            else: "$contentType",
          },
        },
      },
    },
    { $unionWith: "images" },
    {
      $addFields: {
        contentType: {
          $cond: {
            if: { $not: "$contentType" },
            then: "image",
            else: "$contentType",
          },
        },
      },
    },
    { $unionWith: "videos" },
    {
      $addFields: {
        contentType: {
          $cond: {
            if: { $not: "$contentType" },
            then: "video",
            else: "$contentType",
          },
        },
      },
    },
    { $match: { content: { $ne: null } } },
    { $match: { $expr: { $gt: [{ $strLenCP: "$content" }, 0] } } },
    {
      $match: {
        section: section,
        platform: platform,
      },
    },
    { $unwind: "$senderData" },
    {
      $match: {
        "senderData.chatname": groupName,
        $or: [
          { "senderData.timestamp": { $gte: timeStamp } },
          { "senderData.timestamp": { $lt: timeStamp } },
        ],
      },
    },
    {
      $facet: {
        nextMessages: [
          { $sort: { "senderData.timestamp": 1, "senderData.position": -1 } },
          { $match: { "senderData.timestamp": { $gt: timeStamp } } },
          { $limit: 10 },
        ],
        currentMessages: [
          { $sort: { "senderData.timestamp": 1, "senderData.position": -1 } },
          { $match: { "senderData.timestamp": { $eq: timeStamp } } },
        ],
        previousMessages: [
          { $sort: { "senderData.timestamp": -1, "senderData.position": 1 } },
          { $match: { "senderData.timestamp": { $lt: timeStamp } } },
          { $limit: 10 },
        ],
      },
    },
  ])
    .then((data) => {
      res.json(data[0]);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.get("/latestMessageTimestamp", jwtAuth, (req, res) => {
  let findParams = {
    section: req.user.section,
    platform: req.user.platform,
  };

  let arr = [
    { $unionWith: "images" },
    { $unionWith: "videos" },
    { $match: findParams },
    { $unwind: "$senderData" },
    {
      $group: { _id: null, latestTimestamp: { $max: "$senderData.timestamp" } },
    },
    { $project: { _id: 0, latestTimestamp: 1 } },
  ];
  Message.aggregate(arr, { allowDiskUse: true })
    .then((content) => {
      if (content == null) {
        res.status(404).json({
          message: "no content found",
        });
        return;
      }
      res.json(content[0]);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json(err);
    });
});

module.exports = router;
