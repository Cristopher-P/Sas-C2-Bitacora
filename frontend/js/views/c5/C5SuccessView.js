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
            <div class="fade-in" style="max-width: 1400px; margin: 0 auto; padding: 20px;">
                <!-- Encabezado Minimalista - Mismo estilo -->
                <div style="margin-bottom: 30px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                        <div style="display: flex; align-items: center;">
                            <button class="btn btn-back-to-main" style="margin-right: 20px; background: #2c3e50; color: white; border: none; border-radius: 6px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                                <i class="fas fa-arrow-left"></i>
                            </button>
                            <h1 style="margin: 0; color: #2c3e50; font-size: 1.8rem; font-weight: 700; letter-spacing: 0.5px;">
                                REPORTE GENERADO - CERIT
                            </h1>
                        </div>
                        <div style="display: flex; align-items: center; background: #f8f9fa; padding: 8px 16px; border-radius: 6px; border: 1px solid #e9ecef;">
                            <i class="fas fa-user-shield" style="color: #2c3e50; margin-right: 8px;"></i>
                            <span style="color: #2c3e50; font-weight: 600; font-size: 0.95rem;">${this.currentUser || 'OPERADOR'}</span>
                        </div>
                    </div>
                    <div style="background: linear-gradient(90deg, #2ecc71 0%, #27ae60 100%); height: 4px; border-radius: 2px;"></div>
                </div>

                <!-- Panel de Éxito -->
                <div style="margin-bottom: 25px;">
                    <div style="background: #d5f4e6; border-radius: 8px; padding: 25px; border: 1px solid #a3e4d7; display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="background: #2ecc71; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <i class="fas fa-check fa-lg"></i>
                            </div>
                            <div>
                                <h2 style="margin: 0; color: #155724; font-size: 1.5rem; font-weight: 700;">
                                    REPORTE C4 GENERADO EXITOSAMENTE
                                </h2>
                                <p style="color: #0c503c; margin: 8px 0 0 0; font-size: 1rem;">
                                    El folio ha sido registrado en el sistema. Procede a enviar al C5.
                                </p>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #2c3e50; font-size: 0.9rem; font-weight: 600; margin-bottom: 5px;">FOLIO C4 GENERADO</div>
                            <div style="font-family: 'Courier New', monospace; font-size: 2rem; font-weight: 700; color: #2ecc71; letter-spacing: 2px;">
                                ${this.folioC4}
                            </div>
                            <div style="color: #7f8c8d; font-size: 0.85rem; margin-top: 5px;">
                                Formato: DDMMYYHHMM
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Panel de Acciones -->
                <div style="margin-bottom: 25px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <!-- Información del Reporte -->
                        <div style="background: white; border-radius: 8px; padding: 25px; border: 1px solid #e9ecef; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                                <div style="background: #3498db; color: white; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                                    <i class="fas fa-eye"></i>
                                </div>
                                <div>
                                    <h3 style="margin: 0; color: #2c3e50; font-size: 1.2rem; font-weight: 600;">
                                        VISTA PREVIA DEL REPORTE
                                    </h3>
                                    <p style="color: #7f8c8d; margin: 5px 0 0 0; font-size: 0.9rem;">
                                        Formato listo para enviar al Centro de Control
                                    </p>
                                </div>
                            </div>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; border: 1px solid #dee2e6; max-height: 350px; overflow-y: auto;">
                                <pre style="margin: 0; font-family: 'Courier New', monospace; white-space: pre-wrap; font-size: 0.95rem; line-height: 1.6; color: #2c3e50;">${textoFormateado}</pre>
                            </div>
                            
                            <div style="margin-top: 20px;">
                                <button onclick="app.currentView.currentSubView.imprimirReporteC5()"
                                        style="width: 100%; padding: 12px; background: #3498db; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px;">
                                    <i class="fas fa-print"></i> IMPRIMIR FORMATO C5
                                </button>
                            </div>
                        </div>

                        <!-- Envío al C5 -->
                        <div style="background: white; border-radius: 8px; padding: 25px; border: 1px solid #e9ecef; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                                <div style="background: #25D366; color: white; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                                    <i class="fab fa-whatsapp"></i>
                                </div>
                                <div>
                                    <h3 style="margin: 0; color: #2c3e50; font-size: 1.2rem; font-weight: 600;">
                                        ENVÍO AL CENTRO DE CONTROL
                                    </h3>
                                    <p style="color: #7f8c8d; margin: 5px 0 0 0; font-size: 0.9rem;">
                                        Envía este reporte al C5 por WhatsApp
                                    </p>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <div style="background: #e8f5e9; padding: 15px; border-radius: 6px; border-left: 4px solid #2ecc71; margin-bottom: 15px;">
                                    <p style="margin: 0; color: #155724; font-size: 0.9rem; display: flex; align-items: flex-start; gap: 10px;">
                                        <i class="fas fa-info-circle" style="margin-top: 2px;"></i>
                                        Copia el formato y pégalo en WhatsApp del Centro de Control C5
                                    </p>
                                </div>
                                
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    <button onclick="window.open('${whatsappLink}', '_blank')"
                                            style="padding: 14px; background: #25D366; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px;">
                                        <i class="fab fa-whatsapp fa-lg"></i> ABRIR WHATSAPP PARA ENVIAR
                                    </button>
                                    
                                    <button onclick="app.currentView.currentSubView.copiarReporteC5('${textoCodificado}')"
                                            style="padding: 14px; background: #3498db; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px;">
                                        <i class="fas fa-copy"></i> COPIAR TEXTO AL PORTAPAPELES
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Registro de Respuesta C5 -->
                            <div style="background: #fff3cd; padding: 20px; border-radius: 6px; border: 1px solid #ffeaa7;">
                                <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 15px;">
                                    <div style="background: #f39c12; color: white; width: 36px; height: 36px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                        <i class="fas fa-exchange-alt"></i>
                                    </div>
                                    <div>
                                        <h4 style="margin: 0; color: #856404; font-size: 1.1rem; font-weight: 600;">
                                            REGISTRAR RESPUESTA DEL C5
                                        </h4>
                                        <p style="color: #856404; margin: 5px 0 0 0; font-size: 0.9rem;">
                                            ¿Ya recibiste el folio que devolvió el Centro de Control?
                                        </p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; gap: 10px;">
                                    <div style="flex: 1; position: relative;">
                                        <input type="text" id="folio-c5-respuesta" 
                                               placeholder="Ingresa el folio C5 devuelto"
                                               style="width: 100%; padding: 10px 12px 10px 40px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 0.95rem; transition: all 0.2s; box-sizing: border-box;"
                                               onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                               onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                                        <i class="fas fa-hashtag" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #7f8c8d;"></i>
                                    </div>
                                    <button onclick="app.currentView.currentSubView.registrarFolioC5Respuesta()"
                                            style="padding: 10px 20px; background: #f39c12; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap;">
                                        <i class="fas fa-save"></i> REGISTRAR
                                    </button>
                                </div>
                                <div style="color: #856404; font-size: 0.85rem; margin-top: 10px; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-info-circle"></i> El folio se guardará y aparecerá en la lista como "Recibido"
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Botones de Navegación -->
                <div style="background: #f8f9fa; border-radius: 8px; padding: 25px; border: 1px solid #e9ecef;">
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button onclick="app.currentView.showNewReport()"
                                style="padding: 12px 25px; background: #2ecc71; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-plus-circle"></i> NUEVO REPORTE
                        </button>
                        <button onclick="app.currentView.showList()"
                                style="padding: 12px 25px; background: #3498db; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-list"></i> VER TODOS LOS REPORTES
                        </button>
                        <button onclick="app.currentView.showMain()"
                                style="padding: 12px 25px; background: #2c3e50; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-home"></i> VOLVER AL INICIO
                        </button>
                    </div>
                </div>

                <!-- Nota de Seguridad - Mismo que las otras vistas -->
                <div style="margin-top: 30px; text-align: center; color: #7f8c8d; font-size: 0.85rem; padding: 15px; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0;">
                        <i class="fas fa-lock" style="margin-right: 8px; color: #2c3e50;"></i>
                        Sistema protegido bajo protocolos de seguridad CERIT - Acceso autorizado únicamente
                    </p>
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
                this.mostrarAlerta(' TEXTO COPIADO', 'El formato CERIT ha sido copiado al portapapeles', 'success');
            })
            .catch(() => {
                // Fallback
                const textArea = document.createElement('textarea');
                textArea.value = texto;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.mostrarAlerta(' TEXTO COPIADO', 'El formato CERIT ha sido copiado al portapapeles', 'success');
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
                        this.mostrarAlerta(' FOLIO C5 REGISTRADO', `Folio registrado exitosamente:\nC4: ${this.folioC4}\nC5: ${folioC5}`, 'success');
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
            this.mostrarAlerta(' FOLIO C5 REGISTRADO LOCALMENTE', `Folio registrado localmente:\nC4: ${this.folioC4}\nC5: ${folioC5}\n\n(Nota: Para sincronizar con el servidor, activa el servicio C5)`, 'success');
            if (folioC5Input) folioC5Input.value = '';
        }
    }

    mostrarAlerta(titulo, mensaje, tipo = 'info') {
        const color = tipo === 'error' ? '#e74c3c' : tipo === 'success' ? '#2ecc71' : '#3498db';
        
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            background: white; border-left: 4px solid ${color}; 
            padding: 15px 20px; border-radius: 6px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
            z-index: 1001; min-width: 300px; max-width: 400px;
        `;
        
        alertDiv.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="background: ${color}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class="fas fa-${tipo === 'error' ? 'exclamation-triangle' : tipo === 'success' ? 'check-circle' : 'info-circle'}"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">${titulo}</div>
                    <div style="color: #7f8c8d; font-size: 0.9rem; white-space: pre-line;">${mensaje}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: #95a5a6; cursor: pointer; padding: 0; font-size: 1rem;">
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