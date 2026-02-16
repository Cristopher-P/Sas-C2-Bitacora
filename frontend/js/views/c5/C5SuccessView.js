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
        
        // Usar contenedor consistente con LlamadasView y estilos C5
        this.container.innerHTML = this.getTemplate(textoFormateado, textoCodificado, whatsappLink);
        this.bindEvents();
    }

    getTemplate(textoFormateado, textoCodificado, whatsappLink) {
        return `
            <div class="fade-in c5-container">
                <!-- Encabezado -->
                <div class="c5-header">
                    <div style="flex: 1;">
                        <div class="c5-title">
                            <i class="fas fa-check-circle" style="color: var(--cerit-success);"></i> REPORTE GENERADO
                        </div>
                        <div style="color: var(--color-muted); font-size: 0.9rem; margin-top: 5px;">
                            <i class="fas fa-user-shield"></i> Operador: ${this.currentUser || 'OPERADOR'}
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-secondary btn-icon btn-back-to-main" aria-label="Volver">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                    </div>
                </div>

                <!-- Panel de Éxito (Status Banner) -->
                <div class="status-banner">
                    <div class="status-text">
                        <h4>REPORTE C4 GENERADO EXITOSAMENTE</h4>
                        <p style="margin: 5px 0 0 0; color: var(--color-text); opacity: 0.8;">
                            El folio ha sido registrado. Procede a enviar al C5.
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--color-muted); margin-bottom: 5px;">Folio C4 Sistema</div>
                        <div class="folio-badge">
                            ${this.folioC4}
                        </div>
                    </div>
                </div>

                <!-- Grid Principal -->
                <div class="c5-grid">
                    
                    <!-- Columna Izquierda: Vista Previa -->
                    <div class="c5-card" style="padding: 20px;">
                        <div class="section-title">
                            <i class="fas fa-eye"></i> VISTA PREVIA DEL REPORTE
                        </div>
                        <p style="font-size: 0.9rem; color: var(--color-muted); margin-bottom: 15px;">
                            Formato listo para enviar al Centro de Control:
                        </p>
                        
                        <div class="preview-box">
${textoFormateado}
                        </div>
                        
                        <div style="margin-top: 20px;">
                            <button onclick="app.currentView.currentSubView.imprimirReporteC5()" class="btn-block btn-print">
                                <i class="fas fa-print"></i> IMPRIMIR FORMATO
                            </button>
                        </div>
                    </div>

                    <!-- Columna Derecha: Acciones y Respuesta -->
                    <div class="c5-card" style="padding: 20px;">
                        <div class="section-title">
                            <i class="fas fa-paper-plane"></i> ENVÍO Y SEGUIMIENTO
                        </div>
                        
                        <div class="action-card" style="margin-bottom: 20px;">
                            <div style="font-weight: 600; color: var(--cerit-primary); margin-bottom: 10px;">
                                <i class="fab fa-whatsapp"></i> Enviar por WhatsApp
                            </div>
                            <button onclick="window.open('${whatsappLink}', '_blank')" class="btn-block btn-whatsapp">
                                <i class="fab fa-whatsapp"></i> ABRIR WHATSAPP WEB
                            </button>
                            <button onclick="app.currentView.currentSubView.copiarReporteC5('${textoCodificado}')" class="btn-block btn-copy">
                                <i class="fas fa-copy"></i> COPIAR AL PORTAPAPELES
                            </button>
                        </div>
                        
                        <!-- Registro de Respuesta C5 -->
                        <div class="response-area">
                            <div style="font-weight: 600; color: var(--cerit-warning); margin-bottom: 5px;">
                                <i class="fas fa-exchange-alt"></i> REGISTRAR FOLIO C5
                            </div>
                            <p style="font-size: 0.85rem; color: var(--color-muted); margin-bottom: 10px;">
                                Ingresa el folio que devuelve el operador del C5:
                            </p>
                            
                            <div class="response-input-group">
                                <input type="text" id="folio-c5-respuesta" 
                                       class="response-input" 
                                       placeholder="Ej: 123456"
                                       autocomplete="off">
                                <button onclick="app.currentView.currentSubView.registrarFolioC5Respuesta()" 
                                        class="btn btn-primary" 
                                        style="padding: 8px 15px; background: var(--cerit-warning); border: none;">
                                    <i class="fas fa-save"></i>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Botones de Navegación Pie -->
                <div class="footer-actions">
                    <button onclick="app.currentView.showNewReport()" class="btn btn-success">
                        <i class="fas fa-plus-circle"></i> NUEVO REPORTE
                    </button>
                    <button onclick="app.currentView.showList()" class="btn btn-info">
                        <i class="fas fa-list"></i> VER TODOS
                    </button>
                    <button onclick="app.currentView.showMain()" class="btn btn-secondary">
                        <i class="fas fa-home"></i> INICIO
                    </button>
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
        
        // Permitir Enter en input de folio C5
        const folioInput = this.container.querySelector('#folio-c5-respuesta');
        if (folioInput) {
            folioInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.registrarFolioC5Respuesta();
                }
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

*Enviado desde Sistema CERIT*
*Operador: ${this.currentUser}*
*Fecha: ${new Date().toLocaleString()}*`;
    }

    copiarReporteC5(textoCodificado) {
        const texto = decodeURIComponent(textoCodificado);
        navigator.clipboard.writeText(texto)
            .then(() => {
                this.mostrarAlerta('TEXTO COPIADO', 'El formato CERIT ha sido copiado al portapapeles', 'success');
            })
            .catch(() => {
                // Fallback
                const textArea = document.createElement('textarea');
                textArea.value = texto;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.mostrarAlerta('TEXTO COPIADO', 'El formato CERIT ha sido copiado al portapapeles', 'success');
            });
    }

    imprimirReporteC5() {
        const ventana = window.open('', '_blank');
        const textoFormateado = this.formatearReporteC5();
        
        ventana.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reporte CERIT - ${this.folioC4}</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 20px; }
                    h1 { color: #2c3e50; border-bottom: 3px solid #e74c3c; padding-bottom: 10px; }
                    pre { white-space: pre-wrap; font-size: 12pt; line-height: 1.5; }
                    .footer { margin-top: 30px; font-size: 10pt; color: #7f8c8d; text-align: center; }
                </style>
            </head>
            <body>
                <h1>REPORTE CERIT - ${this.folioC4}</h1>
                <pre>${textoFormateado}</pre>
                <div class="footer">
                    Impreso desde Sistema CERIT - ${new Date().toLocaleString()}
                </div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `);
        ventana.document.close();
    }

    registrarFolioC5Respuesta() {
        const folioC5Input = this.container.querySelector('#folio-c5-respuesta');
        const folioC5 = folioC5Input?.value.trim();
        
        if (!folioC5) {
            this.mostrarAlerta('⚠️ CAMPO REQUERIDO', 'Por favor, ingresa el folio que devolvió el C5', 'error');
            if (folioC5Input) folioC5Input.focus();
            return;
        }
        
        if (typeof C5Service !== 'undefined') {
            C5Service.registrarFolioC5(this.folioC4, folioC5)
                .then(resultado => {
                    if (resultado.success) {
                        this.mostrarAlerta('FOLIO C5 REGISTRADO', `Folio registrado exitosamente:\nC4: ${this.folioC4}\nC5: ${folioC5}`, 'success');
                        if (folioC5Input) folioC5Input.value = '';
                    } else {
                        this.mostrarAlerta('⚠️ ERROR', resultado.message, 'error');
                    }
                })
                .catch(error => {
                    console.error('Error registrando folio:', error);
                    this.mostrarAlerta('⚠️ ERROR DE CONEXIÓN', 'Error al conectar con el servidor', 'error');
                });
        } else {
            // Modo local
            this.mostrarAlerta('FOLIO C5 REGISTRADO LOCALMENTE', `Folio registrado localmente:\nC4: ${this.folioC4}\nC5: ${folioC5}\n\n(Nota: Para sincronizar con el servidor, activa el servicio C5)`, 'success');
            if (folioC5Input) folioC5Input.value = '';
        }
    }

    mostrarAlerta(titulo, mensaje, tipo = 'info') {
        const color = tipo === 'error' ? 'var(--color-danger)' : tipo === 'success' ? 'var(--color-success)' : 'var(--color-info)';
        
        const alertDiv = document.createElement('div');
        // Simplificar estilos usando variables CSS
        alertDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            background: white; border-left: 4px solid ${tipo === 'error' ? '#dc3545' : '#28a745'}; 
            padding: 15px 20px; border-radius: 6px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
            z-index: 1001; min-width: 300px;
            animation: fadeIn 0.3s ease;
        `;
        
        const iconClass = tipo === 'error' ? 'exclamation-triangle' : tipo === 'success' ? 'check-circle' : 'info-circle';
        const iconColor = tipo === 'error' ? '#dc3545' : '#28a745';

        alertDiv.innerHTML = `
            <div style="display: flex; align-items: start; gap: 12px;">
                <div style="color: ${iconColor}; font-size: 1.2rem;">
                    <i class="fas fa-${iconClass}"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--color-text); margin-bottom: 5px;">${titulo}</div>
                    <div style="color: var(--color-muted); font-size: 0.9rem; white-space: pre-line;">${mensaje}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: #aaa; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    cleanup() {
        // Limpiar event listeners
    }
}

window.C5SuccessView = C5SuccessView;