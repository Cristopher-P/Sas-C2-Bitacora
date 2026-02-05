/**
 * DASHBOARDVIEW.JS - Vista profesional completa para CERIT Tehuacán
 * Centro de Emergencia y Respuesta Inmediata
 * Versión 2.3.1 - Sistema SAS-C4
 */

class DashboardView {
    constructor(currentUser, appController) {
        this.currentUser = currentUser;
        this.appController = appController;
        this.data = [];
        this.filtrosActivos = {
            mes: null,
            turno: null,
            estado: null,
            busqueda: null
        };
        
        // Configuración de colores institucionales
        this.colors = {
            primary: '#003366',      // Azul policía principal
            secondary: '#0a4d8c',    // Azul más claro para hover
            accent: '#ff6b35',       // Naranja de alerta/acceso rápido
            accentGreen: '#28a745',  // Verde para éxito/operativo
            accentRed: '#dc3545',    // Rojo para emergencias
            light: '#f8f9fa',        // Fondo claro
            dark: '#212529',         // Texto oscuro
            gray: '#6c757d',         // Texto secundario
            border: '#dee2e6',       // Bordes
            warning: '#ffc107',      // Amarillo advertencia
            info: '#17a2b8'          // Azul información
        };
        
        // Configuración para expansión
        this.expandedContainer = null;
        this.originalContainer = null;
        this.horaActualizacion = null;
        this.intervaloActualizacion = null;
    }

    async render(container) {
        this.originalContainer = container; 
        
        // Crear contenedor expandido con fondo institucional
        this.expandedContainer = document.createElement('div');
        this.expandedContainer.className = 'dashboard-cerit-tehuacan view-bleed view-shell view-form';
        
        this.originalContainer.innerHTML = '';
        this.originalContainer.appendChild(this.expandedContainer);
        
        this.container = this.expandedContainer;
        this.container.innerHTML = this.getTemplate();
        this.bindEvents();
        
        await this.loadData();
        
        // Iniciar actualización automática de hora
        this.iniciarActualizacionHora();
    }

    getTemplate() {
        const now = new Date();
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = now.toLocaleDateString('es-MX', dateOptions);
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const formattedTime = now.toLocaleTimeString('es-MX', timeOptions);
        
        return `
            <div class="cerit-dashboard view-shell--xl">
                <!-- HEADER INSTITUCIONAL -->
                
                <!-- PANEL DE CONTROL PRINCIPAL -->
                <div class="dashboard-main-grid" style="display: grid; grid-template-columns: 1fr 320px; gap: 20px; margin-bottom: 12px; align-items: stretch;">
                    <!-- Tabla Principal -->
                    <div class="dashboard-table-column" style="display: flex; flex-direction: column;">
                        <!-- Encabezado de Tabla -->
                        <div style="background: white; border-radius: 10px 10px 0 0; padding: 20px; border: 1px solid ${this.colors.border}; border-bottom: 3px solid ${this.colors.primary}; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <h3 style="margin: 0; color: ${this.colors.primary}; font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-list-ul"></i>
                                    BITÁCORA DE OPERACIONES
                                </h3>
                                
                                <!-- Filtros Rápidos -->
                                <div style="display: flex; gap: 10px;">
                                    <div style="position: relative;">
                                        <input type="text" id="filtro-busqueda" 
                                               style="padding: 8px 12px 8px 35px; border: 2px solid ${this.colors.border}; border-radius: 6px; font-size: 0.9rem; width: 200px; transition: all 0.3s;"
                                               placeholder="Buscar por folio, ubicación..."
                                               onfocus="this.style.borderColor='${this.colors.primary}'; this.style.boxShadow='0 0 0 3px rgba(0, 51, 102, 0.1)'"
                                               onblur="this.style.borderColor='${this.colors.border}'; this.style.boxShadow='none'">
                                        <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: ${this.colors.gray};"></i>
                                    </div>
                                    
                                    <select id="filtro-estado" 
                                            style="padding: 8px 12px; border: 2px solid ${this.colors.border}; border-radius: 6px; font-size: 0.9rem; background: white; min-width: 150px; transition: all 0.3s;"
                                            onfocus="this.style.borderColor='${this.colors.primary}'; this.style.boxShadow='0 0 0 3px rgba(0, 51, 102, 0.1)'"
                                            onblur="this.style.borderColor='${this.colors.border}'; this.style.boxShadow='none'">
                                        <option value="">Todos los estados</option>
                                        <option value="registrado">Registrado</option>
                                        <option value="seguimiento">En Seguimiento</option>
                                        <option value="concluido">Concluido</option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Filtros Detallados -->
                            <div id="filtros-detallados" style="margin-top: 15px; display: none;">
                                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                                    <div>
                                        <label style="display: block; color: ${this.colors.gray}; font-size: 0.8rem; margin-bottom: 3px; font-weight: 600;">MES</label>
                                        <select id="filtro-mes" 
                                                style="padding: 8px 12px; border: 2px solid ${this.colors.border}; border-radius: 6px; font-size: 0.9rem; background: white; min-width: 180px;"
                                                onfocus="this.style.borderColor='${this.colors.primary}'; this.style.boxShadow='0 0 0 3px rgba(0, 51, 102, 0.1)'"
                                                onblur="this.style.borderColor='${this.colors.border}'; this.style.boxShadow='none'">
                                            <option value="">Todos los meses</option>
                                            ${this.generarOpcionesMeses()}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label style="display: block; color: ${this.colors.gray}; font-size: 0.8rem; margin-bottom: 3px; font-weight: 600;">TURNO</label>
                                        <select id="filtro-turno" 
                                                style="padding: 8px 12px; border: 2px solid ${this.colors.border}; border-radius: 6px; font-size: 0.9rem; background: white; min-width: 150px;"
                                                onfocus="this.style.borderColor='${this.colors.primary}'; this.style.boxShadow='0 0 0 3px rgba(0, 51, 102, 0.1)'"
                                                onblur="this.style.borderColor='${this.colors.border}'; this.style.boxShadow='none'">
                                            <option value="">Todos los turnos</option>
                                            <option value="matutino">Matutino</option>
                                            <option value="vespertino">Vespertino</option>
                                            <option value="nocturno">Nocturno</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label style="display: block; color: ${this.colors.gray}; font-size: 0.8rem; margin-bottom: 3px; font-weight: 600;">FECHA</label>
                                        <input type="date" id="filtro-fecha"
                                               style="padding: 8px 12px; border: 2px solid ${this.colors.border}; border-radius: 6px; font-size: 0.9rem; background: white; min-width: 150px;"
                                               onfocus="this.style.borderColor='${this.colors.primary}'; this.style.boxShadow='0 0 0 3px rgba(0, 51, 102, 0.1)'"
                                               onblur="this.style.borderColor='${this.colors.border}'; this.style.boxShadow='none'">
                                    </div>
                                    
                                    <div style="display: flex; gap: 5px; align-self: flex-end;">
                                        <button id="btn-aplicar-filtros" 
                                                style="padding: 8px 15px; background: ${this.colors.primary}; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; transition: all 0.2s;}"
                                                onmouseover="this.style.background='${this.colors.secondary}'"
                                                onmouseout="this.style.background='${this.colors.primary}'">
                                            <i class="fas fa-check"></i> Aplicar
                                        </button>
                                        
                                        <button id="btn-limpiar-filtros" 
                                                style="padding: 8px 15px; background: white; color: ${this.colors.gray}; border: 1px solid ${this.colors.border}; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; transition: all 0.2s;}"
                                                onmouseover="this.style.background='${this.colors.light}'; this.style.color='${this.colors.dark}'"
                                                onmouseout="this.style.background='white'; this.style.color='${this.colors.gray}'">
                                            <i class="fas fa-times"></i> Limpiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Controles de Vista -->
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                                <div id="contador-registros" style="color: ${this.colors.gray}; font-size: 0.85rem; display: flex; align-items: center; gap: 5px;">
                                    <i class="fas fa-database"></i>
                                    <span>Mostrando <span id="registros-mostrados">0</span> de <span id="registros-totales">0</span> registros</span>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button id="btn-toggle-filtros" 
                                            style="padding: 6px 12px; background: white; color: ${this.colors.primary}; border: 1px solid ${this.colors.primary}; border-radius: 4px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s;}"
                                            onmouseover="this.style.background='${this.colors.primary}'; this.style.color='white'"
                                            onmouseout="this.style.background='white'; this.style.color='${this.colors.primary}'">
                                        <i class="fas fa-filter"></i> Más filtros
                                    </button>
                                    <button id="btn-exportar-excel" 
                                            style="padding: 6px 12px; background: ${this.colors.accentGreen}; color: white; border: none; border-radius: 4px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s;}"
                                            onmouseover="this.style.background='#218838'; this.style.transform='translateY(-1px)'"
                                            onmouseout="this.style.background='${this.colors.accentGreen}'; this.style.transform='translateY(0)'">
                                        <i class="fas fa-file-excel"></i> Exportar
                                    </button>
                                    <button id="btn-imprimir" 
                                            style="padding: 6px 12px; background: ${this.colors.info}; color: white; border: none; border-radius: 4px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.2s;}"
                                            onmouseover="this.style.background='#138496'; this.style.transform='translateY(-1px)'"
                                            onmouseout="this.style.background='${this.colors.info}'; this.style.transform='translateY(0)'">
                                        <i class="fas fa-print"></i> Imprimir
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tabla de Datos -->
                        <div id="tabla-llamadas-container" class="dashboard-table-container"
                             style="background: white; border-radius: 0 0 10px 10px; border: 1px solid ${this.colors.border}; border-top: none; flex: 1; min-height: 520px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                            <div style="padding: 50px; text-align: center; color: ${this.colors.gray};">
                                <div style="width: 50px; height: 50px; border: 3px solid ${this.colors.border}; border-top-color: ${this.colors.primary}; border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite;"></div>
                                <h4 style="color: ${this.colors.dark}; margin-bottom: 10px;">Cargando bitácora de operaciones</h4>
                                <p>Obteniendo información del servidor...</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Panel Lateral - Accesos Rápidos y Estadísticas Pequeñas -->
                    <div>
                        <!-- Accesos Rápidos -->
                        <div style="background: white; border-radius: 10px; padding: 20px; border: 1px solid ${this.colors.border}; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                            <h4 style="color: ${this.colors.primary}; font-size: 1rem; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-bolt"></i>
                                ACCESOS RÁPIDOS
                            </h4>
                            
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                <button id="btn-reporte-mensual" 
                                        style="padding: 12px; background: linear-gradient(135deg, ${this.colors.secondary} 0%, ${this.colors.primary} 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; text-align: left; display: flex; align-items: center; gap: 10px;"
                                        onmouseover="this.style.transform='translateX(5px)'; this.style.boxShadow='0 4px 8px rgba(0, 51, 102, 0.2)'"
                                        onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='none'">
                                    <i class="fas fa-file-alt" style="font-size: 1.2rem;"></i>
                                    <div>
                                        <div>Reporte Mensual</div>
                                        <div style="font-size: 0.8rem; opacity: 0.9;">Generar PDF</div>
                                    </div>
                                </button>
                                
                                <button id="btn-mapa-calor" 
                                        style="padding: 12px; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; text-align: left; display: flex; align-items: center; gap: 10px;"
                                        onmouseover="this.style.transform='translateX(5px)'; this.style.boxShadow='0 4px 8px rgba(231, 76, 60, 0.2)'"
                                        onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='none'">
                                    <i class="fas fa-map-marked-alt" style="font-size: 1.2rem;"></i>
                                    <div>
                                        <div>Mapa de Calor</div>
                                        <div style="font-size: 0.8rem; opacity: 0.9;">Incidencias</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Estadísticas del Día Pequeñas -->
                        <div style="background: white; border-radius: 10px; padding: 20px; border: 1px solid ${this.colors.border}; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                            <h4 style="color: ${this.colors.primary}; font-size: 1rem; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-chart-line"></i>
                                ESTADÍSTICAS DEL DÍA
                            </h4>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                                <!-- Total del Día -->
                                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; border-left: 3px solid ${this.colors.primary};">
                                    <div style="color: ${this.colors.gray}; font-size: 0.7rem; font-weight: 600; margin-bottom: 3px;">TOTAL HOY</div>
                                    <div id="stat-total-pequeno" style="font-size: 1.5rem; font-weight: 800; color: ${this.colors.primary};">0</div>
                                </div>
                                
                                <!-- Pendientes -->
                                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; border-left: 3px solid #ff6b35;">
                                    <div style="color: ${this.colors.gray}; font-size: 0.7rem; font-weight: 600; margin-bottom: 3px;">PENDIENTES</div>
                                    <div id="stat-pendientes-pequeno" style="font-size: 1.5rem; font-weight: 800; color: #ff6b35;">0</div>
                                </div>
                            </div>
                            
                            <!-- Estadísticas por Turno -->
                            <div style="border-top: 1px solid ${this.colors.border}; padding-top: 15px;">
                                <div style="color: ${this.colors.gray}; font-size: 0.8rem; font-weight: 600; margin-bottom: 10px;">POR TURNO</div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="font-size: 0.8rem; color: ${this.colors.dark};">Matutino</span>
                                        <span id="stat-matutino-pequeno" style="font-weight: 700; color: #b8860b;">0</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="font-size: 0.8rem; color: ${this.colors.dark};">Vespertino</span>
                                        <span id="stat-vespertino-pequeno" style="font-weight: 700; color: #c0392b;">0</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="font-size: 0.8rem; color: ${this.colors.dark};">Nocturno</span>
                                        <span id="stat-nocturno-pequeno" style="font-weight: 700; color: #1b6d6b;">0</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Estadísticas del Mes -->
<div id="estadisticas-mes" style="background: white; border-radius: 10px; padding: 20px; border: 1px solid ${this.colors.border}; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <h4 style="color: ${this.colors.primary}; font-size: 1rem; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-calendar-alt"></i>
        ESTADÍSTICAS DEL MES
    </h4>
    <div id="estadisticas-mes-contenido" style="color: ${this.colors.gray}; text-align: center; padding: 20px;">
        <i class="fas fa-chart-bar fa-2x" style="margin-bottom: 10px; color: ${this.colors.border};"></i>
        <p>Selecciona un mes para ver estadísticas</p>
    </div>
</div>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes pulse-green {
                    0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); }
                    70% { box-shadow: 0 0 0 6px rgba(40, 167, 69, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
                }
                
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
                }
                
                .btn-emergencia-pulse {
                    animation: pulse-red 2s infinite;
                }
                
                .fade-in {
                    animation: fadeIn 0.5s ease-in;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .stat-update {
                    animation: statUpdate 0.5s ease-out;
                }
                
                @keyframes statUpdate {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
            </style>
        `;
    }
    
    generarOpcionesMeses() {
        const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
                      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
        const añoActual = new Date().getFullYear();
        let options = '';
        
        // Últimos 6 meses
        for (let i = 5; i >= 0; i--) {
            const fecha = new Date();
            fecha.setMonth(fecha.getMonth() - i);
            const año = fecha.getFullYear();
            const mes = fecha.getMonth() + 1;
            const valor = `${año}-${String(mes).padStart(2, '0')}`;
            const texto = `${meses[mes - 1]} ${año}`;
            options += `<option value="${valor}">${texto}</option>`;
        }
        
        return options;
    }
    
    cleanup() {
        if (this.expandedContainer && this.expandedContainer.parentNode) {
            this.expandedContainer.parentNode.removeChild(this.expandedContainer);
        }
        
        if (this.originalContainer) {
            this.originalContainer.innerHTML = '';
        }
        
        // Limpiar intervalos
        if (this.intervaloActualizacion) {
            clearInterval(this.intervaloActualizacion);
        }
        
        this.expandedContainer = null;
        this.originalContainer = null;
        this.container = this.originalContainer;
    }
    
    bindEvents() {
        // Botón nueva llamada
        const btnNueva = this.container.querySelector('#btn-nueva-llamada');
        if (btnNueva) {
            btnNueva.addEventListener('click', () => {
                this.appController.loadView('llamadas');
            });
        }
        
        // Botón emergencia
        const btnEmergencia = this.container.querySelector('#btn-emergencia');
        if (btnEmergencia) {
            btnEmergencia.addEventListener('click', () => {
                this.iniciarEmergencia();
            });
        }
        
        // Botón actualizar
        const btnActualizar = this.container.querySelector('#btn-actualizar');
        if (btnActualizar) {
            btnActualizar.addEventListener('click', () => {
                this.recargarDatosForzados();
            });
        }
        
        // Botón exportar
        const btnExportar = this.container.querySelector('#btn-exportar-excel');
        if (btnExportar) {
            btnExportar.addEventListener('click', () => {
                this.exportarAExcel();
            });
        }
        
        // Botón imprimir
        const btnImprimir = this.container.querySelector('#btn-imprimir');
        if (btnImprimir) {
            btnImprimir.addEventListener('click', () => {
                this.imprimirReporte();
            });
        }
        
        // Botón reporte mensual
        const btnReporteMensual = this.container.querySelector('#btn-reporte-mensual');
        if (btnReporteMensual) {
            btnReporteMensual.addEventListener('click', () => {
                this.generarReporteMensual();
            });
        }
        
        // Botón mapa calor
        const btnMapaCalor = this.container.querySelector('#btn-mapa-calor');
        if (btnMapaCalor) {
            btnMapaCalor.addEventListener('click', () => {
                this.mostrarMapaCalor();
            });
        }
        
        // Toggle filtros
        const btnToggleFiltros = this.container.querySelector('#btn-toggle-filtros');
        if (btnToggleFiltros) {
            btnToggleFiltros.addEventListener('click', () => {
                this.toggleFiltrosDetallados();
            });
        }
        
        // Filtros
        const filtroBusqueda = this.container.querySelector('#filtro-busqueda');
        const filtroEstado = this.container.querySelector('#filtro-estado');
        const filtroMes = this.container.querySelector('#filtro-mes');
        const filtroTurno = this.container.querySelector('#filtro-turno');
        const filtroFecha = this.container.querySelector('#filtro-fecha');
        
        // Filtro búsqueda con debounce
        if (filtroBusqueda) {
            let timeout;
            filtroBusqueda.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.filtrosActivos.busqueda = filtroBusqueda.value || null;
                    this.aplicarFiltros();
                }, 300);
            });
        }
        
        if (filtroEstado) {
            filtroEstado.addEventListener('change', () => {
                this.filtrosActivos.estado = filtroEstado.value || null;
                this.aplicarFiltros();
            });
        }
        
        if (filtroMes) {
            filtroMes.addEventListener('change', () => {
                this.filtrosActivos.mes = filtroMes.value || null;
                this.aplicarFiltros();
                this.mostrarEstadisticasMes(filtroMes.value);
            });
        }
        
        if (filtroTurno) {
            filtroTurno.addEventListener('change', () => {
                this.filtrosActivos.turno = filtroTurno.value || null;
                this.aplicarFiltros();
            });
        }
        
        if (filtroFecha) {
            filtroFecha.addEventListener('change', () => {
                this.filtrosActivos.fecha = filtroFecha.value || null;
                this.aplicarFiltros();
            });
        }
        
        // Botón aplicar filtros
        const btnAplicarFiltros = this.container.querySelector('#btn-aplicar-filtros');
        if (btnAplicarFiltros) {
            btnAplicarFiltros.addEventListener('click', () => {
                this.aplicarFiltros();
            });
        }
        
        // Botón limpiar filtros
        const btnLimpiarFiltros = this.container.querySelector('#btn-limpiar-filtros');
        if (btnLimpiarFiltros) {
            btnLimpiarFiltros.addEventListener('click', () => {
                this.limpiarFiltros();
            });
        }
    }
    
    async loadData() {
        try {
            // Actualizar hora
            this.actualizarHora();
            
            // Actualizar última actualización
            this.actualizarUltimaActualizacion();
            
            // Cargar tabla
            await this.fetchAndRenderTable();
            
            // Mostrar estadísticas iniciales
            this.calcularEstadisticasDesdeDatos();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.mostrarAlerta('⚠️ ERROR', 'Error cargando datos del dashboard', 'error');
        }
    }
    
    iniciarActualizacionHora() {
        // Actualizar reloj cada segundo
        this.intervaloActualizacion = setInterval(() => {
            this.actualizarHora();
        }, 1000);
    }
    
    actualizarHora() {
        const ahora = new Date();
        const horaStr = ahora.toLocaleTimeString('es-MX', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        
        const reloj = this.container.querySelector('#reloj-institucional');
        if (reloj) {
            reloj.textContent = horaStr;
        }
        
        // Actualizar cada minuto para estadísticas
        if (!this.horaActualizacion || ahora.getMinutes() !== this.horaActualizacion.getMinutes()) {
            this.horaActualizacion = ahora;
            this.actualizarEstadisticasTiempoReal();
        }
    }
    
    actualizarUltimaActualizacion() {
        const ahora = new Date();
        const horaStr = ahora.toLocaleTimeString('es-MX', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        
        const elemento = this.container.querySelector('#ultima-actualizacion');
        if (elemento) {
            elemento.textContent = `Última actualización: ${horaStr}`;
        }
    }

    obtenerContenedorTabla() {
        return (this.container && this.container.querySelector('#tabla-llamadas-container')) ||
            document.getElementById('tabla-llamadas-container');
    }

    normalizarFecha(fecha) {
        if (!fecha) return null;
        if (fecha instanceof Date) {
            if (isNaN(fecha)) return null;
            const año = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const dia = String(fecha.getDate()).padStart(2, '0');
            return `${año}-${mes}-${dia}`;
        }
        if (typeof fecha === 'string') {
            if (fecha.includes('T')) {
                return fecha.substring(0, 10);
            }
            if (/^\d{4}-\d{2}-\d{2}/.test(fecha)) {
                return fecha.substring(0, 10);
            }
            return fecha;
        }
        return null;
    }

    normalizarHora(hora) {
        if (!hora) return null;
        if (hora instanceof Date) {
            if (isNaN(hora)) return null;
            const hh = String(hora.getHours()).padStart(2, '0');
            const mm = String(hora.getMinutes()).padStart(2, '0');
            return `${hh}:${mm}`;
        }
        if (typeof hora === 'string') {
            return hora.substring(0, 5);
        }
        return null;
    }

    obtenerTimestamp(item) {
        const fechaStr = this.normalizarFecha(item?.fecha);
        const horaStr = this.normalizarHora(item?.hora) || '00:00';
        if (!fechaStr) return 0;
        const fechaHora = new Date(`${fechaStr}T${horaStr}`);
        return isNaN(fechaHora) ? 0 : fechaHora.getTime();
    }
    
    async fetchAndRenderTable() {
        const container = this.obtenerContenedorTabla();
        if (!container) {
            console.error('No se encontró el contenedor de la tabla de llamadas.');
            return;
        }
        
        try {
            let llamadas = [];
            
            if (typeof LlamadasService !== 'undefined') {
                const response = await LlamadasService.obtenerLlamadas({ include_all: '1' });
                
                if (response) {
                    window._lastTotalDb = response.total_db;
                }
                
                if (response && response.success) {
                    llamadas = response.data || [];
                } else {
                    console.warn("Respuesta no exitosa del servicio:", response);
                    // No usar datos de ejemplo si hay un error del backend
                    this.data = [];
                    this.renderizarTabla();
                    this.actualizarContadorRegistros(0);
                    return;
                }
            } else {
                console.warn("LlamadasService no está definido");
            }

            // Si no hay datos del servicio, no mostrar registros
            if (llamadas.length === 0) {
                // Sin registros
            }

            this.data = llamadas;
            
            // Renderizar tabla
            this.renderizarTabla();
            
            // Actualizar contador
            this.actualizarContadorRegistros();
            
        } catch (error) {
            console.error("Error crítico al cargar datos:", error);
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 3rem; color: ${this.colors.accentRed}; margin-bottom: 15px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 style="color: ${this.colors.accentRed}; margin-bottom: 10px;">Error al cargar datos</h3>
                    <p style="color: ${this.colors.gray}; margin-bottom: 20px;">${error.message}</p>
                    <button onclick="location.reload()" 
                            style="padding: 8px 20px; background: ${this.colors.primary}; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
                            onmouseover="this.style.background='${this.colors.secondary}'"
                            onmouseout="this.style.background='${this.colors.primary}'">
                        <i class="fas fa-redo"></i> Recargar Página
                    </button>
                </div>
            `;
        }
    }
    
    renderizarTabla() {
        const container = this.obtenerContenedorTabla();
        if (!container) {
            console.error('No se encontró el contenedor de la tabla de llamadas.');
            return;
        }
        
        console.log("=== RENDERIZANDO TABLA CERIT ===");
        console.log("Total de datos:", this.data.length);
        
        if (this.data.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="width: 80px; height: 80px; background: ${this.colors.light}; border: 3px solid ${this.colors.border}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: ${this.colors.gray};">
                        <i class="fas fa-inbox fa-2x"></i>
                    </div>
                    <h4 style="color: ${this.colors.dark}; margin-bottom: 10px;">No hay registros</h4>
                    <p style="color: ${this.colors.gray}; margin-bottom: 20px;">No se encontraron llamadas con los filtros aplicados.</p>
                    <button id="btn-crear-primero" 
                            style="padding: 10px 25px; background: ${this.colors.primary}; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.3s;"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(0, 51, 102, 0.2)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <i class="fas fa-plus-circle"></i> Crear Primer Reporte
                    </button>
                </div>
            `;
            
            document.getElementById('btn-crear-primero')?.addEventListener('click', () => {
                this.appController.loadView('llamadas');
            });
            
            return;
        }
        
        // Aplicar filtros
        let llamadasFiltradas = this.aplicarFiltrosADatos(this.data);
        
        // Ordenar por fecha y hora descendente
        llamadasFiltradas.sort((a, b) => {
            return this.obtenerTimestamp(b) - this.obtenerTimestamp(a);
        });
        
        // Crear tabla
        const tableId = 'tabla-llamadas-cerit';
        container.innerHTML = `
            <style>
                #${tableId} {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.85rem;
                }
                
                #${tableId} thead {
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                
                #${tableId} th {
                    background: ${this.colors.primary};
                    color: white;
                    padding: 12px 8px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.8rem;
                    border-right: 1px solid rgba(255,255,255,0.1);
                    white-space: nowrap;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                #${tableId} td {
                    padding: 10px 8px;
                    border-bottom: 1px solid ${this.colors.border};
                    vertical-align: middle;
                    line-height: 1.4;
                    background: white;
                }
                
                #${tableId} tbody tr:nth-child(even) {
                    background: ${this.colors.light};
                }
                
                #${tableId} tbody tr:hover {
                    background: #e3f2fd !important;
                    cursor: pointer;
                }
                
                .badge-estado {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    display: inline-block;
                    min-width: 80px;
                    text-align: center;
                    text-transform: uppercase;
                }
                
                .btn-accion-tabla {
                    padding: 4px 8px;
                    border-radius: 4px;
                    border: none;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin: 2px;
                    font-size: 0.75rem;
                    transition: all 0.2s;
                }
                
                .btn-accion-tabla:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                
                .btn-detalles {
                    background: ${this.colors.primary};
                    color: white;
                }
                
                .scroll-container {
                    height: 100%;
                    min-height: 0;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: ${this.colors.primary} ${this.colors.border};
                }
                
                .scroll-container::-webkit-scrollbar {
                    width: 8px;
                }
                
                .scroll-container::-webkit-scrollbar-track {
                    background: ${this.colors.light};
                }
                
                .scroll-container::-webkit-scrollbar-thumb {
                    background-color: ${this.colors.primary};
                    border-radius: 4px;
                }
            </style>
            
            <div class="scroll-container">
                <table id="${tableId}">
<thead>
    <tr>
        <th style="width: 100px;">ID</th>
        <th style="width: 80px;">FECHA</th>
        <th style="width: 70px;">HORA</th>
        <th style="width: 80px;">TURNO</th>
        <th style="width: 100px;">PROCEDENCIA</th>
        <th style="width: 100px;">GRUPO</th>
        <th style="width: 110px;">CÓDIGO</th>
        <th style="width: 180px;">DESCRIPCIÓN</th>
        <th style="width: 160px;">RAZONAMIENTO</th>
        <th style="width: 120px;">VEHÍCULO</th>
        <th style="width: 150px;">MOTIVO</th>
        <th style="width: 150px;">UBICACIÓN</th>
        <th style="width: 120px;">COLONIA</th>
        <th style="width: 120px;">TELÉFONO</th>
        <th style="width: 100px;">ESTADO</th>
        <th style="width: 80px;">ACCIONES</th>
    </tr>
</thead>
                    <tbody>
                        ${llamadasFiltradas.map((llamada, index) => this.getFilaTablaCERIT(llamada, index)).join("")}
                    </tbody>
                </table>
            </div>
        `;
        
        this.bindTableEvents();
        this.actualizarContadorRegistros(llamadasFiltradas.length);
    }
    
    getFilaTablaCERIT(llamada, index) {
        llamada = (llamada && typeof llamada === 'object') ? llamada : {};
        const fechaStr = this.normalizarFecha(llamada.fecha);
        const horaStr = this.normalizarHora(llamada.hora);
        const fechaHora = fechaStr ? new Date(`${fechaStr}T${horaStr || '00:00'}`) : null;

        const renderValor = (valor) => {
            if (!valor || valor === '--') {
                return `<span style="display:inline-block; padding:2px 6px; background:${this.colors.light}; color:${this.colors.gray}; border:1px solid ${this.colors.border}; border-radius:4px; font-size:0.7rem; font-weight:600;">SIN INFORMACIÓN</span>`;
            }
            return valor;
        };

        // Generar ID en formato 2001260812 (día/mes/año-hora-minuto)
        const idFormateado = (fechaHora && !isNaN(fechaHora))
            ? `${String(fechaHora.getDate()).padStart(2, '0')}${String(fechaHora.getMonth() + 1).padStart(2, '0')}${String(fechaHora.getFullYear()).slice(-2)}${String(fechaHora.getHours()).padStart(2, '0')}${String(fechaHora.getMinutes()).padStart(2, '0')}`
            : '--';
        
        // Determinar estado
        let estadoColor = this.colors.gray;
        let estadoTexto = 'REGISTRADO';
        let estadoIcon = 'fas fa-file-alt';
        
        if (llamada.conclusion) {
            estadoColor = this.colors.accentGreen;
            estadoTexto = 'CONCLUIDO';
            estadoIcon = 'fas fa-check-circle';
        } else if (llamada.seguimiento && llamada.seguimiento !== 'Sin seguimiento') {
            estadoColor = this.colors.accent;
            estadoTexto = 'SEGUIMIENTO';
            estadoIcon = 'fas fa-exclamation-circle';
        }
        
        // Colores para turno
        let turnoColor = this.colors.gray;
        let turnoTexto = llamada.turno ? llamada.turno.toUpperCase() : 'NO ASIG.';
        let turnoIcon = 'fas fa-clock';
        
        if (llamada.turno && llamada.turno.toLowerCase() === 'matutino') {
            turnoColor = '#f6d365';
            turnoIcon = 'fas fa-sun';
        } else if (llamada.turno && llamada.turno.toLowerCase() === 'vespertino') {
            turnoColor = '#ff6b6b';
            turnoIcon = 'fas fa-clock';
        } else if (llamada.turno && llamada.turno.toLowerCase() === 'nocturno') {
            turnoColor = '#4ecdc4';
            turnoIcon = 'fas fa-moon';
        }
        
        const hora = horaStr || '--:--';
        const fecha = fechaStr ? `${fechaStr.substring(8, 10)}/${fechaStr.substring(5, 7)}` : '--/--';
        
        const procedencia = llamada.procedencia || llamada.motivo_radio_operacion || '--';
        const grupo = llamada.grupo_tipo || llamada.agente || llamada.peticionario || '--';
        const codigo = llamada.codigo_procedimiento || llamada.folio_sistema || llamada.folio_c5 || '--';
        const descripcionBase = llamada.descripcion_detallada || llamada.razonamiento || '--';
        const razonamientoBase = llamada.razonamiento || '--';
        const vehiculoBase = llamada.vehiculo || '--';
        const telefono = llamada.numero_telefono || llamada.telefono_agente || llamada.numero_whatsapp || '--';
        const motivoBase = llamada.motivo || llamada.descripcion_detallada || llamada.razonamiento || '--';
        const ubicacionBase = llamada.ubicacion || '--';
        const coloniaBase = llamada.colonia || '--';

        // Acortar textos
        const motivoCorto = motivoBase && motivoBase.length > 25 ? 
            motivoBase.substring(0, 25) + '...' : motivoBase || '--';
        
        const ubicacionCorta = ubicacionBase && ubicacionBase.length > 20 ? 
            ubicacionBase.substring(0, 20) + '...' : ubicacionBase || '--';

        const descripcionCorta = descripcionBase && descripcionBase.length > 30 ?
            descripcionBase.substring(0, 30) + '...' : descripcionBase || '--';

        const razonamientoCorto = razonamientoBase && razonamientoBase.length > 25 ?
            razonamientoBase.substring(0, 25) + '...' : razonamientoBase || '--';
        
        const reportanteCorto = llamada.peticionario && llamada.peticionario.length > 15 ? 
            llamada.peticionario.substring(0, 15) + '...' : llamada.peticionario || '--';
        
        return `
    <tr data-id="${llamada.id || index}" 
        data-folio="${llamada.folio_sistema || ''}"
        onclick="this.querySelector('.btn-detalles').click()">
        <td style="font-family: 'Courier New', monospace; font-weight: 700; color: ${this.colors.primary};">
            ${idFormateado}
        </td>
        <td style="color: ${this.colors.dark}; font-weight: 600; font-family: monospace;">
            ${fecha}
        </td>
        <td style="color: ${this.colors.dark}; font-weight: 600; font-family: monospace;">
            ${hora}
        </td>
        <td>
            <div style="display: flex; align-items: center; gap: 5px; color: ${turnoColor};">
                <i class="${turnoIcon}" style="font-size: 0.9rem;"></i>
                <span style="font-weight: 600; font-size: 0.8rem;">${turnoTexto}</span>
            </div>
        </td>
        <td style="font-size: 0.8rem;" title="${procedencia}">
            ${procedencia}
        </td>
        <td style="font-size: 0.8rem;">
            ${renderValor(grupo)}
        </td>
        <td style="font-family: monospace; font-size: 0.8rem;">
            ${renderValor(codigo)}
        </td>
        <td title="${descripcionBase}">
            <div style="font-size: 0.8rem; color: ${this.colors.dark};">
                ${renderValor(descripcionCorta)}
            </div>
        </td>
        <td title="${razonamientoBase}">
            <div style="font-size: 0.8rem; color: ${this.colors.dark};">
                ${renderValor(razonamientoCorto)}
            </div>
        </td>
        <td style="font-size: 0.8rem;">
            ${renderValor(vehiculoBase)}
        </td>
        <td title="${motivoBase || ''}\n${llamada.descripcion_detallada || ''}">
            <div style="font-weight: 600; color: ${this.colors.dark}; font-size: 0.85rem;">${motivoCorto}</div>
        </td>
        <td title="${ubicacionBase || ''}">
            <div style="font-size: 0.85rem; color: ${this.colors.dark};">
                <i class="fas fa-map-marker-alt" style="color: ${this.colors.accentRed}; margin-right: 3px;"></i>
                ${renderValor(ubicacionCorta)}
            </div>
        </td>
        <td style="font-size: 0.8rem;">
            ${renderValor(coloniaBase)}
        </td>
        <td style="font-size: 0.8rem; font-family: monospace;">
            ${renderValor(telefono)}
        </td>
        <td>
            <div class="badge-estado" style="background: ${estadoColor}; color: white;">
                <i class="${estadoIcon}" style="margin-right: 3px;"></i>
                ${estadoTexto}
            </div>
        </td>
        <td style="white-space: nowrap;">
            <button class="btn-accion-tabla btn-detalles" 
                    data-action="ver" 
                    data-id="${llamada.id || index}"
                    title="Ver detalles completos">
                <i class="fas fa-eye"></i> Ver
            </button>
        </td>
    </tr>
`;
    }
    
    formatearFolioCERIT(folio) {
        if (!folio) return '--';
        
        // Si el folio es formato SAS-YYYYMMDD-NNN
        if (folio.startsWith('SAS-')) {
            try {
                const partes = folio.split('-');
                if (partes.length >= 3) {
                    const fechaCompleta = partes[1]; // 20260126
                    const numeroSecuencia = partes[2]; // 001
                    
                    if (fechaCompleta.length === 8) {
                        const añoCorto = fechaCompleta.substring(2, 4); // 26
                        const mes = fechaCompleta.substring(4, 6); // 01
                        const dia = fechaCompleta.substring(6, 8); // 26
                        
                        return `${dia}/${mes}/${añoCorto}-${numeroSecuencia}`;
                    }
                }
            } catch (e) {
                console.error("Error formateando folio SAS:", e);
            }
        }
        
        // Si ya está en formato numérico
        if (/^\d+$/.test(folio)) {
            if (folio.length >= 10) {
                const dia = folio.substring(0, 2);
                const mes = folio.substring(2, 4);
                const año = folio.substring(4, 6);
                const secuencia = folio.substring(6, 10);
                return `${dia}/${mes}/${año}-${secuencia}`;
            }
            return folio;
        }
        
        return folio;
    }
    
    bindTableEvents() {
        // Botones Ver Detalles
        this.container.querySelectorAll('.btn-detalles').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = e.target.closest('button').dataset.id;
                this.verDetallesCompletos(id);
            });
        });
    }
    
    aplicarFiltrosADatos(datos) {
        let filtrados = [...datos];
        
        // Filtro por mes
        if (this.filtrosActivos.mes) {
            const [año, mes] = this.filtrosActivos.mes.split('-');
            filtrados = filtrados.filter(item => {
                if (!item.fecha) return false;
                try {
                    const fechaNormalizada = this.normalizarFecha(item.fecha);
                    const fechaItem = new Date(fechaNormalizada || item.fecha);
                    const añoItem = fechaItem.getFullYear();
                    const mesItem = fechaItem.getMonth() + 1;
                    return añoItem == año && mesItem == mes;
                } catch (e) {
                    return false;
                }
            });
        }
        
        // Filtro por fecha específica
        if (this.filtrosActivos.fecha) {
            filtrados = filtrados.filter(item => {
                if (!item.fecha) return false;
                const fechaNormalizada = this.normalizarFecha(item.fecha);
                return fechaNormalizada === this.filtrosActivos.fecha;
            });
        }
        
        // Filtro por turno
        if (this.filtrosActivos.turno) {
            filtrados = filtrados.filter(item => {
                if (!item.turno) return false;
                return item.turno.toLowerCase() === this.filtrosActivos.turno.toLowerCase();
            });
        }
        
        // Filtro por estado
        if (this.filtrosActivos.estado) {
            if (this.filtrosActivos.estado === 'seguimiento') {
                filtrados = filtrados.filter(item => item.seguimiento);
            } else if (this.filtrosActivos.estado === 'concluido') {
                filtrados = filtrados.filter(item => item.conclusion);
            } else if (this.filtrosActivos.estado === 'registrado') {
                filtrados = filtrados.filter(item => !item.seguimiento && !item.conclusion);
            }
        }
        
        // Filtro por búsqueda
        if (this.filtrosActivos.busqueda) {
            const busqueda = this.filtrosActivos.busqueda.toLowerCase();
            filtrados = filtrados.filter(item => 
                (item.folio_sistema && item.folio_sistema.toLowerCase().includes(busqueda)) ||
                (item.motivo && item.motivo.toLowerCase().includes(busqueda)) ||
                (item.colonia && item.colonia.toLowerCase().includes(busqueda)) ||
                (item.ubicacion && item.ubicacion.toLowerCase().includes(busqueda)) ||
                (item.peticionario && item.peticionario.toLowerCase().includes(busqueda)) ||
                (item.descripcion_detallada && item.descripcion_detallada.toLowerCase().includes(busqueda))
            );
        }
        
        return filtrados;
    }
    
    aplicarFiltros() {
        this.renderizarTabla();
        this.mostrarInfoFiltros();
    }
    
    limpiarFiltros() {
        // Resetear filtros
        this.filtrosActivos = {
            mes: null,
            turno: null,
            estado: null,
            busqueda: null,
            fecha: null
        };
        
        // Resetear inputs
        const filtroBusqueda = this.container.querySelector('#filtro-busqueda');
        const filtroEstado = this.container.querySelector('#filtro-estado');
        const filtroMes = this.container.querySelector('#filtro-mes');
        const filtroTurno = this.container.querySelector('#filtro-turno');
        const filtroFecha = this.container.querySelector('#filtro-fecha');
        
        if (filtroBusqueda) filtroBusqueda.value = '';
        if (filtroEstado) filtroEstado.value = '';
        if (filtroMes) filtroMes.value = '';
        if (filtroTurno) filtroTurno.value = '';
        if (filtroFecha) filtroFecha.value = '';
        
        
        this.renderizarTabla();
        this.mostrarInfoFiltros();
        const estadisticasMes = this.container.querySelector('#estadisticas-mes-contenido');
            if (estadisticasMes) {
                estadisticasMes.innerHTML = `
                    <i class="fas fa-chart-bar fa-2x" style="margin-bottom: 10px; color: ${this.colors.border};"></i>
                    <p>Selecciona un mes para ver estadísticas</p>
                    `;
}
    }
    
    mostrarInfoFiltros() {
        const filtrosActivos = Object.values(this.filtrosActivos).filter(f => f !== null);
        
        if (filtrosActivos.length > 0) {
            console.log("Filtros activos:", this.filtrosActivos);
        }
    }
    
    actualizarContadorRegistros(filtrados = null) {
        const total = this.data.length;
        const mostrados = filtrados !== null ? filtrados : total;
        
        const contador = this.container.querySelector('#contador-registros');
        const mostradosSpan = this.container.querySelector('#registros-mostrados');
        const totalesSpan = this.container.querySelector('#registros-totales');
        
        if (contador) {
            if (mostradosSpan) mostradosSpan.textContent = mostrados;
            if (totalesSpan) totalesSpan.textContent = total;
            
            if (mostrados < total) {
                contador.innerHTML = `
                    <i class="fas fa-filter" style="color: ${this.colors.accent};"></i>
                    <span>Mostrando <span id="registros-mostrados" style="color: ${this.colors.accent}; font-weight: 700;">${mostrados}</span> de <span id="registros-totales" style="font-weight: 700;">${total}</span> registros</span>
                `;
            } else {
                contador.innerHTML = `
                    <i class="fas fa-database"></i>
                    <span>Mostrando <span id="registros-mostrados" style="font-weight: 700;">${mostrados}</span> de <span id="registros-totales" style="font-weight: 700;">${total}</span> registros</span>
                `;
            }
        }
    }
    
    toggleFiltrosDetallados() {
        const filtrosDetallados = this.container.querySelector('#filtros-detallados');
        const btnToggle = this.container.querySelector('#btn-toggle-filtros');
        
        if (filtrosDetallados.style.display === 'none' || filtrosDetallados.style.display === '') {
            filtrosDetallados.style.display = 'block';
            btnToggle.innerHTML = '<i class="fas fa-filter"></i> Menos filtros';
            btnToggle.style.background = this.colors.primary;
            btnToggle.style.color = 'white';
        } else {
            filtrosDetallados.style.display = 'none';
            btnToggle.innerHTML = '<i class="fas fa-filter"></i> Más filtros';
            btnToggle.style.background = 'white';
            btnToggle.style.color = this.colors.primary;
        }
    }
    
    calcularEstadisticasDesdeDatos() {
        if (!this.data || this.data.length === 0) {
            this.actualizarEstadisticasUI({
                total: 0,
                matutino: 0,
                vespertino: 0,
                nocturno: 0,
                pendientes: 0,
                ultimaHora: 0
            });
            
            this.actualizarEstadisticasPequeñasUI({
                total: 0,
                matutino: 0,
                vespertino: 0,
                nocturno: 0,
                pendientes: 0
            });
            return;
        }
        
        // Filtrar registros de hoy
        const hoy = new Date().toISOString().split('T')[0];
        const datosHoy = this.data.filter(item => item.fecha === hoy);
        
        // Calcular estadísticas
        const stats = {
            total: datosHoy.length,
            matutino: datosHoy.filter(item => item.turno && item.turno.toLowerCase() === 'matutino').length,
            vespertino: datosHoy.filter(item => item.turno && item.turno.toLowerCase() === 'vespertino').length,
            nocturno: datosHoy.filter(item => item.turno && item.turno.toLowerCase() === 'nocturno').length,
            pendientes: datosHoy.filter(item => item.seguimiento && !item.conclusion).length,
            ultimaHora: this.calcularRegistrosUltimaHora()
        };

        this.actualizarEstadisticasUI(stats);
        this.actualizarEstadisticasPequeñasUI(stats);
    }
    
    actualizarEstadisticasPequeñasUI(stats) {
        const elementosPequeños = {
            'stat-total-pequeno': stats.total,
            'stat-matutino-pequeno': stats.matutino,
            'stat-vespertino-pequeno': stats.vespertino,
            'stat-nocturno-pequeno': stats.nocturno,
            'stat-pendientes-pequeno': stats.pendientes
        };
        
        Object.entries(elementosPequeños).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = valor;
            }
        });
    }
    
    calcularRegistrosUltimaHora() {
        const ahora = new Date();
        const unaHoraAtras = new Date(ahora.getTime() - 60 * 60 * 1000);
        
        return this.data.filter(item => {
            if (!item.fecha || !item.hora) return false;
            try {
                const fechaHora = new Date(`${item.fecha}T${item.hora}`);
                return fechaHora >= unaHoraAtras && fechaHora <= ahora;
            } catch (e) {
                return false;
            }
        }).length;
    }
    
    actualizarEstadisticasUI(stats) {
        const elementos = {
            'stat-total': stats.total,
            'stat-matutino': stats.matutino,
            'stat-vespertino': stats.vespertino,
            'stat-nocturno': stats.nocturno,
            'stat-pendientes': stats.pendientes,
            'stat-ultima-hora': stats.ultimaHora
        };
        
        Object.entries(elementos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                const valorAnterior = parseInt(elemento.textContent) || 0;
                if (valorAnterior !== valor) {
                    this.animarConteo(elemento, valor);
                }
            }
        });
    }
    
    animarConteo(elemento, valorFinal) {
        const valorInicial = parseInt(elemento.textContent) || 0;
        const diferencia = valorFinal - valorInicial;
        if (diferencia === 0) return;
        
        // Agregar clase de animación
        elemento.classList.add('stat-update');
        setTimeout(() => {
            elemento.classList.remove('stat-update');
        }, 500);
        
        const duracion = 500;
        const paso = Math.ceil(diferencia / (duracion / 16));
        
        let valorActual = valorInicial;
        const intervalo = setInterval(() => {
            valorActual += paso;
            
            if ((paso > 0 && valorActual >= valorFinal) || 
                (paso < 0 && valorActual <= valorFinal)) {
                valorActual = valorFinal;
                clearInterval(intervalo);
            }
            
            elemento.textContent = valorActual;
        }, 16);
    }
    
    actualizarEstadisticasTiempoReal() {
        if (this.data.length > 0) {
            const ultimaHora = this.calcularRegistrosUltimaHora();
            const elemento = document.getElementById('stat-ultima-hora');
            if (elemento) {
                this.animarConteo(elemento, ultimaHora);
            }
        }
    }
    
   mostrarEstadisticasMes(mesAnio) {
    const container = this.container.querySelector('#estadisticas-mes-contenido');
    if (!container) return;
    
    if (!mesAnio) {
        container.innerHTML = `
            <i class="fas fa-chart-bar fa-2x" style="margin-bottom: 10px; color: ${this.colors.border};"></i>
            <p>Selecciona un mes para ver estadísticas</p>
        `;
        return;
    }
    
    const datosMes = this.filtrarPorMes(mesAnio);
    const stats = this.calcularEstadisticasMes(datosMes);
    
    // Formatear nombre del mes
    const [año, mes] = mesAnio.split('-');
    const nombreMes = new Date(año, mes - 1, 1).toLocaleDateString('es-MX', { month: 'long' }).toUpperCase();
    
    container.innerHTML = `
        <div style="text-align: left;">
            <h5 style="color: ${this.colors.primary}; margin-bottom: 15px; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;">
                <i class="fas fa-chart-bar"></i>
                ${nombreMes} ${año}
            </h5>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div style="background: ${this.colors.light}; padding: 8px; border-radius: 6px; border-left: 3px solid ${this.colors.primary};">
                    <div style="color: ${this.colors.gray}; font-size: 0.7rem; font-weight: 600;">TOTAL</div>
                    <div style="font-size: 1.2rem; font-weight: 700; color: ${this.colors.primary};">${stats.total}</div>
                </div>
                <div style="background: ${this.colors.light}; padding: 8px; border-radius: 6px; border-left: 3px solid #ff6b35;">
                    <div style="color: ${this.colors.gray}; font-size: 0.7rem; font-weight: 600;">ACTIVAS</div>
                    <div style="font-size: 1.2rem; font-weight: 700; color: #ff6b35;">${stats.pendientes}</div>
                </div>
            </div>
            
            <div style="margin-bottom: 10px;">
                <div style="font-size: 0.75rem; color: ${this.colors.gray}; margin-bottom: 5px; font-weight: 600;">POR TURNO</div>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: ${this.colors.dark}; font-size: 0.8rem;">Matutino</span>
                        <span style="font-weight: 600; color: #b8860b;">${stats.matutino}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: ${this.colors.dark}; font-size: 0.8rem;">Vespertino</span>
                        <span style="font-weight: 600; color: #c0392b;">${stats.vespertino}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: ${this.colors.dark}; font-size: 0.8rem;">Nocturno</span>
                        <span style="font-weight: 600; color: #1b6d6b;">${stats.nocturno}</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid ${this.colors.border};">
                <div style="font-size: 0.75rem; color: ${this.colors.gray};">
                    <i class="fas fa-info-circle" style="margin-right: 3px;"></i>
                    ${stats.concluidos} registros concluidos
                </div>
            </div>
        </div>
    `;
}
    
    filtrarPorMes(mesAnio) {
        if (!mesAnio) return this.data;
        
        const [año, mes] = mesAnio.split('-');
        
        return this.data.filter(item => {
            if (!item.fecha) return false;
            
            try {
                const fechaItem = new Date(item.fecha);
                const añoItem = fechaItem.getFullYear();
                const mesItem = fechaItem.getMonth() + 1;
                
                return añoItem == año && mesItem == mes;
            } catch (e) {
                return false;
            }
        });
    }
    
    calcularEstadisticasMes(datosMes) {
        return {
            total: datosMes.length,
            matutino: datosMes.filter(item => item.turno === 'matutino').length,
            vespertino: datosMes.filter(item => item.turno === 'vespertino').length,
            nocturno: datosMes.filter(item => !item.turno || item.turno === 'nocturno').length,
            pendientes: datosMes.filter(item => item.seguimiento && !item.conclusion).length,
            concluidos: datosMes.filter(item => item.conclusion).length
        };
    }
    
    // ========== MÉTODOS DE ACCIÓN ==========
    
    verDetallesCompletos(id) {
        const llamada = this.data.find(l => l.id == id);
        if (!llamada) return;
        
        this.mostrarModalDetallesCERIT(llamada);
    }
    
    mostrarModalDetallesCERIT(llamada) {
        // Generar ID en formato 2001260812 (día/mes/año-hora-minuto)
        const fechaLlamada = new Date(`${llamada.fecha}T${llamada.hora}`);
        const idFormateado = `${String(fechaLlamada.getDate()).padStart(2, '0')}${String(fechaLlamada.getMonth() + 1).padStart(2, '0')}${String(fechaLlamada.getFullYear()).slice(-2)}${String(fechaLlamada.getHours()).padStart(2, '0')}${String(fechaLlamada.getMinutes()).padStart(2, '0')}`;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.85); z-index: 1000; display: flex; 
            align-items: center; justify-content: center; padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="background: white; width: 95%; max-width: 900px; border-radius: 10px; overflow: hidden; border: 3px solid ${this.colors.primary}; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                <div style="background: linear-gradient(135deg, ${this.colors.primary} 0%, ${this.colors.secondary} 100%); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                    <div>
                        <h3 style="margin: 0; font-size: 1.3rem; font-weight: 700; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-file-invoice"></i>
                            DETALLES DE INCIDENCIA
                        </h3>
                        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.9rem;">
                            ID: ${idFormateado} | CERIT Tehuacán
                        </p>
                    </div>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 1.2rem; cursor: pointer; padding: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s;"
                            onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                            onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="padding: 25px; overflow-y: auto; flex-grow: 1;">
                    ${this.getContenidoModalDetalles(llamada, idFormateado)}
                </div>
                <div style="padding: 20px; border-top: 1px solid ${this.colors.border}; background: ${this.colors.light}; flex-shrink: 0;">
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                style="padding: 10px 25px; background: ${this.colors.gray}; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;"
                                onmouseover="this.style.background='#5a6268'"
                                onmouseout="this.style.background='${this.colors.gray}'">
                            <i class="fas fa-times"></i> Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    getContenidoModalDetalles(llamada, idFormateado) {
        return `
            <!-- SECCIÓN 1: DATOS BÁSICOS Y TEMPORALES -->
            <div style="margin-bottom: 25px;">
                <h4 style="color: ${this.colors.primary}; margin-bottom: 15px; border-bottom: 2px solid ${this.colors.primary}; padding-bottom: 5px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-calendar-alt"></i> DATOS BÁSICOS Y TEMPORALES
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    <div style="background: ${this.colors.light}; padding: 12px; border-radius: 6px;">
                        <div style="color: ${this.colors.gray}; font-size: 0.8rem; font-weight: 600; margin-bottom: 5px;">ID</div>
                        <div style="font-family: 'Courier New', monospace; font-weight: 700; color: ${this.colors.primary};">${idFormateado}</div>
                    </div>
                    <div style="background: ${this.colors.light}; padding: 12px; border-radius: 6px;">
                        <div style="color: ${this.colors.gray}; font-size: 0.8rem; font-weight: 600; margin-bottom: 5px;">FCCA (Fecha Creación)</div>
                        <div>${llamada.fecha || 'N/A'}</div>
                    </div>
                    <div style="background: ${this.colors.light}; padding: 12px; border-radius: 6px;">
                        <div style="color: ${this.colors.gray}; font-size: 0.8rem; font-weight: 600; margin-bottom: 5px;">TICR (Hora Inicio)</div>
                        <div>${llamada.hora || 'N/A'}</div>
                    </div>
                    <div style="background: ${this.colors.light}; padding: 12px; border-radius: 6px;">
                        <div style="color: ${this.colors.gray}; font-size: 0.8rem; font-weight: 600; margin-bottom: 5px;">Turno</div>
                        <div>
                            <span style="padding: 3px 8px; background: ${llamada.turno === 'matutino' ? '#f6d365' : llamada.turno === 'vespertino' ? '#ff6b6b' : '#4ecdc4'}; color: ${llamada.turno === 'matutino' ? '#333' : 'white'}; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">
                                ${llamada.turno ? llamada.turno.toUpperCase() : 'NO ASIGNADO'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- SECCIÓN 2: CLASIFICACIÓN Y PRIORIDAD -->
            <div style="margin-bottom: 25px;">
                <h4 style="color: ${this.colors.primary}; margin-bottom: 15px; border-bottom: 2px solid ${this.colors.accent}; padding-bottom: 5px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-exclamation-triangle"></i> CLASIFICACIÓN Y PRIORIDAD
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div style="background: ${this.colors.light}; padding: 12px; border-radius: 6px;">
                        <div style="color: ${this.colors.gray}; font-size: 0.8rem; font-weight: 600; margin-bottom: 5px;">Urgencia</div>
                        <div style="padding: 3px 8px; background: ${llamada.urgencia === 'ALTA' ? this.colors.accentRed : llamada.urgencia === 'MEDIA' ? this.colors.warning : this.colors.accentGreen}; color: white; border-radius: 4px; font-size: 0.85rem; font-weight: 600; display: inline-block;">
                            ${llamada.urgencia || 'N/A'}
                        </div>
                    </div>
                    <div style="background: ${this.colors.light}; padding: 12px; border-radius: 6px;">
                        <div style="color: ${this.colors.gray}; font-size: 0.8rem; font-weight: 600; margin-bottom: 5px;">Grupo Tipo</div>
                        <div>${llamada.grupo_tipo || 'N/A'}</div>
                    </div>
                    <div style="background: ${this.colors.light}; padding: 12px; border-radius: 6px;">
                        <div style="color: ${this.colors.gray}; font-size: 0.8rem; font-weight: 600; margin-bottom: 5px;">Código Procedimiento</div>
                        <div style="font-family: monospace;">${llamada.codigo_procedimiento || 'N/A'}</div>
                    </div>
                </div>
            </div>
            
            <!-- SECCIÓN 3: INFORMACIÓN ESPECÍFICA -->
            <div style="margin-bottom: 25px;">
                <h4 style="color: ${this.colors.primary}; margin-bottom: 15px; border-bottom: 2px solid ${this.colors.info}; padding-bottom: 5px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-info-circle"></i> INFORMACIÓN ESPECÍFICA
                </h4>
                <div style="background: ${this.colors.light}; padding: 15px; border-radius: 8px;">
                    <div style="margin-bottom: 10px;">
                        <div style="color: ${this.colors.gray}; font-size: 0.9rem; font-weight: 600; margin-bottom: 5px;">Elementos Tipo</div>
                        <div>${llamada.elementos_tipo || 'N/A'}</div>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <div style="color: ${this.colors.gray}; font-size: 0.9rem; font-weight: 600; margin-bottom: 5px;">Comunicación</div>
                        <div>${llamada.comunicacion || 'N/A'}</div>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <div style="color: ${this.colors.gray}; font-size: 0.9rem; font-weight: 600; margin-bottom: 5px;">Asociación</div>
                        <div>${llamada.asociacion || 'N/A'}</div>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <div style="color: ${this.colors.gray}; font-size: 0.9rem; font-weight: 600; margin-bottom: 5px;">Conversación/Diálogo</div>
                        <div style="white-space: pre-wrap; background: white; padding: 10px; border-radius: 4px; border: 1px solid ${this.colors.border};">
                            ${llamada.conversacion || 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- SECCIÓN 4: INFORMACIÓN ADICIONAL -->
            <div style="margin-bottom: 25px;">
                <h4 style="color: ${this.colors.primary}; margin-bottom: 15px; border-bottom: 2px solid ${this.colors.accentGreen}; padding-bottom: 5px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-address-card"></i> INFORMACIÓN ADICIONAL
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    <div style="background: ${this.colors.light}; padding: 12px; border-radius: 6px;">
                        <div style="color: ${this.colors.gray}; font-size: 0.8rem; font-weight: 600; margin-bottom: 5px;">Teléfono Reportante</div>
                        <div style="font-family: monospace; font-weight: 600;">${llamada.numero_telefono || 'N/A'}</div>
                    </div>
                    <div style="background: ${this.colors.light}; padding: 12px; border-radius: 6px;">
                        <div style="color: ${this.colors.gray}; font-size: 0.8rem; font-weight: 600; margin-bottom: 5px;">Colonia</div>
                        <div>${llamada.colonia || 'N/A'}</div>
                    </div>
                    <div style="background: ${this.colors.light}; padding: 12px; border-radius: 6px;">
                        <div style="color: ${this.colors.gray}; font-size: 0.8rem; font-weight: 600; margin-bottom: 5px;">Ubicación Específica</div>
                        <div>${llamada.ubicacion || 'N/A'}</div>
                    </div>
                    <div style="background: ${this.colors.light}; padding: 12px; border-radius: 6px;">
                        <div style="color: ${this.colors.gray}; font-size: 0.8rem; font-weight: 600; margin-bottom: 5px;">Reportante</div>
                        <div>${llamada.peticionario || 'N/A'}</div>
                    </div>
                </div>
                
                <div style="margin-top: 15px;">
                    <div style="color: ${this.colors.gray}; font-size: 0.9rem; font-weight: 600; margin-bottom: 5px;">Motivo Principal</div>
                    <div style="font-weight: 600; font-size: 1.1rem; color: ${this.colors.dark}; background: white; padding: 10px; border-radius: 6px; border-left: 4px solid ${this.colors.primary};">
                        ${llamada.motivo || 'N/A'}
                    </div>
                </div>
                
                <div style="margin-top: 15px;">
                    <div style="color: ${this.colors.gray}; font-size: 0.9rem; font-weight: 600; margin-bottom: 5px;">Descripción Detallada</div>
                    <div style="white-space: pre-wrap; line-height: 1.5; background: white; padding: 15px; border-radius: 6px; border: 1px solid ${this.colors.border};">
                        ${llamada.descripcion_detallada || 'Sin descripción detallada'}
                    </div>
                </div>
            </div>
            
            <!-- SECCIÓN 5: SEGUIMIENTO Y CONCLUSIÓN -->
            <div style="margin-bottom: 25px;">
                <h4 style="color: ${this.colors.primary}; margin-bottom: 15px; border-bottom: 2px solid ${this.colors.warning}; padding-bottom: 5px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-clipboard-check"></i> SEGUIMIENTO Y CONCLUSIÓN
                </h4>
                <div style="background: ${this.colors.light}; padding: 15px; border-radius: 8px;">
                    <div style="margin-bottom: 15px;">
                        <div style="color: ${this.colors.gray}; font-size: 0.9rem; font-weight: 600; margin-bottom: 5px;">Estado Actual</div>
                        <div>
                            ${llamada.conclusion ? 
                                `<span style="padding: 8px 15px; background: ${this.colors.accentGreen}; color: white; border-radius: 6px; font-weight: 700; font-size: 0.9rem;">CONCLUIDO</span>` : 
                                llamada.seguimiento ? 
                                `<span style="padding: 8px 15px; background: ${this.colors.accent}; color: white; border-radius: 6px; font-weight: 700; font-size: 0.9rem;">EN SEGUIMIENTO</span>` :
                                `<span style="padding: 8px 15px; background: ${this.colors.gray}; color: white; border-radius: 6px; font-weight: 700; font-size: 0.9rem;">REGISTRADO</span>`
                            }
                        </div>
                    </div>
                    ${llamada.seguimiento ? `
                        <div style="margin-bottom: 10px;">
                            <div style="color: ${this.colors.gray}; font-size: 0.9rem; font-weight: 600; margin-bottom: 5px;">Seguimiento</div>
                            <div style="white-space: pre-wrap; background: white; padding: 10px; border-radius: 4px; border: 1px solid ${this.colors.border};">
                                ${llamada.seguimiento}
                            </div>
                        </div>
                    ` : ''}
                    ${llamada.conclusion ? `
                        <div>
                            <div style="color: ${this.colors.gray}; font-size: 0.9rem; font-weight: 600; margin-bottom: 5px;">Conclusión</div>
                            <div style="white-space: pre-wrap; background: white; padding: 10px; border-radius: 4px; border: 1px solid ${this.colors.border};">
                                ${llamada.conclusion}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Información de Sistema -->
            <div style="background: ${this.colors.primary}15; border-left: 4px solid ${this.colors.primary}; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: ${this.colors.gray};">
                    <div>
                        <i class="fas fa-user-shield"></i> 
                        Operador: ${this.currentUser?.nombre || 'SISTEMA CERIT'}
                    </div>
                    <div>
                        <i class="fas fa-database"></i> 
                        Registro: ${llamada.id || 'N/A'}
                    </div>
                    <div>
                        <i class="fas fa-clock"></i> 
                        Hora registro: ${llamada.hora_registro || 'N/A'}
                    </div>
                </div>
            </div>
        `;
    }
    
    iniciarEmergencia() {
        this.mostrarModalEmergencia();
    }
    
    mostrarModalEmergencia() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(220, 53, 69, 0.95); z-index: 2000; display: flex; 
            align-items: center; justify-content: center; padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="background: white; width: 95%; max-width: 600px; border-radius: 10px; overflow: hidden; border: 3px solid #dc3545; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div style="background: #dc3545; color: white; padding: 25px; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 style="margin: 0; font-size: 1.8rem; font-weight: 800; text-transform: uppercase;">
                        PROTOCOLO DE EMERGENCIA
                    </h2>
                    <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 1.1rem;">
                        CERIT TEHUACÁN
                    </p>
                </div>
                
                <div style="padding: 30px;">
                    <h3 style="color: #dc3545; margin-bottom: 20px; text-align: center; font-size: 1.3rem;">
                        <i class="fas fa-broadcast-tower"></i> ACTIVAR PROTOCOLO
                    </h3>
                    
                    <div style="margin-bottom: 25px;">
                        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                <i class="fas fa-exclamation-circle" style="color: #856404; font-size: 1.2rem;"></i>
                                <div style="font-weight: 600; color: #856404;">ADVERTENCIA CRÍTICA</div>
                            </div>
                            <p style="color: #856404; margin: 0; font-size: 0.95rem;">
                                Este protocolo activará alertas simultáneas a todas las unidades disponibles y notificará al mando superior.
                            </p>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <button onclick="this.iniciarEmergenciaTipo('medica')" 
                                    style="padding: 15px; background: #dc3545; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 10px; font-size: 1rem; transition: all 0.3s;"
                                    onmouseover="this.style.background='#c82333'; this.style.transform='translateY(-2px)'"
                                    onmouseout="this.style.background='#dc3545'; this.style.transform='translateY(0)'">
                                <i class="fas fa-ambulance" style="font-size: 1.2rem;"></i>
                                <div>
                                    <div>EMERGENCIA MÉDICA</div>
                                    <div style="font-size: 0.85rem; opacity: 0.9;">Accidente, heridos, atención médica</div>
                                </div>
                            </button>
                            
                            <button onclick="this.iniciarEmergenciaTipo('seguridad')" 
                                    style="padding: 15px; background: #343a40; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 10px; font-size: 1rem; transition: all 0.3s;"
                                    onmouseover="this.style.background='#23272b'; this.style.transform='translateY(-2px)'"
                                    onmouseout="this.style.background='#343a40'; this.style.transform='translateY(0)'">
                                <i class="fas fa-shield-alt" style="font-size: 1.2rem;"></i>
                                <div>
                                    <div>EMERGENCIA DE SEGURIDAD</div>
                                    <div style="font-size: 0.85rem; opacity: 0.9;">Incidente violento, amenaza, robo</div>
                                </div>
                            </button>
                            
                            <button onclick="this.iniciarEmergenciaTipo('incendio')" 
                                    style="padding: 15px; background: #fd7e14; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 10px; font-size: 1rem; transition: all 0.3s;"
                                    onmouseover="this.style.background='#e96a00'; this.style.transform='translateY(-2px)'"
                                    onmouseout="this.style.background='#fd7e14'; this.style.transform='translateY(0)'">
                                <i class="fas fa-fire" style="font-size: 1.2rem;"></i>
                                <div>
                                    <div>EMERGENCIA INCENDIO</div>
                                    <div style="font-size: 0.85rem; opacity: 0.9;">Fuego, explosión, materiales peligrosos</div>
                                </div>
                            </button>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                style="padding: 10px 25px; background: #6c757d; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem; transition: all 0.2s;"
                                onmouseover="this.style.background='#5a6268'"
                                onmouseout="this.style.background='#6c757d'">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-top: 1px solid #dee2e6; text-align: center; font-size: 0.8rem; color: #6c757d;">
                    <i class="fas fa-phone-alt"></i> Línea directa: 911 | CERIT Tehuacán
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Añadir funciones a los botones
        modal.querySelector('button[onclick*="iniciarEmergenciaTipo(\'medica\')"]').onclick = () => {
            this.procesarEmergencia('medica');
            modal.remove();
        };
        
        modal.querySelector('button[onclick*="iniciarEmergenciaTipo(\'seguridad\')"]').onclick = () => {
            this.procesarEmergencia('seguridad');
            modal.remove();
        };
        
        modal.querySelector('button[onclick*="iniciarEmergenciaTipo(\'incendio\')"]').onclick = () => {
            this.procesarEmergencia('incendio');
            modal.remove();
        };
    }
    
    procesarEmergencia(tipo) {
        const tipos = {
            'medica': { titulo: 'MÉDICA', icono: 'fas fa-ambulance', color: '#dc3545' },
            'seguridad': { titulo: 'DE SEGURIDAD', icono: 'fas fa-shield-alt', color: '#343a40' },
            'incendio': { titulo: 'INCENDIO', icono: 'fas fa-fire', color: '#fd7e14' }
        };
        
        const tipoInfo = tipos[tipo] || tipos.medica;
        
        this.mostrarAlerta(
            `🚨 PROTOCOLO ${tipoInfo.titulo} ACTIVADO`,
            `Se ha activado el protocolo de emergencia ${tipoInfo.titulo.toLowerCase()}. ` +
            `Notificando a todas las unidades disponibles y al mando superior.`,
            'emergencia'
        );
        
        // Simular envío de alerta
        setTimeout(() => {
            this.mostrarAlerta(
                '✅ ALERTA ENVIADA',
                'Todas las unidades han sido notificadas. Coordinando respuesta inmediata.',
                'success'
            );
        }, 2000);
    }
    
    async recargarDatosForzados() {
        try {
            this.mostrarAlerta('🔄 ACTUALIZANDO', 'Recargando datos del servidor...', 'info');
            
            // Mostrar loading
            const container = this.container.querySelector('#tabla-llamadas-container');
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; color: ${this.colors.gray};">
                    <div style="width: 50px; height: 50px; border: 3px solid ${this.colors.border}; border-top-color: ${this.colors.primary}; border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite;"></div>
                    <h4 style="color: ${this.colors.dark}; margin-bottom: 10px;">Actualizando datos</h4>
                    <p>Sincronizando con el servidor CERIT...</p>
                </div>
            `;
            
            // Limpiar cache si existe
            if (typeof LlamadasService !== 'undefined' && LlamadasService.limpiarCache) {
                LlamadasService.limpiarCache();
            }
            
            // Forzar recarga
            this.data = [];
            await this.fetchAndRenderTable();
            
            // Actualizar última actualización
            this.actualizarUltimaActualizacion();
            
            this.mostrarAlerta('✅ ACTUALIZADO', 'Datos cargados correctamente', 'success');
        } catch (error) {
            console.error('Error al recargar datos:', error);
            this.mostrarAlerta('❌ ERROR', 'No se pudieron cargar los datos', 'error');
        }
    }
    
    exportarAExcel() {
        if (this.data.length === 0) {
            this.mostrarAlerta('⚠️ SIN DATOS', 'No hay datos para exportar', 'error');
            return;
        }
        
        // Aplicar filtros actuales a los datos
        let datosExportar = this.aplicarFiltrosADatos(this.data);
        
        if (datosExportar.length === 0) {
            this.mostrarAlerta('⚠️ SIN DATOS', 'No hay datos con los filtros actuales', 'error');
            return;
        }
        
        // Crear CSV con los campos de la BD
        let csv = 'ID,Fecha,Hora,Turno,Folio Sistema,Motivo,Ubicación,Colonia,Peticionario,Teléfono,Seguimiento,Razonamiento,Conclusión,Descripción Detallada,Agente,Teléfono Agente,Folio C5,Estado\n';
        
        datosExportar.forEach(item => {
            // Determinar estado
            let estado = 'REGISTRADO';
            if (item.seguimiento) estado = 'EN SEGUIMIENTO';
            if (item.conclusion) estado = 'CONCLUIDO';
            
            const row = [
                item.id || '',
                item.fecha || '',
                item.hora || '',
                item.turno || '',
                item.folio_sistema || '',
                `"${(item.motivo || '').replace(/"/g, '""')}"`,
                `"${(item.ubicacion || '').replace(/"/g, '""')}"`,
                `"${(item.colonia || '').replace(/"/g, '""')}"`,
                `"${(item.peticionario || '').replace(/"/g, '""')}"`,
                item.numero_telefono || '',
                `"${(item.seguimiento || '').replace(/"/g, '""')}"`,
                `"${(item.razonamiento || '').replace(/"/g, '""')}"`,
                `"${(item.conclusion || '').replace(/"/g, '""')}"`,
                `"${(item.descripcion_detallada || '').replace(/"/g, '""')}"`,
                `"${(item.agente || '').replace(/"/g, '""')}"`,
                item.telefono_agente || '',
                item.folio_c5 || '',
                estado
            ];
            
            csv += row.join(',') + '\n';
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const fecha = new Date().toISOString().slice(0,10);
        const hora = new Date().toTimeString().slice(0,8).replace(/:/g, '-');
        
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_cerit_${fecha}_${hora}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.mostrarAlerta('✅ EXPORTACIÓN COMPLETADA', 
            `Se exportaron ${datosExportar.length} registros a Excel`, 
            'success');
    }
    
    imprimirReporte() {
        if (this.data.length === 0) {
            this.mostrarAlerta('⚠️ SIN DATOS', 'No hay datos para imprimir', 'error');
            return;
        }
        
        // Aplicar filtros actuales
        let datosImprimir = this.aplicarFiltrosADatos(this.data);
        
        if (datosImprimir.length === 0) {
            this.mostrarAlerta('⚠️ SIN DATOS', 'No hay datos con los filtros actuales', 'error');
            return;
        }
        
        // Crear ventana de impresión
        const ventanaImpresion = window.open('', '_blank');
        ventanaImpresion.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reporte CERIT Tehuacán</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #003366; padding-bottom: 15px; }
                    .header h1 { color: #003366; margin: 0; }
                    .header p { color: #666; margin: 5px 0; }
                    .info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; color: #666; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #003366; color: white; padding: 10px; text-align: left; font-weight: bold; }
                    td { padding: 8px; border-bottom: 1px solid #ddd; }
                    tr:nth-child(even) { background: #f9f9f9; }
                    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
                    @media print {
                        body { margin: 0; padding: 10px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>CERIT TEHUACÁN</h1>
                    <p>Centro de Emergencia y Respuesta Inmediata</p>
                    <p>Reporte de Operaciones</p>
                </div>
                
                <div class="info">
                    <div>
                        <strong>Fecha de generación:</strong> ${new Date().toLocaleDateString('es-MX')}<br>
                        <strong>Hora:</strong> ${new Date().toLocaleTimeString('es-MX')}
                    </div>
                    <div>
                        <strong>Operador:</strong> ${this.currentUser?.nombre || 'SISTEMA'}<br>
                        <strong>Total registros:</strong> ${datosImprimir.length}
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Folio</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Turno</th>
                            <th>Motivo</th>
                            <th>Ubicación</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${datosImprimir.map(item => `
                            <tr>
                                <td>${item.folio_sistema || ''}</td>
                                <td>${item.fecha || ''}</td>
                                <td>${item.hora ? item.hora.substring(0,5) : ''}</td>
                                <td>${item.turno ? item.turno.toUpperCase() : ''}</td>
                                <td>${item.motivo || ''}</td>
                                <td>${item.ubicacion || ''}</td>
                                <td>${item.conclusion ? 'CONCLUIDO' : item.seguimiento ? 'SEGUIMIENTO' : 'REGISTRADO'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Sistema CERIT Tehuacán - Protocolo SAS-C4 v2.1</p>
                    <p>Documento generado automáticamente</p>
                </div>
                
                <div class="no-print" style="margin-top: 20px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #003366; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Imprimir Reporte
                    </button>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
                        Cerrar
                    </button>
                </div>
                
                <script>
                    window.onload = function() {
                        // Auto-imprimir si está configurado
                        // window.print();
                    }
                </script>
            </body>
            </html>
        `);
        ventanaImpresion.document.close();
    }
    
    generarReporteMensual() {
        this.mostrarAlerta('📊 REPORTE MENSUAL', 'Generando reporte estadístico del mes actual...', 'info');
        
        // Simular generación de reporte
        setTimeout(() => {
            this.mostrarAlerta('✅ REPORTE GENERADO', 'El reporte mensual se ha generado correctamente', 'success');
        }, 1500);
    }
    
    mostrarMapaCalor() {
    // Cargar la vista del mapa de calor
    if (this.appController && typeof this.appController.loadView === 'function') {
        this.appController.loadView('mapacalor');
    } else {
        // Fallback si no hay appController
        this.mostrarAlerta('🗺️ MAPA DE CALOR', 'Redirigiendo al mapa de calor...', 'info');
        
        // Simular redirección
        setTimeout(() => {
            this.mostrarAlerta('⚠️ ERROR', 'No se pudo cargar el mapa de calor. Asegúrate de que MapaCalorView.js esté incluido.', 'error');
        }, 1000);
    }
    }
    mostrarAlerta(titulo, mensaje, tipo = 'info') {
        const colores = {
            'info': { bg: this.colors.primary, icon: 'fas fa-info-circle' },
            'success': { bg: this.colors.accentGreen, icon: 'fas fa-check-circle' },
            'error': { bg: this.colors.accentRed, icon: 'fas fa-exclamation-triangle' },
            'warning': { bg: this.colors.warning, icon: 'fas fa-exclamation-circle' },
            'emergencia': { bg: this.colors.accentRed, icon: 'fas fa-bell' }
        };
        
        const tipoInfo = colores[tipo] || colores.info;
        
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            background: white; border-left: 4px solid ${tipoInfo.bg}; 
            padding: 15px 20px; border-radius: 8px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
            z-index: 1001; min-width: 300px; max-width: 400px;
            animation: fadeInRight 0.3s ease-out;
            border-top: 1px solid #dee2e6;
            border-right: 1px solid #dee2e6;
            border-bottom: 1px solid #dee2e6;
        `;
        
        alertDiv.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="background: ${tipoInfo.bg}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class="${tipoInfo.icon}"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 700; color: ${this.colors.dark}; margin-bottom: 5px; font-size: 0.95rem;">${titulo}</div>
                    <div style="color: ${this.colors.gray}; font-size: 0.9rem; white-space: pre-line;">${mensaje}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: ${this.colors.gray}; cursor: pointer; padding: 0; font-size: 1rem; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all 0.2s;"
                        onmouseover="this.style.background='${this.colors.light}'; this.style.color='${this.colors.dark}'"
                        onmouseout="this.style.background='none'; this.style.color='${this.colors.gray}'">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-remover después de 5 segundos
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
        
        // Agregar estilos de animación si no existen
        if (!document.querySelector('#alert-animations')) {
            const style = document.createElement('style');
            style.id = 'alert-animations';
            style.textContent = `
                @keyframes fadeInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeOutRight {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(20px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    getDatosEjemploCERIT() {
        const hoy = new Date();
        const año = hoy.getFullYear().toString().substring(2);
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        
        return [
            {
                id: 1,
                fecha: hoy.toISOString().split('T')[0],
                hora: '08:30:00',
                turno: 'matutino',
                motivo: 'Accidente vehicular sin heridos',
                ubicacion: 'Av. Reforma esq. 5 de Mayo',
                colonia: 'Centro',
                peticionario: 'Juan Martínez',
                numero_telefono: '2381234567',
                descripcion_detallada: 'Choque entre dos vehículos en esquina, daños materiales solamente',
                seguimiento: 'Unidad de tránsito en camino',
                conclusion: 'Levantado el reporte, partes intercambiados',
                folio_sistema: `SAS-${hoy.getFullYear()}${mes}${dia}-001`,
                agente: 'OFICIAL GARCÍA',
                hora_registro: '08:35:00',
                urgencia: 'MEDIA',
                codigo_procedimiento: 'CPCB-2024-001',
                grupo_tipo: 'ACCIDENTES',
                elementos_tipo: 'VEHÍCULOS',
                comunicacion: 'TELEFÓNICA',
                asociacion: 'PARTES INVOLUCRADAS',
                conversacion: 'Reportante indica que hubo choque, nadie herido',
                procedencia: 'LLAMADA CIUDADANA'
            },
            {
                id: 2,
                fecha: hoy.toISOString().split('T')[0],
                hora: '14:15:00',
                turno: 'vespertino',
                motivo: 'Robo a comercio',
                ubicacion: 'Calle 5 Norte #123',
                colonia: 'San Francisco',
                peticionario: 'María González',
                numero_telefono: '2387654321',
                descripcion_detallada: 'Sujetos armados ingresaron a tienda de abarrotes, se llevaron dinero en efectivo',
                seguimiento: 'Patrulla en zona realizando rondines',
                conclusion: null,
                folio_sistema: `SAS-${hoy.getFullYear()}${mes}${dia}-002`,
                agente: 'OFICIAL RODRÍGUEZ',
                hora_registro: '14:20:00',
                urgencia: 'ALTA',
                codigo_procedimiento: 'CPCB-2024-002',
                grupo_tipo: 'ROBOS',
                elementos_tipo: 'ARMAS',
                comunicacion: 'RADIO',
                asociacion: 'TESTIGOS',
                conversacion: 'Dueño del establecimiento reporta robo con arma de fuego',
                procedencia: 'PATRULLA'
            },
            {
                id: 3,
                fecha: hoy.toISOString().split('T')[0],
                hora: '22:45:00',
                turno: 'nocturno',
                motivo: 'Disturbios en antro',
                ubicacion: 'Av. Juárez #456',
                colonia: 'La Paz',
                peticionario: 'Roberto Sánchez',
                numero_telefono: '2385551234',
                descripcion_detallada: 'Pelea entre clientes en establecimiento nocturno, requieren presencia policiaca',
                seguimiento: 'Unidades en camino para dispersar a los involucrados',
                razonamiento: 'Alteración del orden público',
                conclusion: 'Situación controlada, dos detenidos',
                folio_sistema: `SAS-${hoy.getFullYear()}${mes}${dia}-003`,
                agente: 'OFICIAL LÓPEZ',
                hora_registro: '22:50:00',
                urgencia: 'ALTA',
                codigo_procedimiento: 'CPCB-2024-003',
                grupo_tipo: 'DISTURBIOS',
                elementos_tipo: 'MULTITUD',
                comunicacion: 'TELEFÓNICA',
                asociacion: 'SEGURIDAD PRIVADA',
                conversacion: 'Guardia de seguridad reporta pelea interna',
                procedencia: 'SEGURIDAD PRIVADA'
            },
            {
                id: 4,
                fecha: hoy.toISOString().split('T')[0],
                hora: '10:20:00',
                turno: 'matutino',
                motivo: 'Vehículo abandonado',
                ubicacion: 'Calle 3 Sur #789',
                colonia: 'San Sebastián',
                peticionario: 'Ana Torres',
                numero_telefono: '2384445566',
                descripcion_detallada: 'Automóvil estacionado desde hace 3 días, sospecha de robo',
                seguimiento: null,
                conclusion: 'Verificado, no es robado, se notificó al propietario',
                folio_sistema: `SAS-${hoy.getFullYear()}${mes}${dia}-004`,
                agente: 'OFICIAL MENDOZA',
                hora_registro: '10:25:00',
                urgencia: 'BAJA',
                codigo_procedimiento: 'CPCB-2024-004',
                grupo_tipo: 'VEHÍCULOS',
                elementos_tipo: 'AUTOMÓVIL',
                comunicacion: 'TELEFÓNICA',
                asociacion: 'VECINOS',
                conversacion: 'Vecina reporta vehículo sospechoso',
                procedencia: 'LLAMADA CIUDADANA'
            },
            {
                id: 5,
                fecha: hoy.toISOString().split('T')[0],
                hora: '16:30:00',
                turno: 'vespertino',
                motivo: 'Persona sospechosa',
                ubicacion: 'Parque Central',
                colonia: 'Centro',
                peticionario: 'Carlos Ruiz',
                numero_telefono: '2387778899',
                descripcion_detallada: 'Individuo merodeando en parque, revisando vehículos estacionados',
                seguimiento: 'Unidad en zona investigando',
                conclusion: 'Persona identificada, sin antecedentes, se le recomendó abandonar el lugar',
                folio_sistema: `SAS-${hoy.getFullYear()}${mes}${dia}-005`,
                agente: 'OFICIAL HERNÁNDEZ',
                hora_registro: '16:35:00',
                urgencia: 'MEDIA',
                codigo_procedimiento: 'CPCB-2024-005',
                grupo_tipo: 'SOSPECHOSOS',
                elementos_tipo: 'PERSONA',
                comunicacion: 'RADIO',
                asociacion: 'VECINOS',
                conversacion: 'Ciudadano reporta persona sospechosa',
                procedencia: 'RONDÍN'
            }
        ];
    }
}

window.DashboardView = DashboardView;