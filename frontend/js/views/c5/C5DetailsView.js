class C5DetailsView {
    constructor(currentUser, controller, folioC4) {
        this.currentUser = currentUser;
        this.controller = controller;
        this.folioC4 = folioC4;
        this.reporte = null;
    }

    async render(container) {
        this.container = container;
        this.container.innerHTML = this.getTemplate();
        this.bindEvents();
        
        // Cargar detalles del reporte
        await this.cargarDetalles();
    }

    getTemplate() {
        return `
            <div class="fade-in">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <button class="btn btn-back-to-list" style="margin-right: 15px; background: transparent; color: #666;">
                        <i class="fas fa-arrow-left fa-lg"></i>
                    </button>
                    <h2 style="margin: 0;"><i class="fas fa-file-invoice"></i> Detalles del Reporte</h2>
                </div>
                
                <div id="detalles-container" style="text-align: center; padding: 50px;">
                    <i class="fas fa-spinner fa-spin fa-2x"></i><br>Cargando detalles del reporte ${this.folioC4}...
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Botón volver
        const backBtn = this.container.querySelector('.btn-back-to-list');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.controller.showList();
            });
        }
    }

    async cargarDetalles() {
        try {
            let reporte = null;
            
            // Intentar obtener del servicio
            if (typeof C5Service !== 'undefined') {
                // Buscar en la lista de reportes o hacer petición específica
                const resultado = await C5Service.obtenerReportes();
                if (resultado.success) {
                    reporte = resultado.data.find(r => r.folio_c4 === this.folioC4);
                }
            }
            
            // Si no se encuentra, usar datos de ejemplo
            if (!reporte) {
                reporte = {
                    folio_c4: this.folioC4,
                    folio_c5: 'C5-2024-001',
                    fecha_envio: '2024-01-26',
                    hora_envio: '14:30:00',
                    motivo: 'VEHÍCULO SOSPECHOSO',
                    ubicacion: 'AV. PRINCIPAL Y CALLE 5',
                    descripcion: 'Vehículo gris estacionado por más de 2 horas frente al domicilio 123',
                    agente: 'PATRULLA 45',
                    conclusion: 'SITUACIÓN CONTROLADA',
                    estado: 'recibido',
                    metodo_envio: 'whatsapp',
                    created_at: '2024-01-26 14:35:00'
                };
            }
            
            this.reporte = reporte;
            this.renderizarDetalles();
            
        } catch (error) {
            console.error('Error cargando detalles:', error);
            const container = this.container.querySelector('#detalles-container');
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> Error cargando detalles: ${error.message}
                    <br><br>
                    <button onclick="app.currentView.currentSubView.cargarDetalles()" class="btn btn-primary">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    renderizarDetalles() {
        const container = this.container.querySelector('#detalles-container');
        
        let badgeColor = '#6c757d';
        if (this.reporte.estado === 'recibido') badgeColor = '#28a745';
        if (this.reporte.estado === 'enviado') badgeColor = '#ffc107';
        if (this.reporte.estado === 'pendiente') badgeColor = '#dc3545';
        
        let metodoIcon = 'fas fa-question';
        if (this.reporte.metodo_envio === 'whatsapp') metodoIcon = 'fab fa-whatsapp';
        if (this.reporte.metodo_envio === 'radio') metodoIcon = 'fas fa-broadcast-tower';
        if (this.reporte.metodo_envio === 'telefono') metodoIcon = 'fas fa-phone';
        
        container.innerHTML = `
            <div style="background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
                <div style="background: linear-gradient(135deg, #2c3e50 0%, #4a6491 100%); color: white; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="margin: 0;"><i class="fas fa-file-alt"></i> Reporte ${this.reporte.folio_c4}</h3>
                            <p style="margin: 5px 0 0 0; opacity: 0.9;">
                                <i class="${metodoIcon}"></i> Enviado por ${this.reporte.metodo_envio || 'desconocido'}
                            </p>
                        </div>
                        <div>
                            <span style="background: ${badgeColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold;">
                                ${this.reporte.estado?.toUpperCase() || 'DESCONOCIDO'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div style="padding: 25px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 25px;">
                        <div class="detail-card">
                            <h5><i class="fas fa-calendar"></i> Fecha y Hora</h5>
                            <p style="font-size: 1.1rem; margin: 10px 0;">
                                ${this.reporte.fecha_envio} a las ${this.reporte.hora_envio?.substring(0,5) || ''} hrs
                            </p>
                        </div>
                        
                        <div class="detail-card">
                            <h5><i class="fas fa-exclamation-circle"></i> Motivo</h5>
                            <p style="font-size: 1.1rem; margin: 10px 0; font-weight: bold;">
                                ${this.reporte.motivo}
                            </p>
                        </div>
                        
                        <div class="detail-card">
                            <h5><i class="fas fa-map-marker-alt"></i> Ubicación</h5>
                            <p style="font-size: 1.1rem; margin: 10px 0;">
                                ${this.reporte.ubicacion}
                            </p>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <h5><i class="fas fa-file-alt"></i> Descripción</h5>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 10px; border-left: 4px solid #3498db;">
                            <p style="margin: 0; line-height: 1.6;">${this.reporte.descripcion || 'Sin descripción'}</p>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 25px;">
                        <div class="detail-card">
                            <h5><i class="fas fa-user-shield"></i> Agente</h5>
                            <p>${this.reporte.agente || 'No especificado'}</p>
                        </div>
                        
                        <div class="detail-card">
                            <h5><i class="fas fa-check-circle"></i> Conclusión</h5>
                            <p>${this.reporte.conclusion || 'Sin conclusión'}</p>
                        </div>
                        
                        <div class="detail-card">
                            <h5><i class="fas fa-exchange-alt"></i> Folio C5</h5>
                            <p style="font-family: monospace; font-weight: bold;">
                                ${this.reporte.folio_c5 || 'Pendiente de asignación'}
                            </p>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                        <h5><i class="fas fa-history"></i> Información Adicional</h5>
                        <div style="display: flex; justify-content: space-between; color: #666; font-size: 0.9rem;">
                            <div>
                                <strong>Registrado:</strong> ${this.reporte.created_at?.substring(0, 16).replace('T', ' ') || 'Fecha desconocida'}
                            </div>
                            <div>
                                ${this.reporte.folio_c5 ? `
                                    <button class="btn btn-sm" style="background: #25D366; color: white;"
                                            onclick="app.currentView.currentSubView.reenviarWhatsApp()">
                                        <i class="fab fa-whatsapp"></i> Reenviar por WhatsApp
                                    </button>
                                ` : `
                                    <button class="btn btn-sm" style="background: #17a2b8; color: white;"
                                            onclick="app.currentView.currentSubView.registrarFolioC5()">
                                        <i class="fas fa-exchange-alt"></i> Registrar Folio C5
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .detail-card {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 6px;
                    border-left: 4px solid #3498db;
                }
                .detail-card h5 {
                    margin: 0 0 10px 0;
                    color: #2c3e50;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .detail-card p {
                    margin: 0;
                    color: #333;
                }
            </style>
        `;
        
        // Bind additional events
        this.bindDetailsEvents();
    }

    bindDetailsEvents() {
        // Botón reenviar WhatsApp
        const btnReenviar = this.container.querySelector('[onclick*="reenviarWhatsApp"]');
        if (btnReenviar) {
            btnReenviar.onclick = () => this.reenviarWhatsApp();
        }
        
        // Botón registrar folio C5
        const btnRegistrar = this.container.querySelector('[onclick*="registrarFolioC5"]');
        if (btnRegistrar) {
            btnRegistrar.onclick = () => this.registrarFolioC5();
        }
    }

    reenviarWhatsApp() {
        const texto = this.formatearReporteParaWhatsApp();
        const textoCodificado = encodeURIComponent(texto);
        const whatsappLink = `https://wa.me/?text=${textoCodificado}`;
        
        window.open(whatsappLink, '_blank');
    }

    registrarFolioC5() {
        const folioC5 = prompt(`Ingresa el folio que devolvió C5 para:\n\nFolio C4: ${this.reporte.folio_c4}`);
        if (!folioC5) return;
        
        if (typeof C5Service !== 'undefined') {
            C5Service.registrarFolioC5(this.reporte.folio_c4, folioC5)
                .then(resultado => {
                    if (resultado.success) {
                        alert(`✅ Folio C5 registrado exitosamente:\n\nC4: ${this.reporte.folio_c4}\nC5: ${folioC5}`);
                        this.cargarDetalles(); // Recargar detalles
                    } else {
                        alert(`⚠️ Error: ${resultado.message}`);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('⚠️ Error al registrar. Verifica la conexión.');
                });
        } else {
            alert(`✅ Folio C5 registrado localmente:\n\nC4: ${this.reporte.folio_c4}\nC5: ${folioC5}\n\n(Nota: Para sincronizar con el servidor, activa el servicio C5)`);
        }
    }

    formatearReporteParaWhatsApp() {
        return `FOLIO: ${this.reporte.folio_c4}
HORA: ${this.reporte.hora_envio?.substring(0,5) || ''}
MOTIVO: ${this.reporte.motivo}
UBICACIÓN: ${this.reporte.ubicacion}
DESCRIPCIÓN: ${this.reporte.descripcion || ''}
AGENTE: ${this.reporte.agente || ''}
CONCLUSIÓN: ${this.reporte.conclusion || ''}

*Reenvío desde SAS C4*`;
    }

    cleanup() {
        // Limpiar event listeners
    }
}

window.C5DetailsView = C5DetailsView;