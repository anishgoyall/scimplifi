const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const configureMulter = require("./middleware/uploadFilesMiddleware");
const calculationHelper = require("./helper/calculationHelper");

const app = express();
app.use(bodyParser.json());

const sessions = new Set();
const fileTimes = [];

const upload = configureMulter(sessions, fileTimes);

app.post("/api/v1/create-session", (req, res) => {
    const sessionId = uuidv4();
    sessions.add(sessionId);
    res.json({ session_id: sessionId });
});

app.post(
    "/api/v1/upload-file/:session_id",
    upload.array("files", 15),
    (req, res) => {
        const sessionId = req.params.session_id;
        if (!sessions.has(sessionId)) {
            return res.status(400).json({ error: "Session does not exist" });
        }

        if (req.files.length > 15) {
            return res
                .status(400)
                .json({ error: "Maximum 15 files can be uploaded" });
        }

        const result = calculationHelper(sessionId);

        res.json({ result: result });
    }
);

app.delete("/api/v1/delete-session/:session_id", (req, res) => {
    const sessionId = req.params.session_id;
    if (!sessions.has(sessionId)) {
        return res.status(400).json({ error: "Session does not exist" });
    }

    sessions.delete(sessionId);
    res.json({ message: "Session deleted successfully" });
});

app.delete("/api/v1/delete-file/:session_id/:file_name", (req, res) => {
    const sessionId = req.params.session_id;
    const filename = req.params.file_name;

    const filePath = `./uploads/${sessionId}/${filename}`;
    if (!fs.existsSync(filePath)) {
        return res.status(400).json({ error: "File does not exist" });
    }

    fs.unlinkSync(filePath);
    delete fileTimes[sessionId + filename];

    const result = calculationHelper(sessionId);
    res.json({ message: "File deleted successfully", result: result });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
