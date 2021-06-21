const express = require("express");
const app = express();

console.log(`NODE_ENV=${config.NODE_ENV}`);

app.get("/", (req, res) => {
  res.send("Sup homie");
});

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server running on ec2-18-222-26-166.us-east-2.compute.amazonaws.com:${port}`))
