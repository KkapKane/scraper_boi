const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
require("dotenv").config();

const app = express();
app.use(cors());

const SentimentData = async (url) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"],
    executablePath:
      process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  await page.goto(url);
  const text = await page.$eval("*", (el) => el.innerText);

  await browser.close();
  return { rawText: text };
};

app.get("/", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    res.status(400).json({ error: "URL parameter is required." });
    return;
  }
  const decodedUrl = decodeURIComponent(url);
  const result = await SentimentData(decodedUrl);
  res.json(result);
});

app.listen(5000, () => console.log("listening to port 5000"));
