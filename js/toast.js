/**
 * Toast Notification System
 * Replaces native alert() with sleek, custom notifications.
 */

const Toast = {
    init() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
    },

    show(message, type = 'success') {
        this.init();

        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Icon selection
        let icon = '';
        if (type === 'success') {
            icon = '<span class="toast-icon">✓</span>';
        } else if (type === 'error') {
            icon = '<span class="toast-icon">✕</span>';
        }

        toast.innerHTML = `
            ${icon}
            <span class="toast-message">${message}</span>
            <span class="toast-close" onclick="this.parentElement.remove()">×</span>
        `;

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentElement) toast.remove();
            }, 3000);
        }, 3000);
    }
};

// Global Exposure for legacy script compatibility
window.showToast = (message, type) => Toast.show(message, type);

// Styles are expected to be in common.css or landing.css
