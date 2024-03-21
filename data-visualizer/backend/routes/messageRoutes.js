const mongoose = require("mongoose");
const express = require("express");

const jwtAuth = require("../lib/jwtAuth");
const Message = require("../db/Message");

const router = express.Router();

// Import the Elasticsearch client instance
const { Client } = require("elasticsearch");
const elasticClient = new Client({
  host: "https://ets.dbackup.cloud", // Replace with your Elasticsearch host
  log: "error", // Set the log level as needed
});

router.get("/", jwtAuth, async (req, res) => {
  try {
    const section = req.user.section;
    const platform = req.user.platform;
    const searchQuery = req.query.search || "";
    const skip = parseInt(req.query.skip) || 0;
    const dateMin = req.query.dateMin ? new Date(req.query.dateMin) : null;
    const dateMax = req.query.dateMax ? new Date(req.query.dateMax) : null;

    let query = {
      bool: {
        must: [],
        filter: [
          { exists: { field: "content.keyword" } },
          { script: { script: "doc['content.keyword'].size() > 0" } },
        ],
      },
    };

    // Adding match conditions
    if (section) {
      query.bool.must.push({ match: { section: section } });
    }
    if (platform) {
      query.bool.must.push({ match: { platform: platform } });
    }
    if (dateMin || dateMax) {
      const dateRange = {};
      if (dateMin) dateRange.gte = dateMin;
      if (dateMax) dateRange.lte = dateMax;
      query.bool.must.push({ range: { latestTimestamp: dateRange } });
    }
    if (searchQuery) {
      query.bool.must.push({ match: { content: searchQuery } });
    }
    query.bool.must.push({
      range: {
        uniqueChatnamesCount: {
          gte: 3,
        },
      },
    });
    query.bool.must.push({
      range: {
        frequency: {
          gte: 3,
        },
      },
    });
    const response = await elasticClient.search({
      index: "messages_testdb5",
      body: {
        query: query,
        sort: [
          { latestTimestamp: { order: "desc" } },
          { uniqueChatnamesCount: { order: "desc" } },
          { frequency: { order: "desc" } },
        ],
        from: skip,
        size: 50,
      },
    });

    if (response.hits.total.value === 0) {
      return res.json([]);
    }
    const aggregatedData = [];
    response.hits.hits.forEach((hit) => {
      const doc = hit._source;
      aggregatedData.push(doc);
    });
    res.json(aggregatedData);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.get("/metadata", jwtAuth, (req, res) => {
  let findParams = {
    section: req.user.section,
    platform: req.user.platform,
  };
  if (req.query.id) {
    findParams = {
      ...findParams,
      _id: mongoose.Types.ObjectId(req.query.id),
    };
  } else {
    res.status(404).json({
      message: "no contentID supplied",
    });
    return;
  }
  if (req.query.dateMin && req.query.dateMax) {
    findParams = {
      ...findParams,
      $and: [
        {
          "senderData.timestamp": {
            $gte: new Date(req.query.dateMin),
          },
        },
        {
          "senderData.timestamp": {
            $lte: new Date(req.query.dateMax),
          },
        },
      ],
    };
  } else if (req.query.dateMin) {
    findParams = {
      ...findParams,
      "senderData.timestamp": {
        $gte: new Date(req.query.dateMin),
      },
    };
  } else if (req.query.dateMax) {
    findParams = {
      ...findParams,
      "senderData.timestamp": {
        $lte: new Date(req.query.dateMax),
      },
    };
  }

  if (req.query.isForwarded == "true") {
    findParams = {
      ...findParams,
      "senderData.forwardingScore": { $gt: 4 },
    };
  }

  let skip = req.query.skip ? parseInt(req.query.skip) : 0;
  let arr = [
    { $unwind: "$senderData" },
    { $match: findParams },
    { $unset: ["content", "similarMessages"] },
    { $sort: { "senderData.timestamp": -1 } },
    { $skip: skip },
    { $limit: 50 },
  ];
  Message.aggregate(arr, { allowDiskUse: true })
    .then((content) => {
      if (content == null) {
        res.status(404).json({
          message: "no message found",
        });
        return;
      }
      res.json(content);
    })
    .catch((err) => {
      res.status(404).json(err);
    });
});

router.get("/id/:uuid", (req, res) => {
  const providedUUID = req.params.uuid;
  Message.findOne({ uuid: providedUUID })
    .then((message) => {
      if (!message) {
        res.status(404).json({
          error: "Message not found",
        });
        return;
      }
      res.send(message.content);
    })
    .catch((err) => {
      res.status(404).json(err);
    });
});

router.get("/similarmessages", jwtAuth, (req, res) => {
  let findParams = {
    section: req.user.section,
    platform: req.user.platform,
  };
  if (req.query.id) {
    findParams = {
      ...findParams,
      _id: mongoose.Types.ObjectId(req.query.id),
    };
  } else {
    res.status(404).json({
      message: "no contentID supplied",
    });
    return;
  }
  let timeStampParams = {};
  if (req.query.dateMin && req.query.dateMax) {
    timeStampParams = {
      $and: [
        {
          $gte: ["$$timestamp", new Date(req.query.dateMin)],
        },
        {
          $lte: ["$$timestamp", new Date(req.query.dateMax)],
        },
      ],
    };
  } else if (req.query.dateMin) {
    timeStampParams = {
      $gte: ["$$timestamp", new Date(req.query.dateMin)],
    };
  } else if (req.query.dateMax) {
    timeStampParams = {
      $lte: ["$$timestamp", new Date(req.query.dateMax)],
    };
  }

  // let skip = req.query.skip ? parseInt(req.query.skip) : 0;
  let arr = [
    { $match: findParams },
    { $unset: ["content", "senderData", "platform", "section"] },
    {
      $addFields: {
        similarMessages: {
          $map: {
            input: "$similarMessages",
            as: "message",
            in: {
              string: "$$message.string",
              timestamp: {
                $filter: {
                  input: "$$message.timestamp",
                  as: "timestamp",
                  cond: timeStampParams,
                  // $and: [
                  //   { $gte: ["$$timestamp", new Date(req.query.dateMin)] },
                  //   { $lte: ["$$timestamp", new Date(req.query.dateMax)] }
                  // ]
                },
              },
            },
          },
        },
      },
    },
    {
      $addFields: {
        similarMessages: {
          $filter: {
            input: {
              $map: {
                input: "$similarMessages",
                as: "message",
                in: {
                  string: "$$message.string",
                  frequency: { $size: "$$message.timestamp" },
                },
              },
            },
            as: "message",
            cond: { $ne: ["$$message.frequency", 0] },
          },
        },
      },
    },
    { $unwind: "$similarMessages" },
    {
      $sort: {
        "similarMessages.frequency": -1,
        "similarMessages.string": 1,
      },
    },
    {
      $group: {
        _id: "$_id",
        similarMessages: { $push: "$similarMessages" },
      },
    },
  ];
  Message.aggregate(arr, { allowDiskUse: true })
    .then((content) => {
      if (content == null) {
        res.status(404).json({
          message: "no message found",
        });
        return;
      }
      res.json(content[0]["similarMessages"]);
    })
    .catch((err) => {
      res.status(404).json(err);
    });
});

router.get("/getcount", jwtAuth, async (req, res) => {
  try {
    const section = req.user.section;
    const platform = req.user.platform;
    const searchQuery = req.query.search || "";
    const skip = parseInt(req.query.skip) || 0;
    const dateMin = req.query.dateMin ? new Date(req.query.dateMin) : null;
    const dateMax = req.query.dateMax ? new Date(req.query.dateMax) : null;

    let query = {
      bool: {
        must: [],
        filter: [
          { exists: { field: "content.keyword" } },
          { script: { script: "doc['content.keyword'].size() > 0" } },
        ],
      },
    };

    // Adding match conditions
    if (section) {
      query.bool.must.push({ match: { section: section } });
    }
    if (platform) {
      query.bool.must.push({ match: { platform: platform } });
    }
    if (dateMin || dateMax) {
      const dateRange = {};
      if (dateMin) dateRange.gte = dateMin;
      if (dateMax) dateRange.lte = dateMax;
      query.bool.must.push({ range: { "senderData.timestamp": dateRange } });
    }
    if (searchQuery) {
      query.bool.must.push({ match: { content: searchQuery } });
    }
    query.bool.must.push({
      range: {
        uniqueChatnamesCount: {
          gte: 3,
        },
      },
    });
    query.bool.must.push({
      range: {
        frequency: {
          gte: 3,
        },
      },
    });
    const response = await elasticClient.search({
      index: "messages_testdb5",
      body: {
        query: query,
        sort: [{ "senderData.timestamp": { order: "desc" } }],
        from: skip,
        size: 1,
      },
    });

    if (response.hits.total.value === 0) {
      return res.json(0);
    }

    res.json(response.hits.total.value);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.get("/captions", jwtAuth, (req, res) => {
  let findParams = {
    section: req.user.section,
    platform: req.user.platform,
  };
  if (req.query.captionOf) {
    findParams = {
      ...findParams,
      "senderData.captionOf": req.query.captionOf,
    };
  } else {
    res.status(404).json({
      message: "no content info supplied",
    });
    return;
  }
  if (req.query.dateMin && req.query.dateMax) {
    findParams = {
      ...findParams,
      $and: [
        {
          "senderData.timestamp": {
            $gte: new Date(req.query.dateMin),
          },
        },
        {
          "senderData.timestamp": {
            $lte: new Date(req.query.dateMax),
          },
        },
      ],
    };
  } else if (req.query.dateMin) {
    findParams = {
      ...findParams,
      "senderData.timestamp": {
        $gte: new Date(req.query.dateMin),
      },
    };
  } else if (req.query.dateMax) {
    findParams = {
      ...findParams,
      "senderData.timestamp": {
        $lte: new Date(req.query.dateMax),
      },
    };
  }

  if (req.query.isForwarded == "true") {
    findParams = {
      ...findParams,
      "senderData.forwardingScore": { $gt: 4 },
    };
  }

  let arr = [
    { $unwind: "$senderData" },
    { $match: findParams },
    { $unset: ["similarMessages"] },
    { $sort: { "senderData.timestamp": -1 } },
    {
      $group: {
        _id: "$content",
        content: { $first: "$content" },
      },
    },
    {
      $project: {
        _id: 0,
        content: 1,
      },
    },
  ];
  Message.aggregate(arr, { allowDiskUse: true })
    .then((content) => {
      if (content == null) {
        res.status(404).json({
          message: "no message found",
        });
        return;
      }
      res.json(content);
    })
    .catch((err) => {
      res.status(404).json(err);
    });
});

module.exports = router;
