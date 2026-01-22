class C5MainView {
    constructor(currentUser, controller) {
        this.currentUser = currentUser;
        this.controller = controller;
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
                    <button class="btn btn-back-to-dashboard" style="margin-right: 15px; background: transparent; color: #666;">
                        <i class="fas fa-arrow-left fa-lg"></i>
                    </button>
                    <h2 style="margin: 0;"><i class="fab fa-whatsapp" style="color: #25D366;"></i> Reportes C5</h2>
                </div>
                
                <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div class="card card-c5-new" style="background: white; border-radius: 8px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); cursor: pointer; transition: transform 0.2s;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                                <i class="fas fa-plus-circle" style="font-size: 2rem;"></i>
                            </div>
                            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Nuevo Reporte</h4>
                            <p style="color: #7f8c8d; margin: 0; font-size: 0.9rem;">Crear reporte en formato CERIT para enviar al C5</p>
                        </div>
                    </div>
                    
                    <div class="card card-c5-list" style="background: white; border-radius: 8px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); cursor: pointer; transition: transform 0.2s;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <div style="background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                                <i class="fas fa-list-alt" style="font-size: 2rem;"></i>
                            </div>
                            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Ver Reportes</h4>
                            <p style="color: #7f8c8d; margin: 0; font-size: 0.9rem;">Consultar reportes enviados al Centro de Control</p>
                        </div>
                    </div>
                    
                    <div class="card card-c5-register" style="background: white; border-radius: 8px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); cursor: pointer; transition: transform 0.2s;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                                <i class="fas fa-exchange-alt" style="font-size: 2rem;"></i>
                            </div>
                            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Registrar Respuesta</h4>
                            <p style="color: #7f8c8d; margin: 0; font-size: 0.9rem;">Ingresar folio que devolvió el C5</p>
                        </div>
                    </div>
                </div>
                
                <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; border-radius: 8px; margin-top: 20px;">
                    <h4 style="margin: 0 0 15px 0; color: #2e7d32;">
                        <i class="fas fa-info-circle"></i> Información sobre formato C5
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        <div>
                            <strong>Folio C4:</strong>
                            <div style="font-size: 0.9rem; color: #555; margin-top: 5px;">
                                Se genera automáticamente con formato DDMMYYHHMM
                            </div>
                        </div>
                        <div>
                            <strong>Ejemplo:</strong>
                            <div style="background: #f1f8e9; padding: 8px; border-radius: 4px; font-family: monospace; margin-top: 5px;">
                                2001260812 = 20/01/2026 08:12 hrs
                            </div>
                        </div>
                        <div>
                            <strong>Folio C5:</strong>
                            <div style="font-size: 0.9rem; color: #555; margin-top: 5px;">
                                Lo proporciona el Centro de Control después de recibir el reporte
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Hover effects
        const cards = this.container.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseover', () => card.style.transform = 'translateY(-5px)');
            card.addEventListener('mouseout', () => card.style.transform = 'translateY(0)');
        });

        // Navegación
        this.container.querySelector('.card-c5-new').addEventListener('click', () => {
            this.controller.showNewReport();
        });

        this.container.querySelector('.card-c5-list').addEventListener('click', () => {
            this.controller.showList();
        });

        this.container.querySelector('.card-c5-register').addEventListener('click', () => {
            this.controller.registerResponse();
        });

        // Botón volver
        this.container.querySelector('.btn-back-to-dashboard').addEventListener('click', () => {
            this.controller.appController.goToDashboard();
        });
    }

    cleanup() {
        // Limpiar event listeners si es necesario
    }
}

window.C5MainView = C5MainView;