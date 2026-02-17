class C5NewView {
    constructor(currentUser, controller) {
        this.currentUser = currentUser;
        this.controller = controller;
        this.colors = {
            primary: '#003366',      // Azul policía principal
            secondary: '#0a4d8c',    // Azul más claro para hover
            accent: '#ff6b35',       // Naranja de alerta/acceso rápido
            accentGreen: '#28a745',  // Verde para éxito/operativo
            accentRed: '#dc3545',    // Rojo para emergencias
            light: '#f8f9fa',        // Fondo claro
            dark: '#212529',         // Texto oscuro
            gray: '#6c757d',         // Texto secundario
            border: '#dee2e6'        // Bordes
        };
    }

    render(container) {
        this.container = container;
        
        // Aplicar clases directamente al contenedor principal para evitar anidamiento
        this.container.className = 'dashboard-cerit-tehuacan view-bleed view-shell view-form';
        this.container.innerHTML = this.getTemplate();
        
        this.setDefaultValues();
        this.bindEvents();

        // Inicializar vista previa del folio
        this.actualizarFolioPreview();
    }

    getTemplate() {
        const now = new Date();
        const fechaHoy = now.toISOString().split('T')[0];
        const horaActual = now.toTimeString().substring(0,5);
        
        return `
            <div class="cerit-dashboard view-shell--xl">
                <!-- HEADER & CONTROL -->
                <div class="c5-form-layout">
                    
                    <!-- COLUMNA PRINCIPAL (Formulario) -->
                    <div class="c5-form-column">
                        
                        <!-- Header Sección -->
                        <div class="c5-header-card">
                            <div>
                                <h2 class="c5-header-title">
                                    <i class="fas fa-file-medical-alt"></i> NUEVO REPORTE CERIT
                                </h2>
                                <p class="c5-header-subtitle">
                                    Complete los campos para registrar la emergencia.
                                </p>
                            </div>
                            <div class="c5-folio-box">
                                <div class="c5-folio-label">FOLIO CERIT</div>
                                <div id="folio-preview" class="c5-folio-value">
                                    -- -- -- --
                                </div>
                            </div>
                        </div>

                        <form id="reporte-c5-form" style="display: contents;">

                            <!-- 1. DATOS DE CONTROL Y TIEMPO -->
                            <div class="c5-form-section">
                                <h3 class="c5-section-title" style="color: ${this.colors.secondary}">
                                    <i class="fas fa-clock"></i> 1. CONTROL Y TIEMPO
                                </h3>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                                    <div>
                                        <label class="form-label">FECHA *</label>
                                        <input type="date" id="fecha-c5" class="form-control" value="${fechaHoy}" required>
                                    </div>
                                    <div>
                                        <label class="form-label">HORA *</label>
                                        <input type="time" id="hora-c5" class="form-control" value="${horaActual}" required>
                                    </div>
                                    <div>
                                        <label class="form-label">MOTIVO DE REPORTE *</label>
                                        <select id="motivo-c5" class="form-control" required>
                                            <option value="">Seleccionar...</option>
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
                                </div>
                            </div>

                            <!-- 2. UBICACIÓN Y DESCRIPCIÓN -->
                            <div class="c5-form-section">
                                <h3 class="c5-section-title" style="color: ${this.colors.secondary}">
                                    <i class="fas fa-map-marker-alt"></i> 2. UBICACIÓN Y DESCRIPCIÓN
                                </h3>
                                <div style="margin-bottom: 15px;">
                                    <label class="form-label">UBICACIÓN EXACTA *</label>
                                    <input type="text" id="ubicacion-c5" class="form-control" placeholder="Ej: 12 PONIENTE Y 14 NORTE, COLONIA LOS FRAILES" required>
                                </div>
                                <div>
                                    <label class="form-label">DESCRIPCIÓN DETALLADA *</label>
                                    <textarea id="descripcion-c5" class="form-control" placeholder="Describa los hechos con detalle..." required style="height: 100px; resize: vertical;"></textarea>
                                </div>
                            </div>

                            <!-- 3. OPERATIVO Y CIERRE -->
                            <div class="c5-form-section">
                                <h3 class="c5-section-title" style="color: ${this.colors.accentGreen}">
                                    <i class="fas fa-user-shield"></i> 3. OPERATIVO
                                </h3>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                    <div>
                                        <label class="form-label">AGENTE / PATRULLA</label>
                                        <input type="text" id="agente-c5" class="form-control" placeholder="Ej: ROBLE 1, PATRULLA 45">
                                    </div>
                                    <div>
                                        <label class="form-label">CONCLUSIÓN</label>
                                        <input type="text" id="conclusion-c5" class="form-control" placeholder="Ej: SITUACIÓN CONTROLADA">
                                    </div>
                                </div>
                            </div>

                        </form>
                    </div>
                    
                    <!-- COLUMNA LATERAL (Acciones) -->
                    <div class="c5-sidebar-sticky">
                        
                        <!-- Progreso -->
                        <div class="c5-progress-card">
                            <h4 style="margin: 0 0 10px 0; font-size: 0.9rem;">CAMPOS REQUERIDOS</h4>
                            <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;">
                                <span id="campos-completados">0%</span>
                            </div>
                            <div style="background: ${this.colors.light}; height: 8px; border-radius: 4px; overflow: hidden;">
                                <div id="progreso-campos" style="background: ${this.colors.accent}; height: 100%; width: 0%; transition: width 0.3s;"></div>
                            </div>
                        </div>

                        <!-- Acciones -->
                        <div class="c5-action-card">
                            <button id="btn-guardar-c5" type="button" class="btn c5-btn-save">
                                <i class="fas fa-save"></i> GUARDAR REPORTE
                            </button>
                            <button id="btn-preview-c5" type="button" class="btn c5-btn-preview">
                                <i class="fas fa-eye"></i> Vista Previa
                            </button>
                            <button class="btn-back-to-main c5-btn-cancel">
                                Cancelar
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        `;
    }

    setDefaultValues() {
        this.inicializarContadorCampos();
    }

    inicializarContadorCampos() {
        this.actualizarContadorCampos();
    }

    actualizarContadorCampos() {
        const requiredIds = [
            'fecha-c5', 'hora-c5', 'motivo-c5', 'ubicacion-c5', 'descripcion-c5'
        ];
        
        let completed = 0;
        requiredIds.forEach(id => {
            const el = this.container.querySelector(`#${id}`);
            if (el && el.value.trim()) completed++;
        });

        const percent = Math.round((completed / requiredIds.length) * 100);
        const counterEl = this.container.querySelector('#campos-completados');
        const progressEl = this.container.querySelector('#progreso-campos');

        if (counterEl) counterEl.textContent = `${percent}%`;
        if (progressEl) {
            progressEl.style.width = `${percent}%`;
            progressEl.style.backgroundColor = percent === 100 ? this.colors.accentGreen : this.colors.accent;
        }
    }

    bindEvents() {
        // Botón volver/cancelar
        const backBtns = this.container.querySelectorAll('.btn-back-to-main');
        backBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.controller.showMain();
            });
        });

        // Guardar
        const btnGuardar = this.container.querySelector('#btn-guardar-c5');
        if (btnGuardar) {
            btnGuardar.addEventListener('click', (e) => {
                e.preventDefault();
                this.guardarReporte();
            });
        }

        // Vista Previa
        const btnPreview = this.container.querySelector('#btn-preview-c5');
        if (btnPreview) {
            btnPreview.addEventListener('click', () => this.previsualizarReporte());
        }

        // Inputs para progreso y folio
        const inputs = this.container.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.actualizarContadorCampos();
                
                if (input.id === 'fecha-c5' || input.id === 'hora-c5') {
                    this.actualizarFolioPreview();
                }
            });
        });
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
            <div style="background: white; width: 90%; max-width: 700px; border-radius: 8px; overflow: hidden; border: 2px solid ${this.colors.primary};">
                <div style="background: ${this.colors.primary}; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 1.3rem; font-weight: 600;">
                        <i class="fas fa-eye" style="margin-right: 10px;"></i>
                        VISTA PREVIA - FORMATO CERIT
                    </h3>
                    <button id="close-modal-btn" 
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
                        <button id="copy-btn"
                                style="padding: 10px 25px; background: ${this.colors.secondary}; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; margin-right: 10px;">
                            <i class="fas fa-copy"></i> COPIAR AL PORTAPAPELES
                        </button>
                        <button id="close-modal-footer-btn" 
                                style="padding: 10px 25px; background: ${this.colors.gray}; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                            <i class="fas fa-times"></i> CERRAR
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);

        // Event listeners para el modal
        modal.querySelector('#close-modal-btn').onclick = () => modal.remove();
        modal.querySelector('#close-modal-footer-btn').onclick = () => modal.remove();
        modal.querySelector('#copy-btn').onclick = () => 
            this.copiarTextoVistaPrevia(encodeURIComponent(textoFormateado));
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
        const color = tipo === 'error' ? this.colors.accentRed : tipo === 'success' ? this.colors.accentGreen : this.colors.secondary;
        
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
                <button class="close-alert-btn" 
                        style="background: none; border: none; color: #95a5a6; cursor: pointer; padding: 0; font-size: 1rem;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        alertDiv.querySelector('.close-alert-btn').onclick = () => alertDiv.remove();
        
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
        const btn = this.container.querySelector('#btn-guardar-c5');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GUARDANDO...';
        btn.disabled = true;
        
        try {
            const fecha = this.container.querySelector('#fecha-c5').value;
            const hora = this.container.querySelector('#hora-c5').value;
            const metodo = 'whatsapp';
            
            // Validar requeridos básicos
            if (!fecha || !hora || !this.container.querySelector('#motivo-c5').value || !this.container.querySelector('#ubicacion-c5').value || !this.container.querySelector('#descripcion-c5').value) {
                throw new Error('Faltan campos obligatorios');
            }

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
            this.mostrarAlerta('⚠️ ERROR', error.message || 'Error al guardar el reporte', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    cleanup() {
        // Limpiar event listeners si es necesario
    }
}

window.C5NewView = C5NewView;