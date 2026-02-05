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
            <div class="fade-in view-shell view-shell--wide view-form">
                <!-- Encabezado -->
                <div class="page-header">
                    <div class="page-title-group">
                        <button class="btn btn-secondary btn-icon btn-back-to-dashboard" aria-label="Volver">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <h1 class="page-title">
                            CERIT - SISTEMA DE REPORTES
                        </h1>
                    </div>
                    <div class="user-chip">
                        <i class="fas fa-user-shield"></i>
                        <span>${this.currentUser || 'OPERADOR'}</span>
                    </div>
                </div>
                <div class="page-divider page-divider--danger"></div>

                <!-- Panel de Control Principal con información de folios -->
                <div style="margin-bottom: 40px;">
                    <div style="display: flex; align-items: flex-start; gap: 25px; margin-bottom: 25px;">
                        <!-- Panel de control CERIT -->
                        <div style="flex: 1; background: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #e9ecef;">
                            <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 1.2rem; font-weight: 600;">
                                <i class="fas fa-sitemap" style="margin-right: 10px; color: #e74c3c;"></i>
                                PANEL DE CONTROL CERIT
                            </h3>
                            <p style="color: #7f8c8d; margin: 0; font-size: 0.95rem;">
                                Centro de Emergencia y Respuesta Inmediata Tehuacán
                            </p>
                        </div>

                        <!-- Información de folios CERIT -->
                        <div style="flex: 1; background: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #e9ecef;">
                            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                <div style="background: #2c3e50; color: white; width: 32px; height: 32px; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
                                    <i class="fas fa-hashtag"></i>
                                </div>
                                <div>
                                    <h3 style="margin: 0; color: #2c3e50; font-size: 1.1rem; font-weight: 600;">
                                        FORMATO DE FOLIO CERIT
                                    </h3>
                                    <p style="color: #7f8c8d; margin: 3px 0 0 0; font-size: 0.85rem;">
                                        DDMMYYHHMM
                                    </p>
                                </div>
                            </div>
                            
                            <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #dee2e6;">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <div>
                                        <div style="color: #2c3e50; font-size: 0.9rem; font-weight: 600; margin-bottom: 2px;">EJEMPLO:</div>
                                        <div style="font-family: 'Courier New', monospace; font-size: 1.1rem; font-weight: 600; color: #2c3e50;">
                                            2001260812
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="color: #2c3e50; font-size: 0.9rem; font-weight: 600;">SIGNIFICADO:</div>
                                        <div style="color: #7f8c8d; font-size: 0.85rem;">
                                            20/01/2026 08:12 hrs
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tarjetas de Acción - Diseño Robusto -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
                        <!-- Tarjeta Nuevo Reporte -->
                        <div class="card card-c5-new" 
                             style="background: white; 
                                    border-radius: 8px; 
                                    border: 2px solid #e74c3c;
                                    padding: 0;
                                    cursor: pointer; 
                                    transition: all 0.2s ease;
                                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                            <div style="background: #e74c3c; color: white; padding: 20px; border-radius: 6px 6px 0 0;">
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 6px;">
                                        <i class="fas fa-exclamation-triangle" style="font-size: 1.5rem;"></i>
                                    </div>
                                    <div>
                                        <h4 style="margin: 0; font-size: 1.3rem; font-weight: 700;">REPORTE NUEVO</h4>
                                        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.9rem;">Crear emergencia</p>
                                    </div>
                                </div>
                            </div>
                            <div style="padding: 20px;">
                                <div style="margin-bottom: 15px;">
                                    <div style="display: flex; align-items: center; color: #2c3e50; margin-bottom: 5px;">
                                        <i class="fas fa-bolt" style="margin-right: 8px; color: #e74c3c;"></i>
                                        <strong style="font-size: 0.9rem;">ACCIÓN INMEDIATA</strong>
                                    </div>
                                    <p style="color: #7f8c8d; margin: 0; font-size: 0.95rem; line-height: 1.5;">
                                        Registrar nuevo incidente para atención inmediata del CERIT
                                    </p>
                                </div>
                                <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; border-left: 3px solid #e74c3c;">
                                    <div style="display: flex; align-items: center; justify-content: space-between;">
                                        <span style="color: #2c3e50; font-size: 0.9rem; font-weight: 600;">
                                            <i class="fas fa-clock" style="margin-right: 5px;"></i>
                                            Tiempo estimado: 2 minutos
                                        </span>
                                        <i class="fas fa-arrow-right" style="color: #e74c3c;"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tarjeta Ver Reportes -->
                        <div class="card card-c5-list" 
                             style="background: white; 
                                    border-radius: 8px; 
                                    border: 2px solid #3498db;
                                    padding: 0;
                                    cursor: pointer; 
                                    transition: all 0.2s ease;
                                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                            <div style="background: #3498db; color: white; padding: 20px; border-radius: 6px 6px 0 0;">
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 6px;">
                                        <i class="fas fa-clipboard-list" style="font-size: 1.5rem;"></i>
                                    </div>
                                    <div>
                                        <h4 style="margin: 0; font-size: 1.3rem; font-weight: 700;">CONSULTAR REPORTES</h4>
                                        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.9rem;">Ver historial</p>
                                    </div>
                                </div>
                            </div>
                            <div style="padding: 20px;">
                                <div style="margin-bottom: 15px;">
                                    <div style="display: flex; align-items: center; color: #2c3e50; margin-bottom: 5px;">
                                        <i class="fas fa-search" style="margin-right: 8px; color: #3498db;"></i>
                                        <strong style="font-size: 0.9rem;">MONITOREO Y SEGUIMIENTO</strong>
                                    </div>
                                    <p style="color: #7f8c8d; margin: 0; font-size: 0.95rem; line-height: 1.5;">
                                        Visualizar y filtrar reportes enviados al sistema CERIT
                                    </p>
                                </div>
                                <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; border-left: 3px solid #3498db;">
                                    <div style="display: flex; align-items: center; justify-content: space-between;">
                                        <span style="color: #2c3e50; font-size: 0.9rem; font-weight: 600;">
                                            <i class="fas fa-filter" style="margin-right: 5px;"></i>
                                            Filtros avanzados disponibles
                                        </span>
                                        <i class="fas fa-arrow-right" style="color: #3498db;"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        `;
    }

    bindEvents() {
        // Efectos hover minimalistas
        const cards = this.container.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseover', () => {
                card.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                card.style.transform = 'translateY(-2px)';
            });
            card.addEventListener('mouseout', () => {
                card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                card.style.transform = 'translateY(0)';
            });
            
            // Efecto de click
            card.addEventListener('mousedown', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            });
            card.addEventListener('mouseup', () => {
                card.style.transform = 'translateY(-2px)';
                card.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
            });
        });

        // Navegación
        this.container.querySelector('.card-c5-new').addEventListener('click', () => {
            this.controller.showNewReport();
        });

        this.container.querySelector('.card-c5-list').addEventListener('click', () => {
            this.controller.showList();
        });

        // Botón volver
        this.container.querySelector('.btn-back-to-dashboard').addEventListener('click', () => {
            this.controller.appController.goToDashboard();
        });
    }

    cleanup() {
        // Limpiar event listeners
    }
}

window.C5MainView = C5MainView;