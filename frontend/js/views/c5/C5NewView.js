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
            <div class="fade-in">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <button class="btn btn-back-to-main" style="margin-right: 15px; background: transparent; color: #666;">
                        <i class="fas fa-arrow-left fa-lg"></i>
                    </button>
                    <h2 style="margin: 0;"><i class="fas fa-file-alt"></i> Nuevo Reporte C5</h2>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <form id="reporte-c5-form">
                        <div style="background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color: white; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div>
                                    <h4 style="margin: 0; font-size: 1.2rem;">
                                        <i class="fab fa-whatsapp"></i> Formato CERIT/C5
                                    </h4>
                                    <small>Complete todos los campos requeridos (*)</small>
                                </div>
                                <div style="background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 20px;">
                                    Folio: <strong id="folio-preview">--</strong>
                                </div>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 25px;">
                            <div class="form-group">
                                <label for="fecha-c5"><i class="fas fa-calendar"></i> Fecha *</label>
                                <input type="date" id="fecha-c5" class="form-control" value="${fechaHoy}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="hora-c5"><i class="fas fa-clock"></i> Hora *</label>
                                <input type="time" id="hora-c5" class="form-control" value="${horaActual}" required>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <div class="form-group">
                                <label for="motivo-c5"><i class="fas fa-exclamation-circle"></i> Motivo *</label>
                                <select id="motivo-c5" class="form-control" required>
                                    <option value="">Seleccionar motivo...</option>
                                    <option value="VEHÍCULO SOSPECHOSO">VEHÍCULO SOSPECHOSO</option>
                                    <option value="PERSONA SOSPECHOSA">PERSONA SOSPECHOSA</option>
                                    <option value="ALTERCADO EN VÍA PÚBLICA">ALTERCADO EN VÍA PÚBLICA</option>
                                    <option value="RUIDO EXCESIVO">RUIDO EXCESIVO</option>
                                    <option value="SOLICITUD DE OTROS SERVICIOS PÚBLICOS">SOLICITUD DE OTROS SERVICIOS PÚBLICOS</option>
                                    <option value="ACCIDENTE VIAL">ACCIDENTE VIAL</option>
                                    <option value="ROBO">ROBO</option>
                                    <option value="INCENDIO">INCENDIO</option>
                                    <option value="OTRO">OTRO</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <div class="form-group">
                                <label for="ubicacion-c5"><i class="fas fa-map-marker-alt"></i> Ubicación *</label>
                                <input type="text" id="ubicacion-c5" class="form-control" 
                                       placeholder="Ej: 12 PONIENTE Y 14 NORTE LOS FRAILES" 
                                       style="font-size: 1.1em;" required>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <div class="form-group">
                                <label for="descripcion-c5"><i class="fas fa-file-alt"></i> Descripción *</label>
                                <textarea id="descripcion-c5" class="form-control" rows="4" 
                                          placeholder="Describa los hechos de manera detallada..." 
                                          style="font-family: 'Segoe UI', sans-serif;" required></textarea>
                                <small class="text-muted">Incluya detalles como: personas involucradas, vehículos, hora exacta, etc.</small>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 25px;">
                            <div class="form-group">
                                <label for="agente-c5"><i class="fas fa-user-shield"></i> Agente</label>
                                <input type="text" id="agente-c5" class="form-control" 
                                       placeholder="Ej: ROBLE 1, PATRULLA 45">
                            </div>
                            
                            <div class="form-group">
                                <label for="conclusion-c5"><i class="fas fa-check-circle"></i> Conclusión</label>
                                <input type="text" id="conclusion-c5" class="form-control" 
                                       placeholder="Ej: SITUACIÓN CONTROLADA, NEGATIVO DE LO REPORTADO">
                            </div>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
                            <h5 style="margin: 0 0 10px 0; color: #495057;">
                                <i class="fas fa-paper-plane"></i> Método de envío
                            </h5>
                            <div style="display: flex; gap: 15px;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="radio" name="metodo-c5" value="whatsapp" checked>
                                    <span><i class="fab fa-whatsapp" style="color: #25D366;"></i> WhatsApp</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="radio" name="metodo-c5" value="radio">
                                    <span><i class="fas fa-broadcast-tower"></i> Radio</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="radio" name="metodo-c5" value="telefono">
                                    <span><i class="fas fa-phone"></i> Teléfono</span>
                                </label>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 15px; justify-content: flex-end; padding-top: 20px; border-top: 1px solid #eee;">
                            <button type="button" class="btn btn-secondary btn-back-to-main">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                            <button type="button" class="btn" style="background: #17a2b8; color: white;"
                                    onclick="app.currentView.currentSubView.previsualizarReporte()">
                                <i class="fas fa-eye"></i> Vista Previa
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Guardar Reporte
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
        }
        if (horaInput) {
            horaInput.addEventListener('change', () => this.actualizarFolioPreview());
        }
    }

    actualizarFolioPreview() {
        const fecha = this.container.querySelector('#fecha-c5')?.value;
        const hora = this.container.querySelector('#hora-c5')?.value;
        
        if (fecha && hora) {
            const folio = this.generarFolioC4(fecha, hora);
            const folioPreview = this.container.querySelector('#folio-preview');
            if (folioPreview) {
                folioPreview.textContent = folio;
                folioPreview.style.fontFamily = 'monospace';
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
            alert('Por favor, complete todos los campos requeridos');
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
            background: rgba(0,0,0,0.7); z-index: 1000; display: flex; 
            align-items: center; justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="background: white; width: 90%; max-width: 700px; border-radius: 10px; overflow: hidden;">
                <div style="background: #25D366; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0;"><i class="fab fa-whatsapp"></i> Vista Previa - Formato CERIT/C5</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="padding: 25px; max-height: 70vh; overflow-y: auto;">
                    <pre style="background: #f8f9fa; padding: 20px; border-radius: 5px; font-family: 'Courier New', monospace; white-space: pre-wrap;">${textoFormateado}</pre>
                    <div style="margin-top: 20px; text-align: center;">
                        <button class="btn btn-primary" onclick="app.currentView.currentSubView.copiarTextoVistaPrevia('${encodeURIComponent(textoFormateado)}')">
                            <i class="fas fa-copy"></i> Copiar al Portapapeles
                        </button>
                        <button class="btn" onclick="this.parentElement.parentElement.parentElement.remove()" style="margin-left: 10px;">
                            Cerrar
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

*Enviado desde SAS C4*
*Turno: ${this.currentUser.turno}*
*Supervisor: ${this.currentUser.username}*`;
    }

    copiarTextoVistaPrevia(textoCodificado) {
        const texto = decodeURIComponent(textoCodificado);
        navigator.clipboard.writeText(texto)
            .then(() => alert('✅ Texto copiado al portapapeles'))
            .catch(() => alert('⚠️ No se pudo copiar el texto'));
    }

    async guardarReporte() {
        const btn = this.container.querySelector('#reporte-c5-form button[type="submit"]');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        btn.disabled = true;
        
        try {
            const fecha = this.container.querySelector('#fecha-c5').value;
            const hora = this.container.querySelector('#hora-c5').value;
            const metodo = this.container.querySelector('input[name="metodo-c5"]:checked')?.value || 'whatsapp';
            
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
                    alert('⚠️ Error guardando en base de datos: ' + error.message);
                    this.controller.showSuccess(folioC4, datos);
                }
            } else {
                this.controller.showSuccess(folioC4, datos);
            }
            
        } catch (error) {
            console.error('Error guardando reporte:', error);
            alert('⚠️ Error al guardar el reporte');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    cleanup() {
        // Limpiar event listeners
    }
}

window.C5NewView = C5NewView;