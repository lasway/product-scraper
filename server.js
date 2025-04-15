const express = require("express");
const urlRoutes = require("./routes/urlRoutes");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", urlRoutes);

app.listen(port, () => {
  console.log(`URL shortener service running at http://localhost:${port}`);
});
