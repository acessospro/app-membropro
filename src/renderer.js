document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.botao-iniciar-perfil').forEach(button => {
        button.addEventListener('click', () => {
            const profileId = button.getAttribute('data-profile-id');

            if (!profileId) {
                atualizarStatus('❌ Erro: Nenhum ID de perfil encontrado.', 'erro');
                return;
            }

            atualizarStatus('⏳ Acessando ferramenta...', 'info');
            
            // Envia o ID do perfil para o processo principal via IPC
            window.electronAPI.startProfile(profileId);
        });
    });
});

// 🔹 Função para exibir logs estilizados no app
function atualizarStatus(mensagem, tipo) {
    const statusContainer = document.getElementById('status-mensagens');
    if (!statusContainer) return;

    const statusElement = document.createElement('p');
    statusElement.textContent = mensagem;
    statusElement.classList.add(tipo);

    // Remove mensagens antigas após um tempo
    setTimeout(() => {
        statusElement.remove();
    }, 5000);

    statusContainer.appendChild(statusElement);
}

// 🔹 Captura os logs do processo principal e exibe no frontend
window.electronAPI.onLogMessage((mensagem) => {
    atualizarStatus(mensagem, 'log');
});
