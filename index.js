const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const app = express();
const path = require("path");
const userRouter = require("./routers/router");
const bookRouter = require("./routers/bookRouter");
const { getFile } = require("./controllers/aws");
const verificationRouter = require("./routers/verificationRoutes");

const PORT = process.env.PORT || 5050;
app.use(express.json());
app.use(cors());

app.use("/uploads/images/:key", (req, res) => {
  const fileKey = req.params.key;

  const readStream = getFile(fileKey);

  readStream.pipe(res);
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization"
  );

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");

  next();
});
app.get("/", (req, res) => {
  res.send("Connected To server");
});
app.use("/api/verification", verificationRouter);
app.use("/api/users", userRouter);

app.use("/api/books", bookRouter);

app.use((err, req, res, next) => {
  res.status(err.code || 500).json(err.message || "Something went wrong");
});

try {
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      app.listen(PORT, () => {
        console.log("Running on Port 5000");
      });
    });
} catch (err) {
  console.log(err);
}
