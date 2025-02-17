import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  packagerConfig: {
    asar: true,
    icon: path.resolve(__dirname, "src/assets/icon") // Ícone padrão para todas as plataformas
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: "app-membropro",
        authors: "Acessos Pro",
        exe: "app-membropro.exe",
        setupExe: "MembroProInstaller.exe",
        setupIcon: path.resolve(__dirname, "src/assets/icon.ico"),
        iconUrl: "https://membro.pro/assets/icon.ico",
        loadingGif: path.resolve(__dirname, "src/assets/loader.gif"),
        shortcutName: "MembroPro",
        createDesktopShortcut: true, // 🔹 Criar atalho na área de trabalho
        createStartMenuShortcut: true, // 🔹 Criar atalho no menu iniciar
        allowToChangeInstallationDirectory: true, // 🔹 Permitir que o usuário escolha a pasta de instalação
        oneClick: false, // 🔹 Instalador interativo (permite ver as opções)
        runAfterFinish: true, // 🔹 Abre o app após a instalação
        requestExecutionLevel: "admin" // 🔹 **Força execução como Administrador**
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: "Acessos Pro",
          homepage: "https://membro.pro",
          icon: path.resolve(__dirname, "src/assets/icon.png")
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          maintainer: "Acessos Pro",
          homepage: "https://membro.pro",
          icon: path.resolve(__dirname, "src/assets/icon.png")
        }
      }
    }
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "acessospro",
          name: "app-membropro"
        },
        prerelease: false,
        draft: true
      }
    }
  ]
};
