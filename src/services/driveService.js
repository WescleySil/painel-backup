
import { gapi } from 'gapi-script';

// REPLACE THESE WITH YOUR REAL CREDENTIALS (IN .ENV)
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const FOLDER_ID = import.meta.env.VITE_GOOGLE_FOLDER_ID || '';

// Mock Data incase of error
const MOCK_DATA = [
  { id: '1', name: 'backup_2025-12-10_10-00-00.zip', mimeType: 'application/zip', createdTime: '2025-12-10T10:00:00Z', size: '102400', status: 'Success' },
  { id: '2', name: 'backup_2025-12-03_10-00-00.zip', mimeType: 'application/zip', createdTime: '2025-12-03T10:00:00Z', size: '101200', status: 'Success' },
  { id: '3', name: 'backup_2025-11-26_10-00-00.zip', mimeType: 'application/zip', createdTime: '2025-11-26T10:00:00Z', size: '98000', status: 'Failed' },
];

let gapiInited = false;

export const initClient = async (callback) => {
  if (!API_KEY) {
    console.warn("Google Drive API Key missing. Using Mock Data.");
    callback(false);
    return;
  }

  gapi.load('client', () => {
    gapi.client.init({
      apiKey: API_KEY,
    }).then(() => {
      gapiInited = true;
      callback(true);
    }, (err) => {
      console.error("Error initializing GAPI client", err);
      callback(false);
    });
  });
};

export const signIn = () => { };
export const signOut = () => { };

export const getBackupLogs = async () => {
  if (!API_KEY) {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_DATA), 800));
  }

  try {
    // We search specifically for the log file to avoid picking up zip/xml backups
    let query = "name = 'backup.txt' and trashed = false";

    if (FOLDER_ID) {
      query += ` and '${FOLDER_ID}' in parents`;
    }

    const listResponse = await gapi.client.request({
      path: 'https://www.googleapis.com/drive/v3/files',
      method: 'GET',
      params: {
        q: query,
        pageSize: 1,
        orderBy: 'modifiedTime desc', // Get the most recently modified log
        fields: 'files(id, name, createdTime)'
      }
    });

    const files = listResponse.result.files;

    if (files && files.length > 0) {
      const logFile = files[0];

      // 2. Read the content using native fetch (proven to work in test script)
      const contentUrl = `https://www.googleapis.com/drive/v3/files/${logFile.id}?alt=media&key=${API_KEY}`;
      const contentResponse = await fetch(contentUrl);

      let text = "";
      if (contentResponse.ok) {
        text = await contentResponse.text();
      } else {
        console.error("Fetch failed:", contentResponse.status, contentResponse.statusText);
      }

      console.log("Raw Log Content Length:", text.length);

      if (!text) return [];

      // PARSING LOGIC FOR THE NEW FORMAT
      // 1. Split by the "Starting Automation Backup Process" block to identify separate runs
      //    We use regex to split but keep delimiters or just split by the separator line
      const rawBlocks = text.split("========================================");

      const backups = [];
      let currentBackup = null;

      // Iterate through chunks to reconstruct logical backup blocks
      // The log format is a bit chatty, so we look for "Starting" to begin a block 
      // and "Process Completed" to mark success.

      // Simpler approach: Process line by line state fully
      const lines = text.split('\n');

      let tempBackup = {};

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.includes("Starting Automation Backup Process")) {
          // New block starts found
          if (tempBackup.date) {
            backups.push(tempBackup);
          }
          // Extract date from this line: "2025-12-19 10:56:14,656 - INFO - ..."
          const dateMatch = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
          tempBackup = {
            date: dateMatch ? dateMatch[1] : new Date().toISOString(),
            status: 'Failed', // Default to failed until proven success or skipped
            filename: 'Unknown File'
          };
        }

        if (line.includes("Saved backup as:") || line.includes("Existing backup already present:")) {
          // Extract filename
          const parts = line.split('\\');
          const fileName = parts[parts.length - 1].trim();
          tempBackup.filename = fileName;
        }

        if (line.includes("Process Completed Successfully")) {
          // Only mark as Success if it wasn't already marked as Skipped (though usually Success implies done)
          if (tempBackup.status !== 'Skipped') {
            tempBackup.status = 'Success';
          }
        }

        if (line.includes("skipped creating duplicate") || line.includes("Skipped Upload")) {
          tempBackup.status = 'Skipped';
        }
      }

      // Push the last one
      if (tempBackup.date) {
        backups.push(tempBackup);
      }

      // Return the last 3, reversed (most recent first)
      return backups.reverse().slice(0, 3).map((bkp, idx) => ({
        id: `log-${idx}`,
        createdTime: bkp.date,
        status: bkp.status, // Success, Failed, or Skipped
        name: bkp.filename
      }));

    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching logs", error);
    return [];
  }
};
