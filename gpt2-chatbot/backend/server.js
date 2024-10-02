const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const PORT = 5000; // Ensure this matches the port you are using for the fetch request

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Handle chat requests with fine-tuned model integration
app.post("/api/chat", async (req, res) => {
  console.log("Received chat request:", req.body); // Log the request body
  const { message } = req.body;

  try {
    // Update the command to call the Flask server at the correct endpoint
    const pythonProcess = spawn("curl", [
      "http://127.0.0.1:5001/chat", // Change this line
      "-d",
      JSON.stringify({ message }),
      "-H",
      "Content-Type: application/json",
    ]);

    let modelResponse = "";

    pythonProcess.stdout.on("data", (data) => {
      modelResponse += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Error from Python script: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        return res
          .status(500)
          .json({ error: "Failed to get a response from the model" });
      }
      res.json({ response: modelResponse.trim() });
    });
  } catch (error) {
    console.error("Error communicating with the model:", error);
    res.status(500).json({ error: "Failed to get a response from the model" });
  }
});

// Handle file uploads
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

  res.json({
    fileName: req.file.filename,
    filePath: `/uploads/${req.file.filename}`,
  });
});

// Handle logo uploads
app.post("/api/upload/logo", upload.single("logo"), (req, res) => {
  if (!req.file) return res.status(400).send("No logo uploaded.");

  res.json({
    fileName: req.file.filename,
    filePath: `/uploads/${req.file.filename}`,
  });
});

// Serve frontend
app.use(express.static(path.join(__dirname, "client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
