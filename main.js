const https = require('https');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const { execSync } = require('child_process'); 

const StartServer = () => {
    // Diretório onde os logs serão armazenados
    const logsDir = 'logs';
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }

    // Função para registrar logs
    const log = (message) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        console.log(logMessage);
        logStream.write(logMessage);
    };

    // Verificar se o arquivo de configuração existe
    const configPath = 'config.json';
    let config = {};

    if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath);
        config = JSON.parse(configData);
        if(config.customCertPath == "" && config.customKeyPath == ""){
            log("Criando Certificado")
            // Gerar certificado SSL falso apenas se nenhum certificado personalizado estiver configurado
            const command = `openssl req -x509 -newkey rsa:2048 -keyout chave_privada.key -out certificado.crt -days 365 -nodes -subj "/CN=localhost"`;
            execSync(command);
            // Salvar configurações padrão e caminhos dos certificados no arquivo
            config.customKeyPath = 'chave_privada.key';
            config.customCertPath = 'certificado.crt';
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        }
    } else {
        // Gerar configurações padrão se o arquivo não existir
        config = {
            targetAddress: '127.0.0.1',
            targetPort: 1337,
            saveLogs: true,
            customKeyPath: '',
            customCertPath: '',
        };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        // Gerar certificado SSL falso apenas se nenhum certificado personalizado estiver configurado
        const command = `openssl req -x509 -newkey rsa:2048 -keyout chave_privada.key -out certificado.crt -days 365 -nodes -subj "/CN=localhost"`;
        execSync(command);

        // Salvar configurações padrão e caminhos dos certificados no arquivo
        config.customKeyPath = 'chave_privada.key';
        config.customCertPath = 'certificado.crt';
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }

    // Arquivo de log
    let logStream = null;
    if (config.saveLogs) {
        const logFile = path.join(logsDir, 'server.log');
        logStream = fs.createWriteStream(logFile, { flags: 'a' });
    }

    // Função para gerar o certificado SSL
    const generateCertificate = () => {
        return {
            key: fs.readFileSync(config.customKeyPath),
            cert: fs.readFileSync(config.customCertPath)
        };
    };

    const options = generateCertificate();

    const server = https.createServer(options);
    const wss = new WebSocket.Server({ server });

    let wsTarget = null; // Referência para a conexão com o servidor WS de destino

    // Conexão do cliente WSS
    wss.on('connection', (ws) => {
        log('C_CONNECTED');

        if (!wsTarget || wsTarget.readyState !== WebSocket.OPEN) {
            wsTarget = new WebSocket(`ws://${config.targetAddress}:${config.targetPort}`);

            wsTarget.on('open', () => {
                log('D_CONNECTED');
            });

            wsTarget.on('message', (message) => {
                log(`D: ${message}`);
                if (Buffer.isBuffer(message)) {
                    data = message.toString(); // Converter o Buffer para uma string
                } else if (typeof message === 'string') {
                    data = message;
                } else {
                    log(`D_M_UNSUPORTED ${typeof message}`);
                    console.error('Tipo de mensagem não suportado:', typeof message);
                    return;
                }
                ws.send(data); // Encaminhar mensagens do servidor WS para o cliente WSS
            });

            wsTarget.on('close', () => {
                log('D_CLOSED');
                wsTarget = null;
            });
        }

        ws.on('message', (message) => {
            log(`C: ${message}`);
            if (wsTarget && wsTarget.readyState === WebSocket.OPEN) {
                wsTarget.send(message); // Encaminhar mensagens do cliente WSS para o servidor WS de destino
            }
        });

        ws.on('close', () => {
            log('C_CLOSED');
            if (wsTarget && wsTarget.readyState === WebSocket.OPEN) {
                wsTarget.close(); // Fechar conexão com o servidor WS de destino quando o cliente WSS se desconectar
            }
        });
    });

    server.listen(443, () => {
        log(`Servidor de WSS iniciado na porta ${443}.`);
    });
}

// // Função para verificar se o OpenSSL está instalado e iniciar o servidor
// const checkAndStartServer = async () => {
//     if (process.platform === 'win32') {
//         // Verificar se o OpenSSL está instalado no Windows
//         try {
//             execSync('openssl version'); // Verifica se o comando OpenSSL pode ser executado
//             console.log('OpenSSL já está instalado.');
//             StartServer(); // Inicia o servidor
//         } catch (error) {
//             console.error('OpenSSL não está instalado no sistema.');

//             let installFile = '';
//             if (process.arch === 'x64') {
//                 // Windows 64 bits
//                 installFile = 'Win64OpenSSL_Light-3_2_1.exe';
//             } else {
//                 // Windows 32 bits
//                 installFile = 'Win32OpenSSL_Light-3_2_1.exe';
//             }
        
//             const installerPath = path.join(__dirname, 'requirements', installFile);
        
//             // Função para instalar o OpenSSL
//             const installOpenSSL = () => {
//                 try {
//                     execSync(`start /wait ${installerPath}`, { stdio: 'inherit' });
//                     console.log('OpenSSL instalado com sucesso.');
//                     StartServer(); // Inicia o servidor após a instalação
//                 } catch (error) {
//                     console.error('Erro ao instalar o OpenSSL:', error.message);
//                 }
//             };
        
//             // Executar a instalação do OpenSSL
//             installOpenSSL();
//         }
//     } else {
//         StartServer();
//     }
// };



// checkAndStartServer();
StartServer();


