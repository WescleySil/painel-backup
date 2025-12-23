
import React, { useState, useEffect } from 'react';
import Countdown from './components/Countdown';
import BackupTable from './components/BackupTable';
import { initClient, getBackupLogs } from './services/driveService';

function App() {
  const [backups, setBackups] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Google Drive Client (API Key only)
    initClient((status) => {
      setConnected(status);
      fetchLogs();
    });
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const logs = await getBackupLogs();
    setBackups(logs);
    setLoading(false);
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
        <Countdown />
        <div className="spacer"></div>
        {loading ? (
          <p className="loading-text">Carregando informações do backup...</p>
        ) : (
          <BackupTable backups={backups} />
        )}
      </main>

      <footer className="app-footer">
        <p>Sistema de Backup Automatizado &bull; Quartas-feiras às 10:00</p>
      </footer>
    </div>
  );
}

export default App;
