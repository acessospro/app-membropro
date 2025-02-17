import { app, BrowserWindow, ipcMain, Menu, shell, session } from 'electron';
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

let mainWindow;

// 🔹 Cria a janela do Electron
app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
        }
    });

    mainWindow.loadURL(DASHBOARD_URL);

    // 🔹 Remove o menu padrão e adiciona o personalizado
    const menu = Menu.buildFromTemplate([
        {
            label: 'Menu',
            submenu: [
                {
                    label: 'Atualizar',
                    accelerator: 'F5',
                    click: () => mainWindow.reload()
                },
                {
                    label: 'Reiniciar',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => app.relaunch() || app.exit()
                },
                {
                    label: 'Limpar Cache',
                    accelerator: 'CmdOrCtrl+Shift+Del',
                    click: async () => {
                        try {
                            await session.defaultSession.clearCache();
                            await session.defaultSession.clearStorageData();
                            console.log('[INFO] Cache do app e navegador limpos.');
                            mainWindow.reload();
                        } catch (error) {
                            console.error('[ERRO] Falha ao limpar o cache:', error);
                        }
                    }
                },
                {
                    label: 'Solicitar Suporte',
                    click: () => shell.openExternal('https://wa.me/message/GZXMOEPJE7EGC1')
                },
                {
                    label: 'Sair',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => app.quit()
                }
            ]
        }
    ]);
    Menu.setApplicationMenu(menu);

    // 🔹 Cria o atalho no desktop automaticamente
    createDesktopShortcut();
});

// 🔹 Captura o `profileId` enviado pelo botão
ipcMain.on('start-profile', async (_event, profileId) => {
    console.log(`[INFO] Iniciando Orbita com o perfil ${profileId}...`);

    const goLogin = new GoLogin({
        token: GOLOGIN_TOKEN,
        profile_id: profileId
    });

    try {
        const { status, wsUrl } = await goLogin.start();

        if (status !== 'success' || !wsUrl) {
            throw new Error("Erro ao obter WebSocket do GoLogin.");
        }

        console.log("[SUCESSO] Orbita iniciado via GoLogin.");

        const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl });

        console.log("[INFO] Conectado ao Orbita.");
    } catch (error) {
        console.error("[ERRO] Falha ao iniciar Orbita:", error);
    }
});

// 🔹 Servidor Express para status
const agentApp = express();
agentApp.use(cors());
agentApp.use(express.json());

agentApp.get('/status', (_req, res) => {
    res.json({ status: 'running' });
});

const PORT = 8888;
agentApp.listen(PORT, () => {
    console.log(`✅ Agente rodando em http://localhost:${PORT}`);
});

// 🔹 Fecha o app corretamente
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 🔹 Função para criar atalhos no desktop (Windows, Mac e Linux)
function createDesktopShortcut() {
    const desktopPath = path.join(os.homedir(), "Desktop");
    const shortcutPathWin = path.join(desktopPath, `${APP_NAME}.lnk`);
    const shortcutPathMac = path.join(desktopPath, `${APP_NAME}.app`);
    const shortcutPathLinux = path.join(desktopPath, `${APP_NAME}.desktop`);

    if (process.platform === 'win32') {
        if (!fs.existsSync(shortcutPathWin)) {
            exec(`powershell.exe $s=(New-Object -COM WScript.Shell).CreateShortcut('${shortcutPathWin}');$s.TargetPath='${process.execPath}';$s.Save()`, (err) => {
                if (err) console.error("[ERRO] Falha ao criar atalho no Windows:", err);
                else console.log("[SUCESSO] Atalho criado no Windows.");
            });
        }
    } else if (process.platform === 'darwin') {
        if (!fs.existsSync(shortcutPathMac)) {
            fs.symlinkSync(process.execPath, shortcutPathMac, 'file');
            console.log("[SUCESSO] Atalho criado no macOS.");
        }
    } else if (process.platform === 'linux') {
        if (!fs.existsSync(shortcutPathLinux)) {
            const shortcutContent = `[Desktop Entry]
Type=Application
Name=${APP_NAME}
Exec=${process.execPath}
Icon=${path.join(__dirname, "src/assets/icon.png")}
Terminal=false`;
            fs.writeFileSync(shortcutPathLinux, shortcutContent, { mode: 0o755 });
            console.log("[SUCESSO] Atalho criado no Linux.");
        }
    }
}
