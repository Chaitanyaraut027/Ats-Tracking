import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

let pythonProcess = null;

const checkHealth = async (url) => {
    try {
        const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(1000) });
        return res.ok;
    } catch (e) {
        return false;
    }
};

const getPythonExecutable = () => {
    // 1. Check local python-ats virtual environment
    const venvWin = path.resolve('..', 'python-ats', 'venv', 'Scripts', 'python.exe');
    if (fs.existsSync(venvWin)) return venvWin;

    const venvUnix = path.resolve('..', 'python-ats', 'venv', 'bin', 'python');
    if (fs.existsSync(venvUnix)) return venvUnix;

    // 2. Fallback to system python
    return process.platform === 'win32' ? 'python' : 'python3';
};

export const startPythonService = async () => {
    const serviceUrl = process.env.ATS_SCORING_SERVICE_URL || 'http://localhost:8000';

    // Check if Python service is already running
    const alreadyRunning = await checkHealth(serviceUrl);
    if (alreadyRunning) {
        console.log(`[Python ATS Service] Service is already active at ${serviceUrl}`);
        return;
    }

    const pythonExe = getPythonExecutable();
    const pythonCwd = path.resolve('..', 'python-ats');

    console.log(`[Python ATS Service] Automatically starting Python microservice...`);
    console.log(`[Python ATS Service] Executable: ${pythonExe}`);
    console.log(`[Python ATS Service] Working Dir: ${pythonCwd}`);

    try {
        pythonProcess = spawn(pythonExe, ['-m', 'uvicorn', 'app.main:app', '--port', '8000', '--host', '127.0.0.1'], {
            cwd: pythonCwd,
            stdio: ['ignore', 'pipe', 'pipe'],
            windowsHide: true,
        });

        pythonProcess.stdout.on('data', (chunk) => {
            const line = chunk.toString().trim();
            if (line) console.log(`[Python Scorer] ${line}`);
        });

        pythonProcess.stderr.on('data', (chunk) => {
            const line = chunk.toString().trim();
            if (line) console.log(`[Python Scorer] ${line}`);
        });

        pythonProcess.on('error', (err) => {
            console.error(`[Python ATS Service] Failed to start:`, err.message);
        });

        pythonProcess.on('exit', (code) => {
            if (code !== 0 && code !== null) {
                console.warn(`[Python ATS Service] Exited with code ${code}`);
            }
        });

        // Clean termination on Node server exit
        const cleanExit = () => {
            if (pythonProcess && !pythonProcess.killed) {
                console.log('[Python ATS Service] Shutting down Python microservice...');
                try {
                    if (process.platform === 'win32') {
                        spawn('taskkill', ['/pid', pythonProcess.pid, '/f', '/t']);
                    } else {
                        pythonProcess.kill('SIGTERM');
                    }
                } catch (e) {}
            }
        };

        process.on('SIGINT', () => { cleanExit(); process.exit(); });
        process.on('SIGTERM', () => { cleanExit(); process.exit(); });
        process.on('exit', () => { cleanExit(); });

        // Wait up to 6 seconds for the service to become ready
        for (let i = 0; i < 12; i++) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            const isReady = await checkHealth(serviceUrl);
            if (isReady) {
                console.log(`[Python ATS Service] Microservice ready and listening at ${serviceUrl}`);
                return;
            }
        }

        console.warn(`[Python ATS Service] Started process (PID ${pythonProcess.pid}), awaiting first request.`);
    } catch (error) {
        console.error(`[Python ATS Service] Error launching process:`, error.message);
    }
};

export const stopPythonService = () => {
    if (pythonProcess && !pythonProcess.killed) {
        try {
            pythonProcess.kill('SIGTERM');
        } catch (e) {}
    }
};
