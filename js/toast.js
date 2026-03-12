/**
 * Simple Alert-based Notification System for ShopKhata
 * Replaces the toast feature with basic browser popups as requested.
 */

class SimpleAlert {
    /**
     * Show a basic alert
     * @param {string} message 
     * @param {string} type 
     */
    show(message, type = 'Info') {
        // Simple alert with the type prefixed for clarity
        const prefix = type ? `${type.toUpperCase()}: ` : '';
        window.alert(`${prefix}${message}`);
    }

    success(message) {
        this.show(message, 'Success');
    }

    error(message) {
        this.show(message, 'Error');
    }

    info(message) {
        this.show(message, 'Info');
    }

    warning(message) {
        this.show(message, 'Warning');
    }

    // Check for messages in localStorage on page load
    checkPending() {
        const pending = localStorage.getItem('shopkhata_toast');
        if (pending) {
            try {
                const { message, type } = JSON.parse(pending);
                this.show(message, type);
            } catch (e) {
                console.error('Error parsing pending message', e);
            } finally {
                localStorage.removeItem('shopkhata_toast');
            }
        }
    }
}

// Global instance (kept as shopToast to avoid breaking existing code)
window.shopToast = new SimpleAlert();

// Auto check for pending messages on page load
document.addEventListener('DOMContentLoaded', () => {
    window.shopToast.checkPending();
});

/**
 * Utility to set a message to be shown on the next page
 */
window.setPendingToast = (type, message) => {
    localStorage.setItem('shopkhata_toast', JSON.stringify({ type, message }));
};

