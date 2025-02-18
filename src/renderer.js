document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.botao-iniciar-perfil').forEach(button => {
        button.addEventListener('click', () => {
            const profileId = button.getAttribute('data-profile-id');
            if (!profileId) {
                atualizarStatus('Erro: Nenhum ID de perfil encontrado.', 'erro');
                return;
            }

            atualizarStatus('Acessando ferramenta...', 'info');
            window.electronAPI.startProfile(profileId);
        });
    });
});

function atualizarStatus(mensagem, tipo) {
    const statusContainer = document.getElementById('status-mensagens');
    const statusElement = document.createElement('p');
    statusElement.textContent = mensagem;
    statusElement.classList.add(tipo);
    statusContainer.appendChild(statusElement);
}
