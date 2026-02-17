/**
 * LLAMADASVIEW.JS - Vista completa para registrar llamadas con diseño mejorado
 */

class LlamadasView {
    constructor(currentUser, appController) {
        this.currentUser = currentUser;
        this.appController = appController;
        this.expandedContainer = null;
        this.originalContainer = null;
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

    async render(container) {
        this.originalContainer = container; 
        
        // Usar la misma clase base del dashboard para consistencia
        this.expandedContainer = document.createElement('div');
        this.expandedContainer.className = 'dashboard-cerit-tehuacan view-bleed view-shell view-form';
        
        this.originalContainer.innerHTML = '';
        this.originalContainer.appendChild(this.expandedContainer);
        
        this.container = this.expandedContainer;
        this.container.innerHTML = this.getTemplate();
        this.setDefaultValues();
        this.bindEvents();
    }

    setDefaultValues() {
        this.inicializarContadorCampos();
    }

    bindEvents() {
        // Event listeners para actualizar folio y progreso
        this.container.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', () => {
                this.actualizarContadorCampos();
                
                // Actualizar folio si cambia fecha u hora
                if (input.id === 'fecha' || input.id === 'hr_rec') {
                    const fecha = this.container.querySelector('#fecha').value;
                    const hora = this.container.querySelector('#hr_rec').value;
                    const folioEl = this.container.querySelector('#folio-preview');
                    if (folioEl) {
                        folioEl.textContent = this.generarFolioLlamada(fecha, hora);
                    }
                }
            });
        });

        // Botones
        const btnGuardar = this.container.querySelector('#btn-guardar');
        if (btnGuardar) {
            btnGuardar.addEventListener('click', () => this.procesarRegistroCompleto());
        }

        const btnLimpiar = this.container.querySelector('#btn-limpiar');
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', () => {
                if(confirm('¿Está seguro de limpiar el formulario?')) {
                    this.render(this.originalContainer);
                }
            });
        }

        const btnCancelar = this.container.querySelector('.btn-back-to-main');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => {
                this.appController.goToDashboard();
            });
        }
    }

    getTemplate() {
        const now = new Date();
        const fechaHoy = now.toISOString().split('T')[0];
        const horaActual = now.toTimeString().substring(0,5);
        
        return `
            <div class="cerit-dashboard view-shell--xl">
                <!-- HEADER & CONTROL -->
                <div class="dashboard-main-grid" style="display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start;">
                    
                    <!-- COLUMNA PRINCIPAL (Formulario) -->
                    <div class="dashboard-table-column" style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <!-- Header Sección -->
                        <div style="background: white; border-radius: 10px; padding: 20px; border: 1px solid ${this.colors.border}; border-left: 5px solid ${this.colors.primary}; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h2 style="margin: 0; color: ${this.colors.primary}; font-size: 1.4rem; font-weight: 700;">
                                    <i class="fas fa-edit"></i> REGISTRO DE LLAMADA
                                </h2>
                                <p style="margin: 5px 0 0 0; color: ${this.colors.gray}; font-size: 0.9rem;">
                                    Complete los 21 campos requeridos por el sistema.
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.8rem; color: ${this.colors.gray};">FOLIO SISTEMA</div>
                                <div id="folio-preview" style="font-family: 'Courier New', monospace; font-size: 1.2rem; font-weight: 800; color: ${this.colors.accent};">
                                    ${this.generarFolioLlamada(fechaHoy, horaActual)}
                                </div>
                            </div>
                        </div>

                        <!-- 1. DATOS DE CONTROL Y TIEMPO -->
                        <div class="form-section" style="background: white; border-radius: 10px; padding: 25px; border: 1px solid ${this.colors.border};">
                            <h3 style="margin: 0 0 20px 0; color: ${this.colors.secondary}; font-size: 1.1rem; border-bottom: 1px solid ${this.colors.light}; padding-bottom: 10px;">
                                <i class="fas fa-clock"></i> 1. CONTROL Y TIEMPO
                            </h3>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
                                <div>
                                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">FECHA *</label>
                                    <input type="date" id="fecha" class="form-control" value="${fechaHoy}" required style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 5px;">
                                </div>
                                <div>
                                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">TURN (TURNO) *</label>
                                    <select id="turn" class="form-control" required style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 5px;">
                                        <option value="">Seleccionar...</option>
                                        <option value="matutino">MATUTINO</option>
                                        <option value="vespertino">VESPERTINO</option>
                                        <option value="nocturno">NOCTURNO</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">HR REC (RECEPCIÓN) *</label>
                                    <input type="time" id="hr_rec" class="form-control" value="${horaActual}" required style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 5px;">
                                </div>
                                <div>
                                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">AGENTE TEL</label>
                                    <input type="text" id="agente_tel" class="form-control" value="${this.currentUser?.nombre || ''}" readonly style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 5px; background: ${this.colors.light};">
                                </div>
                            </div>
                        </div>

                        <!-- 2. UBICACIÓN Y SOLICITANTE -->
                        <div class="form-section" style="background: white; border-radius: 10px; padding: 25px; border: 1px solid ${this.colors.border};">
                            <h3 style="margin: 0 0 20px 0; color: ${this.colors.secondary}; font-size: 1.1rem; border-bottom: 1px solid ${this.colors.light}; padding-bottom: 10px;">
                                <i class="fas fa-map-marker-alt"></i> 2. UBICACIÓN Y SOLICITANTE
                            </h3>
                            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <div>
                                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">UBICACIÓN EXACTA *</label>
                                    <input type="text" id="ubicacion" class="form-control" placeholder="Calle, Número, Referencias" required style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 5px;">
                                </div>
                                <div>
                                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">COLONIA *</label>
                                    <input type="text" id="colonia" class="form-control" placeholder="Colonia" required style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 5px;">
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                                <div>
                                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">ECTO (SECTOR)</label>
                                    <input type="text" id="ecto" class="form-control" placeholder="Sector/Distrito" style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 5px;">
                                </div>
                                <div>
                                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">PETICIONARIO *</label>
                                    <input type="text" id="peticionario" class="form-control" placeholder="Nombre completo" required style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 5px;">
                                </div>
                                <div>
                                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">NUMERO TEL *</label>
                                    <input type="tel" id="numero_tel" class="form-control" placeholder="10 dígitos" required style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 5px;">
                                </div>
                            </div>
                        </div>

                        <!-- 3. MOTIVOS Y DETALLES -->
                        <div class="form-section" style="background: white; border-radius: 10px; padding: 25px; border: 1px solid ${this.colors.border};">
                            <h3 style="margin: 0 0 20px 0; color: ${this.colors.accentGreen}; font-size: 1.1rem; border-bottom: 1px solid ${this.colors.light}; padding-bottom: 10px;">
                                <i class="fas fa-exclamation-circle"></i> 3. MOTIVOS Y DETALLES
                            </h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <div>
                                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">MOTIVO (REPORTADO) *</label>
                                    <input type="text" id="motivo" class="form-control" placeholder="Incidente reportado" required style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 5px;">
                                </div>
                                <div>
                                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">MOTIVO RADIO OPERAD *</label>
                                    <input type="text" id="motivo_radio" class="form-control" placeholder="Tipificación operador" required style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 5px;">
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div>
                                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">VEH (VEHÍCULOS)</label>
                                    <textarea id="veh" class="form-control" placeholder="Datos de vehículos..." style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 5px; height: 60px; resize: none;"></textarea>
                                </div>
                                <div>
                                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">DET (DETENIDOS/DETALLES)</label>
                                    <textarea id="det" class="form-control" placeholder="Detalles o detenidos..." style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 5px; height: 60px; resize: none;"></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- 4. OPERATIBIDAD UNIDADES -->
                        <div class="form-section" style="background: white; border-radius: 10px; padding: 25px; border: 1px solid ${this.colors.border};">
                            <h3 style="margin: 0 0 20px 0; color: ${this.colors.accent}; font-size: 1.1rem; border-bottom: 1px solid ${this.colors.light}; padding-bottom: 10px;">
                                <i class="fas fa-car-side"></i> 4. UNIDADES Y TIEMPOS
                            </h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <div>
                                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">UNIDAD (PATRULLA) *</label>
                                    <input type="text" id="unidad" class="form-control" placeholder="Ej: P-123" required style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 5px;">
                                </div>
                                <div>
                                    <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">DE DESI (DESTINO)</label>
                                    <input type="text" id="de_desi" class="form-control" placeholder="Destino / Dependencia" style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 5px;">
                                </div>
                            </div>

                            <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">HORARIOS OPERATIVOS</label>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; background: ${this.colors.light}; padding: 10px; border-radius: 5px;">
                                <div>
                                    <span style="font-size: 0.75rem; color: ${this.colors.gray}; display: block;">REPORTI</span>
                                    <input type="time" id="reporti" class="form-control" style="width: 100%; padding: 5px; border: 1px solid ${this.colors.border}; border-radius: 4px;">
                                </div>
                                <div>
                                    <span style="font-size: 0.75rem; color: ${this.colors.gray}; display: block;">LLEGA</span>
                                    <input type="time" id="llega" class="form-control" style="width: 100%; padding: 5px; border: 1px solid ${this.colors.border}; border-radius: 4px;">
                                </div>
                                <div>
                                    <span style="font-size: 0.75rem; color: ${this.colors.gray}; display: block;">SALIDA</span>
                                    <input type="time" id="salida" class="form-control" style="width: 100%; padding: 5px; border: 1px solid ${this.colors.border}; border-radius: 4px;">
                                </div>
                            </div>
                        </div>

                        <!-- 5. CIERRE Y SEGUIMIENTO -->
                        <div class="form-section" style="background: white; border-radius: 10px; padding: 25px; border: 1px solid ${this.colors.border};">
                            <h3 style="margin: 0 0 20px 0; color: ${this.colors.dark}; font-size: 1.1rem; border-bottom: 1px solid ${this.colors.light}; padding-bottom: 10px;">
                                <i class="fas fa-clipboard-check"></i> 5. CIERRE Y SEGUIMIENTO
                            </h3>
                            
                            <div style="margin-bottom: 15px;">
                                <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">SEGUIMIENTO</label>
                                <textarea id="seguimiento" class="form-control" placeholder="Notas de seguimiento..." style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 5px; height: 80px; resize: vertical;"></textarea>
                            </div>
                            
                            <div>
                                <label class="form-label" style="font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 5px;">RAZONAMIENTO (JUSTIFICACIÓN)</label>
                                <textarea id="razonamiento" class="form-control" placeholder="Justificación o cierre..." style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 5px; height: 80px; resize: vertical;"></textarea>
                            </div>
                        </div>

                    </div>
                    
                    <!-- COLUMNA LATERAL (Acciones) -->
                    <div style="display: flex; flex-direction: column; gap: 20px; position: sticky; top: 20px;">
                        
                        <!-- Progreso -->
                        <div style="background: white; border-radius: 10px; padding: 20px; border: 1px solid ${this.colors.border}; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                            <h4 style="margin: 0 0 10px 0; font-size: 0.9rem;">CAMPOS REQUERIDOS</h4>
                            <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;">
                                <span id="campos-completados">0%</span>
                            </div>
                            <div style="background: ${this.colors.light}; height: 8px; border-radius: 4px; overflow: hidden;">
                                <div id="progreso-campos" style="background: ${this.colors.accent}; height: 100%; width: 0%; transition: width 0.3s;"></div>
                            </div>
                        </div>

                        <!-- Acciones -->
                        <div style="background: white; border-radius: 10px; padding: 20px; border: 1px solid ${this.colors.border}; display: flex; flex-direction: column; gap: 10px;">
                            <button id="btn-guardar" class="btn btn-primary" style="padding: 12px; font-weight: bold; background: ${this.colors.primary}; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                <i class="fas fa-save"></i> GUARDAR LLAMADA
                            </button>
                            <button id="btn-limpiar" class="btn btn-secondary" style="padding: 10px; background: white; border: 1px solid ${this.colors.border}; border-radius: 5px; cursor: pointer;">
                                <i class="fas fa-eraser"></i> Limpiar Formulario
                            </button>
                            <button class="btn-back-to-main" style="padding: 10px; background: transparent; border: none; color: ${this.colors.gray}; cursor: pointer;">
                                Cancelar
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        `;
    }

    inicializarContadorCampos() {
        this.actualizarContadorCampos();
    }

    actualizarContadorCampos() {
        const requiredIds = [
            'fecha', 'turn', 'hr_rec', 'ubicacion', 'colonia', 
            'peticionario', 'numero_tel', 'motivo', 'motivo_radio', 'unidad'
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

    generarFolioLlamada(fecha, hora) {
        try {
            if (!fecha || !hora) return 'PENDIENTE';
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

    obtenerDatosCompletos() {
        const getVal = (id) => {
            const el = this.container.querySelector(`#${id}`);
            return el ? el.value.trim() : '';
        };

        const fecha = getVal('fecha');
        const hora = getVal('hr_rec');

        return {
            fecha: fecha,
            turn: getVal('turn'),
            folio_sistema: this.generarFolioLlamada(fecha, hora),
            hr_rec: hora,
            motivo: getVal('motivo'),
            ubicacion: getVal('ubicacion'),
            colonia: getVal('colonia'),
            ecto: getVal('ecto'),
            unidad: getVal('unidad'),
            de_desi: getVal('de_desi'),
            reporti: getVal('reporti'),
            llega: getVal('llega'),
            seguimiento: getVal('seguimiento'),
            razonamiento: getVal('razonamiento'),
            motivo_radio_operad: getVal('motivo_radio'),
            salida: getVal('salida'),
            det: getVal('det'),
            veh: getVal('veh'),
            numero_tel: getVal('numero_tel'),
            peticionario: getVal('peticionario'),
            agente_tel: getVal('agente_tel') || this.currentUser?.nombre
        };
    }

    async procesarRegistroCompleto() {
        // Validar requeridos
        const requiredIds = [
            'fecha', 'turn', 'hr_rec', 'ubicacion', 'colonia', 
            'peticionario', 'numero_tel', 'motivo', 'motivo_radio', 'unidad'
        ];

        for (const id of requiredIds) {
            const el = this.container.querySelector(`#${id}`);
            if (!el || !el.value.trim()) {
                alert(`El campo ${id.toUpperCase()} es obligatorio.`);
                el?.focus();
                return;
            }
        }

        const datos = this.obtenerDatosCompletos();

        // UI de guardado
        const btn = this.container.querySelector('#btn-guardar');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        
        try {
            // Usar el servicio para guardar en BD
            if (typeof LlamadasService === 'undefined') {
                throw new Error('El servicio de llamadas no está disponible');
            }

            const response = await LlamadasService.registrarLlamada(datos);

            if (response.success) {
                alert(`✅ Llamada registrada correctamente\nFolio: ${datos.folio_sistema}`);
                this.appController.goToDashboard();
            } else {
                throw new Error(response.message || 'Error al guardar la llamada');
            }

        } catch (error) {
            console.error('Error al guardar:', error);
            alert(`❌ Error: ${error.message}`);
            
            // Restaurar botón
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

window.LlamadasView = LlamadasView;