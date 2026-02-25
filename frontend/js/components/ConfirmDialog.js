
class ConfirmDialog {
    show(options = {}) {
        return new Promise((resolve) => {
            const {
                title = '¿Confirmar acción?',
                message = '¿Estás seguro de continuar?',
                confirmText = 'Confirmar',
                cancelText = 'Cancelar',
                type = 'default',
                icon = '❓'
            } = options;

            const overlay = document.createElement('div');
            overlay.className = 'confirm-dialog-overlay fade-in';
            overlay.innerHTML = `
                <div class="confirm-dialog scale-in">
                    <div class="confirm-dialog-icon">${icon}</div>
                    <h3 class="confirm-dialog-title">${title}</h3>
                    <p class="confirm-dialog-message">${message}</p>
                    <div class="confirm-dialog-buttons">
                        <button class="confirm-btn-cancel">${cancelText}</button>
                        <button class="confirm-btn-confirm ${type === 'danger' ? 'confirm-btn-danger' : ''}">${confirmText}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const btnCancel = overlay.querySelector('.confirm-btn-cancel');
            const btnConfirm = overlay.querySelector('.confirm-btn-confirm');

            const close = (result) => {
                overlay.classList.add('fade-out');
                setTimeout(() => {
                    overlay.remove();
                    resolve(result);
                }, 300);
            };

            btnCancel.onclick = () => close(false);
            btnConfirm.onclick = () => close(true);
            overlay.onclick = (e) => {
                if (e.target === overlay) close(false);
            };
        });
    }

    async confirm(message, title) {
        return this.show({ message, title });
    }

    async delete(itemName = 'este elemento') {
        return this.show({
            title: 'Confirmar eliminación',
            message: `¿Estás seguro de eliminar ${itemName}? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar',
            type: 'danger',
            icon: '🗑️'
        });
    }

    async warning(message, title = 'Advertencia') {
        return this.show({
            title,
            message,
            type: 'warning',
            icon: '⚠️'
        });
    }
}

window.Confirm = new ConfirmDialog();
