import express from "express";
import cors from 'cors'
import cookieParser from "cookie-parser";

const port = 8000;
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true
  })
)

app.get("/", (req, res) => {
  res.send("Hello camplyr!!!");
});

app.listen(port, () => {
  console.log(`Server is now running at ${port}`);
});
