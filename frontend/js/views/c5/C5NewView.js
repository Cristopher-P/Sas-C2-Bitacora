class C5NewView {
    constructor(currentUser, controller) {
        this.currentUser = currentUser;
        this.controller = controller;
    }

    render(container) {
        this.container = container;
        
        const now = new Date();
        const fechaHoy = now.toISOString().split('T')[0];
        const horaActual = now.toTimeString().substring(0,5);
        
        this.container.innerHTML = this.getTemplate(fechaHoy, horaActual);
        this.bindEvents();
        
        // Inicializar vista previa del folio
        setTimeout(() => this.actualizarFolioPreview(), 100);
    }

    getTemplate(fechaHoy, horaActual) {
        return `
            <div class="fade-in view-shell view-shell--wide view-form">
                <!-- Encabezado -->
                <div class="page-header">
                    <div class="page-title-group">
                        <button class="btn btn-secondary btn-icon btn-back-to-main" aria-label="Volver">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <h1 class="page-title">
                            NUEVO REPORTE CERIT
                        </h1>
                    </div>
                    <div class="user-chip">
                        <i class="fas fa-user-shield"></i>
                        <span>${this.currentUser || 'OPERADOR'}</span>
                    </div>
                </div>
                <div class="page-divider page-divider--danger"></div>

                <!-- Panel de Control con Folio - Mismo tamaño -->
                <div style="margin-bottom: 25px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <!-- Información del formulario -->
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #e9ecef; height: 100%; display: flex; flex-direction: column; justify-content: center;">
                            <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 1.2rem; font-weight: 600;">
                                <i class="fas fa-exclamation-triangle" style="margin-right: 10px; color: #e74c3c;"></i>
                                FORMULARIO DE REPORTE
                            </h3>
                            <p style="color: #7f8c8d; margin: 0; font-size: 0.95rem; line-height: 1.4;">
                                Complete todos los campos para registrar la emergencia. Todos los campos marcados con * son obligatorios.
                            </p>
                        </div>

                        <!-- Folio CERIT -->
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #e9ecef; height: 100%; display: flex; flex-direction: column; justify-content: center;">
                            <div style="margin-bottom: 15px;">
                                <div style="display: flex; align-items: center; margin-bottom: 5px;">
                                    <div style="background: #2c3e50; color: white; width: 32px; height: 32px; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
                                        <i class="fas fa-hashtag"></i>
                                    </div>
                                    <div>
                                        <h3 style="margin: 0; color: #2c3e50; font-size: 1.1rem; font-weight: 600;">
                                            FOLIO CERIT
                                        </h3>
                                        <p style="color: #7f8c8d; margin: 3px 0 0 0; font-size: 0.85rem;">
                                            Formato: DDMMYYHHMM
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #dee2e6;">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <div>
                                        <div style="color: #2c3e50; font-size: 0.9rem; font-weight: 600; margin-bottom: 5px;">FOLIO GENERADO:</div>
                                        <div style="font-family: 'Courier New', monospace; font-size: 1.3rem; font-weight: 700; color: #e74c3c; letter-spacing: 1px;" id="folio-preview">
                                            -- -- -- --
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="color: #2c3e50; font-size: 0.9rem; font-weight: 600;">EJEMPLO:</div>
                                        <div style="color: #7f8c8d; font-size: 0.85rem;">
                                            2001260812
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Formulario Principal -->
                <div style="background: white; border-radius: 8px; padding: 30px; border: 1px solid #e9ecef; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <form id="reporte-c5-form">
                        <!-- Fecha y Hora -->
                        <div style="margin-bottom: 30px;">
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                                <div>
                                    <label for="fecha-c5" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                        <i class="fas fa-calendar" style="margin-right: 8px; color: #e74c3c;"></i>
                                        FECHA *
                                    </label>
                                    <input type="date" id="fecha-c5" 
                                           style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;"
                                           value="${fechaHoy}" 
                                           required
                                           onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                           onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                                </div>
                                
                                <div>
                                    <label for="hora-c5" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                        <i class="fas fa-clock" style="margin-right: 8px; color: #e74c3c;"></i>
                                        HORA *
                                    </label>
                                    <input type="time" id="hora-c5" 
                                           style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;"
                                           value="${horaActual}" 
                                           required
                                           onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                           onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                                </div>
                            </div>
                        </div>

                        <!-- Motivo -->
                        <div style="margin-bottom: 30px;">
                            <label for="motivo-c5" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-exclamation-circle" style="margin-right: 8px; color: #e74c3c;"></i>
                                MOTIVO DE REPORTE *
                            </label>
                            <select id="motivo-c5" 
                                    style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; background: white; transition: all 0.2s; box-sizing: border-box;"
                                    required
                                    onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                    onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                                <option value="">SELECCIONAR MOTIVO...</option>
                                <option value="VEHÍCULO SOSPECHOSO">🚗 VEHÍCULO SOSPECHOSO</option>
                                <option value="PERSONA SOSPECHOSA">👤 PERSONA SOSPECHOSA</option>
                                <option value="ALTERCADO EN VÍA PÚBLICA">⚔️ ALTERCADO EN VÍA PÚBLICA</option>
                                <option value="RUIDO EXCESIVO">🔊 RUIDO EXCESIVO</option>
                                <option value="SOLICITUD DE OTROS SERVICIOS PÚBLICOS">🏛️ SOLICITUD DE OTROS SERVICIOS PÚBLICOS</option>
                                <option value="ACCIDENTE VIAL">🚨 ACCIDENTE VIAL</option>
                                <option value="ROBO">💼 ROBO</option>
                                <option value="INCENDIO">🔥 INCENDIO</option>
                                <option value="OTRO">📝 OTRO</option>
                            </select>
                        </div>

                        <!-- Ubicación -->
                        <div style="margin-bottom: 30px;">
                            <label for="ubicacion-c5" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-map-marker-alt" style="margin-right: 8px; color: #e74c3c;"></i>
                                UBICACIÓN EXACTA *
                            </label>
                            <input type="text" id="ubicacion-c5" 
                                   style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;"
                                   placeholder="Ej: 12 PONIENTE Y 14 NORTE, COLONIA LOS FRAILES"
                                   required
                                   onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                   onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                        </div>

                        <!-- Descripción -->
                        <div style="margin-bottom: 30px;">
                            <label for="descripcion-c5" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-file-alt" style="margin-right: 8px; color: #e74c3c;"></i>
                                DESCRIPCIÓN DETALLADA *
                            </label>
                            <textarea id="descripcion-c5" 
                                      style="width: 100%; padding: 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; min-height: 120px; resize: vertical; transition: all 0.2s; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; line-height: 1.5;"
                                      placeholder="Describa los hechos con detalle: personas involucradas, vehículos, hora exacta, etc..."
                                      required
                                      onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                      onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'"></textarea>
                            <div style="color: #7f8c8d; font-size: 0.85rem; margin-top: 8px;">
                                <i class="fas fa-info-circle"></i> Incluya todos los detalles relevantes para la atención
                            </div>
                        </div>

                        <!-- Agente y Conclusión -->
                        <div style="margin-bottom: 30px;">
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                                <div>
                                    <label for="agente-c5" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                        <i class="fas fa-user-shield" style="margin-right: 8px; color: #3498db;"></i>
                                        AGENTE / PATRULLA
                                    </label>
                                    <input type="text" id="agente-c5" 
                                           style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;"
                                           placeholder="Ej: ROBLE 1, PATRULLA 45"
                                           onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                           onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                                </div>
                                
                                <div>
                                    <label for="conclusion-c5" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                        <i class="fas fa-check-circle" style="margin-right: 8px; color: #2ecc71;"></i>
                                        CONCLUSIÓN
                                    </label>
                                    <input type="text" id="conclusion-c5" 
                                           style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;"
                                           placeholder="Ej: SITUACIÓN CONTROLADA, NEGATIVO REPORTADO"
                                           onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                           onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                                </div>
                            </div>
                        </div>

                        <!-- Botones de Acción -->
                        <div style="display: flex; gap: 15px; justify-content: flex-end; padding-top: 30px; border-top: 1px solid #e9ecef;">
                            <button type="button" class="btn-back-to-main" 
                                    style="padding: 10px 25px; background: #95a5a6; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                                <i class="fas fa-times"></i> CANCELAR
                            </button>
                            <button type="button" onclick="app.currentView.currentSubView.previsualizarReporte()"
                                    style="padding: 10px 25px; background: #3498db; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                                <i class="fas fa-eye"></i> VISTA PREVIA
                            </button>
                            <button type="submit" 
                                    style="padding: 10px 25px; background: #2ecc71; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                                <i class="fas fa-save"></i> GUARDAR REPORTE
                            </button>
                        </div>
                    </form>
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

        // Formulario
        const form = this.container.querySelector('#reporte-c5-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.guardarReporte();
            });
        }

        // Actualizar folio cuando cambian fecha/hora
        const fechaInput = this.container.querySelector('#fecha-c5');
        const horaInput = this.container.querySelector('#hora-c5');
        
        if (fechaInput) {
            fechaInput.addEventListener('change', () => this.actualizarFolioPreview());
            fechaInput.addEventListener('input', () => this.actualizarFolioPreview());
        }
        if (horaInput) {
            horaInput.addEventListener('change', () => this.actualizarFolioPreview());
            horaInput.addEventListener('input', () => this.actualizarFolioPreview());
        }
    }

    actualizarFolioPreview() {
        const fecha = this.container.querySelector('#fecha-c5')?.value;
        const hora = this.container.querySelector('#hora-c5')?.value;
        
        if (fecha && hora) {
            const folio = this.generarFolioC4(fecha, hora);
            const folioPreview = this.container.querySelector('#folio-preview');
            if (folioPreview) {
                // Formatear el folio con espacios para mejor legibilidad
                const folioFormateado = folio.match(/.{1,2}/g)?.join(' ') || folio;
                folioPreview.textContent = folioFormateado;
                folioPreview.style.color = '#e74c3c';
            }
        }
    }

    generarFolioC4(fecha, hora) {
        try {
            const date = new Date(`${fecha}T${hora}`);
            const dia = date.getDate().toString().padStart(2, '0');
            const mes = (date.getMonth() + 1).toString().padStart(2, '0');
            const ano = date.getFullYear().toString().substring(2, 4);
            const horas = date.getHours().toString().padStart(2, '0');
            const minutos = date.getMinutes().toString().padStart(2, '0');
            
            return `${dia}${mes}${ano}${horas}${minutos}`;
        } catch (error) {
            console.error('Error generando folio:', error);
            return 'ERROR-FOLIO';
        }
    }

    previsualizarReporte() {
        const fecha = this.container.querySelector('#fecha-c5')?.value;
        const hora = this.container.querySelector('#hora-c5')?.value;
        const motivo = this.container.querySelector('#motivo-c5')?.value;
        const ubicacion = this.container.querySelector('#ubicacion-c5')?.value;
        const descripcion = this.container.querySelector('#descripcion-c5')?.value;
        const agente = this.container.querySelector('#agente-c5')?.value;
        const conclusion = this.container.querySelector('#conclusion-c5')?.value;
        
        if (!fecha || !hora || !motivo || !ubicacion || !descripcion) {
            this.mostrarAlerta('⚠️ FALTAN CAMPOS REQUERIDOS', 'Por favor, complete todos los campos con asterisco (*)', 'error');
            return;
        }
        
        const folio = this.generarFolioC4(fecha, hora);
        const textoFormateado = this.formatearReporteC5({
            folio_c4: folio,
            hora_envio: hora,
            motivo,
            ubicacion,
            descripcion,
            agente,
            conclusion
        });
        
        // Mostrar previsualización
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 1000; display: flex; 
            align-items: center; justify-content: center; padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="background: white; width: 90%; max-width: 700px; border-radius: 8px; overflow: hidden; border: 2px solid #2c3e50;">
                <div style="background: #2c3e50; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 1.3rem; font-weight: 600;">
                        <i class="fas fa-eye" style="margin-right: 10px;"></i>
                        VISTA PREVIA - FORMATO CERIT
                    </h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="padding: 25px; max-height: 70vh; overflow-y: auto;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; border: 1px solid #e9ecef;">
                        <div style="font-family: 'Courier New', monospace; white-space: pre-wrap; font-size: 0.95rem; line-height: 1.6;">
${textoFormateado}
                        </div>
                    </div>
                    <div style="margin-top: 20px; text-align: center;">
                        <button onclick="app.currentView.currentSubView.copiarTextoVistaPrevia('${encodeURIComponent(textoFormateado)}')"
                                style="padding: 10px 25px; background: #3498db; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; margin-right: 10px;">
                            <i class="fas fa-copy"></i> COPIAR AL PORTAPAPELES
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                style="padding: 10px 25px; background: #95a5a6; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                            <i class="fas fa-times"></i> CERRAR
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    formatearReporteC5(datos) {
        return `FOLIO: ${datos.folio_c4}
HORA: ${datos.hora_envio}
MOTIVO: ${datos.motivo}
UBICACIÓN: ${datos.ubicacion}
DESCRIPCIÓN: ${datos.descripcion}
AGENTE: ${datos.agente || 'No especificado'}
CONCLUSIÓN: ${datos.conclusion || 'Sin conclusión'}

*Enviado desde Sistema CERIT*
*Operador: ${this.currentUser}*
*Fecha: ${new Date().toLocaleString()}*`;
    }

    mostrarAlerta(titulo, mensaje, tipo = 'info') {
        const alertDiv = document.createElement('div');
        const color = tipo === 'error' ? '#e74c3c' : tipo === 'success' ? '#2ecc71' : '#3498db';
        
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
                    <div style="color: #7f8c8d; font-size: 0.9rem;">${mensaje}</div>
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

    copiarTextoVistaPrevia(textoCodificado) {
        const texto = decodeURIComponent(textoCodificado);
        navigator.clipboard.writeText(texto)
            .then(() => this.mostrarAlerta(' TEXTO COPIADO', 'El formato CERIT ha sido copiado al portapapeles', 'success'))
            .catch(() => this.mostrarAlerta('⚠️ ERROR', 'No se pudo copiar el texto', 'error'));
    }

    async guardarReporte() {
        const btn = this.container.querySelector('#reporte-c5-form button[type="submit"]');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GUARDANDO...';
        btn.disabled = true;
        
        try {
            const fecha = this.container.querySelector('#fecha-c5').value;
            const hora = this.container.querySelector('#hora-c5').value;
            const metodo = 'whatsapp'; // Método fijo ahora
            
            const datos = {
                fecha_envio: fecha,
                hora_envio: hora,
                motivo: this.container.querySelector('#motivo-c5').value,
                ubicacion: this.container.querySelector('#ubicacion-c5').value,
                descripcion: this.container.querySelector('#descripcion-c5').value,
                agente: this.container.querySelector('#agente-c5').value || '',
                conclusion: this.container.querySelector('#conclusion-c5').value || '',
                metodo_envio: metodo,
                numero_destino: ''
            };
            
            const folioC4 = this.generarFolioC4(fecha, hora);
            
            if (typeof C5Service !== 'undefined') {
                try {
                    const resultado = await C5Service.crearReporte(datos);
                    
                    if (resultado.success) {
                        this.controller.showSuccess(folioC4, datos, resultado.data);
                    } else {
                        throw new Error(resultado.message);
                    }
                } catch (error) {
                    console.error('Error con servicio C5:', error);
                    this.mostrarAlerta('⚠️ ERROR DE BASE DE DATOS', error.message, 'error');
                    this.controller.showSuccess(folioC4, datos);
                }
            } else {
                this.controller.showSuccess(folioC4, datos);
            }
            
        } catch (error) {
            console.error('Error guardando reporte:', error);
            this.mostrarAlerta('⚠️ ERROR', 'Error al guardar el reporte', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    cleanup() {
        // Limpiar event listeners
    }
}

window.C5NewView = C5NewView;