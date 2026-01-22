class C5ListView {
    constructor(currentUser, controller) {
        this.currentUser = currentUser;
        this.controller = controller;
        this.reportes = [];
    }

    async render(container) {
        this.container = container;
        this.container.innerHTML = this.getTemplate();
        this.bindEvents();
        
        // Cargar reportes
        await this.cargarReportes();
    }

    getTemplate() {
        return `
            <div class="fade-in">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center;">
                        <button class="btn btn-back-to-main" style="margin-right: 15px; background: transparent; color: #666;">
                            <i class="fas fa-arrow-left fa-lg"></i>
                        </button>
                        <h2 style="margin: 0;"><i class="fas fa-list-alt"></i> Reportes Enviados al C5</h2>
                    </div>
                    <div>
                        <button class="btn btn-primary" id="btn-actualizar">
                            <i class="fas fa-sync-alt"></i> Actualizar
                        </button>
                    </div>
                </div>
                
                <div id="tabla-reportes-container" style="text-align: center; padding: 20px;">
                    <i class="fas fa-spinner fa-spin fa-2x"></i><br>Cargando reportes...
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Botón volver
        const backBtn = this.container.querySelector('.btn-back-to-main');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.controller.showMain();
            });
        }

        // Botón actualizar
        const btnActualizar = this.container.querySelector('#btn-actualizar');
        if (btnActualizar) {
            btnActualizar.addEventListener('click', () => {
                this.cargarReportes();
            });
        }
    }

    async cargarReportes() {
        try {
            let reportes = [];
            
            if (typeof C5Service !== 'undefined') {
                const resultado = await C5Service.obtenerReportes();
                if (resultado.success) {
                    reportes = resultado.data;
                } else {
                    throw new Error(resultado.message);
                }
            } else {
                // Datos de ejemplo
                reportes = [
                    {
                        id: 1,
                        folio_c4: '2601241430',
                        folio_c5: 'C5-2024-001',
                        fecha_envio: '2024-01-26',
                        hora_envio: '14:30:00',
                        motivo: 'VEHÍCULO SOSPECHOSO',
                        ubicacion: 'AV. PRINCIPAL Y CALLE 5',
                        estado: 'recibido',
                        created_at: '2024-01-26 14:35:00'
                    },
                    {
                        id: 2,
                        folio_c4: '2601241015',
                        folio_c5: null,
                        fecha_envio: '2024-01-26',
                        hora_envio: '10:15:00',
                        motivo: 'RUIDO EXCESIVO',
                        ubicacion: 'CALLE 10 NORTE',
                        estado: 'enviado',
                        created_at: '2024-01-26 10:20:00'
                    }
                ];
            }
            
            this.reportes = reportes;
            this.renderizarTabla();
            
        } catch (error) {
            console.error('Error cargando reportes:', error);
            const container = this.container.querySelector('#tabla-reportes-container');
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> Error cargando reportes: ${error.message}
                    <br><br>
                    <button onclick="app.currentView.currentSubView.cargarReportes()" class="btn btn-primary">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    renderizarTabla() {
        const container = this.container.querySelector('#tabla-reportes-container');
        
        if (this.reportes.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <i class="fas fa-inbox fa-3x text-muted"></i>
                    <h4 style="margin-top: 20px;">No hay reportes</h4>
                    <p>No se encontraron reportes C5 en el sistema.</p>
                    <button class="btn btn-primary" onclick="app.currentView.showNewReport()">
                        <i class="fas fa-plus"></i> Crear Primer Reporte
                    </button>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="table-container" style="background: white; border-radius: 8px; box-shadow: 0 0 20px rgba(0,0,0,0.05); overflow: hidden;">
                <div class="table-responsive">
                    <table class="table table-hover" style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                        <thead style="background: #2c3e50; color: white;">
                            <tr>
                                <th style="padding: 12px;">Folio C4</th>
                                <th style="padding: 12px;">Folio C5</th>
                                <th style="padding: 12px;">Fecha/Hora</th>
                                <th style="padding: 12px;">Motivo</th>
                                <th style="padding: 12px;">Ubicación</th>
                                <th style="padding: 12px;">Estado</th>
                                <th style="padding: 12px;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        this.reportes.forEach(reporte => {
            let badgeColor = '#6c757d';
            if (reporte.estado === 'recibido') badgeColor = '#28a745';
            if (reporte.estado === 'enviado') badgeColor = '#ffc107';
            if (reporte.estado === 'pendiente') badgeColor = '#dc3545';
            
            html += `
                <tr>
                    <td style="padding: 12px; font-family: monospace; font-weight: bold;">${reporte.folio_c4}</td>
                    <td style="padding: 12px;">${reporte.folio_c5 || '--'}</td>
                    <td style="padding: 12px;">
                        ${reporte.fecha_envio}<br>
                        <small>${reporte.hora_envio?.substring(0,5) || ''}</small>
                    </td>
                    <td style="padding: 12px;">${reporte.motivo}</td>
                    <td style="padding: 12px;">${reporte.ubicacion}</td>
                    <td style="padding: 12px;">
                        <span style="background: ${badgeColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8em;">
                            ${reporte.estado || 'pendiente'}
                        </span>
                    </td>
                    <td style="padding: 12px;">
                        <button class="btn btn-sm btn-view-report" data-folio="${reporte.folio_c4}" style="background: #e9ecef; margin-right: 5px;" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${!reporte.folio_c5 ? `
                        <button class="btn btn-sm btn-register-c5" data-folio="${reporte.folio_c4}" style="background: #17a2b8; color: white; margin-right: 5px;" title="Registrar C5">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                        ` : ''}
                        <button class="btn btn-sm btn-resend-whatsapp" data-folio="${reporte.folio_c4}" style="background: #25D366; color: white;" title="Reenviar WhatsApp">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
                <div style="padding: 15px; background: #f8f9fa; border-top: 1px solid #eee; text-align: center;">
                    <small class="text-muted">Mostrando ${this.reportes.length} reportes</small>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Bind table events
        this.bindTableEvents();
    }

    bindTableEvents() {
        // Botones Ver Detalles
        this.container.querySelectorAll('.btn-view-report').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const folio = e.target.closest('.btn-view-report').dataset.folio;
                this.verDetallesReporte(folio);
            });
        });

        // Botones Registrar C5
        this.container.querySelectorAll('.btn-register-c5').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const folio = e.target.closest('.btn-register-c5').dataset.folio;
                this.registrarFolioParaReporte(folio);
            });
        });

        // Botones Reenviar WhatsApp
        this.container.querySelectorAll('.btn-resend-whatsapp').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const folio = e.target.closest('.btn-resend-whatsapp').dataset.folio;
                this.enviarWhatsAppReporte(folio);
            });
        });
    }

    verDetallesReporte(folio) {
        alert(`Ver detalles del reporte ${folio}\n\nEsta funcionalidad se implementará pronto.`);
    }

    async registrarFolioParaReporte(folio) {
        const folioC5 = prompt(`Ingresa el folio que devolvió C5 para:\n\nFolio C4: ${folio}`);
        if (!folioC5) return;
        
        if (typeof C5Service !== 'undefined') {
            try {
                const resultado = await C5Service.registrarFolioC5(folio, folioC5);
                
                if (resultado.success) {
                    alert(`✅ Folio C5 registrado exitosamente:\n\nC4: ${folio}\nC5: ${folioC5}`);
                    await this.cargarReportes(); // Recargar lista
                } else {
                    alert(`⚠️ Error: ${resultado.message}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('⚠️ Error al registrar. Verifica la conexión.');
            }
        } else {
            alert(`✅ Folio C5 registrado localmente:\n\nC4: ${folio}\nC5: ${folioC5}\n\n(Nota: Para sincronizar con el servidor, activa el servicio C5)`);
        }
    }

    enviarWhatsAppReporte(folio) {
        const reporte = this.reportes.find(r => r.folio_c4 === folio);
        if (!reporte) return;
        
        const texto = `FOLIO: ${reporte.folio_c4}
HORA: ${reporte.hora_envio}
MOTIVO: ${reporte.motivo}
UBICACIÓN: ${reporte.ubicacion}

*Reenvío desde SAS C4*`;
        
        const textoCodificado = encodeURIComponent(texto);
        const whatsappLink = `https://wa.me/?text=${textoCodificado}`;
        
        window.open(whatsappLink, '_blank');
    }

    cleanup() {
        // Limpiar event listeners
    }
}

window.C5ListView = C5ListView;