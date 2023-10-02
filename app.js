const express = require("express");
const dotenv = require("dotenv");
const logger = require("morgan");

dotenv.config({ path: "./config/config.env" });

const envelopesRouter = require("./routes/envelopes");
const transactionsRouter = require("./routes/transactions");
const docsRouter = require("./routes/docs");
const seedDb = require('./config/seed')

const app = express();

app.use(logger("dev"));
app.use(express.json());

app.use("/api-docs", docsRouter);

app.use("/api/v1/envelopes", envelopesRouter);
app.use("/api/v1/transactions", transactionsRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
