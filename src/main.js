import { app, BrowserWindow, ipcMain, Menu, shell, session, dialog } from 'electron';
import GoLogin from 'gologin';
import puppeteer from 'puppeteer-core';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOLOGIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzkyZTI5YjU0MzUzZTY1NGQ0ODg1ZDIiLCJ0eXBlIjoiZGV2Iiwiand0aWQiOiI2N2IwMjYxODljZTQzNzIzNGY4YmMzMGYifQ.whj_4HL_bJiR4TrzWrJfOOcCoHrMcjQRMGcgZUMSTyE";
const DASHBOARD_URL = "https://membro.pro/page/dashboard";
const APP_NAME = "MembroPro";
const PORT = 3500; // 🔹 Alteração da porta para 3500

let mainWindow;

// 🔹 Servidor Express para status
const agentApp = express();
agentApp.use(cors());
agentApp.use(express.json());

agentApp.get('/status', (_req, res) => {
    res.json({ status: 'running' });
});

agentApp.listen(PORT, () => {
    console.log(`✅ Agente rodando em http://localhost:${PORT}`);
});

// 🔹 Criação da janela com *loader* inicial
app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1300, // 🔹 Janela maior
        height: 850,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
        }
    });

    // 🔹 Primeiro carrega a tela de loading
    mainWindow.loadFile(path.join(__dirname, 'src/loader.html'));

    setTimeout(() => {
        mainWindow.loadURL(DASHBOARD_URL);
    }, 5000); // 🔹 Mantém *loader.gif* por 5 segundos antes de abrir o app

    configurarFirewall(); // 🔹 Adiciona regras ao firewall

    // 🔹 Menu personalizado em linha (horizontal)
    const menuTemplate = [
        { label: 'Atualizar', accelerator: 'F5', click: () => mainWindow.reload() },
        { label: 'Reiniciar', accelerator: 'CmdOrCtrl+R', click: () => app.relaunch() || app.exit() },
        { label: 'Limpar Cache', click: limparCache },
        { label: 'Solicitar Suporte', click: () => shell.openExternal('https://wa.me/message/GZXMOEPJE7EGC1') },
        { label: 'Sair', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    createDesktopShortcut(); // 🔹 Criação do atalho no desktop
});

// 🔹 Limpar cache do app
async function limparCache() {
    try {
        await session.defaultSession.clearCache();
        await session.defaultSession.clearStorageData();
        console.log('[INFO] Cache do app e navegador limpos.');
        mainWindow.reload();
    } catch (error) {
        console.error('[ERRO] Falha ao limpar o cache:', error);
    }
}

// 🔹 Captura o `profileId` enviado pelo botão
ipcMain.on('start-profile', async (_event, profileId) => {
    console.log("[INFO] Abrindo perfil...");
    
    const goLogin = new GoLogin({
        token: GOLOGIN_TOKEN,
        profile_id: profileId
    });

    try {
        const { status, wsUrl } = await goLogin.start();

        if (status !== 'success' || !wsUrl) {
            throw new Error("Erro ao obter WebSocket.");
        }

        console.log("[SUCESSO] Perfil aberto com sucesso.");

        const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl });
    } catch (error) {
        console.error("[ERRO] Falha ao iniciar perfil:", error);
    }
});

// 🔹 Criar atalhos no desktop
function createDesktopShortcut() {
    const desktopPath = path.join(os.homedir(), "Desktop");
    const shortcutPathWin = path.join(desktopPath, `${APP_NAME}.lnk`);
    const shortcutPathMac = path.join(desktopPath, `${APP_NAME}.app`);
    const shortcutPathLinux = path.join(desktopPath, `${APP_NAME}.desktop`);

    if (process.platform === 'win32') {
        exec(`powershell.exe $s=(New-Object -COM WScript.Shell).CreateShortcut('${shortcutPathWin}');$s.TargetPath='${process.execPath}';$s.Save()`);
    } else if (process.platform === 'darwin') {
        fs.symlinkSync(process.execPath, shortcutPathMac, 'file');
    } else if (process.platform === 'linux') {
        fs.writeFileSync(shortcutPathLinux, `[Desktop Entry]\nType=Application\nName=${APP_NAME}\nExec=${process.execPath}\nTerminal=false`, { mode: 0o755 });
    }
}

// 🔹 Configuração de firewall
function configurarFirewall() {
    if (process.platform === 'win32') {
        exec(`netsh advfirewall firewall show rule name="MembroPro"`, (err, stdout) => {
            if (!stdout.includes("MembroPro")) {
                console.log("[INFO] Criando regra de firewall no Windows...");
                exec(`netsh advfirewall firewall add rule name="MembroPro" dir=in action=allow protocol=TCP localport=${PORT}`);
            }
        });
    } else if (process.platform === 'darwin') {
        exec(`sudo /usr/libexec/ApplicationFirewall/socketfilterfw --listapps`, (err, stdout) => {
            if (!stdout.includes(APP_NAME)) {
                console.log("[INFO] Criando regra de firewall no macOS...");
                exec(`sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add ${process.execPath}`);
            }
        });
    } else if (process.platform === 'linux') {
        exec(`sudo ufw status | grep "${PORT}"`, (err, stdout) => {
            if (!stdout.includes(`${PORT}`)) {
                console.log("[INFO] Criando regra de firewall no Linux...");
                exec(`sudo ufw allow ${PORT}/tcp`);
            }
        });
    }
}
