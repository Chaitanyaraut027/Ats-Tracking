import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import User from '../models/User.js';

const router = express.Router();

const uploadDir = path.resolve('uploads', 'resume');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const id = req.params.id || 'anonymous';
        const ext = file.originalname.split('.').pop();
        const filename = `${id}.${ext}`;
        cb(null, filename);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// File upload route (supports single file named 'file' or 'resume')
router.post('/upload/resume/:id', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), async (req, res) => {
    try {
        const file = req.files?.file?.[0] || req.files?.resume?.[0];
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const id = req.params.id;
        const relativeUrl = `/uploads/resume/${file.filename}`;

        try {
            await User.findByIdAndUpdate(id, { resumeUrl: relativeUrl });
        } catch (e) {
            // Non-critical if id is not a Mongo user ID
        }

        res.status(200).json({
            success: true,
            message: 'Resume uploaded successfully',
            file,
            url: relativeUrl,
        });
    } catch (err) {
        console.error('File upload error:', err);
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});

// Serve / download resume by candidate ID
router.get('/upload/resume/:id', (req, res) => {
    const { id } = req.params;
    if (!fs.existsSync(uploadDir)) {
        return res.status(404).json({ message: 'No resumes stored yet' });
    }

    const files = fs.readdirSync(uploadDir);
    const candidateFile = files.find(f => f.startsWith(id));

    if (!candidateFile) {
        return res.status(404).json({ message: 'Resume not found for this candidate' });
    }

    const filePath = path.join(uploadDir, candidateFile);
    res.sendFile(filePath);
});

export default router;