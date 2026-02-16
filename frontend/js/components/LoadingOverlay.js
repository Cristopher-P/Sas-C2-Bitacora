// Loading Overlay
class LoadingOverlay {
    constructor() {
        this.overlay = null;
    }
    
    show(message = 'Cargando...') {
        if (this.overlay) {
            this.hide();
        }
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay fade-in';
        this.overlay.innerHTML = `
            <div>
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        
        document.body.appendChild(this.overlay);
        document.body.style.overflow = 'hidden';
    }
    
    hide() {
        if (this.overlay) {
            this.overlay.classList.add('fade-out');
            setTimeout(() => {
                this.overlay.remove();
                this.overlay = null;
                document.body.style.overflow = '';
            }, 300);
        }
    }
    
    // Wrapper para operaciones async
    async wrap(promise, message = 'Cargando...') {
        this.show(message);
        try {
            const result = await promise;
            this.hide();
            return result;
        } catch (error) {
            this.hide();
            throw error;
        }
    }
}

window.Loading = new LoadingOverlay();
