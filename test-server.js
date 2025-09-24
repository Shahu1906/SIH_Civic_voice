import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello, Civic Voice Backend is working!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
