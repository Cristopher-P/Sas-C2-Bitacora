class C5SuccessView {
    constructor(currentUser, controller, folioC4, datosReporte, datosServicio = null) {
        this.currentUser = currentUser;
        this.controller = controller;
        this.folioC4 = folioC4;
        this.datosReporte = datosReporte;
        this.datosServicio = datosServicio;
    }

    render(container) {
        this.container = container;
        
        const textoFormateado = this.formatearReporteC5();
        const textoCodificado = encodeURIComponent(textoFormateado);
        const whatsappLink = `https://wa.me/?text=${textoCodificado}`;
        
        this.container.innerHTML = this.getTemplate(textoFormateado, textoCodificado, whatsappLink);
        this.bindEvents();
    }

    getTemplate(textoFormateado, textoCodificado, whatsappLink) {
        return `
            <div class="fade-in">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <button class="btn btn-back-to-main" style="margin-right: 15px; background: transparent; color: #666;">
                        <i class="fas fa-arrow-left fa-lg"></i>
                    </button>
                    <h2 style="margin: 0;"><i class="fas fa-check-circle" style="color: #4caf50;"></i> Reporte C5 Generado</h2>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <div style="background: #d4edda; color: #155724; padding: 20px; border-radius: 6px; border-left: 5px solid #28a745; margin-bottom: 25px;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div>
                                <h4 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                                    <i class="fas fa-check-circle fa-lg"></i>
                                    Reporte guardado exitosamente
                                </h4>
                                <p style="margin: 10px 0 0 0;">Folio C4 generado: <strong>${this.folioC4}</strong></p>
                            </div>
                            <div style="background: #28a745; color: white; padding: 10px 20px; border-radius: 20px; font-family: monospace; font-size: 1.2rem;">
                                ${this.folioC4}
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                        <div>
                            <h5 style="margin: 0 0 15px 0; color: #495057;">
                                <i class="fas fa-eye"></i> Vista Previa
                            </h5>
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; border: 1px solid #dee2e6; max-height: 400px; overflow-y: auto;">
                                <pre style="margin: 0; font-family: 'Courier New', monospace; white-space: pre-wrap; font-size: 0.9rem;">${textoFormateado}</pre>
                            </div>
                        </div>
                        
                        <div>
                            <h5 style="margin: 0 0 15px 0; color: #495057;">
                                <i class="fas fa-paper-plane"></i> Enviar al C5
                            </h5>
                            
                            <div style="background: #e8f5e9; padding: 20px; border-radius: 6px; border: 1px solid #c8e6c9; margin-bottom: 20px;">
                                <p style="margin: 0 0 15px 0; color: #2e7d32;">
                                    <i class="fas fa-info-circle"></i> Envía este reporte al Centro de Control C5
                                </p>
                                
                                <div style="display: flex; flex-direction: column; gap: 10px;">
                                    <button class="btn" style="background: #25D366; color: white; padding: 12px;"
                                            onclick="window.open('${whatsappLink}', '_blank')">
                                        <i class="fab fa-whatsapp"></i> Abrir WhatsApp para Enviar
                                    </button>
                                    
                                    <button class="btn btn-primary" style="padding: 12px;"
                                            onclick="app.currentView.currentSubView.copiarReporteC5('${textoCodificado}')">
                                        <i class="fas fa-copy"></i> Copiar Texto (Ctrl+V en WhatsApp)
                                    </button>
                                    
                                    <button class="btn" style="background: #17a2b8; color: white; padding: 12px;"
                                            onclick="app.currentView.currentSubView.imprimirReporteC5()">
                                        <i class="fas fa-print"></i> Imprimir Reporte
                                    </button>
                                </div>
                            </div>
                            
                            <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border: 1px solid #ffeaa7;">
                                <h6 style="margin: 0 0 10px 0; color: #856404;">
                                    <i class="fas fa-exchange-alt"></i> ¿Ya recibiste respuesta del C5?
                                </h6>
                                <p style="margin: 0 0 10px 0; font-size: 0.9rem; color: #856404;">
                                    Registra el folio que te devolvió el Centro de Control:
                                </p>
                                <div style="display: flex; gap: 10px;">
                                    <input type="text" id="folio-c5-respuesta" 
                                           placeholder="Folio que devolvió C5" 
                                           style="flex: 1; padding: 8px; border: 1px solid #ffeaa7; border-radius: 4px;">
                                    <button class="btn btn-sm" style="background: #f39c12; color: white;"
                                            onclick="app.currentView.currentSubView.registrarFolioC5Respuesta()">
                                        Registrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <button class="btn" onclick="app.currentView.showNewReport()">
                            <i class="fas fa-plus"></i> Nuevo Reporte
                        </button>
                        <button class="btn btn-primary" onclick="app.currentView.showList()">
                            <i class="fas fa-list"></i> Ver Todos los Reportes
                        </button>
                        <button class="btn" onclick="app.currentView.showMain()">
                            <i class="fas fa-home"></i> Volver al Inicio C5
                        </button>
                    </div>
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
    }

    formatearReporteC5() {
        return `FOLIO: ${this.folioC4}
HORA: ${this.datosReporte.hora_envio}
MOTIVO: ${this.datosReporte.motivo}
UBICACIÓN: ${this.datosReporte.ubicacion}
DESCRIPCIÓN: ${this.datosReporte.descripcion}
AGENTE: ${this.datosReporte.agente || 'No especificado'}
CONCLUSIÓN: ${this.datosReporte.conclusion || 'Sin conclusión'}

*Enviado desde SAS C4*
*Turno: ${this.currentUser.turno}*
*Supervisor: ${this.currentUser.username}*`;
    }

    copiarReporteC5(textoCodificado) {
        const texto = decodeURIComponent(textoCodificado);
        navigator.clipboard.writeText(texto)
            .then(() => alert('✅ Texto copiado al portapapeles. Ya puedes pegarlo en WhatsApp.'))
            .catch(() => {
                // Fallback
                const textArea = document.createElement('textarea');
                textArea.value = texto;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('✅ Texto copiado (método alternativo)');
            });
    }

    imprimirReporteC5() {
        window.print();
    }

    registrarFolioC5Respuesta() {
        const folioC5Input = this.container.querySelector('#folio-c5-respuesta');
        const folioC5 = folioC5Input?.value.trim();
        
        if (!folioC5) {
            alert('Por favor, ingresa el folio que devolvió el C5');
            return;
        }
        
        if (typeof C5Service !== 'undefined') {
            C5Service.registrarFolioC5(this.folioC4, folioC5)
                .then(resultado => {
                    if (resultado.success) {
                        alert(`✅ Folio C5 registrado:\nC4: ${this.folioC4}\nC5: ${folioC5}`);
                        if (folioC5Input) folioC5Input.value = '';
                    } else {
                        alert(`⚠️ Error: ${resultado.message}`);
                    }
                })
                .catch(error => {
                    console.error('Error registrando folio:', error);
                    alert('⚠️ Error al conectar con el servidor');
                });
        } else {
            // Modo local
            alert(`✅ Folio C5 registrado localmente:\nC4: ${this.folioC4}\nC5: ${folioC5}\n\n(Nota: Para guardar en el servidor, activa el servicio C5)`);
            if (folioC5Input) folioC5Input.value = '';
        }
    }

    cleanup() {
        // Limpiar event listeners
    }
}

window.C5SuccessView = C5SuccessView;