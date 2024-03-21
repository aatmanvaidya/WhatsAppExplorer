const mongoose = require("mongoose");
const express = require("express");
const fs = require("fs");

const jwtAuth = require("../lib/jwtAuth");
const Video = require("../db/Video");
const { Client } = require("elasticsearch");
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
      index: "videos_testdb5",
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
  Video.aggregate(arr, { allowDiskUse: true })
    .then((content) => {
      if (content == null) {
        res.status(404).json({
          message: "no video found",
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
      index: "videos_testdb5",
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
      return res.json(0);
    }
    res.json(response.hits.total.value);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.get("/:id", (req, res) => {
  // const videoPath = `${req.query.platform == "facebook" ? "media_fb" : "media"}/${req.params.id}`; // only mp4 videos
  const videoPath = `media/${req.params.id}`; // only mp4 videos
  const videoStat = fs.statSync(videoPath);
  const fileSize = videoStat.size;
  const videoRange = req.headers.range;

  if (videoRange) {
    const parts = videoRange.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

module.exports = router;
