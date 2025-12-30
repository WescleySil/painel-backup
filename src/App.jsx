
import React, { useState, useEffect } from 'react';
import Countdown from './components/Countdown';
import BackupTable from './components/BackupTable';
import { initClient, getBackupLogs } from './services/driveService';

import FooterCredits from './components/FooterCredits';

function App() {
  const [backups, setBackups] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPollingWindow, setIsPollingWindow] = useState(false);
  const [todaysBackupFound, setTodaysBackupFound] = useState(false);

  useEffect(() => {
    // Initialize Google Drive Client (API Key only)
    initClient((status) => {
      setConnected(status);
      fetchLogs();
    });
  }, []);

  useEffect(() => {
    // Reset todaysBackupFound when entering the polling window
    if (isPollingWindow) {
      setTodaysBackupFound(false);
    }
  }, [isPollingWindow]);

  useEffect(() => {
    // Polling logic
    let intervalId;

    if (isPollingWindow && !todaysBackupFound && connected) {
      console.log("Starting polling for new backup (every 60s)...");
      // Poll immediately
      fetchLogs(true);

      intervalId = setInterval(() => {
        console.log("Polling for new backup...");
        fetchLogs(true);
      }, 60000); // 1 minute
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPollingWindow, todaysBackupFound, connected]);

  const fetchLogs = async (isPolling = false) => {
    if (!isPolling) setLoading(true); // Don't show loading spinner on background poll

    const logs = await getBackupLogs();
    setBackups(logs);

    // Check if we found today's backup
    if (logs && logs.length > 0) {
      const latest = logs[0];
      const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD


      if (latest.createdTime && latest.createdTime.startsWith(todayStr)) {
        console.log("Today's backup found! Stopping polling.");
        setTodaysBackupFound(true);
      }
    }

    if (!isPolling) setLoading(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="status-indicator">
          {connected ? <span className="dot online"></span> : <span className="dot offline"></span>}
          {connected ? "Conectado ao Drive (Público)" : "Desconectado"}
        </div>
      </header>

      <main className="main-content">
        <Countdown onBackupSlot={setIsPollingWindow} />
        <div className="spacer"></div>
        {loading ? (
          <p className="loading-text">Carregando informações do backup...</p>
        ) : (
          <BackupTable backups={backups} />
        )}
      </main>

      <footer className="app-footer">
        <p>Sistema de Backup Automatizado &bull; Quartas-feiras às 10:00</p>
        <FooterCredits />
      </footer>
    </div>
  );
}

export default App;
