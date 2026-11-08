const modal = document.getElementById('projectModal');
const modalContent = modal.querySelector('.projectContent');
const modalBody = modal.querySelector('.projectBody');

function openModal(details) {
    modalBody.replaceChildren(details.content.cloneNode(true));
    modal.style.display = 'flex';
    modalContent.scrollTop = 0;
    document.body.classList.add('modalOpen');

    if (!history.state || !history.state.projectModal) {
        history.pushState({ projectModal: true }, '');
    }
}

function hideModal() {
    modal.style.display = 'none';
    document.body.classList.remove('modalOpen');
}

function closeModal() {
    if (history.state && history.state.projectModal) {
        history.back();
    } else {
        hideModal();
    }
}

document.getElementById('projects').addEventListener('click', (event) => {
    const button = event.target.closest('.seeMoreButton');
    if (button) {
        openModal(button.closest('.projectCard').querySelector('.projectDetails'));
    }
});

document.getElementById('closeModal').addEventListener('click', closeModal);

modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
    }
});

window.addEventListener('popstate', () => {
    if (modal.style.display === 'flex') {
        hideModal();
    }
});

if (history.state && history.state.projectModal) {
    history.replaceState(null, '');
}
