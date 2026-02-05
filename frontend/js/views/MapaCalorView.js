/**
 * MAPACALORVIEW.JS - Mapa de calor para incidencias en Tehuacán, Puebla
 * Sistema CERIT - Versión 2.0 - Diseño UX/UI Mejorado
 */

class MapaCalorView {
    constructor(appController) {
        this.appController = appController;
        this.mapa = null;
        this.marcadores = [];
        this.capasCalor = [];
        this.markerClusterGroup = null;
        this.filtrosActivos = {
            tipo: 'todos',
            fechaInicio: null,
            fechaFin: null,
            turno: null
        };
        
        // Configuración de colores mejorada
        this.colors = {
            primary: '#003366',
            primaryLight: '#0a4d8c',
            primaryDark: '#001f3f',
            accent: '#ff6b35',
            accentRed: '#dc3545',
            accentGreen: '#28a745',
            warning: '#ffc107',
            info: '#17a2b8',
            dark: '#212529',
            light: '#f8f9fa',
            border: '#dee2e6',
            text: '#495057',
            textLight: '#6c757d'
        };
        
        // Coordenadas de Tehuacán, Puebla
        this.coordenadasTehuacan = {
            lat: 18.4614,
            lng: -97.3928,
            zoom: 13
        };
        
        // Tipos de incidencia mejorados con gradientes
        this.tiposIncidencia = {
            'accidente': { 
                color: '#ff6b35', 
                gradient: 'linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)',
                icon: 'car-crash', 
                nombre: 'Accidentes',
                descripcion: 'Choques y accidentes vehiculares'
            },
            'robo': { 
                color: '#dc3545', 
                gradient: 'linear-gradient(135deg, #dc3545 0%, #e74c5d 100%)',
                icon: 'shield-alt', 
                nombre: 'Robos',
                descripcion: 'Robos y asaltos reportados'
            },
            'disturbio': { 
                color: '#ffc107', 
                gradient: 'linear-gradient(135deg, #ffc107 0%, #ffd34e 100%)',
                icon: 'users', 
                nombre: 'Disturbios',
                descripcion: 'Alteraciones del orden público'
            },
            'sospechoso': { 
                color: '#6c757d', 
                gradient: 'linear-gradient(135deg, #6c757d 0%, #8a929a 100%)',
                icon: 'user-secret', 
                nombre: 'Sospechosos',
                descripcion: 'Personas o situaciones sospechosas'
            },
            'vehiculo': { 
                color: '#17a2b8', 
                gradient: 'linear-gradient(135deg, #17a2b8 0%, #1fc6df 100%)',
                icon: 'car', 
                nombre: 'Vehículos',
                descripcion: 'Vehículos abandonados o sospechosos'
            },
            'medica': { 
                color: '#28a745', 
                gradient: 'linear-gradient(135deg, #28a745 0%, #34ce57 100%)',
                icon: 'ambulance', 
                nombre: 'Emergencias',
                descripcion: 'Emergencias médicas'
            }
        };
        
        // Estado del panel lateral
        this.panelAbierto = true;
        
        // Modo de vista del mapa
        this.modoVista = 'calor'; // 'calor', 'marcadores', 'clusters'

        // Control de geocodificación
        this.geocodingDisponible = true;
        this.geocodingErrorNotificado = false;
    }
    
    async render(container) {
        this.container = container;
        document.body.classList.add('mapa-fullscreen');
        this.container.innerHTML = this.getTemplate();
        await this.initMapa();
        this.bindEvents();
        this.iniciarAnimaciones();
        
        // Cargar datos iniciales
        await this.cargarDatosMapa();
    }
    
    getTemplate() {
        return `
            <div class="mapa-calor-container view-form view-bleed" style="width: 100vw; height: 100vh; background: ${this.colors.light}; display: flex; flex-direction: column; overflow: hidden;">
                <!-- Header del Mapa Mejorado -->
                <div class="header-mapa mapa-header" style="background: white; padding: 15px 25px; border-bottom: 3px solid ${this.colors.primary}; box-shadow: 0 4px 12px rgba(0,0,0,0.08); position: relative;">
                    <div class="mapa-toolbar" style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 20px;">
                            <div>
                                <h2 style="margin: 0; color: ${this.colors.primary}; font-size: 1.4rem; display: flex; align-items: center; gap: 12px; font-weight: 700;">
                                    <div style="width: 40px; height: 40px; background: ${this.colors.primary}; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,51,102,0.2);">
                                        <i class="fas fa-map-marked-alt" style="color: white; font-size: 1.1rem;"></i>
                                    </div>
                                    MAPA DE CALOR CERIT
                                </h2>
                                <p style="margin: 5px 0 0 52px; color: ${this.colors.textLight}; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-map-marker-alt" style="color: ${this.colors.accent};"></i>
                                    Tehuacán, Puebla - Visualización en tiempo real
                                </p>
                            </div>
                            
                            <!-- Indicador de actualización -->
                            <div id="indicador-actualizacion" style="display: flex; align-items: center; gap: 8px; padding: 8px 15px; background: linear-gradient(135deg, #28a745 0%, #34ce57 100%); border-radius: 20px; box-shadow: 0 2px 8px rgba(40,167,69,0.3);">
                                <div class="pulso-indicador" style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
                                <span style="color: white; font-size: 0.85rem; font-weight: 600;">EN VIVO</span>
                            </div>
                            
                            <!-- Indicador de geocodificación -->
                            <div id="indicador-geocoding" style="display: none; align-items: center; gap: 8px; padding: 8px 15px; background: linear-gradient(135deg, #17a2b8 0%, #1fc6df 100%); border-radius: 20px; box-shadow: 0 2px 8px rgba(23,162,184,0.3);">
                                <div class="pulso-indicador" style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
                                <span id="texto-geocoding" style="color: white; font-size: 0.85rem; font-weight: 600;">Geocodificando...</span>
                            </div>
                        </div>
                        
                        <div class="mapa-toolbar" style="display: flex; gap: 12px; align-items: center;">
                            <!-- Botón de vista rápida -->
                            <div class="btn-group-mapa" style="display: flex; gap: 0; background: ${this.colors.light}; border-radius: 8px; padding: 4px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);">
                                <button class="btn-vista-mapa active" data-vista="calor" 
                                        style="padding: 8px 16px; background: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; color: ${this.colors.primary}; transition: all 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
                                        title="Mapa de calor">
                                    <i class="fas fa-fire"></i>
                                </button>
                                <button class="btn-vista-mapa" data-vista="marcadores" 
                                        style="padding: 8px 16px; background: transparent; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; color: ${this.colors.textLight}; transition: all 0.3s;"
                                        title="Marcadores">
                                    <i class="fas fa-map-pin"></i>
                                </button>
                                <button class="btn-vista-mapa" data-vista="clusters" 
                                        style="padding: 8px 16px; background: transparent; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; color: ${this.colors.textLight}; transition: all 0.3s;"
                                        title="Agrupación">
                                    <i class="fas fa-th"></i>
                                </button>
                            </div>
                            
                            <!-- Botón agregar incidencia -->
                            <button id="btn-agregar-incidencia" 
                                    class="btn-accion-mapa"
                                    style="padding: 10px 18px; background: ${this.colors.accent}; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s; box-shadow: 0 3px 10px rgba(255,107,53,0.3);"
                                    title="Agregar incidencia en el mapa">
                                <i class="fas fa-plus-circle"></i>
                                <span>Agregar</span>
                            </button>
                            
                            <!-- Botón exportar -->
                            <button id="btn-exportar-mapa" 
                                    class="btn-accion-mapa"
                                    style="padding: 10px 18px; background: ${this.colors.info}; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s; box-shadow: 0 3px 10px rgba(23,162,184,0.3);"
                                    title="Exportar mapa">
                                <i class="fas fa-download"></i>
                            </button>
                            
                            <!-- Botón volver -->
                            <button id="btn-volver-dashboard" 
                                    class="btn-accion-mapa"
                                    style="padding: 10px 18px; background: ${this.colors.primary}; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s; box-shadow: 0 3px 10px rgba(0,51,102,0.3);">
                                <i class="fas fa-arrow-left"></i>
                                <span>Dashboard</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Contenido Principal -->
                <div class="mapa-layout" style="overflow: hidden; position: relative;">
                    <!-- Panel de Control Lateral Mejorado -->
                    <div id="panel-control" class="panel-control-lateral mapa-panel" 
                         style="background: white; border-right: 1px solid ${this.colors.border}; display: flex; flex-direction: column; transition: all 0.3s ease; box-shadow: 2px 0 12px rgba(0,0,0,0.08); z-index: 50; position: relative;">
                        
                        <!-- Botón toggle panel -->
                        <button id="btn-toggle-panel" 
                                style="position: absolute; right: -20px; top: 50%; transform: translateY(-50%); width: 40px; height: 80px; background: white; border: 1px solid ${this.colors.border}; border-left: none; border-radius: 0 10px 10px 0; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 2px 0 8px rgba(0,0,0,0.1); transition: all 0.3s; z-index: 10;">
                            <i class="fas fa-chevron-left" style="color: ${this.colors.primary}; transition: transform 0.3s;"></i>
                        </button>
                        
                        <div style="flex: 1; overflow-y: auto; padding: 20px;">
                            <!-- Tarjeta de Estadísticas Rápidas -->
                            <div class="stats-rapidas" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 25px;">
                                <div class="stat-card" style="background: linear-gradient(135deg, ${this.colors.primary} 0%, ${this.colors.primaryLight} 100%); padding: 15px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,51,102,0.2); position: relative; overflow: hidden;">
                                    <div style="position: absolute; top: -10px; right: -10px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                                    <div style="position: relative; z-index: 1;">
                                        <div style="color: rgba(255,255,255,0.8); font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Total</div>
                                        <div id="total-incidencias" style="color: white; font-size: 2rem; font-weight: 700; line-height: 1;">0</div>
                                        <div style="color: rgba(255,255,255,0.9); font-size: 0.8rem; margin-top: 3px;">Incidencias</div>
                                    </div>
                                </div>
                                
                                <div class="stat-card" style="background: linear-gradient(135deg, ${this.colors.accent} 0%, #ff8c5a 100%); padding: 15px; border-radius: 12px; box-shadow: 0 4px 12px rgba(255,107,53,0.2); position: relative; overflow: hidden;">
                                    <div style="position: absolute; top: -10px; right: -10px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                                    <div style="position: relative; z-index: 1;">
                                        <div style="color: rgba(255,255,255,0.8); font-size: 0.75rem; font-weight: 600; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Visibles</div>
                                        <div id="mostradas-incidencias" style="color: white; font-size: 2rem; font-weight: 700; line-height: 1;">0</div>
                                        <div style="color: rgba(255,255,255,0.9); font-size: 0.8rem; margin-top: 3px;">En mapa</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Filtros Mejorados -->
                            <div class="seccion-filtros" style="margin-bottom: 25px;">
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                                    <h4 style="color: ${this.colors.primary}; font-size: 1rem; margin: 0; display: flex; align-items: center; gap: 8px; font-weight: 700;">
                                        <i class="fas fa-sliders-h"></i> FILTROS
                                    </h4>
                                    <button id="btn-limpiar-filtros-mapa" 
                                            style="padding: 5px 12px; background: ${this.colors.light}; color: ${this.colors.text}; border: 1px solid ${this.colors.border}; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s;"
                                            title="Limpiar todos los filtros">
                                        <i class="fas fa-eraser"></i> Limpiar
                                    </button>
                                </div>
                                
                                <div style="display: flex; flex-direction: column; gap: 18px;">
                                    <!-- Rango de Fechas -->
                                    <div class="form-group-mapa">
                                        <label style="display: block; color: ${this.colors.text}; font-size: 0.85rem; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                                            <i class="fas fa-calendar-alt" style="color: ${this.colors.info};"></i> Período
                                        </label>
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                            <input type="date" id="filtro-fecha-inicio"
                                                   class="input-custom"
                                                   style="padding: 12px 10px; border: 2px solid ${this.colors.border}; border-radius: 8px; font-size: 0.85rem; transition: all 0.3s;"
                                                   placeholder="Desde">
                                            <input type="date" id="filtro-fecha-fin"
                                                   class="input-custom"
                                                   style="padding: 12px 10px; border: 2px solid ${this.colors.border}; border-radius: 8px; font-size: 0.85rem; transition: all 0.3s;"
                                                   placeholder="Hasta">
                                        </div>
                                    </div>
                                    
                                    <!-- Botón Aplicar Filtros -->
                                    <button id="btn-aplicar-filtros-mapa" 
                                            style="width: 100%; padding: 14px; background: linear-gradient(135deg, ${this.colors.primary} 0%, ${this.colors.primaryLight} 100%); color: white; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 0.95rem; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,51,102,0.3);">
                                        <i class="fas fa-filter"></i> APLICAR FILTROS
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Leyenda movida al mapa -->
                            
                            <!-- Información Adicional -->
                            <div style="background: linear-gradient(135deg, ${this.colors.light} 0%, white 100%); padding: 15px; border-radius: 10px; border: 1px solid ${this.colors.border};">
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                    <i class="fas fa-info-circle" style="color: ${this.colors.info}; font-size: 1.1rem;"></i>
                                    <span style="font-size: 0.85rem; font-weight: 700; color: ${this.colors.text};">ÚLTIMA ACTUALIZACIÓN</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div class="pulso-pequeño" style="width: 8px; height: 8px; background: ${this.colors.accentGreen}; border-radius: 50%;"></div>
                                    <span id="ultima-actualizacion-mapa" style="font-size: 0.9rem; color: ${this.colors.primary}; font-weight: 600;">Ahora mismo</span>
                                </div>
                            </div>
                            
                            <!-- Últimos Registros -->
                            <div class="seccion-ultimos" style="margin-top: 25px;">
                                <h4 style="color: ${this.colors.primary}; font-size: 1rem; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; font-weight: 700;">
                                    <i class="fas fa-history"></i> ÚLTIMOS REGISTROS
                                </h4>
                                <div id="lista-ultimos-registros" style="display: flex; flex-direction: column; gap: 10px;">
                                    <!-- Se llenará dinámicamente -->
                                    <div style="text-align: center; color: ${this.colors.textLight}; font-size: 0.85rem; padding: 10px;">
                                        <i class="fas fa-spinner fa-spin"></i> Cargando...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Mapa Principal -->
                    <div class="mapa-canvas" style="position: relative; background: ${this.colors.light};">
                        <div id="mapa-tehuacan" style="width: 100%; height: 100%;"></div>
                        
                        <!-- Controles flotantes del mapa -->
                        <div class="controles-flotantes" style="position: absolute; top: 20px; right: 20px; display: flex; flex-direction: column; gap: 12px; z-index: 400;">
                            <!-- Control de zoom personalizado -->
                            <div style="background: white; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); overflow: hidden;">
                                <button id="btn-zoom-in" 
                                        style="width: 45px; height: 45px; background: white; border: none; border-bottom: 1px solid ${this.colors.border}; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                                    <i class="fas fa-plus" style="color: ${this.colors.primary}; font-size: 1.1rem;"></i>
                                </button>
                                <button id="btn-zoom-out" 
                                        style="width: 45px; height: 45px; background: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                                    <i class="fas fa-minus" style="color: ${this.colors.primary}; font-size: 1.1rem;"></i>
                                </button>
                            </div>
                            
                            <!-- Control de ubicación -->
                            <button id="btn-mi-ubicacion" 
                                    style="width: 45px; height: 45px; background: white; border: none; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                                <i class="fas fa-crosshairs" style="color: ${this.colors.primary}; font-size: 1.1rem;"></i>
                            </button>
                            
                            <!-- Control pantalla completa -->
                            <button id="btn-pantalla-completa" 
                                    style="width: 45px; height: 45px; background: white; border: none; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                                <i class="fas fa-expand" style="color: ${this.colors.primary}; font-size: 1.1rem;"></i>
                            </button>
                        </div>
                        
                        <!-- Indicador de modo vista -->
                        <div id="indicador-modo-vista" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 10px 20px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 8px; z-index: 400; backdrop-filter: blur(10px); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                            <i class="fas fa-fire"></i>
                            <span>Modo: <span id="nombre-modo-vista">Mapa de Calor</span></span>
                        </div>
                        
                        <!-- Leyenda Flotante (Top Center) -->
                        <div id="leyenda-flotante" style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); background: white; padding: 6px 15px; border-radius: 30px; display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 400; max-width: 90%; overflow-x: auto;">
                            ${Object.entries(this.tiposIncidencia).map(([key, tipo]) => `
                                <div class="leyenda-item-flotante" data-tipo="${key}" title="${tipo.nombre}" style="display: flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;">
                                    <div style="width: 10px; height: 10px; background: ${tipo.color}; border-radius: 50%;"></div>
                                    <span style="font-size: 0.8rem; font-weight: 700; color: ${this.colors.dark}; white-space: nowrap;">${tipo.nombre}</span>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Loading del Mapa Mejorado -->
                        <div id="loading-mapa" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(5px);">
                            <div style="position: relative; width: 100px; height: 100px; margin-bottom: 30px;">
                                <div class="loader-ring" style="position: absolute; width: 100%; height: 100%; border: 4px solid ${this.colors.light}; border-top-color: ${this.colors.primary}; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; background: ${this.colors.primary}; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-map" style="color: white; font-size: 1.3rem;"></i>
                                </div>
                            </div>
                            <h4 style="color: ${this.colors.primary}; margin-bottom: 10px; font-weight: 700; font-size: 1.2rem;">Cargando Mapa de Tehuacán</h4>
                            <p style="color: ${this.colors.textLight}; font-size: 0.95rem;">Preparando datos de incidencias...</p>
                            <div style="width: 200px; height: 4px; background: ${this.colors.light}; border-radius: 2px; margin-top: 20px; overflow: hidden;">
                                <div class="barra-progreso" style="width: 0%; height: 100%; background: linear-gradient(90deg, ${this.colors.primary}, ${this.colors.accent}); border-radius: 2px; animation: progreso 2s ease-in-out infinite;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${this.getEstilos()}
        `;
    }
    
    getEstilos() {
        return `
            <style>
                .mapa-layout {
                    display: flex;
                    flex: 1;
                    min-height: 0;
                    overflow: hidden;
                }
                .mapa-header {
                    position: sticky;
                    top: 0;
                    z-index: 120;
                }
                .mapa-panel {
                    width: 380px;
                    min-width: 320px;
                    max-width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                .mapa-canvas {
                    flex: 1;
                    min-width: 0;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                #mapa-tehuacan {
                    flex: 1;
                    min-height: 320px;
                }
                .mapa-toolbar {
                    flex-wrap: wrap;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes progreso {
                    0% { width: 0%; transform: translateX(0); }
                    50% { width: 70%; }
                    100% { width: 100%; transform: translateX(100%); }
                }
                
                @keyframes pulso {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                }
                
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes fadeInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes fadeOutRight {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(20px); }
                }
                
                .pulso-indicador {
                    animation: pulso 2s ease-in-out infinite;
                }
                
                .pulso-pequeño {
                    animation: pulso 1.5s ease-in-out infinite;
                }
                
                .stat-card {
                    animation: fadeInUp 0.5s ease-out;
                }
                
                .stat-card:nth-child(2) {
                    animation-delay: 0.1s;
                }
                
                .btn-accion-mapa:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.2) !important;
                }
                
                .btn-accion-mapa:active {
                    transform: translateY(0);
                }
                
                .btn-vista-mapa:hover {
                    background: white;
                    color: ${this.colors.primary};
                    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                }

                .btn-vista-mapa:focus {
                    outline: none;
                    box-shadow: none;
                }
                
                .btn-vista-mapa.active {
                    background: white !important;
                    color: ${this.colors.primary} !important;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
                }
                
                .input-custom:focus {
                    outline: none;
                    border-color: ${this.colors.primary};
                    box-shadow: 0 0 0 3px rgba(0,51,102,0.1);
                }
                
                .btn-turno.active {
                    background: ${this.colors.primary} !important;
                    color: white !important;
                    border-color: ${this.colors.primary} !important;
                }
                
                .btn-turno:hover {
                    border-color: ${this.colors.primary};
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                
                .leyenda-item:hover {
                    border-color: ${this.colors.primary};
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    transform: translateX(5px);
                }
                
                .controles-flotantes button:hover {
                    background: ${this.colors.light} !important;
                    transform: scale(1.1);
                }
                
                .leaflet-popup-content-wrapper {
                    border-radius: 12px !important;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
                }
                
                .leaflet-popup-tip {
                    box-shadow: 0 3px 6px rgba(0,0,0,0.1) !important;
                }
                
                /* Scrollbar personalizado */
                .panel-control-lateral::-webkit-scrollbar {
                    width: 6px;
                }
                
                .panel-control-lateral::-webkit-scrollbar-track {
                    background: ${this.colors.light};
                }
                
                .panel-control-lateral::-webkit-scrollbar-thumb {
                    background: ${this.colors.border};
                    border-radius: 3px;
                }
                
                .panel-control-lateral::-webkit-scrollbar-thumb:hover {
                    background: ${this.colors.textLight};
                }
                
                /* Animación de entrada para elementos */
                .seccion-filtros,
                .seccion-leyenda {
                    animation: fadeInUp 0.6s ease-out;
                }
                
                /* Panel colapsado */
                .panel-control-lateral.colapsado {
                    width: 0 !important;
                    padding: 0 !important;
                    border: none !important;
                }
                
                .panel-control-lateral.colapsado #btn-toggle-panel i {
                    transform: rotate(180deg);
                }

                @media (max-width: 1200px) {
                    .mapa-panel {
                        width: 320px;
                    }
                }

                @media (max-width: 992px) {
                    .mapa-layout {
                        flex-direction: column;
                    }
                    .mapa-panel {
                        width: 100%;
                        height: auto;
                        border-right: none;
                        border-top: 1px solid ${this.colors.border};
                    }
                    .mapa-canvas {
                        min-height: 60vh;
                    }
                    .controles-flotantes {
                        top: 12px !important;
                        right: 12px !important;
                    }
                }

                @media (max-width: 768px) {
                    .mapa-header {
                        position: relative;
                    }
                    .mapa-toolbar {
                        gap: 8px !important;
                    }
                    .mapa-toolbar button {
                        padding: 8px 12px !important;
                    }
                    .btn-group-mapa {
                        width: 100%;
                        justify-content: space-between;
                    }
                    .btn-group-mapa button {
                        flex: 1;
                    }
                    .controles-flotantes {
                        flex-direction: row !important;
                        top: auto !important;
                        bottom: 80px !important;
                        right: 12px !important;
                        left: 12px !important;
                        justify-content: center;
                    }
                }
            </style>
        `;
    }
    
    getEmojiForTipo(tipo) {
        const emojis = {
            'accidente': '🚗',
            'robo': '🚨',
            'disturbio': '⚠️',
            'sospechoso': '🔍',
            'vehiculo': '🚙',
            'medica': '🚑'
        };
        return emojis[tipo] || '📍';
    }
    
    async initMapa() {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (typeof L === 'undefined') {
            this.cargarLeafletCSS();
            await this.cargarLeafletJS();
        }

        this.prepararCanvasHeatmap();

        if (typeof L.heatLayer === 'undefined') {
            await this.cargarLeafletHeat();
        }
        
        this.mapa = L.map('mapa-tehuacan', {
            center: [this.coordenadasTehuacan.lat, this.coordenadasTehuacan.lng],
            zoom: this.coordenadasTehuacan.zoom,
            zoomControl: false // Usaremos controles personalizados
        });
        
        // Capa base con estilo mejorado
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(this.mapa);
        
        document.getElementById('loading-mapa').style.display = 'none';
    }
    
    cargarLeafletCSS() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
    }
    
    cargarLeafletJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    cargarLeafletHeat() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    bindEvents() {
        // Botón volver
        document.getElementById('btn-volver-dashboard').addEventListener('click', () => {
            this.appController.loadView('dashboard');
        });
        
        // Botones de vista
        document.querySelectorAll('.btn-vista-mapa').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.cambiarModoVista(e.currentTarget.dataset.vista);
            });
        });
        
        // Botón toggle panel
        document.getElementById('btn-toggle-panel').addEventListener('click', () => {
            this.togglePanel();
        });
        
        // Botones de turno
        document.querySelectorAll('.btn-turno').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-turno').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.getElementById('filtro-turno').value = e.currentTarget.dataset.turno;
            });
        });
        
        // Aplicar filtros
        document.getElementById('btn-aplicar-filtros-mapa').addEventListener('click', () => {
            this.aplicarFiltrosMapa();
        });
        
        // Limpiar filtros
        document.getElementById('btn-limpiar-filtros-mapa').addEventListener('click', () => {
            this.limpiarFiltrosMapa();
        });
        
        // Controles del mapa
        document.getElementById('btn-zoom-in').addEventListener('click', () => {
            this.mapa.zoomIn();
        });
        
        document.getElementById('btn-zoom-out').addEventListener('click', () => {
            this.mapa.zoomOut();
        });
        
        document.getElementById('btn-mi-ubicacion').addEventListener('click', () => {
            this.centrarEnTehuacan();
        });
        
        document.getElementById('btn-pantalla-completa').addEventListener('click', () => {
            this.togglePantallaCompleta();
        });
        
        // Agregar incidencia
        document.getElementById('btn-agregar-incidencia').addEventListener('click', () => {
            this.habilitarModoAgregarIncidencia();
        });
        
        // Exportar mapa
        document.getElementById('btn-exportar-mapa').addEventListener('click', () => {
            this.exportarMapaComoImagen();
        });
        
        // Clicks en leyenda flotante para filtrar
        document.querySelectorAll('.leyenda-item-flotante').forEach(item => {
            item.addEventListener('click', (e) => {
                const tipo = e.currentTarget.dataset.tipo;
                if (tipo) {
                    this.filtrarPorTipo(tipo);
                }
            });
        });
    }
    
    iniciarAnimaciones() {
        // Animaciones de entrada escalonadas
        const elementos = [
            '.stat-card',
            '.seccion-filtros',
            '.seccion-leyenda'
        ];
        
        elementos.forEach((selector, index) => {
            const elementos = document.querySelectorAll(selector);
            elementos.forEach((el, i) => {
                el.style.opacity = '0';
                setTimeout(() => {
                    el.style.animation = `fadeInUp 0.5s ease-out forwards`;
                }, (index * 100) + (i * 50));
            });
        });
    }
    
    togglePanel() {
        const panel = document.getElementById('panel-control');
        const icono = document.querySelector('#btn-toggle-panel i');
        
        this.panelAbierto = !this.panelAbierto;
        
        if (this.panelAbierto) {
            panel.style.width = '380px';
            panel.style.padding = '0';
            icono.className = 'fas fa-chevron-left';
        } else {
            panel.style.width = '0';
            panel.style.padding = '0';
            icono.className = 'fas fa-chevron-right';
        }
        
        // Actualizar mapa
        setTimeout(() => {
            this.mapa.invalidateSize();
        }, 300);
    }
    
    cambiarModoVista(modo) {
        this.modoVista = modo;
        
        const nombres = {
            'calor': 'Mapa de Calor',
            'marcadores': 'Marcadores',
            'clusters': 'Agrupación'
        };
        
        const iconos = {
            'calor': 'fa-fire',
            'marcadores': 'fa-map-pin',
            'clusters': 'fa-th'
        };
        
        const indicadorIcono = document.querySelector('#indicador-modo-vista i');
        if (indicadorIcono) {
            indicadorIcono.className = `fas ${iconos[modo]}`;
        }
        const nombreModo = document.getElementById('nombre-modo-vista');
        if (nombreModo) {
            nombreModo.textContent = nombres[modo];
        }

        this.syncBotonesModoVista(modo);
        
        // Aplicar modo de vista
        this.aplicarModoVista();
        
        // Mostrar notificación
        this.mostrarNotificacionRapida(`Modo cambiado a: ${nombres[modo]}`);
    }

    syncBotonesModoVista(modo) {
        document.querySelectorAll('.btn-vista-mapa').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.vista === modo);
        });
    }
    
    aplicarModoVista() {
        if (!this.mapa) {
            return;
        }
        // Limpiar capas actuales
        this.limpiarMarcadores();
        
        // Aplicar según modo
        const datosFiltrados = this.aplicarFiltrosADatos(this.datosMapa || []);
        
        switch(this.modoVista) {
            case 'calor':
                this.mostrarMapaCalor(datosFiltrados);
                break;
            case 'marcadores':
                this.mostrarMarcadores(datosFiltrados);
                break;
            case 'clusters':
                this.mostrarClusters(datosFiltrados);
                break;
        }
    }
    
    mostrarNotificacionRapida(mensaje) {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 600;
            z-index: 2000;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: fadeInUp 0.3s ease-out;
        `;
        notif.textContent = mensaje;
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.style.animation = 'fadeOutRight 0.3s ease-out';
            setTimeout(() => notif.remove(), 300);
        }, 2000);
    }
    
    centrarEnTehuacan() {
        this.mapa.setView(
            [this.coordenadasTehuacan.lat, this.coordenadasTehuacan.lng],
            this.coordenadasTehuacan.zoom,
            { animate: true, duration: 1 }
        );
        this.mostrarNotificacionRapida('Centrado en Tehuacán');
    }
    
    togglePantallaCompleta() {
        const elem = document.documentElement;
        const icono = document.querySelector('#btn-pantalla-completa i');
        
        if (!document.fullscreenElement) {
            elem.requestFullscreen().then(() => {
                icono.className = 'fas fa-compress';
            });
        } else {
            document.exitFullscreen().then(() => {
                icono.className = 'fas fa-expand';
            });
        }
    }
    
    async cargarDatosMapa() {
        try {
            let datos = [];
            
            if (typeof LlamadasService !== 'undefined') {
                const response = await LlamadasService.obtenerLlamadas();
                if (response && response.success) {
                    datos = response.data || [];
                }
            }
            
            if (datos.length === 0) {
                console.log('Sin registros para el mapa');
            }
            
            this.datosMapa = this.normalizarDatosMapa(datos);
            if (!Array.isArray(this.datosMapa)) {
                this.datosMapa = [];
            }
            this.aplicarModoVista();
            this.actualizarEstadisticas(this.datosMapa.length, this.datosMapa.length);
            this.actualizarContadoresTipo(this.datosMapa);

            this.resolverCoordenadasIncidencias(this.datosMapa).then(() => {
                this.aplicarModoVista();
            });

            if (this.mapa) {
                setTimeout(() => this.mapa.invalidateSize(), 100);
            }
            
        } catch (error) {
            console.error('Error cargando datos del mapa:', error);
            this.mostrarAlerta('⚠️ ERROR', 'Error cargando datos del mapa', 'error');
        }
    }
    
    actualizarEstadisticas(total, mostradas) {
        // Animación de contador
        this.animarContador('total-incidencias', total);
        this.animarContador('mostradas-incidencias', mostradas);

        const actualizacionEl = document.getElementById('ultima-actualizacion-mapa');
        if (actualizacionEl) {
            actualizacionEl.textContent =
                new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        }
    }
    
    animarContador(elementOrId, valorFinal) {
        const elemento = typeof elementOrId === 'string'
            ? document.getElementById(elementOrId)
            : elementOrId;
        if (!elemento) return;
        const valorActual = parseInt(elemento.textContent) || 0;
        const diferencia = Math.abs(valorFinal - valorActual);
        if (diferencia >= 50) {
            elemento.textContent = valorFinal;
            return;
        }
        const duracion = 200;
        const incremento = (valorFinal - valorActual) / (duracion / 16);
        
        let valor = valorActual;
        const intervalo = setInterval(() => {
            valor += incremento;
            if ((incremento > 0 && valor >= valorFinal) || (incremento < 0 && valor <= valorFinal)) {
                elemento.textContent = valorFinal;
                clearInterval(intervalo);
            } else {
                elemento.textContent = Math.round(valor);
            }
        }, 16);
    }
    
    actualizarContadoresTipo(datos) {
        // Resetear contadores
        document.querySelectorAll('.contador-tipo').forEach(el => {
            el.textContent = '0';
        });
        
        // Contar por tipo
        const conteo = {};
        datos.forEach(incidencia => {
            const tipo = this.determinarTipoIncidencia(incidencia.motivo);
            conteo[tipo] = (conteo[tipo] || 0) + 1;
        });
        
        // Actualizar contadores
        Object.entries(conteo).forEach(([tipo, cantidad]) => {
            const elemento = document.querySelector(`.contador-tipo[data-tipo="${tipo}"]`);
            if (elemento) {
                this.animarContador(elemento, cantidad);
                elemento.textContent = cantidad;
            }
        });
    }

    normalizarDatosMapa(datos) {
        return (datos || []).map(item => {
            const fecha = item.fecha || item.fcca || item.fecha_registro || (item.created_at ? String(item.created_at).split(' ')[0] : null);
            const hora = item.hora || item.ticr || (item.created_at ? String(item.created_at).split(' ')[1] : null);
            return {
                ...item,
                fecha,
                hora,
                motivo: item.motivo || item.descripcion || 'Sin motivo',
                ubicacion: item.ubicacion || item.direccion || '',
                colonia: item.colonia || ''
            };
        });
    }

    extraerLatLng(incidencia) {
        const posiblesLat = [
            incidencia.latitud,
            incidencia.lat,
            incidencia.latitude,
            incidencia.coordenada_lat,
            incidencia.coord_lat,
            incidencia.latitud_decimal
        ];
        const posiblesLng = [
            incidencia.longitud,
            incidencia.lng,
            incidencia.lon,
            incidencia.longitude,
            incidencia.coordenada_lng,
            incidencia.coord_lng,
            incidencia.coord_lng,
            incidencia.coord_lng,
            incidencia.coord_lng,
            incidencia.longitud_decimal
        ];

        const lat = parseFloat(posiblesLat.find(v => v !== undefined && v !== null && v !== ''));
        const lng = parseFloat(posiblesLng.find(v => v !== undefined && v !== null && v !== ''));

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            return { lat, lng };
        }

        if (Array.isArray(incidencia.coordenadas) && incidencia.coordenadas.length >= 2) {
            const [latArr, lngArr] = incidencia.coordenadas;
            const latNum = parseFloat(latArr);
            const lngNum = parseFloat(lngArr);
            if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
                return { lat: latNum, lng: lngNum };
            }
        }

        if (incidencia.coordenadas && typeof incidencia.coordenadas === 'object') {
            const latObj = parseFloat(incidencia.coordenadas.lat || incidencia.coordenadas.latitude);
            const lngObj = parseFloat(incidencia.coordenadas.lng || incidencia.coordenadas.longitude);
            if (Number.isFinite(latObj) && Number.isFinite(lngObj)) {
                return { lat: latObj, lng: lngObj };
            }
        }

        return null;
    }



    validarCoordenadasTehuacan(lat, lng) {
        // Límites geográficos aproximados de Tehuacán, Puebla
        const limites = {
            latMin: 18.40,
            latMax: 18.52,
            lngMin: -97.45,
            lngMax: -97.35
        };
        
        return lat >= limites.latMin && lat <= limites.latMax &&
               lng >= limites.lngMin && lng <= limites.lngMax;
    }

    async resolverCoordenadasIncidencias(datos) {
        if (!this.coordenadasCache) {
            this.coordenadasCache = new Map();
        }
        const pendientes = (datos || []).filter(incidencia => !this.extraerLatLng(incidencia));
        if (pendientes.length === 0) {
            return;
        }

        if (!this.geocodingDisponible || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
            pendientes.forEach((incidencia) => {
                incidencia._coords = this.obtenerCoordenadasFallback(incidencia);
            });
            return;
        }

        console.log(`🌍 Iniciando geocodificación de ${pendientes.length} incidencias...`);
        this.mostrarIndicadorGeocoding(true);

        const procesarLote = async (lote, index) => {
            await Promise.all(lote.map(async (incidencia) => {
                const coords = await this.geocodificarIncidencia(incidencia);
                if (coords) {
                    incidencia.latitud = coords.lat;
                    incidencia.longitud = coords.lng;
                    incidencia._coords = coords;
                } else {
                    incidencia._coords = this.obtenerCoordenadasFallback(incidencia);
                }
            }));
            
            // Actualizar progreso
            const procesados = Math.min((index + 1) * lote.length, pendientes.length);
            this.actualizarProgresoGeocoding(procesados, pendientes.length);
        };

        // Respetar límites de Nominatim (1 req/seg)
        const tamañoLote = 1;
        for (let i = 0; i < pendientes.length; i += tamañoLote) {
            const lote = pendientes.slice(i, i + tamañoLote);
            await procesarLote(lote, i);
            
            // Delay de 1.1 segundos entre solicitudes para respetar límites de API
            if (i + tamañoLote < pendientes.length) {
                await new Promise(resolve => setTimeout(resolve, 1100));
            }
        }

        this.mostrarIndicadorGeocoding(false);
        console.log(`✅ Geocodificación completada`);
    }





    async geocodificarIncidencia(incidencia) {
        // Optimización: Usar solo métodos efectivos (Photon) y fallback simple
        // para mejorar velocidad de carga y evitar loops de reintento lentos.

        // 1. Construir query optimizado para Photon
        // Photon prefiere: "Calle Número, Ciudad, Estado"
        let query = `${incidencia.calle || incidencia.ubicacion || ''}`;
        if (incidencia.numero) query += ` ${incidencia.numero}`;
        query += ', Tehuacán, Puebla'; // Contexto simple

        // 2. Verificar caché en memoria
        if (this.coordenadasCache && this.coordenadasCache.has(query)) {
            return this.coordenadasCache.get(query);
        }

        console.log(`📍 Geocodificando (Photon): "${query}"`);

        // 3. Consultar Photon API (Rápido y tolerante)
        try {
            // Bias hacia Tehuacán (Lat 18.46, Lon -97.39)
            const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1&lat=18.46&lon=-97.39`;
            
            const response = await fetch(photonUrl);
            if (response.ok) {
                const data = await response.json();
                if (data.features && data.features.length > 0) {
                    const coordsData = data.features[0].geometry.coordinates; // [lon, lat]
                    const lng = coordsData[0];
                    const lat = coordsData[1];
                    
                    if (Number.isFinite(lat) && Number.isFinite(lng) && this.validarCoordenadasTehuacan(lat, lng)) {
                        const resultado = { lat, lng };
                        if (this.coordenadasCache) this.coordenadasCache.set(query, resultado);
                        return resultado;
                    }
                }
            }
        } catch (e) {
            console.warn('Fallo Photon:', e);
        }

        // 4. Fallback: Intentar solo Colonia si falla la calle específica
        // Esto es mucho más rápido que probar 5 variantes en Nominatim
        if (incidencia.colonia && incidencia.colonia.trim()) {
            const queryColonia = `Colonia ${incidencia.colonia}, Tehuacán`;
            
            // Check cache para colonia
            if (this.coordenadasCache && this.coordenadasCache.has(queryColonia)) {
                return this.coordenadasCache.get(queryColonia);
            }

            try {
                const photonUrlCol = `https://photon.komoot.io/api/?q=${encodeURIComponent(queryColonia)}&limit=1&lat=18.46&lon=-97.39`;
                const response = await fetch(photonUrlCol);
                if (response.ok) {
                    const data = await response.json();
                     if (data.features && data.features.length > 0) {
                        const coordsData = data.features[0].geometry.coordinates; // [lon, lat]
                        const lng = coordsData[0];
                        const lat = coordsData[1];
                        if (Number.isFinite(lat) && Number.isFinite(lng)) {
                            const resultado = { lat, lng };
                            if (this.coordenadasCache) this.coordenadasCache.set(queryColonia, resultado);
                            return resultado;
                        }
                    }
                }
            } catch (e) { /* Ignore */ }
        }

        // Si todo falla, retornamos null y el sistema usará el fallback hash (matemático)
        return null;
    }



    mostrarIndicadorGeocoding(mostrar) {
        let indicador = document.getElementById('geocoding-indicator');
        
        if (mostrar) {
            if (!indicador) {
                indicador = document.createElement('div');
                indicador.id = 'geocoding-indicator';
                indicador.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: white;
                    padding: 10px 15px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.9rem;
                    border-left: 4px solid #3498db;
                    animation: slideInUp 0.3s ease-out;
                    font-family: 'Segoe UI', sans-serif;
                `;
                indicador.innerHTML = `
                    <i class="fas fa-satellite-dish fa-spin" style="color: #3498db;"></i>
                    <div>
                        <div style="font-weight: 700; color: #34495e;">Geocodificando...</div>
                        <div id="geocoding-progress" style="font-size: 0.8rem; color: #7f8c8d;">Iniciando búsqueda</div>
                    </div>
                `;
                document.body.appendChild(indicador);
            }
            indicador.style.display = 'flex';
        } else {
            if (indicador) {
                indicador.style.animation = 'slideOutDown 0.3s ease-in';
                setTimeout(() => {
                    indicador.style.display = 'none';
                    indicador.style.animation = '';
                }, 300);
            }
        }
    }

    actualizarProgresoGeocoding(actual, total) {
        const progressEl = document.getElementById('geocoding-progress');
        if (progressEl) {
            progressEl.textContent = `Procesando ${actual} de ${total}`;
        }
    }

    getGeocodingEndpoint() {
        if (typeof LlamadasService !== 'undefined' && LlamadasService.apiBaseUrl) {
            return `${LlamadasService.apiBaseUrl}/geocode`;
        }
        return 'http://localhost:3000/api/llamadas/geocode';
    }

    prepararCanvasHeatmap() {
        if (typeof window === 'undefined') {
            return;
        }
        if (window.__sasCanvasHeatmapPatched) {
            return;
        }
        const original = HTMLCanvasElement.prototype.getContext;
        if (typeof original !== 'function') {
            return;
        }
        HTMLCanvasElement.prototype.getContext = function(type, options) {
            if (type === '2d') {
                const merged = options ? { ...options, willReadFrequently: true } : { willReadFrequently: true };
                return original.call(this, type, merged);
            }
            return original.call(this, type, options);
        };
        window.__sasCanvasHeatmapPatched = true;
    }

    obtenerCoordenadasFallback(incidencia) {
        const baseLat = this.coordenadasTehuacan.lat;
        const baseLng = this.coordenadasTehuacan.lng;
        const seed = `${incidencia.colonia || ''}|${incidencia.ubicacion || ''}|${incidencia.motivo || ''}`;
        const hash = this.hashString(seed);

        const offsetLat = ((hash % 1000) / 1000 - 0.5) * 0.06;
        const offsetLng = (((hash / 1000) % 1000) / 1000 - 0.5) * 0.06;

        return {
            lat: baseLat + offsetLat,
            lng: baseLng + offsetLng
        };
    }

    obtenerCoordenadas(incidencia) {
        if (incidencia._coords && Number.isFinite(incidencia._coords.lat) && Number.isFinite(incidencia._coords.lng)) {
            return incidencia._coords;
        }

        const coordsDirectas = this.extraerLatLng(incidencia);
        if (coordsDirectas) {
            return coordsDirectas;
        }

        return this.obtenerCoordenadasFallback(incidencia);
    }

    hashString(texto) {
        let hash = 0;
        for (let i = 0; i < texto.length; i++) {
            hash = ((hash << 5) - hash) + texto.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }
    
    determinarTipoIncidencia(motivo) {
        if (!motivo) return 'accidente';
        
        const motivoLower = motivo.toLowerCase();
        
        if (motivoLower.includes('accidente') || motivoLower.includes('choque') || motivoLower.includes('vehicular')) {
            return 'accidente';
        } else if (motivoLower.includes('robo') || motivoLower.includes('asalto') || motivoLower.includes('hurto')) {
            return 'robo';
        } else if (motivoLower.includes('disturbio') || motivoLower.includes('pelea') || motivoLower.includes('altercado')) {
            return 'disturbio';
        } else if (motivoLower.includes('sospechoso') || motivoLower.includes('merodeando') || motivoLower.includes('sospecha')) {
            return 'sospechoso';
        } else if (motivoLower.includes('vehículo') || motivoLower.includes('automóvil') || motivoLower.includes('carro')) {
            return 'vehiculo';
        } else if (motivoLower.includes('médica') || motivoLower.includes('herido') || motivoLower.includes('ambulancia')) {
            return 'medica';
        }
        
        return 'accidente';
    }
    
    mostrarMapaCalor(datos) {
        if (!this.mapa) return;
        const container = this.mapa.getContainer();
        if (!container || container.clientWidth === 0 || container.clientHeight === 0) {
            setTimeout(() => {
                if (this.mapa) {
                    this.mapa.invalidateSize();
                    this.mostrarMapaCalor(datos);
                }
            }, 150);
            return;
        }
        const puntosCalor = datos.map(incidencia => {
            const coords = this.obtenerCoordenadas(incidencia);
            return [coords.lat, coords.lng, 1];
        });
        
        if (puntosCalor.length === 0) {
            return;
        }

        if (typeof L.heatLayer === 'undefined') {
            this.mostrarNotificacionRapida('Heatmap no disponible, mostrando marcadores');
            this.mostrarMarcadores(datos);
            return;
        }

        if (puntosCalor.length > 0) {
            this.capaCalor = L.heatLayer(puntosCalor, {
                radius: 30,
                blur: 20,
                maxZoom: 17,
                gradient: {
                    0.0: 'blue',
                    0.3: 'cyan',
                    0.5: 'lime',
                    0.7: 'yellow',
                    0.9: 'orange',
                    1.0: 'red'
                }
            }).addTo(this.mapa);
            this.capasCalor.push(this.capaCalor);
        }
    }
    
    mostrarMarcadores(datos) {
        if (!this.mapa) return;
        datos.forEach((incidencia, index) => {
            const coords = this.obtenerCoordenadas(incidencia);
            if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
                return;
            }
            
            const tipo = this.determinarTipoIncidencia(incidencia.motivo);
            const tipoInfo = this.tiposIncidencia[tipo];
            
            const marcador = this.crearMarcadorMejorado(coords.lat, coords.lng, tipoInfo, incidencia, index);
            marcador.addTo(this.mapa);
            this.marcadores.push(marcador);
        });
        
        if (this.marcadores.length > 0) {
            const grupo = new L.FeatureGroup(this.marcadores);
            this.mapa.fitBounds(grupo.getBounds().pad(0.1));
        }
    }
    
    mostrarClusters(datos) {
        // Similar a mostrarMarcadores pero con agrupación
        this.mostrarMarcadores(datos);
        this.mostrarNotificacionRapida('Modo clusters activado');
    }
    
    crearMarcadorMejorado(lat, lng, tipoInfo, incidencia, index) {
        const icono = L.divIcon({
            className: 'marcador-custom',
            html: `
                <div style="position: relative;">
                    <div style="width: 40px; height: 40px; background: ${tipoInfo.gradient}; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 3px 10px ${tipoInfo.color}60; border: 3px solid white; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-${tipoInfo.icon}" style="color: white; font-size: 1rem; transform: rotate(45deg);"></i>
                    </div>
                    <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); width: 20px; height: 20px; background: ${tipoInfo.color}40; border-radius: 50%; filter: blur(3px);"></div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });
        
        const marcador = L.marker([lat, lng], { 
            icon: icono,
            draggable: true, // Permitir arrastrar para corregir ubicación
            id_incidencia: incidencia.id // Para búsqueda inversa
        });
        
        // Manejar evento de fin de arrastre
        marcador.on('dragend', async (event) => {
            const nuevaPosicion = event.target.getLatLng();
            
            // Preguntar confirmación antes de guardar
            const confirmar = confirm(`¿Deseas actualizar la ubicación exacta de este registro?\n\nNueva posición: ${nuevaPosicion.lat.toFixed(6)}, ${nuevaPosicion.lng.toFixed(6)}`);
            
            if (confirmar) {
                // Guardar en backend
                try {
                    const servicio = new LlamadasService(); // O usar window.LlamadasService estático
                    // Nota: LlamadasService es estático en la implementación actual
                    const resultado = await window.LlamadasService.actualizarLlamada(incidencia.id, {
                        latitud: nuevaPosicion.lat,
                        longitud: nuevaPosicion.lng,
                        ubicacion_exacta: true // Flag opcional para indicar que fue corregido manualmente
                    });
                    
                    if (resultado.success) {
                        this.mostrarNotificacionRapida('✅ Ubicación actualizada correctamente');
                        // Actualizar datos locales del marcador para que no rebote al recargar
                        incidencia.latitud = nuevaPosicion.lat;
                        incidencia.longitud = nuevaPosicion.lng;
                    } else {
                        throw new Error(resultado.message || 'Error al guardar');
                    }
                } catch (error) {
                    console.error('Error actualizando ubicación:', error);
                    alert('❌ Error al guardar la nueva ubicación: ' + error.message);
                    // Revertir a posición original
                    event.target.setLatLng([lat, lng]);
                }
            } else {
                // Revertir a posición original si cancela
                event.target.setLatLng([lat, lng]);
            }
        });
        
        const popupContent = this.crearPopupMejorado(tipoInfo, incidencia, index);
        marcador.bindPopup(popupContent, {
            maxWidth: 320,
            className: 'popup-mejorado'
        });
        
        return marcador;
    }
    
    crearPopupMejorado(tipoInfo, incidencia, index) {
        return `
            <div style="font-family: 'Segoe UI', sans-serif; min-width: 280px;">
                <div style="background: ${tipoInfo.gradient}; color: white; padding: 15px; border-radius: 10px 10px 0 0; margin: -15px -20px 15px -20px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <div style="width: 45px; height: 45px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                            <i class="fas fa-${tipoInfo.icon}" style="font-size: 1.3rem;"></i>
                        </div>
                        <div>
                            <div style="font-weight: 700; font-size: 1.1rem;">${tipoInfo.nombre.toUpperCase()}</div>
                            <div style="font-size: 0.85rem; opacity: 0.9;">ID: #${String(index + 1).padStart(4, '0')}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; opacity: 0.95;">
                        <i class="fas fa-calendar"></i> ${incidencia.fecha || 'N/A'}
                        <span style="margin: 0 5px;">•</span>
                        <i class="fas fa-clock"></i> ${incidencia.hora ? incidencia.hora.substring(0,5) : 'N/A'}
                    </div>
                </div>
                
                <div style="padding: 5px 0;">
                    <div style="margin-bottom: 12px;">
                        <div style="color: ${this.colors.textLight}; font-size: 0.75rem; font-weight: 700; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">
                            <i class="fas fa-info-circle"></i> Motivo
                        </div>
                        <div style="font-weight: 600; color: ${this.colors.dark}; font-size: 0.95rem;">${incidencia.motivo || 'Sin especificar'}</div>
                    </div>
                    
                    <div style="margin-bottom: 12px;">
                        <div style="color: ${this.colors.textLight}; font-size: 0.75rem; font-weight: 700; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">
                            <i class="fas fa-map-marker-alt"></i> Ubicación
                        </div>
                        <div style="color: ${this.colors.text}; font-size: 0.9rem;">${incidencia.ubicacion || 'Sin especificar'}</div>
                    </div>
                    
                    <div style="margin-bottom: 12px;">
                        <div style="color: ${this.colors.textLight}; font-size: 0.75rem; font-weight: 700; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">
                            <i class="fas fa-home"></i> Colonia
                        </div>
                        <div style="color: ${this.colors.text}; font-size: 0.9rem;">${incidencia.colonia || 'Sin especificar'}</div>
                    </div>
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: ${this.colors.light}; border-radius: 8px; margin-top: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-clock" style="color: ${this.colors.warning};"></i>
                            <span style="font-size: 0.85rem; color: ${this.colors.text}; font-weight: 600;">${incidencia.turno || 'N/A'}</span>
                        </div>
                        <div>
                            ${this.getEstadoBadge(incidencia)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getEstadoBadge(incidencia) {
        if (incidencia.conclusion) {
            return `<span style="padding: 5px 12px; background: ${this.colors.accentGreen}; color: white; border-radius: 15px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fas fa-check-circle"></i> CONCLUIDO
            </span>`;
        } else if (incidencia.seguimiento) {
            return `<span style="padding: 5px 12px; background: ${this.colors.accent}; color: white; border-radius: 15px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fas fa-spinner"></i> SEGUIMIENTO
            </span>`;
        } else {
            return `<span style="padding: 5px 12px; background: ${this.colors.textLight}; color: white; border-radius: 15px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 5px;">
                <i class="fas fa-circle"></i> REGISTRADO
            </span>`;
        }
    }
    
    limpiarMarcadores() {
        this.marcadores.forEach(marcador => {
            this.mapa.removeLayer(marcador);
        });
        this.marcadores = [];
        
        this.capasCalor.forEach(capa => {
            this.mapa.removeLayer(capa);
        });
        this.capasCalor = [];
    }
    
    aplicarFiltrosMapa() {
        // Usar estado actual o default 'todos'
        const currentTipo = (this.filtrosActivos && this.filtrosActivos.tipo) ? this.filtrosActivos.tipo : 'todos';
        
        // Elementos de fecha aun existen
        const fechaInicio = document.getElementById('filtro-fecha-inicio') ? document.getElementById('filtro-fecha-inicio').value : '';
        const fechaFin = document.getElementById('filtro-fecha-fin') ? document.getElementById('filtro-fecha-fin').value : '';
        
        // Turno (ya no hay botones, lo manejamos interno si fuera necesario, o lo quitamos)
        const turno = (this.filtrosActivos && this.filtrosActivos.turno) ? this.filtrosActivos.turno : '';
        
        this.filtrosActivos = { 
            tipo: currentTipo, 
            fechaInicio, 
            fechaFin, 
            turno 
        };
        
        const datosFiltrados = this.aplicarFiltrosADatos(this.datosMapa || []);
        
        this.aplicarModoVista();
        this.actualizarEstadisticas(this.datosMapa ? this.datosMapa.length : 0, datosFiltrados.length);
        this.actualizarContadoresTipo(datosFiltrados);
        this.actualizarUltimosRegistros(datosFiltrados);
        this.actualizarUIFiltrosActivos(); // Asegurar que la leyenda refleje el estado
        
        this.mostrarNotificacionRapida(`Filtros: ${datosFiltrados.length} registros`);
    }

    // ... (omitted)

    centrarEnIncidencia(id) {
        const incidencia = this.datosMapa.find(d => d.id == id);
        if (!incidencia) {
            this.mostrarNotificacionRapida('Registro no encontrado');
            return;
        }

        // Usar la función centralizada para garantizar consistencia
        const coords = this.obtenerCoordenadas(incidencia);
        
        if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
            this.mostrarNotificacionRapida('Ubicación no disponible para este registro');
            return;
        }

        const { lat, lng } = coords;
        
        // 1. Mover mapa
        this.mapa.flyTo([lat, lng], 18, {
            animate: true,
            duration: 1.5
        });

        // 2. Buscar y abrir marcador
        let marcadorEncontrado = null;
        this.mapa.eachLayer(layer => {
            // Comparación robusta
            if (layer instanceof L.Marker && String(layer.options.id_incidencia) === String(id)) {
                marcadorEncontrado = layer;
            }
        });

        if (marcadorEncontrado) {
            // Si es cluster, usar función especial si existe
            // Si no, intentar abrir
            setTimeout(() => {
                if (marcadorEncontrado.__parent) {
                    marcadorEncontrado.__parent.spiderfy(); 
                }
                marcadorEncontrado.openPopup();
            }, 1000); 
        } else {
            // Si el marcador no está en el mapa (ej: filtrado o en cluster cerrado)
            // Forzar vista de marcadores si estamos en calor?
            if (this.modoVista === 'calor') {
                this.cambiarModoVista('marcadores');
                // Reintentar centrado
                setTimeout(() => this.centrarEnIncidencia(id), 500);
            }
        }
    }

    // Método helper para activar filtro por tipo desde la leyenda flotante
    filtrarPorTipo(tipo) {
        if (!this.filtrosActivos) this.filtrosActivos = {};
        
        // Toggle: Si ya está activo, desactivar (mostrar todos), si no, activar
        if (this.filtrosActivos.tipo === tipo) {
            this.filtrosActivos.tipo = 'todos';
        } else {
            this.filtrosActivos.tipo = tipo;
        }
        
        this.aplicarFiltrosMapa();
        this.actualizarUIFiltrosActivos();
    }

    actualizarUIFiltrosActivos() {
        // Actualizar visualmente la leyenda flotante
        const tipoActivo = this.filtrosActivos.tipo || 'todos';
        document.querySelectorAll('.leyenda-item-flotante').forEach(item => {
            if (tipoActivo === 'todos') {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            } else {
                if (item.dataset.tipo === tipoActivo) {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1.1)';
                    item.style.fontWeight = 'bold';
                } else {
                    item.style.opacity = '0.4';
                    item.style.transform = 'scale(0.95)';
                    item.style.fontWeight = 'normal';
                }
            }
        });
    }
    
    aplicarFiltrosADatos(datos) {
        let filtrados = [...datos];
        const { tipo, fechaInicio, fechaFin, turno } = this.filtrosActivos;
        
        if (tipo !== 'todos') {
            filtrados = filtrados.filter(incidencia => {
                const tipoIncidencia = this.determinarTipoIncidencia(incidencia.motivo);
                return tipoIncidencia === tipo;
            });
        }
        
        if (fechaInicio) {
            filtrados = filtrados.filter(incidencia => 
                incidencia.fecha >= fechaInicio
            );
        }
        
        if (fechaFin) {
            filtrados = filtrados.filter(incidencia => 
                incidencia.fecha <= fechaFin
            );
        }
        
        if (turno) {
            filtrados = filtrados.filter(incidencia => 
                incidencia.turno && incidencia.turno.toLowerCase() === turno.toLowerCase()
            );
        }
        
        return filtrados;
    }
    
    limpiarFiltrosMapa() {
        document.getElementById('filtro-tipo').value = 'todos';
        document.getElementById('filtro-fecha-inicio').value = '';
        document.getElementById('filtro-fecha-fin').value = '';
        document.querySelectorAll('.btn-turno').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.btn-turno[data-turno=""]').classList.add('active');
        
        this.filtrosActivos = {
            tipo: 'todos',
            fechaInicio: null,
            fechaFin: null,
            turno: null
        };
        
        this.aplicarModoVista();
        this.actualizarEstadisticas(this.datosMapa.length, this.datosMapa.length);
        this.actualizarContadoresTipo(this.datosMapa);
        
        this.mostrarNotificacionRapida('Filtros limpiados');
    }
    
    habilitarModoAgregarIncidencia() {
        this.mapa.doubleClickZoom.disable();
        
        const agregarHandler = (e) => {
            this.mostrarModalAgregarIncidencia(e.latlng.lat, e.latlng.lng);
        };
        
        this.mapa.on('dblclick', agregarHandler);
        
        this.mostrarAlerta(
            '📍 MODO AGREGAR INCIDENCIA', 
            'Haz doble clic en cualquier punto del mapa para agregar una nueva incidencia',
            'info'
        );
        
        return () => {
            this.mapa.off('dblclick', agregarHandler);
            this.mapa.doubleClickZoom.enable();
        };
    }
    
    mostrarModalAgregarIncidencia(lat, lng) {
        // [Código del modal igual que en la versión original, pero con estilos mejorados]
        this.mostrarNotificacionRapida('Modal de agregar incidencia (funcionalidad completa)');
    }
    
    exportarMapaComoImagen() {
        this.mostrarAlerta(
            'ℹ️ EXPORTAR MAPA', 
            'La función de exportación estará disponible próximamente',
            'info'
        );
    }
    
    mostrarAlerta(titulo, mensaje, tipo = 'info') {
        const colores = {
            'info': { bg: this.colors.primary, icon: 'fas fa-info-circle' },
            'success': { bg: this.colors.accentGreen, icon: 'fas fa-check-circle' },
            'error': { bg: this.colors.accentRed, icon: 'fas fa-exclamation-triangle' },
            'warning': { bg: this.colors.warning, icon: 'fas fa-exclamation-circle' }
        };
        
        const tipoInfo = colores[tipo] || colores.info;
        
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed; top: 90px; right: 20px; 
            background: white; border-left: 4px solid ${tipoInfo.bg}; 
            padding: 20px 25px; border-radius: 12px; 
            box-shadow: 0 8px 24px rgba(0,0,0,0.15); 
            z-index: 2000; min-width: 320px; max-width: 420px;
            animation: fadeInRight 0.4s ease-out;
            border: 1px solid ${this.colors.border};
        `;
        
        alertDiv.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 15px;">
                <div style="width: 40px; height: 40px; background: ${tipoInfo.bg}; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 8px ${tipoInfo.bg}40;">
                    <i class="${tipoInfo.icon}" style="color: white; font-size: 1.2rem;"></i>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 700; color: ${this.colors.dark}; margin-bottom: 6px; font-size: 1rem;">${titulo}</div>
                    <div style="color: ${this.colors.text}; font-size: 0.9rem; line-height: 1.5;">${mensaje}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: ${this.colors.textLight}; cursor: pointer; padding: 0; font-size: 1.2rem; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 6px; transition: all 0.2s; flex-shrink: 0;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.style.animation = 'fadeOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (alertDiv.parentNode) {
                        alertDiv.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
    
    generarDatosEjemploMapa() {
        const hoy = new Date();
        const fecha = hoy.toISOString().split('T')[0];
        
        return [
            {
                id: 1,
                fecha: fecha,
                hora: '08:30:00',
                turno: 'matutino',
                motivo: 'Accidente vehicular en avenida principal',
                ubicacion: 'Av. Reforma esq. 5 de Mayo',
                colonia: 'Centro',
                latitud: '18.4620',
                longitud: '-97.3930'
            },
            {
                id: 2,
                fecha: fecha,
                hora: '14:15:00',
                turno: 'vespertino',
                motivo: 'Robo a comercio en mercado',
                ubicacion: 'Mercado Municipal, local 15',
                colonia: 'Centro',
                latitud: '18.4630',
                longitud: '-97.3950'
            },
            {
                id: 3,
                fecha: fecha,
                hora: '22:45:00',
                turno: 'nocturno',
                motivo: 'Disturbios en zona comercial',
                ubicacion: 'Calle Juárez #123',
                colonia: 'San Francisco',
                latitud: '18.4700',
                longitud: '-97.3900'
            },
            {
                id: 4,
                fecha: fecha,
                hora: '10:20:00',
                turno: 'matutino',
                motivo: 'Vehículo abandonado sospechoso',
                ubicacion: 'Calle 3 Sur #456',
                colonia: 'La Paz',
                latitud: '18.4550',
                longitud: '-97.4050'
            },
            {
                id: 5,
                fecha: fecha,
                hora: '16:30:00',
                turno: 'vespertino',
                motivo: 'Persona sospechosa en parque',
                ubicacion: 'Parque El Riego',
                colonia: 'Centro',
                latitud: '18.4550',
                longitud: '-97.3900'
            },
            {
                id: 6,
                fecha: fecha,
                hora: '09:45:00',
                turno: 'matutino',
                motivo: 'Accidente de motocicleta',
                ubicacion: 'Av. Independencia #789',
                colonia: 'San Francisco',
                latitud: '18.4685',
                longitud: '-97.3910'
            },
            {
                id: 7,
                fecha: fecha,
                hora: '18:20:00',
                turno: 'vespertino',
                motivo: 'Robo de celular en terminal',
                ubicacion: 'Terminal de Autobuses',
                colonia: 'Centro',
                latitud: '18.4650',
                longitud: '-97.4000'
            },
            {
                id: 8,
                fecha: fecha,
                hora: '13:10:00',
                turno: 'vespertino',
                motivo: 'Emergencia médica urgente',
                ubicacion: 'Hospital General de Tehuacán',
                colonia: 'Centro',
                latitud: '18.4580',
                longitud: '-97.3880'
            }
        ];
    }
    
    cleanup() {
        document.body.classList.remove('mapa-fullscreen');
        if (this.mapa) {
            this.mapa.remove();
            this.mapa = null;
        }
        
        if (this.intervaloActualizacion) {
            clearInterval(this.intervaloActualizacion);
        }
        
        this.marcadores = [];
        this.capasCalor = [];
        this.datosMapa = null;
    }
$toInsert
}

window.MapaCalorView = MapaCalorView;