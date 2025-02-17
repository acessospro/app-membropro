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
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        allowToChangeInstallationDirectory: true,
        oneClick: false,
        runAfterFinish: true,
        requestExecutionLevel: "admin"
      }
    },
    {
      name: '@electron-forge/maker-dmg', // 🔹 Gera DMG no macOS
      platforms: ['darwin'],
      config: {
        format: 'ULFO',
        background: path.resolve(__dirname, "src/assets/dmg-background.png"), // (Opcional) Fundo do instalador DMG
        icon: path.resolve(__dirname, "src/assets/icon.icns"),
        overwrite: true
      }
    },
    {
      name: '@electron-forge/maker-appimage', // 🔹 Gera AppImage no Linux
      platforms: ['linux'],
      config: {
        options: {
          icon: path.resolve(__dirname, "src/assets/icon.png"),
          categories: ["Utility"]
        }
      }
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
