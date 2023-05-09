const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "static")));

const userRouter = require("./routes/userRoute");
app.use("/api/", userRouter);

module.exports = app;
