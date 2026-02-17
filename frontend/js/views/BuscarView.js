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
            <div class="fade-in view-shell view-shell--wide">
                <div class="page-header">
                    <div class="page-title-group">
                        <button id="btn-volver" class="btn btn-secondary btn-icon" aria-label="Volver">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <h2 class="page-title"><i class="fas fa-search"></i> Búsqueda Avanzada</h2>
                    </div>
                </div>
                <div class="page-divider"></div>
                
                <div class="empty-state">
                    <i class="fas fa-search fa-4x text-muted mb-3"></i>
                    <h3>Búsqueda en Desarrollo</h3>
                    <p class="text-muted" style="max-width: 500px; margin: 0 auto 30px;">
                        Esta función está siendo desarrollada. Pronto podrás buscar llamadas por fecha, 
                        motivo, ubicación y otros criterios avanzados.
                    </p>
                    
                    <div style="display: inline-flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
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
            const filtroMes = this.container.querySelector('#filtro-mes');
    if (filtroMes) {
        filtroMes.addEventListener('change', () => {
            this.aplicarFiltros();
            // Mostrar estadísticas del mes
            if (filtroMes.value) {
                this.mostrarEstadisticasMes(filtroMes.value);
            } else {
                this.container.querySelector('#estadisticas-mes').style.display = 'none';
            }
        });
    }
    
    // Botón exportar por mes
    const btnExportarMes = this.container.querySelector('#btn-exportar-mes');
    if (btnExportarMes) {
        btnExportarMes.addEventListener('click', () => {
            const mesSeleccionado = this.container.querySelector('#filtro-mes')?.value;
            if (mesSeleccionado) {
                this.exportarPorMes(mesSeleccionado);
            } else {
                this.mostrarAlerta('⚠️ SELECCIONA UN MES', 'Por favor selecciona un mes para exportar', 'warning');
            }
        });
    }

    }

    cleanup() {
        // Limpiar event listeners
    }
}
window.BuscarView = BuscarView;
