require("dotenv").config();
const express = require('express');
const app = express();

const photosRouter = require("./api/photos/photos.router");

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS"
    );
    next();
  });

app.use("/api/photos", photosRouter);

app.listen(process.env.PORT || process.env.APP_PORT, () => {
    console.log("Node server up @ localhost:" + (process.env.PORT || process.env.APP_PORT));
});
