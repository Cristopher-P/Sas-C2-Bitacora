class C5ListView {
    constructor(currentUser, controller) {
        this.currentUser = currentUser;
        this.controller = controller;
        this.reportes = [];
        this.filtros = {
            estado: '',
            folio: ''
        };
        this.refreshInterval = null; // Variable para guardar el intervalo
    }

    async render(container) {
        this.container = container;
        
        // Usar contenedor principal directamente
        this.container.className = 'c5-expanded-view view-bleed view-shell view-form';
        this.container.innerHTML = this.getTemplate();
        
        this.bindEvents();
        
        await this.cargarReportes();
        this.startWebSockets(); // Conectar WebSockets para recibir actualizaciones en tiempo real
    }

// En el método getTemplate(), cambia el max-width del contenedor principal:
getTemplate() {
    return `
        <div class="fade-in view-shell--wide">
            <!-- Encabezado -->
            <div class="page-header">
                <div class="page-title-group">
                    <button class="btn btn-secondary btn-icon btn-back-to-main" aria-label="Volver">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h1 class="page-title">
                        REPORTES CERIT
                    </h1>
                </div>
                <div class="user-chip">
                    <i class="fas fa-user-shield"></i>
                    <span>${this.currentUser || 'OPERADOR'}</span>
                </div>
            </div>
            <div class="page-divider page-divider--danger"></div>

            <!-- Panel de Estadísticas (Recuadros pequeños en la parte superior) -->
            <div style="margin-bottom: 25px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; max-width: 1600px;"> <!-- Añadido max-width -->
                    <!-- Total Reportes -->
                    <div style="background: white; border-radius: 8px; padding: 15px; border: 1px solid #e9ecef; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 12px;">
                        <div style="background: #3498db; color: white; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div>
                            <div style="color: #7f8c8d; font-size: 0.85rem; font-weight: 600;">TOTAL</div>
                            <div id="total-reportes" style="font-size: 1.3rem; font-weight: 700; color: #2c3e50;">0</div>
                        </div>
                    </div>
                    
                    <!-- Pendientes -->
                    <div style="background: white; border-radius: 8px; padding: 15px; border: 1px solid #e9ecef; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 12px;">
                        <div style="background: #e74c3c; color: white; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div>
                            <div style="color: #7f8c8d; font-size: 0.85rem; font-weight: 600;">PENDIENTES</div>
                            <div id="pendientes-reportes" style="font-size: 1.3rem; font-weight: 700; color: #2c3e50;">0</div>
                        </div>
                    </div>
                    
                    <!-- Con Folio -->
                    <div style="background: white; border-radius: 8px; padding: 15px; border: 1px solid #e9ecef; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 12px;">
                        <div style="background: #2ecc71; color: white; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div>
                            <div style="color: #7f8c8d; font-size: 0.85rem; font-weight: 600;">CON FOLIO</div>
                            <div id="con-folio-reportes" style="font-size: 1.3rem; font-weight: 700; color: #2c3e50;">0</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Panel de Control con Filtros -->
            <div style="margin-bottom: 25px;">
                <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #e9ecef; max-width: 1600px;"> <!-- Añadido max-width -->
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div>
                                <label style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 5px; font-size: 0.9rem;">
                                    <i class="fas fa-filter" style="margin-right: 5px; color: #e74c3c;"></i>
                                    FILTRAR POR:
                                </label>
                                <div style="display: flex; gap: 10px;">
                                    <select id="filtro-estado" 
                                            style="padding: 8px 12px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 0.95rem; background: white; transition: all 0.2s; min-width: 150px;"
                                            onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                            onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                                        <option value="">TODOS LOS ESTADOS</option>
                                        <option value="recibido">RECIBIDO</option>
                                        <option value="pendiente">PENDIENTE</option>
                                    </select>
                                    
                                    <div style="position: relative;">
                                        <input type="text" id="filtro-folio" 
                                               style="padding: 8px 12px 8px 35px; border: 2px solid #dee2e6; border-radius: 6px; font-size: 0.95rem; width: 180px;"
                                               placeholder="Buscar por folio..."
                                               onfocus="this.style.borderColor='#3498db'; this.style.boxShadow='0 0 0 3px rgba(52,152,219,0.1)'"
                                               onblur="this.style.borderColor='#dee2e6'; this.style.boxShadow='none'">
                                        <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #7f8c8d;"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <button id="btn-limpiar-filtros" 
                                    style="padding: 8px 15px; background: #95a5a6; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.9rem;">
                                <i class="fas fa-times"></i> LIMPIAR
                            </button>
                            <button id="btn-exportar" 
                                    style="padding: 8px 15px; background: #2ecc71; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.9rem;">
                                <i class="fas fa-file-excel"></i> EXPORTAR
                            </button>
                            <button id="btn-actualizar" 
                                    style="padding: 8px 15px; background: #3498db; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.9rem;">
                                <i class="fas fa-sync-alt"></i> ACTUALIZAR
                            </button>
                        </div>
                    </div>
                    
                    <!-- Info de Filtros Activos -->
                    <div id="filtro-info" style="margin-top: 15px; display: none;">
                        <div style="display: flex; align-items: center; gap: 8px; background: #e3f2fd; padding: 8px 12px; border-radius: 4px; border-left: 4px solid #3498db;">
                            <i class="fas fa-filter" style="color: #3498db;"></i>
                            <span id="filtro-texto" style="color: #0d47a1; font-size: 0.9rem;"></span>
                            <button id="btn-limpiar-filtros-small" 
                                    style="margin-left: auto; background: none; border: none; color: #3498db; cursor: pointer; font-size: 0.8rem;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla de Reportes -->
            <div style="background: white; border-radius: 8px; border: 1px solid #e9ecef; box-shadow: 0 4px 12px rgba(0,0,0,0.08); width: 100%; overflow: hidden; max-width: 1600px;"> <!-- Añadido max-width -->
                <div id="tabla-reportes-container" style="width: 100%; min-height: 400px;">
                    <div style="padding: 40px; text-align: center; color: #7f8c8d;">
                        <i class="fas fa-spinner fa-spin fa-2x"></i><br><br>Cargando información...
                    </div>
                </div>
            </div>
        </div>
    `;
}

    cleanup() {
        this.stopWebSockets(); // Desconectar socket al salir
    }

    bindEvents() {
        // Botón volver
        const backBtn = this.container.querySelector('.btn-back-to-main');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.controller.showMain();
            });
        }

        // Botón actualizar
        const btnActualizar = this.container.querySelector('#btn-actualizar');
        if (btnActualizar) {
            btnActualizar.addEventListener('click', () => {
                this.cargarReportes();
            });
        }

        // Botón exportar
        const btnExportar = this.container.querySelector('#btn-exportar');
        if (btnExportar) {
            btnExportar.addEventListener('click', () => {
                this.exportarAExcel();
            });
        }

        // Filtros
        const filtroEstado = this.container.querySelector('#filtro-estado');
        const filtroFolio = this.container.querySelector('#filtro-folio');
        
        if (filtroEstado) {
            filtroEstado.addEventListener('change', () => {
                this.filtros.estado = filtroEstado.value;
                this.aplicarFiltros();
            });
        }
        
        if (filtroFolio) {
            filtroFolio.addEventListener('input', () => {
                this.filtros.folio = filtroFolio.value;
                this.aplicarFiltros();
            });
        }

        // Botones limpiar filtros
        const btnLimpiar = this.container.querySelector('#btn-limpiar-filtros');
        const btnLimpiarSmall = this.container.querySelector('#btn-limpiar-filtros-small');
        
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', () => {
                this.limpiarFiltros();
            });
        }
        
        if (btnLimpiarSmall) {
            btnLimpiarSmall.addEventListener('click', () => {
                this.limpiarFiltros();
            });
        }
    }

    async cargarReportes(isWebSocketUpdate = false) {
        try {
            // Solo actualizamos si la petición es exitosa
            
            let reportes = [];
            
            if (typeof C5Service !== 'undefined') {
                const filtrosServicio = {};
                if (this.filtros.estado) filtrosServicio.estado = this.filtros.estado;
                if (this.filtros.folio) filtrosServicio.folio = this.filtros.folio;
                
                const resultado = await C5Service.obtenerReportes(filtrosServicio);
                if (resultado.success) {
                    reportes = resultado.data;
                } else {
                    throw new Error(resultado.message);
                }
            } else {
                reportes = this.getDatosEjemploCompletos();
            }
            
            this.reportes = reportes;
            this.renderizarTabla();
            this.actualizarEstadisticas();
            this.mostrarInfoFiltros();
            
            if (isWebSocketUpdate) {
                // Indicador visual discreto de actualización
                const totalBadge = this.container.querySelector('.fa-file-alt')?.parentElement;
                if(totalBadge) {
                    totalBadge.style.transition = 'background 0.3s';
                    const originalBg = totalBadge.style.background;
                    totalBadge.style.background = '#2ecc71'; // Green flash
                    setTimeout(() => {
                        totalBadge.style.background = originalBg; // Restore
                    }, 500);
                }
            }
            
        } catch (error) {
            console.error('Error cargando reportes:', error);
            
            // Solo mostramos error general si es carga inicial/manual (evitamos romper socket update)
            if (!isWebSocketUpdate) {
                const container = this.container.querySelector('#tabla-reportes-container');
                container.innerHTML = `
                    <div style="padding: 30px; text-align: center;">
                        <div style="background: #ffeaea; border-left: 4px solid #e74c3c; padding: 15px; border-radius: 4px; display: inline-block;">
                            <i class="fas fa-exclamation-triangle" style="color: #e74c3c; margin-right: 10px;"></i>
                            <strong style="color: #c0392b;">Error cargando reportes:</strong> ${error.message}
                        </div>
                        <br><br>
                        <button onclick="app.currentView.cargarReportes()" 
                                style="padding: 8px 20px; background: #3498db; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                            <i class="fas fa-redo"></i> Reintentar
                        </button>
                    </div>
                `;
            }
        }
    }

    startWebSockets() {
        this.stopWebSockets(); // Asegurar conexión limpia
        
        // Conectar a Socket.io en la misma URL del frontend (o API URL si existe variable global)
        const socketUrl = (typeof window.API_URL !== 'undefined') ? window.API_URL.replace('/api', '') : window.location.origin;
        
        if (typeof io !== 'undefined') {
            this.socket = io(socketUrl);
            
            this.socket.on('connect', () => {
                console.log('[WebSockets] Conectado en tiempo real (ID: ' + this.socket.id + ')');
            });

            this.socket.on('reportes_actualizados', (data) => {
                // Solo recargar si la vista sigue activa en el DOM
                if (document.body.contains(this.container)) {
                    this.cargarReportes(true);
                } else {
                    this.stopWebSockets();
                }
            });

            this.socket.on('disconnect', () => {
                console.log('[WebSockets] Desconectado del servidor');
            });
        }
    }

    stopWebSockets() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    actualizarEstadisticas() {
        const total = this.reportes.length;
        const pendientes = this.reportes.filter(r => !r.folio_c5).length;
        const conFolio = this.reportes.filter(r => r.folio_c5).length;
        
        // Actualizar UI
        const totalEl = this.container.querySelector('#total-reportes');
        const pendientesEl = this.container.querySelector('#pendientes-reportes');
        const conFolioEl = this.container.querySelector('#con-folio-reportes');
        
        if (totalEl) totalEl.textContent = total;
        if (pendientesEl) pendientesEl.textContent = pendientes;
        if (conFolioEl) conFolioEl.textContent = conFolio;
    }

    renderizarTabla() {
        const container = this.container.querySelector('#tabla-reportes-container');
        
        if (!container) return; // FIX: Prevent error if container is removed from DOM

        if (this.reportes.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px 20px;">
                    <div style="font-size: 3rem; color: #bdc3c7; margin-bottom: 15px;">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <h3 style="color: #7f8c8d; margin-bottom: 10px;">No hay reportes</h3>
                    <p style="color: #95a5a6; margin-bottom: 20px;">No se encontraron reportes con los filtros aplicados.</p>
                    <button onclick="app.currentView.showNewReport()" 
                            style="padding: 8px 20px; background: #2ecc71; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                        <i class="fas fa-plus"></i> Crear Primer Reporte
                    </button>
                </div>
            `;
            return;
        }
        
        // Filtrar reportes si hay filtros aplicados
        let reportesFiltrados = this.reportes;
        
        if (this.filtros.estado) {
            if (this.filtros.estado === 'recibido') {
                reportesFiltrados = reportesFiltrados.filter(r => r.folio_c5);
            } else if (this.filtros.estado === 'pendiente') {
                reportesFiltrados = reportesFiltrados.filter(r => !r.folio_c5);
            }
        }
        
        if (this.filtros.folio) {
            const folioBusqueda = this.filtros.folio.toLowerCase();
            reportesFiltrados = reportesFiltrados.filter(r => 
                (r.folio_c4 && r.folio_c4.toLowerCase().includes(folioBusqueda)) ||
                (r.folio_c5 && r.folio_c5.toLowerCase().includes(folioBusqueda))
            );
        }
        
        // Crear tabla adaptativa que muestre todas las columnas
        container.innerHTML = `
            <style>
                .tabla-reportes-c5 {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                }
                
                .tabla-reportes-c5 th {
                    background: #2c3e50;
                    color: white;
                    padding: 12px 8px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.85rem;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    border-right: 1px solid rgba(255,255,255,0.1);
                }
                
                .tabla-reportes-c5 td {
                    padding: 10px 8px;
                    border-bottom: 1px solid #e9ecef;
                    vertical-align: top;
                    line-height: 1.4;
                    background: white;
                }
                
                .tabla-reportes-c5 tbody tr:nth-child(even) {
                    background: #f8f9fa;
                }
                
                .tabla-reportes-c5 tbody tr:hover {
                    background: #e3f2fd !important;
                }
                
                .badge-estado {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    display: inline-block;
                    min-width: 80px;
                    text-align: center;
                }
                
                .folio-input {
                    width: 120px;
                    padding: 5px 8px;
                    border: 1px solid #dee2e6;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.85rem;
                }
                
                .folio-input:focus {
                    border-color: #3498db;
                    box-shadow: 0 0 0 3px rgba(52,152,219,0.1);
                    outline: none;
                }
                
                .btn-folio {
                    padding: 5px 10px;
                    background: #2ecc71;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.8rem;
                    margin-left: 5px;
                }
                
                .btn-folio:hover {
                    background: #27ae60;
                }
                
                .btn-accion {
                    width: 32px;
                    height: 32px;
                    border-radius: 4px;
                    border: none;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin: 2px;
                }
                
                .btn-accion:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                
                .btn-detalles {
                    background: #3498db;
                    color: white;
                }
                
                .btn-whatsapp {
                    background: #25D366;
                    color: white;
                }
            </style>
            
            <table class="tabla-reportes-c5">
                <thead>
                    <tr>
                        <th style="width: 100px;">FOLIO C4</th>
                        <th style="width: 120px;">FOLIO C5</th>
                        <th style="width: 80px;">FECHA</th>
                        <th style="width: 70px;">HORA</th>
                        <th style="width: 120px;">MOTIVO</th>
                        <th style="width: 180px;">UBICACIÓN</th>
                        <th style="width: 200px;">DESCRIPCIÓN</th>
                        <th style="width: 100px;">AGENTE</th>
                        <th style="width: 150px;">CONCLUSIÓN</th>
                        <th style="width: 90px;">ESTADO</th>
                        <th style="width: 80px;">ACCIONES</th>
                    </tr>
                </thead>
                <tbody id="tabla-body">
                    ${reportesFiltrados.map((reporte, index) => this.getFilaTabla(reporte, index)).join('')}
                </tbody>
            </table>
            
            <div style="padding: 15px; background: #f8f9fa; border-top: 1px solid #e9ecef;">
                <div style="color: #7f8c8d; font-size: 0.85rem; text-align: center;">
                    <i class="fas fa-info-circle"></i> Mostrando ${reportesFiltrados.length} de ${this.reportes.length} reportes
                </div>
            </div>
        `;
        
        this.bindTableEvents();
    }

    getFilaTabla(reporte, index) {
        // Determinar colores y texto para estado
        let estadoColor = '#6c757d';
        let estadoTexto = 'DESCONOCIDO';
        
        if (reporte.folio_c5) {
            estadoColor = '#28a745';
            estadoTexto = 'RECIBIDO';
        } else {
            estadoColor = '#e74c3c';
            estadoTexto = 'PENDIENTE';
        }
        
        // Acortar descripción
        let descripcionCorta = reporte.descripcion || '--';
        if (descripcionCorta.length > 80) {
            descripcionCorta = descripcionCorta.substring(0, 80) + '...';
        }
        
        // Acortar ubicación
        let ubicacionCorta = reporte.ubicacion || '--';
        if (ubicacionCorta.length > 50) {
            ubicacionCorta = ubicacionCorta.substring(0, 50) + '...';
        }
        
        // Input para folio C5 si está pendiente
        let folioC5Cell = '';
        if (reporte.folio_c5) {
            folioC5Cell = `
                <span style="font-family: 'Courier New', monospace; font-weight: bold; color: #2ecc71;">
                    ${reporte.folio_c5}
                </span>
            `;
        } else {
            folioC5Cell = `
                <div style="display: flex; align-items: center;">
                    <input type="text" 
                           class="folio-input" 
                           id="folio-input-${index}"
                           placeholder="C5-XXXX"
                           data-index="${index}"
                           data-folio="${reporte.folio_c4}">
                    <button class="btn-folio" 
                            data-index="${index}"
                            data-folio="${reporte.folio_c4}">
                        <i class="fas fa-save"></i>
                    </button>
                </div>
            `;
        }
        
        return `
            <tr>
                <td style="font-family: 'Courier New', monospace; font-weight: bold; color: #2c3e50;">
                    ${reporte.folio_c4 || '--'}
                </td>
                <td>
                    ${folioC5Cell}
                </td>
                <td>${reporte.fecha_envio || '--'}</td>
                <td>${reporte.hora_envio ? reporte.hora_envio.substring(0,5) : '--'}</td>
                <td style="font-weight: 600;">${reporte.motivo || '--'}</td>
                <td title="${reporte.ubicacion || ''}">${ubicacionCorta}</td>
                <td title="${reporte.descripcion || ''}">${descripcionCorta}</td>
                <td>${reporte.agente || '--'}</td>
                <td>${reporte.conclusion || '--'}</td>
                <td>
                    <span class="badge-estado" style="background: ${estadoColor}; color: white;">
                        ${estadoTexto}
                    </span>
                </td>
                <td style="white-space: nowrap;">
                    <button class="btn-accion btn-detalles" 
                            data-action="ver" 
                            data-folio="${reporte.folio_c4}"
                            title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-accion btn-whatsapp" 
                            onclick="app.currentView.currentSubView.reenviarWhatsApp('${reporte.folio_c4}')"
                            title="Reenviar por WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    bindTableEvents() {
        // Botones Ver Detalles
        this.container.querySelectorAll('.btn-detalles').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const folio = e.target.closest('button').dataset.folio;
                this.verDetallesReporte(folio);
            });
        });

        // Botones Guardar Folio C5
        this.container.querySelectorAll('.btn-folio').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.closest('.btn-folio').dataset.index;
                const folioC4 = e.target.closest('.btn-folio').dataset.folio;
                this.guardarFolioInline(index, folioC4);
            });
        });

        // Permitir Enter en inputs de folio
        this.container.querySelectorAll('.folio-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const index = e.target.id.replace('folio-input-', '');
                    const folioC4 = e.target.dataset.folio;
                    if (folioC4) {
                        this.guardarFolioInline(index, folioC4);
                    }
                }
            });
        });
    }

    verDetallesReporte(folio) {
        const reporte = this.reportes.find(r => r.folio_c4 === folio);
        if (!reporte) return;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.7); z-index: 1000; display: flex; 
            align-items: center; justify-content: center; padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="background: white; width: 90%; max-width: 800px; border-radius: 8px; overflow: hidden; border: 2px solid #2c3e50;">
                <div style="background: #2c3e50; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 1.3rem; font-weight: 600;">
                        <i class="fas fa-file-alt" style="margin-right: 10px;"></i>
                        DETALLES DEL REPORTE - ${reporte.folio_c4}
                    </h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div style="padding: 25px; max-height: 70vh; overflow-y: auto;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <div style="color: #7f8c8d; font-size: 0.85rem; margin-bottom: 5px;">FOLIO C4</div>
                            <div style="font-family: 'Courier New', monospace; font-size: 1.3rem; font-weight: 700; color: #2c3e50;">
                                ${reporte.folio_c4}
                            </div>
                        </div>
                        <div>
                            <div style="color: #7f8c8d; font-size: 0.85rem; margin-bottom: 5px;">FOLIO C5</div>
                            <div style="font-family: 'Courier New', monospace; font-size: 1.3rem; font-weight: 700; color: ${reporte.folio_c5 ? '#2ecc71' : '#e74c3c'};">
                                ${reporte.folio_c5 || 'PENDIENTE'}
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <div>
                                <div style="color: #7f8c8d; font-size: 0.85rem; margin-bottom: 5px;">FECHA</div>
                                <div style="font-weight: 600; color: #2c3e50;">${reporte.fecha_envio}</div>
                            </div>
                            <div>
                                <div style="color: #7f8c8d; font-size: 0.85rem; margin-bottom: 5px;">HORA</div>
                                <div style="font-weight: 600; color: #2c3e50;">${reporte.hora_envio ? reporte.hora_envio.substring(0,5) : '--'}</div>
                            </div>
                            <div>
                                <div style="color: #7f8c8d; font-size: 0.85rem; margin-bottom: 5px;">ESTADO</div>
                                <div>
                                    <span style="display: inline-block; padding: 3px 8px; background: ${reporte.folio_c5 ? '#28a745' : '#e74c3c'}; color: white; border-radius: 4px; font-weight: 600;">
                                        ${reporte.folio_c5 ? 'RECIBIDO' : 'PENDIENTE'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <div style="color: #7f8c8d; font-size: 0.85rem; margin-bottom: 5px;">MOTIVO</div>
                        <div style="font-weight: 700; color: #2c3e50; font-size: 1.1rem;">
                            ${reporte.motivo || '--'}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <div style="color: #7f8c8d; font-size: 0.85rem; margin-bottom: 5px;">UBICACIÓN EXACTA</div>
                        <div style="font-weight: 600; color: #2c3e50;">${reporte.ubicacion || '--'}</div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <div style="color: #7f8c8d; font-size: 0.85rem; margin-bottom: 5px;">DESCRIPCIÓN DETALLADA</div>
                        <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; line-height: 1.6;">
                            ${reporte.descripcion || 'Sin descripción'}
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <div style="color: #7f8c8d; font-size: 0.85rem; margin-bottom: 5px;">AGENTE / PATRULLA</div>
                            <div style="font-weight: 600; color: #2c3e50;">${reporte.agente || '--'}</div>
                        </div>
                        <div>
                            <div style="color: #7f8c8d; font-size: 0.85rem; margin-bottom: 5px;">CONCLUSIÓN</div>
                            <div style="font-weight: 600; color: #2c3e50;">${reporte.conclusion || '--'}</div>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 20px;">
                        <div style="color: #7f8c8d; font-size: 0.85rem; margin-bottom: 5px;">INFORMACIÓN DE REGISTRO</div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: #2c3e50;">
                            <div>
                                <i class="fas fa-user"></i> ${reporte.usuario_registro || '--'}
                            </div>
                            <div>
                                <i class="fas fa-calendar"></i> ${reporte.created_at ? reporte.created_at.substring(0, 16).replace('T', ' ') : '--'}
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center; display: flex; gap: 10px; justify-content: center;">
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                style="padding: 10px 20px; background: #95a5a6; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                            <i class="fas fa-times"></i> Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async guardarFolioInline(index, folioC4) {
        const input = this.container.querySelector(`#folio-input-${index}`);
        if (!input) return;
        
        const folioC5 = input.value.trim();
        if (!folioC5) {
            this.mostrarAlerta('⚠️ CAMPO VACÍO', 'Por favor, ingresa un folio C5 válido', 'error');
            input.focus();
            return;
        }
        
        await this.registrarFolioC5(folioC4, folioC5);
    }

    async registrarFolioC5(folioC4, folioC5) {
        if (typeof C5Service !== 'undefined') {
            try {
                const resultado = await C5Service.registrarFolioC5(folioC4, folioC5);               
                if (resultado.success) {
                    this.mostrarAlerta('FOLIO C5 REGISTRADO', `Folio registrado exitosamente:\nC4: ${folioC4}\nC5: ${folioC5}`, 'success');
                    await this.cargarReportes();
                } else {
                    this.mostrarAlerta('⚠️ ERROR', resultado.message, 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                this.mostrarAlerta('⚠️ ERROR', 'Error al registrar. Verifica la conexión.', 'error');
            }
        } else {
            // Modo simulación
            this.mostrarAlerta('FOLIO C5 REGISTRADO LOCALMENTE', `Folio registrado localmente:\nC4: ${folioC4}\nC5: ${folioC5}\n\n(Nota: Para sincronizar con el servidor, activa el servicio C5)`, 'success');
            
            const reporteIndex = this.reportes.findIndex(r => r.folio_c4 === folioC4);
            if (reporteIndex !== -1) {
                this.reportes[reporteIndex].folio_c5 = folioC5;
                this.renderizarTabla();
                this.actualizarEstadisticas();
            }
        }
    }

    aplicarFiltros() {
        this.renderizarTabla();
        this.mostrarInfoFiltros();
    }

    limpiarFiltros() {
        this.filtros = {
            estado: '',
            folio: ''
        };
        
        const filtroEstado = this.container.querySelector('#filtro-estado');
        const filtroFolio = this.container.querySelector('#filtro-folio');
        
        if (filtroEstado) filtroEstado.value = '';
        if (filtroFolio) filtroFolio.value = '';
        
        this.renderizarTabla();
        this.mostrarInfoFiltros();
    }

    mostrarInfoFiltros() {
        const filtroInfo = this.container.querySelector('#filtro-info');
        const filtroTexto = this.container.querySelector('#filtro-texto');
        
        if (!filtroInfo || !filtroTexto) return;
        
        const filtrosActivos = [];
        
        if (this.filtros.estado) {
            filtrosActivos.push(`Estado: ${this.filtros.estado.toUpperCase()}`);
        }
        if (this.filtros.folio) {
            filtrosActivos.push(`Folio: ${this.filtros.folio}`);
        }
        
        if (filtrosActivos.length > 0) {
            filtroTexto.textContent = filtrosActivos.join(' | ');
            filtroInfo.style.display = 'block';
        } else {
            filtroInfo.style.display = 'none';
        }
    }

    getDatosEjemploCompletos() {
        return [
            {
                id: 1,
                folio_c4: '2601241430',
                folio_c5: 'C5-2024-001',
                fecha_envio: '2024-01-26',
                hora_envio: '14:30:00',
                motivo: 'VEHÍCULO SOSPECHOSO',
                ubicacion: 'AV. PRINCIPAL Y CALLE 5, COL. CENTRO',
                descripcion: 'Vehículo gris estacionado por más de 2 horas frente al domicilio 123',
                agente: 'PATRULLA 45',
                conclusion: 'SITUACIÓN CONTROLADA - VEHÍCULO RETIRADO',
                estado: 'recibido',
                metodo_envio: 'whatsapp',
                numero_destino: '5512345678',
                usuario_registro: 'operador1',
                created_at: '2024-01-26 14:35:00',
                updated_at: '2024-01-26 15:00:00'
            },
            {
                id: 2,
                folio_c4: '2601241015',
                folio_c5: null,
                fecha_envio: '2024-01-26',
                hora_envio: '10:15:00',
                motivo: 'RUIDO EXCESIVO',
                ubicacion: 'CALLE 10 NORTE #456, COL. HÉROES',
                descripcion: 'Ruido excesivo procedente de fiesta, vecinos reportan desde las 02:00 hrs',
                agente: 'ROBLE 1',
                conclusion: '',
                estado: 'pendiente',
                metodo_envio: 'radio',
                numero_destino: '',
                usuario_registro: 'operador2',
                created_at: '2024-01-26 10:20:00',
                updated_at: '2024-01-26 10:20:00'
            },
            {
                id: 3,
                folio_c4: '2501240910',
                folio_c5: 'C5-2024-002',
                fecha_envio: '2024-01-25',
                hora_envio: '09:10:00',
                motivo: 'ACCIDENTE VIAL',
                ubicacion: 'BLVD. UNIVERSIDAD Y CALLE 8',
                descripcion: 'Choque entre automóvil y motocicleta, hay heridos',
                agente: 'AMBULANCIA 3, PATRULLA 12',
                conclusion: 'HERIDOS TRASLADADOS AL HOSPITAL',
                estado: 'recibido',
                metodo_envio: 'telefono',
                numero_destino: '5512345679',
                usuario_registro: 'operador1',
                created_at: '2024-01-25 09:15:00',
                updated_at: '2024-01-25 11:30:00'
            }
        ];
    }

    reenviarWhatsApp(folio) {
        const reporte = this.reportes.find(r => r.folio_c4 === folio);
        if (!reporte) return;
        
        const texto = `FOLIO: ${reporte.folio_c4}
HORA: ${reporte.hora_envio?.substring(0,5) || ''}
MOTIVO: ${reporte.motivo}
UBICACIÓN: ${reporte.ubicacion}
DESCRIPCIÓN: ${reporte.descripcion || ''}
AGENTE: ${reporte.agente || ''}
CONCLUSIÓN: ${reporte.conclusion || ''}

*Reenvío desde SAS C4*`;
        
        const textoCodificado = encodeURIComponent(texto);
        const whatsappLink = `https://wa.me/?text=${textoCodificado}`;
        
        window.open(whatsappLink, '_blank');
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

    exportarAExcel() {
        if (this.reportes.length === 0) {
            this.mostrarAlerta('⚠️ SIN DATOS', 'No hay datos para exportar', 'error');
            return;
        }
        
        // Crear CSV sin columna de método
        let csv = 'Folio C4,Folio C5,Fecha,Hora,Motivo,Ubicación,Descripción,Agente,Conclusión,Estado,Registrado por,Fecha Registro\n';
        
        this.reportes.forEach(reporte => {
            const estado = reporte.folio_c5 ? 'RECIBIDO' : 'PENDIENTE';
            const row = [
                reporte.folio_c4 || '',
                reporte.folio_c5 || '',
                reporte.fecha_envio || '',
                reporte.hora_envio ? reporte.hora_envio.substring(0,5) : '',
                reporte.motivo || '',
                reporte.ubicacion || '',
                `"${(reporte.descripcion || '').replace(/"/g, '""')}"`,
                reporte.agente || '',
                reporte.conclusion || '',
                estado,
                reporte.usuario_registro || '',
                reporte.created_at ? reporte.created_at.substring(0, 16).replace('T', ' ') : ''
            ];
            
            csv += row.join(',') + '\n';
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `reportes_c5_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.mostrarAlerta(' EXPORTACIÓN COMPLETADA', `Se exportaron ${this.reportes.length} reportes a Excel`, 'success');
    }

    cleanup() {
        if (this.expandedContainer && this.expandedContainer.parentNode) {
            this.expandedContainer.parentNode.removeChild(this.expandedContainer);
        }
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        this.expandedContainer = null;
    }
}

window.C5ListView = C5ListView;