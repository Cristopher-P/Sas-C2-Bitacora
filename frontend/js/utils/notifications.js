/**
 * NOTIFICATIONS.JS - Utilidades para mostrar notificaciones
 */

class Notifications {
    static show(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notifications') || this.createContainer();
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        }[type] || 'fas fa-info-circle';
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="${icon}" style="font-size: 1.2rem;"></i>
                <div>${message}</div>
                <button class="notification-close" style="margin-left: auto; background: none; border: none; color: inherit; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Cerrar al hacer click
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        // Auto-remover
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }
        
        return notification;
    }
    
    static createContainer() {
        const container = document.createElement('div');
        container.id = 'notifications';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
        `;
        document.body.appendChild(container);
        return container;
    }
    
    static removeNotification(notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    // Métodos rápidos
    static success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }
    
    static error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }
    
    static warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }
    
    static info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }
    
    static alert(message, title = 'Aviso') {
        return alert(`${title}\n\n${message}`);
    }
    
    static confirm(message, title = 'Confirmar') {
        return confirm(`${title}\n\n${message}`);
    }
    
    static prompt(message, defaultValue = '') {
        return prompt(message, defaultValue);
    }
}

// Hacer disponible globalmente
window.Notifications = Notifications;