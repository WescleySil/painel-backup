
import React from 'react';

const BackupTable = ({ backups }) => {
    return (
        <div className="table-container">
            <h2 className="table-title">Backups Recentes</h2>
            {backups.length === 0 ? (
                <p className="no-data">Nenhum backup recente encontrado.</p>
            ) : (
                <table className="backup-table">
                    <thead>
                        <tr>
                            <th>Data / Hora</th>
                            <th>Arquivo</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {backups.map((backup) => (
                            <tr key={backup.id} className={`row-${backup.status.toLowerCase()}`}>
                                <td>{new Date(backup.createdTime).toLocaleString('pt-BR')}</td>
                                <td className="file-name">{backup.name}</td>
                                <td>
                                    <span className={`status-badge ${backup.status.toLowerCase()}`}>
                                        {backup.status === 'Success' ? 'Sucesso' :
                                            backup.status === 'Skipped' ? 'Ignorado' : 'Falha'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default BackupTable;
