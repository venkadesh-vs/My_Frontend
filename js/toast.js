/**
 * Toast Notification System for ShopKhata
 */

class Toast {
    constructor() {
        this.container = document.querySelector('.toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Show a toast message
     * @param {Object} options - { title, message, type, duration }
     */
    show(options) {
        const {
            title = '',
            message = '',
            type = 'info', // success, error, info, warning
            duration = 4000
        } = options;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || 'ℹ'}</div>
            <div class="toast-content">
                ${title ? `<span class="toast-title">${title}</span>` : ''}
                <p class="toast-message">${message}</p>
            </div>
            <button class="toast-close">✕</button>
            <div class="toast-progress">
                <div class="toast-progress-bar" style="animation-duration: ${duration}ms"></div>
            </div>
        `;

        this.container.appendChild(toast);

        // Forced reflow to trigger animation
        toast.offsetHeight;
        toast.classList.add('show');

        const closeBtn = toast.querySelector('.toast-close');
        const autoHideTimeout = setTimeout(() => this.hide(toast), duration);

        closeBtn.onclick = () => {
            clearTimeout(autoHideTimeout);
            this.hide(toast);
        };
    }

    hide(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }

    success(message, title = 'Success') {
        this.show({ title, message, type: 'success' });
    }

    error(message, title = 'Error') {
        this.show({ title, message, type: 'error' });
    }

    info(message, title = 'Info') {
        this.show({ title, message, type: 'info' });
    }

    warning(message, title = 'Warning') {
        this.show({ title, message, type: 'warning' });
    }

    // Check for messages in localStorage on page load
    checkPending() {
        const pending = localStorage.getItem('shopkhata_toast');
        if (pending) {
            const { type, message, title } = JSON.parse(pending);
            this[type](message, title);
            localStorage.removeItem('shopkhata_toast');
        }
    }
}

// Global instance
window.shopToast = new Toast();

// Auto check for pending toasts
document.addEventListener('DOMContentLoaded', () => {
    window.shopToast.checkPending();
});

/**
 * Utility to set a toast to be shown on the next page
 */
window.setPendingToast = (type, message, title) => {
    localStorage.setItem('shopkhata_toast', JSON.stringify({ type, message, title }));
};
