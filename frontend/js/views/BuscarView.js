/**
 * BUSCARVIEW.JS - Vista de búsqueda
 */

class BuscarView {
    constructor(currentUser, appController) {
        this.currentUser = currentUser;
        this.appController = appController;
    }

    render(container) {
        this.container = container;
        this.container.innerHTML = this.getTemplate();
        this.bindEvents();
    }

    getTemplate() {
        return `
            <div class="fade-in">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <button id="btn-volver" class="btn" style="margin-right: 15px; background: transparent; color: #666;">
                        <i class="fas fa-arrow-left fa-lg"></i>
                    </button>
                    <h2 style="margin: 0;"><i class="fas fa-search"></i> Búsqueda Avanzada</h2>
                </div>
                
                <div style="text-align: center; padding: 50px; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <i class="fas fa-search fa-4x text-muted mb-3"></i>
                    <h3 style="margin-bottom: 15px;">Búsqueda en Desarrollo</h3>
                    <p style="color: #666; max-width: 500px; margin: 0 auto 30px;">
                        Esta función está siendo desarrollada. Pronto podrás buscar llamadas por fecha, 
                        motivo, ubicación y otros criterios avanzados.
                    </p>
                    
                    <div style="display: inline-flex; gap: 10px;">
                        <button class="btn btn-secondary" onclick="app.goToDashboard()">
                            <i class="fas fa-home"></i> Volver al Dashboard
                        </button>
                        <button class="btn btn-primary" onclick="app.loadView('llamadas')">
                            <i class="fas fa-phone-alt"></i> Registrar Llamada
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.getElementById('btn-volver').addEventListener('click', () => {
            this.appController.goToDashboard();
        });
    }

    cleanup() {
        // Limpiar event listeners
    }
}
window.BuscarView = BuscarView;
