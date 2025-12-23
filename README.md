# Dashboard de Backup

Um dashboard minimalista e moderno construído com React + Vite para monitorar execuções de backup e mostrar a contagem regressiva para o próximo agendamento.

## Funcionalidades

- **Contagem Regressiva**: Mostra exatamente quanto tempo falta para a próxima quarta-feira às 10:00.
- **Integração com Google Drive**: Conecta-se à API do Google Drive para buscar os logs de backup mais recentes.
- **Logs Recentes**: Exibe os últimos 3 backups com status (Sucesso/Falha) e data.
- **Design Minimalista**: Interface limpa e calma, focada na legibilidade.

## Como Usar

### 1. Instalação

```bash
npm install
```

### 2. Configuração do Google Drive

Para ver dados reais (ao invés de dados de demonstração), você precisa configurar suas credenciais:

1. Obtenha um **Client ID** e uma **API Key** no [Google Cloud Console](https://console.cloud.google.com/).
2. Abra o arquivo `src/services/driveService.js`.
3. Adicione suas credenciais no topo do arquivo:
    ```javascript
    const CLIENT_ID = 'SEU_CLIENT_ID_AQUI';
    const API_KEY = 'SUA_API_KEY_AQUI';
    ```

### 3. Rodando o Projeto

```bash
npm run dev
```

Acesse `http://localhost:5173` no seu navegador.

## Estrutura do Projeto

- `src/components/`: Componentes React (Countdown, BackupTable).
- `src/services/`: Lógica de integração com serviços externos (Google Drive).
- `src/index.css`: Estilos globais e tema.
