class C5MainView {
    constructor(currentUser, controller) {
        this.currentUser = currentUser;
        this.controller = controller;
        this.colors = {
            primary: '#003366',      // Azul policía principal
            secondary: '#0a4d8c',    // Azul más claro
            accent: '#ff6b35',       // Naranja
            accentGreen: '#28a745',  // Verde
            accentRed: '#dc3545',    // Rojo
            light: '#f8f9fa',        // Fondo claro
            dark: '#212529',         // Texto oscuro
            gray: '#6c757d',         // Texto secundario
            border: '#dee2e6'        // Bordes
        };
    }

    render(container) {
        this.container = container;
        // Usar contenedor base del dashboard
        this.container.className = 'dashboard-cerit-tehuacan view-bleed view-shell';
        this.container.innerHTML = this.getTemplate();
        this.bindEvents();
    }

    getTemplate() {
        return `
            <div class="cerit-dashboard view-shell--xl">
                <!-- HEADER -->
                <div style="background: white; border-radius: 10px; padding: 25px; border: 1px solid ${this.colors.border}; border-left: 5px solid ${this.colors.primary}; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <button class="btn-back-to-dashboard" style="background: ${this.colors.light}; border: 1px solid ${this.colors.border}; width: 40px; height: 40px; border-radius: 50%; color: ${this.colors.primary}; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <div>
                            <h1 style="margin: 0; color: ${this.colors.primary}; font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px;">
                                SISTEMA C5
                            </h1>
                            <p style="margin: 5px 0 0 0; color: ${this.colors.gray}; font-size: 0.95rem;">
                                Centro de Control, Comando, Comunicaciones, Cómputo y Calidad
                            </p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                         <div style="text-align: right; padding-right: 20px; border-right: 1px solid ${this.colors.border};">
                            <div style="font-size: 0.8rem; font-weight: 700; color: ${this.colors.gray}; letter-spacing: 0.5px;">FORMATO FOLIO</div>
                            <div style="font-family: 'Courier New', monospace; font-size: 1.1rem; font-weight: 700; color: ${this.colors.dark};">
                                DDMMYYHHMM
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px; background: ${this.colors.light}; padding: 8px 15px; border-radius: 50px; border: 1px solid ${this.colors.border};">
                            <div style="width: 30px; height: 30px; background: ${this.colors.primary}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem;">
                                <i class="fas fa-user-shield"></i>
                            </div>
                            <span style="font-weight: 600; color: ${this.colors.primary}; font-size: 0.9rem;">${this.currentUser || 'OPERADOR'}</span>
                        </div>
                    </div>
                </div>

                <!-- DASHBOARD GRID -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px;">
                    
                    <!-- Tarjeta Nuevo Reporte -->
                    <div class="action-card card-c5-new" style="background: white; border-radius: 12px; border: 1px solid ${this.colors.border}; overflow: hidden; transition: transform 0.3s, box-shadow 0.3s; cursor: pointer; position: relative;">
                        <div style="height: 6px; background: linear-gradient(90deg, ${this.colors.accentRed}, #ff8a80);"></div>
                        <div style="padding: 30px;">
                            <div style="width: 60px; height: 60px; background: rgba(220, 53, 69, 0.1); color: ${this.colors.accentRed}; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 20px;">
                                <i class="fas fa-file-medical-alt"></i>
                            </div>
                            <h2 style="margin: 0 0 10px 0; color: ${this.colors.primary}; font-size: 1.4rem; font-weight: 700;">
                                Nuevo Reporte
                            </h2>
                            <p style="margin: 0 0 25px 0; color: ${this.colors.gray}; line-height: 1.5;">
                                Registrar incidencia inmediata. Generación automática de folio y formato CERIT estandarizado.
                            </p>
                            <div style="display: flex; align-items: center; color: ${this.colors.accentRed}; font-weight: 600; font-size: 0.9rem;">
                                <span style="border-bottom: 2px solid transparent; transition: border-color 0.2s;">INICIAR REGISTRO</span>
                                <i class="fas fa-arrow-right" style="margin-left: 8px; transition: transform 0.2s;"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Tarjeta Consultar Reportes -->
                    <div class="action-card card-c5-list" style="background: white; border-radius: 12px; border: 1px solid ${this.colors.border}; overflow: hidden; transition: transform 0.3s, box-shadow 0.3s; cursor: pointer; position: relative;">
                        <div style="height: 6px; background: linear-gradient(90deg, ${this.colors.secondary}, #4dabf5);"></div>
                        <div style="padding: 30px;">
                            <div style="width: 60px; height: 60px; background: rgba(10, 77, 140, 0.1); color: ${this.colors.secondary}; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 20px;">
                                <i class="fas fa-clipboard-list"></i>
                            </div>
                            <h2 style="margin: 0 0 10px 0; color: ${this.colors.primary}; font-size: 1.4rem; font-weight: 700;">
                                Consultar Reportes
                            </h2>
                            <p style="margin: 0 0 25px 0; color: ${this.colors.gray}; line-height: 1.5;">
                                Historial completo de reportes C5. Filtrado por fecha, búsqueda por folio y exportación de datos.
                            </p>
                            <div style="display: flex; align-items: center; color: ${this.colors.secondary}; font-weight: 600; font-size: 0.9rem;">
                                <span style="border-bottom: 2px solid transparent; transition: border-color 0.2s;">VER LISTADO</span>
                                <i class="fas fa-arrow-right" style="margin-left: 8px; transition: transform 0.2s;"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Tarjeta Estadística Rápida (Placeholder) -->
                    <div style="background: linear-gradient(145deg, ${this.colors.primary}, ${this.colors.secondary}); border-radius: 12px; padding: 30px; color: white; display: flex; flex-direction: column; justify-content: center; box-shadow: 0 10px 20px rgba(0,51,102,0.2);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                            <div>
                                <h3 style="margin: 0; font-size: 1.1rem; font-weight: 600; opacity: 0.9;">Reportes Hoy</h3>
                                <div style="font-size: 2.5rem; font-weight: 800; margin-top: 5px;">--</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.2); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-chart-line"></i>
                            </div>
                        </div>
                        <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 15px;">
                            <div style="display: flex; align-items: center; gap: 10px; font-size: 0.9rem;">
                                <i class="fas fa-info-circle"></i>
                                <span>Sistema operativo y en línea</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        `;
    }

    bindEvents() {
        // Efectos hover para tarjetas
        const cards = this.container.querySelectorAll('.action-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
                const arrow = card.querySelector('.fa-arrow-right');
                if(arrow) arrow.style.transform = 'translateX(5px)';
                const text = card.querySelector('span');
                if(text) text.style.borderColor = 'currentColor';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = 'none';
                card.style.border = `1px solid ${this.colors.border}`;
                const arrow = card.querySelector('.fa-arrow-right');
                if(arrow) arrow.style.transform = 'translateX(0)';
                const text = card.querySelector('span');
                if(text) text.style.borderColor = 'transparent';
            });
        });

        // Navegación
        const btnNew = this.container.querySelector('.card-c5-new');
        if(btnNew) {
            btnNew.addEventListener('click', () => {
                this.controller.showNewReport();
            });
        }

        const btnList = this.container.querySelector('.card-c5-list');
        if(btnList) {
            btnList.addEventListener('click', () => {
                this.controller.showList();
            });
        }

        // Botón volver
        const btnBack = this.container.querySelector('.btn-back-to-dashboard');
        if(btnBack) {
            btnBack.addEventListener('click', () => {
                this.controller.appController.goToDashboard();
            });
        }
    }

    cleanup() {
        // Limpiar event listeners
    }
}

window.C5MainView = C5MainView;