
import fs from 'fs';
import path from 'path';

// 1. Read .env manually
const loadEnv = () => {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim();
                env[key] = val;
            }
        });
        return env;
    } catch (e) {
        console.error("Error reading .env file", e);
        return {};
    }
};

const env = loadEnv();
const API_KEY = env.VITE_GOOGLE_API_KEY;
const FOLDER_ID = env.VITE_GOOGLE_FOLDER_ID;

console.log("--- Google Drive Test Script ---");
console.log(`API Key: ${API_KEY ? 'Loaded' : 'Missing'}`);

const listFiles = async () => {
    try {
        let url = `https://www.googleapis.com/drive/v3/files?key=${API_KEY}`;
        // Specific query for backup.log
        let query = "name = 'backup.log' and trashed = false";

        if (FOLDER_ID) {
            query += ` and '${FOLDER_ID}' in parents`;
        }

        url += `&q=${encodeURIComponent(query)}`;
        url += `&fields=files(id,name,mimeType,createdTime,modifiedTime)`;
        url += `&pageSize=10`;
        url += `&orderBy=modifiedTime desc`;

        console.log(`fetching list: ${url}`);

        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Error List: ${response.status} ${response.statusText}`);
            return;
        }

        const data = await response.json();
        const files = data.files || [];

        console.log(`\nFound ${files.length} files:`);

        for (const f of files) {
            console.log(`[${f.modifiedTime}] ${f.name} (ID: ${f.id})`);

            // Attempt download
            console.log(`>>> Attempting to read content...`);
            const contentUrl = `https://www.googleapis.com/drive/v3/files/${f.id}?alt=media&key=${API_KEY}`;
            const res = await fetch(contentUrl);

            if (res.ok) {
                const text = await res.text();
                console.log("SUCCESS! Content Preview:");
                console.log(text.substring(0, 200) + "...");
            } else {
                console.error(`FAILED to read content. Status: ${res.status} ${res.statusText}`);
                const errText = await res.text();
                console.error("Error body:", errText);
            }
        }

    } catch (error) {
        console.error("Execution Error:", error);
    }
};

listFiles();
