// Modal Manager
class ModalManager {
    constructor() {
        this.modals = new Map();
    }
    
    show(options = {}) {
        const {
            title = 'Modal',
            content = '',
            size = 'medium', // small, medium, large
            closable = true,
            onClose = null,
            footer = null
        } = options;
        
        const modalId = `modal-${Date.now()}`;
        
        // Backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade-in';
        backdrop.onclick = closable ? () => this.close(modalId) : null;
        
        // Modal
        const modal = document.createElement('div');
        modal.className = `modal modal-${size} modal-enter`;
        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                ${closable ? '<button class="modal-close">×</button>' : ''}
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
        `;
        
        if (closable) {
            modal.querySelector('.modal-close').onclick = () => this.close(modalId);
        }
        
        document.body.appendChild(backdrop);
        document.body.appendChild(modal);
        
        this.modals.set(modalId, { modal, backdrop, onClose });
        
        return modalId;
    }
    
    close(modalId) {
        const data = this.modals.get(modalId);
        if (!data) return;
        
        data.modal.classList.add('fade-out');
        data.backdrop.classList.add('fade-out');
        
        setTimeout(() => {
            data.modal.remove();
            data.backdrop.remove();
            if (data.onClose) data.onClose();
            this.modals.delete(modalId);
        }, 300);
    }
    
    closeAll() {
        this.modals.forEach((_, id) => this.close(id));
    }
}

window.Modal = new ModalManager();
