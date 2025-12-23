// Instagram Modal Functions
function openInstagramModal() {
    const modal = document.getElementById('instagramModal');
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
}

function closeInstagramModal() {
    const modal = document.getElementById('instagramModal');
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}

// Close modal on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeInstagramModal();
    }
});

// Close modal on outside click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('instagramModal');
    if (modal && e.target === modal) {
        closeInstagramModal();
    }
});