class C5View {
    constructor(currentUser, appController) {
        this.currentUser = currentUser;
        this.appController = appController;
        this.currentSubView = null;
    }

    async render(container) {
        this.container = container;
        await this.showMain();
    }

    async showMain() {
        this.cleanupCurrentView();
        
        // Verificar si la vista está disponible
        if (typeof C5MainView === 'undefined') {
            this.showError('C5MainView no está disponible');
            return;
        }
        
        this.currentSubView = new C5MainView(this.currentUser, this);
        await this.currentSubView.render(this.container);
    }

    async showNewReport() {
        this.cleanupCurrentView();
        
        if (typeof C5NewView === 'undefined') {
            this.showError('C5NewView no está disponible');
            return;
        }
        
        this.currentSubView = new C5NewView(this.currentUser, this);
        await this.currentSubView.render(this.container);
    }

    async showList() {
        this.cleanupCurrentView();
        
        if (typeof C5ListView === 'undefined') {
            this.showError('C5ListView no está disponible');
            return;
        }
        
        this.currentSubView = new C5ListView(this.currentUser, this);
        await this.currentSubView.render(this.container);
    }

    showSuccess(folioC4, datosReporte, datosServicio = null) {
        this.cleanupCurrentView();
        
        if (typeof C5SuccessView === 'undefined') {
            this.showError('C5SuccessView no está disponible');
            return;
        }
        
        this.currentSubView = new C5SuccessView(
            this.currentUser, 
            this, 
            folioC4, 
            datosReporte, 
            datosServicio
        );
        this.currentSubView.render(this.container);
    }

    async showDetails(folioC4) {
        this.cleanupCurrentView();
        
        if (typeof C5DetailsView === 'undefined') {
            this.showError('C5DetailsView no está disponible');
            return;
        }
        
        this.currentSubView = new C5DetailsView(this.currentUser, this, folioC4);
        await this.currentSubView.render(this.container);
    }

    registerResponse() {
        const folioC4 = prompt('Ingresa el folio C4 del reporte:');
        if (!folioC4) return;
        
        const folioC5 = prompt(`Ingresa el folio que devolvió C5 para:\n\nFolio C4: ${folioC4}`);
        if (!folioC5) return;
        
        if (typeof C5Service !== 'undefined') {
            C5Service.registrarFolioC5(folioC4, folioC5)
                .then(resultado => {
                    if (resultado.success) {
                        alert(`Folio C5 registrado exitosamente:\n\nC4: ${folioC4}\nC5: ${folioC5}`);
                    } else {
                        alert(`⚠️ Error: ${resultado.message}`);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('⚠️ Error al registrar. Verifica la conexión.');
                });
        } else {
            alert(`Folio C5 registrado localmente:\n\nC4: ${folioC4}\nC5: ${folioC5}\n\n(Nota: Para sincronizar con el servidor, activa el servicio C5)`);
        }
    }

    cleanupCurrentView() {
        if (this.currentSubView && typeof this.currentSubView.cleanup === 'function') {
            this.currentSubView.cleanup();
        }
        this.currentSubView = null;
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="view-shell view-shell--wide">
                <div class="card empty-state">
                    <i class="fas fa-exclamation-triangle fa-3x text-danger"></i>
                    <h3>Error de carga</h3>
                    <p class="text-muted">${message}</p>
                    <button onclick="app.currentView.showMain()" class="btn btn-primary">
                        <i class="fas fa-home"></i> Volver al Menú Principal
                    </button>
                </div>
            </div>
        `;
    }

    cleanup() {
        this.cleanupCurrentView();
    }
}

window.C5View = C5View;