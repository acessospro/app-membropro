document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.botao-iniciar-perfil').forEach(button => {
        button.addEventListener('click', () => {
            const profileId = button.getAttribute('data-profile-id');
            if (!profileId) {
                console.error('[ERRO] Nenhum ID de perfil encontrado no botão.');
                return;
            }

            console.log(`[INFO] Enviando ID do perfil para Electron: ${profileId}`);
            window.electronAPI.startProfile(profileId);
        });
    });
});
