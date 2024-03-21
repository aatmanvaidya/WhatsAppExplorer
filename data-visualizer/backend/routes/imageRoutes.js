const mongoose = require("mongoose");
const express = require("express");
const { Client } = require("elasticsearch");
const jwtAuth = require("../lib/jwtAuth");
const Image = require("../db/Image");

const router = express.Router();

const elasticClient = new Client({
  host: "https://ets.dbackup.cloud", // Replace with your Elasticsearch host
  log: "error", // Set the log level as needed
});

router.get("/", jwtAuth, async (req, res) => {
  try {
    const section = req.user.section;
    const platform = req.user.platform;
    const isDownloaded = true;
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
    if (isDownloaded) {
      query.bool.must.push({ match: { isDownloaded: isDownloaded } });
    }
    if (dateMin || dateMax) {
      const dateRange = {};
      if (dateMin) dateRange.gte = dateMin;
      if (dateMax) dateRange.lte = dateMax;
      query.bool.must.push({ range: { latestTimestamp: dateRange } });
    }
    if (searchQuery) {
      query.bool.must.push({ match: { altText: searchQuery } });
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
      index: "images_testdb5",
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
    { $unset: ["content"] },
    { $sort: { "senderData.timestamp": -1 } },
    { $skip: skip },
    { $limit: 50 },
  ];
  Image.aggregate(arr, { allowDiskUse: true })
    .then((content) => {
      if (content == null) {
        res.status(404).json({
          message: "no image found",
        });
        return;
      }
      res.json(content);
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
    const isDownloaded = true;
    let query = {
      bool: {
        must: [],
        filter: [],
      },
    };

    // Section and platform matching
    if (section) {
      query.bool.must.push({ match: { section } });
    }
    if (platform) {
      query.bool.must.push({ match: { platform } });
    }
    if (isDownloaded) {
      query.bool.must.push({ match: { isDownloaded: isDownloaded } });
    }

    // Date range filtering
    if (dateMin || dateMax) {
      const dateRange = {};
      if (dateMin) dateRange.gte = dateMin;
      if (dateMax) dateRange.lte = dateMax;
      query.bool.filter.push({ range: { "senderData.timestamp": dateRange } });
    }

    // Full-text search on altText
    if (searchQuery) {
      query.bool.must.push({ match: { altText: searchQuery } });
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
    // Execute the search query
    const response = await elasticClient.search({
      index: "images_testdb5",
      body: {
        query: query,
        sort: [{ "senderData.timestamp": { order: "desc" } }],
        from: skip,
        size: 1, // Modify size as per your requirement
      },
    });
    // console.log("Elasticsearch response:", response.hits.hits);
    // Check for no results

    // console.log(response.hits.hits)
    if (response.hits.total.value === 0) {
      return res.json(0);
    }
    res.json(response.hits.total.value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error executing search", error: err });
  }
});

module.exports = router;
