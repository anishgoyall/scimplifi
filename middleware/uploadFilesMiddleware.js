const multer = require('multer');
const fs = require('fs');
const path = require('path');

function configureMulter(sessions, fileTimes) {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const sessionId = req.params.session_id;
            const uploadPath = `./uploads/${sessionId}`;

            if (!sessions.has(sessionId)) {
                return cb(new Error('Invalid session ID'));
            }

            fs.mkdir(uploadPath, { recursive: true }, (err) => {
                if (err) return cb(err);

                const filesInFolder = fs.readdirSync(uploadPath);
                if (filesInFolder.length >= 15) {
                    filesInFolder.sort((a, b) => fileTimes[a] - fileTimes[b]);

                    const filesToDeleteCount = filesInFolder.length + 1 - 15;
                    for (let i = 0; i < filesToDeleteCount; i++) {
                        const filePath = path.join(uploadPath, filesInFolder[i]);
                        fs.unlinkSync(filePath);
                        delete fileTimes[sessionId + filesInFolder[i]];
                    }
                }

                cb(null, uploadPath);
            });
        },
        filename: (req, file, cb) => {
            const sessionId = req.params.session_id;
            if (!sessions.has(sessionId)) {
                return cb(new Error('Invalid session ID'));
            }

            fileTimes[sessionId + file.originalname] = Date.now();
            cb(null, file.originalname);
        },
    });

    const upload = multer({ storage: storage });

    return upload;
}

module.exports = configureMulter;
