/**
 * LLAMADASVIEW.JS - Vista completa para registrar llamadas con todos los campos
 */

class LlamadasView {
    constructor(currentUser, appController) {
        this.currentUser = currentUser;
        this.appController = appController;
        this.expandedContainer = null;
        this.originalContainer = null;
    }

    async render(container) {
        this.originalContainer = container; 
        
        // Crear contenedor expandido
        this.expandedContainer = document.createElement('div');
        this.expandedContainer.className = 'llamadas-expanded-view view-bleed view-shell view-form';
        
        this.originalContainer.innerHTML = '';
        this.originalContainer.appendChild(this.expandedContainer);
        
        this.container = this.expandedContainer;
        this.container.innerHTML = this.getTemplate();
        this.setDefaultValues();
        this.bindEvents();
    }

    getTemplate() {
        const now = new Date();
        const fechaHoy = now.toISOString().split('T')[0];
        const horaActual = now.toTimeString().substring(0,5);
        
        return `
            <div class="fade-in view-shell--wide">
                <!-- Encabezado -->
                <div class="page-header">
                    <div class="page-title-group">
                        <button class="btn btn-secondary btn-icon btn-back-to-main" aria-label="Volver">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <h1 class="page-title">
                            REGISTRO COMPLETO DE LLAMADA
                        </h1>
                    </div>
                    <div class="user-chip">
                        <i class="fas fa-user-shield"></i>
                        <span>${this.currentUser?.nombre || 'OPERADOR'} | TURNO ${this.currentUser?.turno?.toUpperCase() || 'ACTUAL'}</span>
                    </div>
                </div>
                <div class="page-divider page-divider--accent"></div>
                <p class="page-subtitle">
                    <i class="fas fa-clipboard-list"></i>
                    Formulario completo con todos los campos requeridos por protocolo
                </p>

                <!-- Panel de Control con Folio -->
                <div style="margin-bottom: 25px;">
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
                        <!-- Información del formulario -->
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #e9ecef; height: 100%;">
                            <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 1.2rem; font-weight: 600;">
                                <i class="fas fa-list-check" style="margin-right: 10px; color: #667eea;"></i>
                                CAMPOS REQUERIDOS POR PROTOCOLO
                            </h3>
                            <p style="color: #7f8c8d; margin: 0; font-size: 0.95rem; line-height: 1.4;">
                                Complete <strong>TODOS</strong> los campos según el protocolo establecido. Campos con * son obligatorios.
                            </p>
                            <div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 10px;">
                                <span style="background: #e3f2fd; color: #1565c0; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">FCCA</span>
                                <span style="background: #e3f2fd; color: #1565c0; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">TICR</span>
                                <span style="background: #e3f2fd; color: #1565c0; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">FCCA DELTA</span>
                                <span style="background: #e3f2fd; color: #1565c0; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">MERCADO</span>
                                <span style="background: #e3f2fd; color: #1565c0; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">URGENCIA</span>
                            </div>
                        </div>

                        <!-- Folio Generado -->
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #e9ecef; height: 100%;">
                            <div style="margin-bottom: 15px;">
                                <div style="display: flex; align-items: center; margin-bottom: 5px;">
                                    <div style="background: #2c3e50; color: white; width: 32px; height: 32px; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
                                        <i class="fas fa-barcode"></i>
                                    </div>
                                    <div>
                                        <h3 style="margin: 0; color: #2c3e50; font-size: 1.1rem; font-weight: 600;">
                                            FOLIO ÚNICO
                                        </h3>
                                        <p style="color: #7f8c8d; margin: 3px 0 0 0; font-size: 0.85rem;">
                                            Generado automáticamente
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #dee2e6; text-align: center;">
                                <div style="font-family: 'Courier New', monospace; font-size: 1.4rem; font-weight: 700; color: #667eea; letter-spacing: 2px;" id="folio-preview">
                                    ${this.generarFolioLlamada(fechaHoy, horaActual)}
                                </div>
                                <div style="color: #7f8c8d; font-size: 0.8rem; margin-top: 5px;">
                                    DDMMAAHHMM
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Formulario Principal - SECCIÓN 1: DATOS BÁSICOS -->
                <div style="background: white; border-radius: 8px; padding: 30px; border: 1px solid #e9ecef; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 25px;">
                    <div style="border-left: 4px solid #667eea; padding-left: 15px; margin-bottom: 25px;">
                        <h3 style="margin: 0; color: #2c3e50; font-size: 1.3rem; font-weight: 700;">
                            <i class="fas fa-calendar-check" style="margin-right: 10px;"></i>
                            SECCIÓN 1: DATOS BÁSICOS Y TEMPORALES
                        </h3>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-bottom: 30px;">
                        <!-- FCCA - Fecha de Creación de Caso -->
                        <div>
                            <label for="fcca" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-calendar-plus" style="margin-right: 8px; color: #667eea;"></i>
                                FCCA * (Fecha Creación Caso)
                            </label>
                            <input type="date" id="fcca" 
                                   style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;"
                                   value="${fechaHoy}" 
                                   required
                                   onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                   onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                        </div>
                        
                        <!-- TICR - Tiempo Inicio Caso Real -->
                        <div>
                            <label for="ticr" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-clock" style="margin-right: 8px; color: #667eea;"></i>
                                TICR * (Tiempo Inicio Caso)
                            </label>
                            <input type="time" id="ticr" 
                                   style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;"
                                   value="${horaActual}" 
                                   required
                                   onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                   onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                        </div>
                        
                        <!-- FCCA DELTA - Fecha Cierre Caso -->
                        <div>
                            <label for="fcca_delta" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-calendar-minus" style="margin-right: 8px; color: #667eea;"></i>
                                FCCA DELTA (Fecha Cierre)
                            </label>
                            <input type="date" id="fcca_delta" 
                                   style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;"
                                   onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                   onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                        </div>
                    </div>
                    
                    <!-- MERCADO - Tipo de Mercado/Procedencia -->
                    <div style="margin-bottom: 25px;">
                        <label for="mercado" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                            <i class="fas fa-store" style="margin-right: 8px; color: #667eea;"></i>
                            MERCADO (Procedencia)
                        </label>
                        <select id="mercado" 
                                style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; background: white; transition: all 0.2s; box-sizing: border-box;"
                                onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                            <option value="">SELECCIONAR PROCEDENCIA...</option>
                            <option value="llamada_911">LLAMADA 911</option>
                            <option value="patrulla">PATRULLA EN TERRENO</option>
                            <option value="ciudadano">CIUDADANO PRESENCIAL</option>
                            <option value="otra_agencia">OTRA AGENCIA</option>
                            <option value="monitoreo">MONITOREO C4/C5</option>
                            <option value="otros">OTROS</option>
                        </select>
                    </div>
                </div>

                <!-- SECCIÓN 2: CLASIFICACIÓN Y PRIORIDAD -->
                <div style="background: white; border-radius: 8px; padding: 30px; border: 1px solid #e9ecef; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 25px;">
                    <div style="border-left: 4px solid #e74c3c; padding-left: 15px; margin-bottom: 25px;">
                        <h3 style="margin: 0; color: #2c3e50; font-size: 1.3rem; font-weight: 700;">
                            <i class="fas fa-exclamation-triangle" style="margin-right: 10px; color: #e74c3c;"></i>
                            SECCIÓN 2: CLASIFICACIÓN Y PRIORIDAD
                        </h3>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-bottom: 30px;">
                        <!-- URGENCIA - Nivel de Urgencia -->
                        <div>
                            <label for="urgencia" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-bell" style="margin-right: 8px; color: #e74c3c;"></i>
                                URGENCIA * (Nivel de Prioridad)
                            </label>
                            <select id="urgencia" 
                                    style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; background: white; transition: all 0.2s; box-sizing: border-box;"
                                    required
                                    onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                    onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                                <option value="">SELECCIONAR URGENCIA...</option>
                                <option value="critica">CRÍTICA (Respuesta inmediata)</option>
                                <option value="alta">ALTA (Respuesta rápida)</option>
                                <option value="media">MEDIA (Respuesta programada)</option>
                                <option value="baja">BAJA (Seguimiento)</option>
                            </select>
                        </div>
                        
                        <!-- GTCN - Grupo de Tipo de Caso -->
                        <div>
                            <label for="gtcn" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-layer-group" style="margin-right: 8px; color: #e74c3c;"></i>
                                GTCN (Grupo Tipo de Caso)
                            </label>
                            <select id="gtcn" 
                                    style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; background: white; transition: all 0.2s; box-sizing: border-box;"
                                    onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                    onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                                <option value="">SELECCIONAR GRUPO...</option>
                                <option value="delitos">DELITOS</option>
                                <option value="accidentes">ACCIDENTES</option>
                                <option value="emergencias">EMERGENCIAS MÉDICAS</option>
                                <option value="orden_publico">ORDEN PÚBLICO</option>
                                <option value="servicios">SERVICIOS PÚBLICOS</option>
                                <option value="otros_casos">OTROS CASOS</option>
                            </select>
                        </div>
                        
                        <!-- CPCB - Código de Procedimiento -->
                        <div>
                            <label for="cpcb" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-code" style="margin-right: 8px; color: #e74c3c;"></i>
                                CPCB (Código Procedimiento)
                            </label>
                            <input type="text" id="cpcb" 
                                   style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;"
                                   placeholder="Ej: CPCB-2024-001"
                                   onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                   onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                        </div>
                    </div>
                    
                    <!-- ESCALAS NUMÉRICAS -->
                    <div style="margin-bottom: 25px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                            <!-- Escala 3.5 -->
                            <div>
                                <label for="escala_35" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                    <i class="fas fa-chart-line" style="margin-right: 8px;"></i>
                                    ESCALA 3.5
                                </label>
                                <select id="escala_35" 
                                        style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; background: white; transition: all 0.2s; box-sizing: border-box;"
                                        onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                        onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                                    <option value="">SELECCIONAR VALOR...</option>
                                    <option value="1">1 - Mínimo</option>
                                    <option value="2">2 - Bajo</option>
                                    <option value="3">3 - Medio</option>
                                    <option value="4">4 - Alto</option>
                                    <option value="5">5 - Máximo</option>
                                </select>
                            </div>
                            
                            <!-- Escala 4.0 -->
                            <div>
                                <label for="escala_40" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                    <i class="fas fa-chart-bar" style="margin-right: 8px;"></i>
                                    ESCALA 4.0
                                </label>
                                <select id="escala_40" 
                                        style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; background: white; transition: all 0.2s; box-sizing: border-box;"
                                        onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                        onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                                    <option value="">SELECCIONAR VALOR...</option>
                                    <option value="1">1 - Mínimo</option>
                                    <option value="2">2 - Bajo</option>
                                    <option value="3">3 - Medio</option>
                                    <option value="4">4 - Alto</option>
                                    <option value="5">5 - Máximo</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN 3: INFORMACIÓN ESPECÍFICA -->
                <div style="background: white; border-radius: 8px; padding: 30px; border: 1px solid #e9ecef; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 25px;">
                    <div style="border-left: 4px solid #2ecc71; padding-left: 15px; margin-bottom: 25px;">
                        <h3 style="margin: 0; color: #2c3e50; font-size: 1.3rem; font-weight: 700;">
                            <i class="fas fa-info-circle" style="margin-right: 10px; color: #2ecc71;"></i>
                            SECCIÓN 3: INFORMACIÓN ESPECÍFICA
                        </h3>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-bottom: 30px;">
                        <!-- PCB ELTO - Elementos Tipo -->
                        <div>
                            <label for="pcb_elto" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-cubes" style="margin-right: 8px; color: #2ecc71;"></i>
                                PCB ELTO (Elementos Tipo)
                            </label>
                            <select id="pcb_elto" 
                                    style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; background: white; transition: all 0.2s; box-sizing: border-box;"
                                    onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                    onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                                <option value="">SELECCIONAR ELEMENTO...</option>
                                <option value="vehiculo">VEHÍCULO</option>
                                <option value="persona">PERSONA(S)</option>
                                <option value="arma">ARMA</option>
                                <option value="documento">DOCUMENTO</option>
                                <option value="evidencia">EVIDENCIA</option>
                                <option value="otros_elementos">OTROS ELEMENTOS</option>
                            </select>
                        </div>
                        
                        <!-- COMUNO - Comunicación/Notificación -->
                        <div>
                            <label for="comuno" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-bullhorn" style="margin-right: 8px; color: #2ecc71;"></i>
                                COMUNO (Comunicación)
                            </label>
                            <select id="comuno" 
                                    style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; background: white; transition: all 0.2s; box-sizing: border-box;"
                                    onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                    onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                                <option value="">SELECCIONAR TIPO...</option>
                                <option value="llamada_entrante">LLAMADA ENTRANTE</option>
                                <option value="llamada_saliente">LLAMADA SALIENTE</option>
                                <option value="radio">RADIO</option>
                                <option value="mensaje">MENSAJE</option>
                                <option value="email">EMAIL</option>
                                <option value="presencial">PRESENCIAL</option>
                            </select>
                        </div>
                        
                        <!-- ASSOCIATO - Asociación/Vínculo -->
                        <div>
                            <label for="associato" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-link" style="margin-right: 8px; color: #2ecc71;"></i>
                                ASSOCIATO (Asociación)
                            </label>
                            <select id="associato" 
                                    style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; background: white; transition: all 0.2s; box-sizing: border-box;"
                                    onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                    onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                                <option value="">SELECCIONAR ASOCIACIÓN...</option>
                                <option value="victima_sospechoso">VÍCTIMA-SOSPECHOSO</option>
                                <option value="testigo_hecho">TESTIGO-HECHO</option>
                                <option value="ubicacion_caso">UBICACIÓN-CASO</option>
                                <option value="vehiculo_persona">VEHÍCULO-PERSONA</option>
                                <option value="caso_anterior">CASO ANTERIOR</option>
                                <option value="sin_asociacion">SIN ASOCIACIÓN</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- CONVERSAMENTE - Conversación/Diálogo -->
                    <div style="margin-bottom: 25px;">
                        <label for="conversamente" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                            <i class="fas fa-comments" style="margin-right: 8px; color: #2ecc71;"></i>
                            CONVERSAMENTE (Conversación/Diálogo)
                        </label>
                        <textarea id="conversamente" 
                                  style="width: 100%; padding: 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; min-height: 100px; resize: vertical; transition: all 0.2s; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; line-height: 1.5;"
                                  placeholder="Transcriba la conversación o diálogo relevante..."
                                  onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                  onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'"></textarea>
                    </div>
                    
                    <!-- PORTA DE SEGUENCIA EN ALGUNA PARTE -->
                    <div style="margin-bottom: 25px;">
                        <label for="porta_seguencia" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                            <i class="fas fa-map-marked-alt" style="margin-right: 8px; color: #2ecc71;"></i>
                            PORTA DE SEGUENCIA EN ALGUNA PARTE
                        </label>
                        <textarea id="porta_seguencia" 
                                  style="width: 100%; padding: 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; min-height: 80px; resize: vertical; transition: all 0.2s; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; line-height: 1.5;"
                                  placeholder="Describa la ubicación específica o secuencia de eventos..."
                                  onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                  onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'"></textarea>
                    </div>
                    
                    <!-- ACONTECENDO A LA FINALIDAD -->
                    <div>
                        <label for="acontecendo_finalidad" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                            <i class="fas fa-flag-checkered" style="margin-right: 8px; color: #2ecc71;"></i>
                            ACONTECENDO A LA FINALIDAD
                        </label>
                        <textarea id="acontecendo_finalidad" 
                                  style="width: 100%; padding: 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; min-height: 80px; resize: vertical; transition: all 0.2s; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; line-height: 1.5;"
                                  placeholder="Describa el resultado final o consecuencia del caso..."
                                  onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                  onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'"></textarea>
                    </div>
                </div>

                <!-- CAMPOS ADICIONALES (mantener compatibilidad) -->
                <div style="background: white; border-radius: 8px; padding: 30px; border: 1px solid #e9ecef; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 25px;">
                    <div style="border-left: 4px solid #f39c12; padding-left: 15px; margin-bottom: 25px;">
                        <h3 style="margin: 0; color: #2c3e50; font-size: 1.3rem; font-weight: 700;">
                            <i class="fas fa-plus-circle" style="margin-right: 10px; color: #f39c12;"></i>
                            SECCIÓN 4: INFORMACIÓN ADICIONAL
                        </h3>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px;">
                        <!-- TELÉFONO REPORTANTE -->
                        <div>
                            <label for="telefono" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-phone" style="margin-right: 8px;"></i>
                                TELÉFONO REPORTANTE *
                            </label>
                            <input type="tel" id="telefono" 
                                   style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;"
                                   placeholder="Ej: 2381234567"
                                   required
                                   onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                   onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                        </div>

                        <!-- CALLE PRINCIPAL -->
                        <div>
                            <label for="calle" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-road" style="margin-right: 8px; color: #667eea;"></i>
                                CALLE PRINCIPAL *
                            </label>
                            <input type="text" id="calle" 
                                   style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;"
                                   placeholder="Ej: 5 Sur"
                                   required
                                   onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                   onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                        </div>

                        <!-- NÚMERO DE DOMICILIO -->
                        <div>
                            <label for="numero" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-hashtag" style="margin-right: 8px; color: #667eea;"></i>
                                NÚMERO EXTERIOR
                                <small style="font-weight: 400; color: #7f8c8d; font-size: 0.85rem;"> (Opcional)</small>
                            </label>
                            <input type="text" id="numero" 
                                   style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;"
                                   placeholder="Ej: 404"
                                   onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                   onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                        </div>
                    </div>
                    
                    <!-- SEGUNDA FILA: ENTRE CALLES Y COLONIA -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-top: 25px;">
                        <!-- ENTRE CALLE 1 -->
                        <div>
                            <label for="entre_calle1" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-arrows-alt-h" style="margin-right: 8px; color: #667eea;"></i>
                                ENTRE CALLE 1
                                <small style="font-weight: 400; color: #7f8c8d; font-size: 0.85rem;"> (Opcional)</small>
                            </label>
                            <input type="text" id="entre_calle1" 
                                   style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;"
                                   placeholder="Ej: Av. Reforma Norte"
                                   onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                   onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                        </div>

                        <!-- ENTRE CALLE 2 -->
                        <div>
                            <label for="entre_calle2" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-arrows-alt-h" style="margin-right: 8px; color: #667eea;"></i>
                                ENTRE CALLE 2
                                <small style="font-weight: 400; color: #7f8c8d; font-size: 0.85rem;"> (Opcional)</small>
                            </label>
                            <input type="text" id="entre_calle2" 
                                   style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;"
                                   placeholder="Ej: 3 Norte"
                                   onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                   onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                        </div>

                        <!-- COLONIA -->
                        <div>
                            <label for="colonia" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                                <i class="fas fa-map-pin" style="margin-right: 8px; color: #667eea;"></i>
                                COLONIA *
                            </label>
                            <input type="text" id="colonia" 
                                   style="width: 100%; padding: 10px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;"
                                   placeholder="Ej: Centro"
                                   required
                                   onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                   onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                        </div>
                    </div>
                    
                    <!-- MOTIVO PRINCIPAL -->
                    <div style="margin-top: 25px;">
                        <label for="motivo" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                            <i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>
                            MOTIVO PRINCIPAL *
                        </label>
                        <textarea id="motivo" 
                                  style="width: 100%; padding: 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; min-height: 80px; resize: vertical; transition: all 0.2s; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; line-height: 1.5;"
                                  placeholder="Describa el motivo principal de la llamada..."
                                  required
                                  onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                  onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'"></textarea>
                    </div>
                    
                    <!-- DESCRIPCIÓN DETALLADA -->
                    <div style="margin-top: 25px;">
                        <label for="descripcion" style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px; font-size: 0.95rem;">
                            <i class="fas fa-file-alt" style="margin-right: 8px;"></i>
                            DESCRIPCIÓN DETALLADA *
                        </label>
                        <textarea id="descripcion" 
                                  style="width: 100%; padding: 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 1rem; min-height: 120px; resize: vertical; transition: all 0.2s; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; line-height: 1.5;"
                                  placeholder="Describa los hechos con detalle completo..."
                                  required
                                  onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                  onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'"></textarea>
                    </div>
                </div>

                <!-- Botones de Acción -->
                <div style="background: white; border-radius: 8px; padding: 25px; border: 1px solid #e9ecef; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <div style="display: flex; gap: 15px; justify-content: flex-end; padding-top: 10px;">
                        <button type="button" class="btn-back-to-main" 
                                style="padding: 12px 30px; background: #95a5a6; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; font-size: 1rem;">
                            <i class="fas fa-times"></i> CANCELAR
                        </button>
                        <button type="button" onclick="app.currentView.currentSubView.previsualizarCompleto()"
                                style="padding: 12px 30px; background: #3498db; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; font-size: 1rem;">
                            <i class="fas fa-eye"></i> VISTA PREVIA COMPLETA
                        </button>
                        <button type="submit" id="btn-guardar" 
                                style="padding: 12px 30px; background: #2ecc71; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; font-size: 1rem;">
                            <i class="fas fa-save"></i> GUARDAR REGISTRO COMPLETO
                        </button>
                    </div>
                    
                    <!-- Contador de campos -->
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center;">
                        <div style="color: #7f8c8d; font-size: 0.9rem;">
                            <i class="fas fa-clipboard-check"></i> 
                            <span id="campos-completados">0</span> de <span id="total-campos">25</span> campos completados
                        </div>
                        <div style="background: #e9ecef; height: 6px; border-radius: 3px; margin-top: 8px; overflow: hidden;">
                            <div id="progreso-campos" style="background: #2ecc71; height: 100%; width: 0%; transition: width 0.3s;"></div>
                        </div>
                    </div>
                </div>

            
            <form id="llamada-form" style="display: none;"></form>
        `;
    }

    setDefaultValues() {
        setTimeout(() => {
            this.actualizarFolioPreview();
            this.inicializarContadorCampos();
        }, 100);
    }

    bindEvents() {
        // Botón volver
        const backBtn = this.container.querySelector('.btn-back-to-main');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.appController.goToDashboard();
            });
        }

        // Botón guardar
        const btnGuardar = this.container.querySelector('#btn-guardar');
        if (btnGuardar) {
            btnGuardar.addEventListener('click', (e) => {
                e.preventDefault();
                this.procesarRegistroCompleto();
            });
        }

        // Actualizar folio cuando cambian fecha/hora
        const fechaInput = this.container.querySelector('#fcca');
        const horaInput = this.container.querySelector('#ticr');
        
        if (fechaInput) {
            fechaInput.addEventListener('change', () => this.actualizarFolioPreview());
            fechaInput.addEventListener('input', () => this.actualizarFolioPreview());
        }
        if (horaInput) {
            horaInput.addEventListener('change', () => this.actualizarFolioPreview());
            horaInput.addEventListener('input', () => this.actualizarFolioPreview());
        }

        // Actualizar contador de campos
        const inputs = this.container.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', () => this.actualizarContadorCampos());
            input.addEventListener('input', () => this.actualizarContadorCampos());
        });
    }

    inicializarContadorCampos() {
        const totalCampos = this.container.querySelectorAll('input, select, textarea').length;
        const totalElement = this.container.querySelector('#total-campos');
        if (totalElement) {
            totalElement.textContent = totalCampos;
        }
        this.actualizarContadorCampos();
    }

    actualizarContadorCampos() {
        const inputs = this.container.querySelectorAll('input, select, textarea');
        let completados = 0;
        
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                if (input.checked) completados++;
            } else if (input.value && input.value.trim() !== '') {
                completados++;
            }
        });
        
        const total = inputs.length;
        const porcentaje = Math.round((completados / total) * 100);
        
        const completadosElement = this.container.querySelector('#campos-completados');
        const progresoElement = this.container.querySelector('#progreso-campos');
        
        if (completadosElement) completadosElement.textContent = completados;
        if (progresoElement) progresoElement.style.width = porcentaje + '%';
        
        // Cambiar color según porcentaje
        if (porcentaje < 30) {
            progresoElement.style.background = '#e74c3c';
        } else if (porcentaje < 70) {
            progresoElement.style.background = '#f39c12';
        } else {
            progresoElement.style.background = '#2ecc71';
        }
    }

    actualizarFolioPreview() {
        const fecha = this.container.querySelector('#fcca')?.value;
        const hora = this.container.querySelector('#ticr')?.value;
        
        if (fecha && hora) {
            const folio = this.generarFolioLlamada(fecha, hora);
            const folioPreview = this.container.querySelector('#folio-preview');
            if (folioPreview) {
                const folioFormateado = folio.match(/.{1,2}/g)?.join(' ') || folio;
                folioPreview.textContent = folioFormateado;
                folioPreview.style.color = '#667eea';
            }
        }
    }

    generarFolioLlamada(fecha, hora) {
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

    previsualizarCompleto() {
        // Validar campos obligatorios
        const camposRequeridos = [
            {id: 'fcca', nombre: 'FCCA'},
            {id: 'ticr', nombre: 'TICR'},
            {id: 'urgencia', nombre: 'URGENCIA'},
            {id: 'telefono', nombre: 'TELÉFONO'},
            {id: 'calle', nombre: 'CALLE PRINCIPAL'},
            {id: 'colonia', nombre: 'COLONIA'},
            {id: 'motivo', nombre: 'MOTIVO'},
            {id: 'descripcion', nombre: 'DESCRIPCIÓN'}
        ];
        
        const camposFaltantes = [];
        camposRequeridos.forEach(campo => {
            const elemento = this.container.querySelector(`#${campo.id}`);
            if (!elemento || !elemento.value.trim()) {
                camposFaltantes.push(campo.nombre);
            }
        });
        
        if (camposFaltantes.length > 0) {
            this.mostrarAlerta('⚠️ CAMPOS REQUERIDOS FALTANTES', 
                `Los siguientes campos son obligatorios:\n\n• ${camposFaltantes.join('\n• ')}`, 
                'error');
            return;
        }
        
        // Obtener todos los valores
        const datos = this.obtenerDatosCompletos();
        const textoFormateado = this.formatearRegistroCompleto(datos);
        
        // Mostrar previsualización
        this.mostrarModalPrevisualizacion(textoFormateado, datos.folio);
    }

    obtenerDatosCompletos() {
        const getValue = (id) => {
            const el = this.container.querySelector(`#${id}`);
            return el ? el.value : '';
        };
        
        return {
            // Sección 1
            fcca: getValue('fcca'),
            ticr: getValue('ticr'),
            fcca_delta: getValue('fcca_delta'),
            mercado: getValue('mercado'),
            
            // Sección 2
            urgencia: getValue('urgencia'),
            gtcn: getValue('gtcn'),
            cpcb: getValue('cpcb'),
            escala_35: getValue('escala_35'),
            escala_40: getValue('escala_40'),
            
            // Sección 3
            pcb_elto: getValue('pcb_elto'),
            comuno: getValue('comuno'),
            associato: getValue('associato'),
            conversamente: getValue('conversamente'),
            porta_seguencia: getValue('porta_seguencia'),
            acontecendo_finalidad: getValue('acontecendo_finalidad'),
            
            // Sección 4 - Ubicación estructurada
            telefono: getValue('telefono'),
            calle: getValue('calle'),
            numero: getValue('numero'),
            entre_calle1: getValue('entre_calle1'),
            entre_calle2: getValue('entre_calle2'),
            colonia: getValue('colonia'),
            motivo: getValue('motivo'),
            descripcion: getValue('descripcion'),
            
            // Generado
            folio: this.generarFolioLlamada(getValue('fcca'), getValue('ticr')),
            operador: this.currentUser?.nombre || 'OPERADOR',
            fecha_registro: new Date().toLocaleString()
        };
    }

    formatearRegistroCompleto(datos) {
        return `📋 REGISTRO COMPLETO DE LLAMADA
══════════════════════════════════════

📅 DATOS BÁSICOS:
• FCCA (Fecha Creación): ${datos.fcca || 'N/A'}
• TICR (Hora Inicio): ${datos.ticr || 'N/A'}
• FCCA Delta (Cierre): ${datos.fcca_delta || 'N/A'}
• Procedencia: ${datos.mercado || 'N/A'}

🚨 CLASIFICACIÓN:
• Urgencia: ${datos.urgencia || 'N/A'}
• Grupo Tipo: ${datos.gtcn || 'N/A'}
• Código Procedimiento: ${datos.cpcb || 'N/A'}
• Escala 3.5: ${datos.escala_35 || 'N/A'}
• Escala 4.0: ${datos.escala_40 || 'N/A'}

🔍 INFORMACIÓN ESPECÍFICA:
• Elementos Tipo: ${datos.pcb_elto || 'N/A'}
• Comunicación: ${datos.comuno || 'N/A'}
• Asociación: ${datos.associato || 'N/A'}
• Conversación: ${datos.conversamente || 'N/A'}
• Ubicación/Secuencia: ${datos.porta_seguencia || 'N/A'}
• Resultado Final: ${datos.acontecendo_finalidad || 'N/A'}

📍 DATOS ADICIONALES:
• Teléfono: ${datos.telefono || 'N/A'}
• Calle: ${datos.calle || 'N/A'}
• Número: ${datos.numero || 'N/A'}
• Entre Calles: ${datos.entre_calle1 && datos.entre_calle2 ? `${datos.entre_calle1} y ${datos.entre_calle2}` : 'N/A'}
• Colonia: ${datos.colonia || 'N/A'}
• Motivo: ${datos.motivo || 'N/A'}
• Descripción: ${datos.descripcion || 'N/A'}

══════════════════════════════════════
📄 FOLIO: ${datos.folio}
👤 OPERADOR: ${datos.operador}
🕐 REGISTRO: ${datos.fecha_registro}
══════════════════════════════════════`;
    }

    mostrarModalPrevisualizacion(texto, folio) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.85); z-index: 1000; display: flex; 
            align-items: center; justify-content: center; padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="background: white; width: 95%; max-width: 900px; border-radius: 8px; overflow: hidden; border: 2px solid #2c3e50; max-height: 90vh; display: flex; flex-direction: column;">
                <div style="background: #2c3e50; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                    <h3 style="margin: 0; font-size: 1.3rem; font-weight: 600;">
                        <i class="fas fa-file-alt" style="margin-right: 10px;"></i>
                        VISTA PREVIA COMPLETA - FOLIO: ${folio}
                    </h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="padding: 25px; overflow-y: auto; flex-grow: 1;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; border: 1px solid #e9ecef; font-family: 'Courier New', monospace; white-space: pre-wrap; font-size: 0.9rem; line-height: 1.6;">
${texto}
                    </div>
                </div>
                <div style="padding: 20px; border-top: 1px solid #e9ecef; background: #f8f9fa; flex-shrink: 0;">
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="app.currentView.currentSubView.copiarTextoPrevisualizacion('${encodeURIComponent(texto)}')"
                                style="padding: 10px 25px; background: #3498db; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-copy"></i> COPIAR REGISTRO
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                style="padding: 10px 25px; background: #95a5a6; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-times"></i> CERRAR
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async procesarRegistroCompleto() {
        const btn = this.container.querySelector('#btn-guardar');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> GUARDANDO REGISTRO COMPLETO...';
        btn.disabled = true;

        try {
            // Validar campos obligatorios
            const camposRequeridos = ['fcca', 'ticr', 'urgencia', 'telefono', 'calle', 'colonia', 'motivo', 'descripcion'];
            const faltantes = [];
            
            camposRequeridos.forEach(id => {
                const elemento = this.container.querySelector(`#${id}`);
                if (!elemento || !elemento.value.trim()) {
                    const label = elemento?.previousElementSibling?.textContent || id;
                    faltantes.push(label.replace('*', '').trim());
                }
            });
            
            if (faltantes.length > 0) {
                throw new Error(`Campos obligatorios faltantes: ${faltantes.join(', ')}`);
            }
            
            // Preparar datos para el backend
            const datos = this.obtenerDatosCompletos();
            
            // Construir campo ubicacion a partir de campos estructurados para backend
            let ubicacionParaBackend = datos.calle || '';
            if (datos.numero) {
                ubicacionParaBackend += ` ${datos.numero}`;
            }
            if (datos.entre_calle1 && datos.entre_calle2) {
                ubicacionParaBackend += `, entre ${datos.entre_calle1} y ${datos.entre_calle2}`;
            }
            
            // Datos compatibles con el backend actual
            const datosBackend = {
                folio_sistema: datos.folio,
                fecha: datos.fcca,
                turno: this.currentUser?.turno || 'matutino',
                hora: datos.ticr,
                motivo: datos.motivo,
                ubicacion: ubicacionParaBackend,  // Campo construido a partir de datos estructurados
                colonia: datos.colonia,
                descripcion: datos.descripcion,
                telefono: datos.telefono,
                
                // Guardar también campos estructurados para futura referencia
                calle: datos.calle,
                numero: datos.numero,
                entre_calle1: datos.entre_calle1,
                entre_calle2: datos.entre_calle2,
                
                // Campos adicionales para protocolo completo
                seguimiento: "Registro completo",
                motivo_radio_operacion: "Protocolo completo",
                salida: "no",
                detenido: "no",
                vehiculo: "",
                peticionario: "Sistema completo",
                agente: "",
                telefono_agente: "",
                
                // Campos extendidos (pueden necesitar mapeo en backend)
                datos_extendidos: {
                    fcca_delta: datos.fcca_delta,
                    mercado: datos.mercado,
                    urgencia: datos.urgencia,
                    gtcn: datos.gtcn,
                    cpcb: datos.cpcb,
                    escala_35: datos.escala_35,
                    escala_40: datos.escala_40,
                    pcb_elto: datos.pcb_elto,
                    comuno: datos.comuno,
                    associato: datos.associato,
                    conversamente: datos.conversamente,
                    porta_seguencia: datos.porta_seguencia,
                    acontecendo_finalidad: datos.acontecendo_finalidad,
                    folio_completo: datos.folio
                }
            };

            if (typeof LlamadasService !== 'undefined') {
                const resultado = await LlamadasService.registrarLlamada(datosBackend);
                
                if (resultado && resultado.success) {
                    this.mostrarAlerta('✅ REGISTRO COMPLETO GUARDADO', 
                        `Folio: ${datos.folio}\nRegistro completo guardado exitosamente en el sistema.`, 
                        'success');
                    
                    setTimeout(() => {
                        this.appController.goToDashboard();
                    }, 2000);
                } else {
                    const detalle = resultado?.error || resultado?.message || 'Error del servidor al guardar registro completo';
                    throw new Error(detalle);
                }
            } else {
                throw new Error('Servicio de llamadas no disponible');
            }
            
        } catch (error) {
            console.error('Error registrando llamada completa:', error);
            this.mostrarAlerta('⚠️ ERROR EN REGISTRO', 
                `Error al guardar el registro completo:\n${error.message}`, 
                'error');
            
            // Restaurar botón
            btn.innerHTML = originalText;
            btn.disabled = false;
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
            z-index: 1001; min-width: 300px; max-width: 500px;
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

    copiarTextoPrevisualizacion(textoCodificado) {
        const texto = decodeURIComponent(textoCodificado);
        navigator.clipboard.writeText(texto)
            .then(() => this.mostrarAlerta('📋 TEXTO COPIADO', 'El registro completo ha sido copiado al portapapeles', 'success'))
            .catch(() => this.mostrarAlerta('⚠️ ERROR', 'No se pudo copiar el texto', 'error'));
    }

    cleanup() {
        if (this.expandedContainer && this.expandedContainer.parentNode) {
            this.expandedContainer.parentNode.removeChild(this.expandedContainer);
        }
        
        if (this.originalContainer) {
            this.originalContainer.innerHTML = '';
        }
        
        this.expandedContainer = null;
        this.originalContainer = null;
        this.container = this.originalContainer;
    }
}

window.LlamadasView = LlamadasView;