import express   from "express";

const port = 8000;
const app = express();

app.get("/", (req, res) => {
  res.send("Hello camplyr");
});

app.listen(port, () => {
  console.log(`Server is now running at ${port}`);
});
