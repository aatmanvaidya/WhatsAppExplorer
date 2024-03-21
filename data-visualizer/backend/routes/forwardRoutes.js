const mongoose = require("mongoose");
const express = require("express");
const { Client } = require("elasticsearch");
const jwtAuth = require("../lib/jwtAuth");
const Message = require("../db/Message");

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
        must: []
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
      query.bool.should = [
        { match: { altText: searchQuery } },
        { match: { content: searchQuery } },
      ];
      query.bool.minimum_should_match = 1;
    }
    const response = await elasticClient.search({
      index: "forward_testdb5",
      body: {
        query: query,
        sort: [
          { latestTimestamp: { order: "desc" } },
          { maxForwardingScore: { order: "desc" } },
          { uniqueChatnamesCount: { order: "desc" } },
          { frequency: { order: "desc" } },
        ],
        from: skip,
        size: 50,
      },
    });

    if (response.hits.total.value === 0) {
      res.json([]);
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
        must: []
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
      query.bool.should = [
        { match: { altText: searchQuery } },
        { match: { content: searchQuery } },
      ];
      query.bool.minimum_should_match = 1;
    }
    const response = await elasticClient.search({
      index: "forward_testdb5",
      body: {
        query: query,
        sort: [
          { latestTimestamp: { order: "desc" } },
          { maxForwardingScore: { order: "desc" } },
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

module.exports = router;
