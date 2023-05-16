const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");

app.use(cors());
app.options("*", cors());

//middleware
app.use(express.json());
app.use(morgan("tiny"));

//Routes
app.get("/", (req, res) => {
  res.send("Hello");
});
const usersRoutes = require("./routes/userRoute");
const api = process.env.API_URL;
const userApi = `${api}/user`;
app.use(userApi, usersRoutes);

//Database
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "24solution",
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

//Server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server is running :${port}`);
});
