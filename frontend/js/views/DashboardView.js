/**
 * DASHBOARDVIEW.JS - Vista principal con tabla
 */

class DashboardView {
    constructor(currentUser, appController) {
        this.currentUser = currentUser;
        this.appController = appController;
        this.data = [];
    }

    async render(container) {
        this.container = container;
        this.container.innerHTML = this.getTemplate();
        await this.loadData();
        this.bindEvents();
    }

    getTemplate() {
        return `
            <div class="fade-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h2 style="margin: 0; color: #2c3e50;"><i class="fas fa-table"></i> Bitácora de Operaciones</h2>
                        <p class="text-muted" style="margin: 0;">Turno: <strong>${this.currentUser.turno || 'General'}</strong> | ${new Date().toLocaleDateString()}</p>
                    </div>
                    <button id="btn-nueva-llamada" class="btn btn-primary" style="box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11);">
                        <i class="fas fa-plus"></i> Nueva Llamada
                    </button>
                </div>

                <div class="dashboard-grid" style="grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
                    <div class="card-stat" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px;">
                        <h3 id="stat-total" style="font-size: 2rem; margin: 0;">--</h3>
                        <small>Total Hoy</small>
                    </div>
                    <div class="card-stat" style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f6d365; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <h3 id="stat-matutino" style="font-size: 1.5rem; margin: 0; color: #333;">--</h3>
                        <small class="text-muted">Matutino</small>
                    </div>
                    <div class="card-stat" style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #ff6b6b; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <h3 id="stat-vespertino" style="font-size: 1.5rem; margin: 0; color: #333;">--</h3>
                        <small class="text-muted">Vespertino</small>
                    </div>
                    <div class="card-stat" style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #4ecdc4; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <h3 id="stat-nocturno" style="font-size: 1.5rem; margin: 0; color: #333;">--</h3>
                        <small class="text-muted">Nocturno</small>
                    </div>
                </div>

                <div class="table-container" style="background: white; border-radius: 8px; box-shadow: 0 0 20px rgba(0,0,0,0.05); overflow: hidden;">
                    <div class="table-header" style="padding: 15px; border-bottom: 1px solid #eee; background: #f8f9fa;">
                        <h4 style="margin: 0; font-size: 1.1rem;"><i class="fas fa-list-alt"></i> Últimos Registros</h4>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-hover" style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                            <thead style="background: #2c3e50; color: white;">
                                <tr>
                                    <th style="padding: 12px;">Hora</th>
                                    <th style="padding: 12px;">Folio/ID</th>
                                    <th style="padding: 12px;">Motivo</th>
                                    <th style="padding: 12px;">Ubicación</th>
                                    <th style="padding: 12px;">Colonia</th>
                                    <th style="padding: 12px;">Estado</th>
                                    <th style="padding: 12px;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-llamadas-body">
                                <tr>
                                    <td colspan="7" style="text-align: center; padding: 30px;">
                                        <i class="fas fa-spinner fa-spin fa-2x"></i><br>Cargando datos...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    async loadData() {
        try {
            // Actualizar estadísticas
            await this.updateStats();
            
            // Cargar tabla
            await this.fetchAndRenderTable();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Error cargando datos del dashboard');
        }
    }

    async updateStats() {
        try {
            if (typeof LlamadasService !== 'undefined') {
                const hoy = new Date().toISOString().split('T')[0];
                const stats = await LlamadasService.obtenerEstadisticas(hoy, hoy);
                
                if (stats.success) {
                    // Actualizar estadísticas con datos reales
                    document.getElementById('stat-total').innerText = stats.total || 0;
                    // Puedes agregar más estadísticas según tu backend
                }
            }
        } catch (error) {
            console.warn('No se pudieron cargar estadísticas, usando valores por defecto');
            document.getElementById('stat-total').innerText = "5";
            document.getElementById('stat-matutino').innerText = "3";
            document.getElementById('stat-vespertino').innerText = "2";
            document.getElementById('stat-nocturno').innerText = "0";
        }
    }

    async fetchAndRenderTable() {
        const tbody = document.getElementById('tabla-llamadas-body');
        
        try {
            let llamadas = [];
            
            if (typeof LlamadasService !== 'undefined') {
                const response = await LlamadasService.obtenerLlamadas();
                if(response.success) {
                    llamadas = response.data;
                }
            }

            // Datos de prueba si no hay conexión
            if (llamadas.length === 0) {
                llamadas = [
                    { id: 105, hora: '14:30', motivo: 'Vehículo sospechoso', ubicacion: 'Calle 5 Sur', colonia: 'Centro', estatus: 'Pendiente' },
                    { id: 104, hora: '13:15', motivo: 'Ruido excesivo', ubicacion: 'Av. Independencia', colonia: 'Héroes', estatus: 'Atendido' },
                    { id: 103, hora: '12:45', motivo: 'Accidente vial', ubicacion: 'Blvd. Principal', colonia: 'San Nicolas', estatus: 'En Proceso' },
                    { id: 102, hora: '11:20', motivo: 'Apoyo ciudadano', ubicacion: 'Calle Reforma', colonia: 'Centro', estatus: 'Atendido' },
                    { id: 101, hora: '09:05', motivo: 'Persona agresiva', ubicacion: 'Mercado 16', colonia: 'La Purísima', estatus: 'Atendido' }
                ];
            }

            this.renderTable(llamadas);
            
        } catch (error) {
            console.error("Error crítico:", error);
            tbody.innerHTML = `<tr><td colspan="7" class="text-danger text-center">Error al cargar datos.</td></tr>`;
        }
    }

    renderTable(llamadas) {
        const tbody = document.getElementById('tabla-llamadas-body');
        tbody.innerHTML = '';
        
        llamadas.forEach(item => {
            const row = document.createElement('tr');
            row.style.borderBottom = "1px solid #eee";
            
            let badgeColor = '#6c757d';
            if(item.estatus === 'Atendido') badgeColor = '#28a745';
            if(item.estatus === 'En Proceso') badgeColor = '#ffc107';
            if(item.estatus === 'Pendiente') badgeColor = '#dc3545';

            row.innerHTML = `
                <td style="padding: 12px; font-weight: bold;">${item.hora}</td>
                <td style="padding: 12px;">#${item.id}</td>
                <td style="padding: 12px;">${item.motivo}</td>
                <td style="padding: 12px;">${item.ubicacion}</td>
                <td style="padding: 12px;">${item.colonia}</td>
                <td style="padding: 12px;">
                    <span style="background: ${badgeColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8em;">
                        ${item.estatus || 'Registrado'}
                    </span>
                </td>
                <td style="padding: 12px;">
                    <button class="btn btn-sm btn-view" data-id="${item.id}" style="background: #e9ecef; color: #333;" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    bindEvents() {
        // Botón Nueva Llamada
        const btnNueva = document.getElementById('btn-nueva-llamada');
        if (btnNueva) {
            btnNueva.addEventListener('click', () => {
                this.appController.loadView('llamadas');
            });
        }

        // Botones Ver Detalles
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.btn-view')) {
                const id = e.target.closest('.btn-view').dataset.id;
                this.verDetalles(id);
            }
        });
    }

    verDetalles(id) {
        alert(`Ver detalles de llamada #${id}\n\n(Esta funcionalidad se implementará pronto)`);
    }

    showError(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-error';
        alertDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        
        this.container.prepend(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }

    cleanup() {
        // Limpiar event listeners si es necesario
    }
}
window.DashboardView = DashboardView;
