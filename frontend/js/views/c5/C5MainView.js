class C5MainView {
    constructor(currentUser, controller) {
        this.currentUser = currentUser;
        this.controller = controller;
        this.colors = {
            primary: '#003366',
            secondary: '#0a4d8c',
            accent: '#ff6b35',
            accentGreen: '#28a745',
            accentRed: '#dc3545',
            light: '#f8f9fa',
            dark: '#212529',
            gray: '#6c757d',
            border: '#dee2e6'
        };
    }

    render(container) {
        this.container = container;
        this.container.className = 'dashboard-c5-command';
        this.container.innerHTML = this.getTemplate();
        this.bindEvents();
        this.loadRecentActivity();
    }

    getTemplate() {
        return `
            <div class="c5-command-center">
                <!-- CONTENIDO PRINCIPAL -->
                <div class="c5-main-content">
                    
                    <!-- Header & Acciones Rápidas -->
                    <div class="c5-header-container">
                        <div style="display: flex; gap: 20px; align-items: flex-end;">
                            <button class="btn-back-to-dashboard" title="Volver al Menú Principal" style="background: #e2e8f0; color: #64748b; border: none; width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; margin-bottom: 6px;" onmouseover="this.style.background='#cbd5e1'; this.style.color='#0f172a'" onmouseout="this.style.background='#e2e8f0'; this.style.color='#64748b'">
                                <i class="fas fa-arrow-left" style="font-size: 1.2rem;"></i>
                            </button>
                            <div class="c5-page-title">
                                <h2 style="margin: 0; padding-bottom: 2px;">Centro de envio C5</h2>
                            </div>
                        </div>
                        
                        <div class="c5-quick-actions">
                            <button class="c5-action-btn history card-c5-list">
                                <i class="fas fa-history"></i> Historial y Consultas
                            </button>
                            <button class="c5-action-btn new-report card-c5-new">
                                <i class="fas fa-plus-circle"></i> Nuevo Reporte
                            </button>
                        </div>
                    </div>

                    <!-- Barra de Estado -->
                    <div class="c5-status-bar">
                        <div class="c5-system-status">
                            <div class="status-indicator">
                                <span class="status-dot online"></span>
                                Conexión SQS Establecida y En Línea
                            </div>
                        </div>
                        <div class="c5-operator-info">
                            <i class="fas fa-user-shield"></i> Operador: ${this.currentUser?.nombre || this.currentUser?.username || 'CERIT'}
                        </div>
                    </div>

                    <!-- Métricas Rápidas (Analytics Grid) -->
                    <div class="c5-analytics-grid">
                        <div class="c5-stat-box">
                            <div class="c5-stat-icon-wrapper stat-blue">
                                <i class="fas fa-chart-bar"></i>
                            </div>
                            <div class="c5-stat-info">
                                <h3 id="stat-total">12</h3>
                                <p>Reportes Enviados Hoy</p>
                            </div>
                        </div>
                        <div class="c5-stat-box">
                            <div class="c5-stat-icon-wrapper stat-green">
                                <i class="fas fa-check-double"></i>
                            </div>
                            <div class="c5-stat-info">
                                <h3 id="stat-success">9</h3>
                                <p>Folios Sincronizados</p>
                            </div>
                        </div>
                        <div class="c5-stat-box">
                            <div class="c5-stat-icon-wrapper stat-orange">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="c5-stat-info">
                                <h3 id="stat-pending">3</h3>
                                <p>Respuestas Pendientes SQS</p>
                            </div>
                        </div>
                    </div>

                    <!-- Actividad Reciente -->
                    <div class="c5-activity-panel">
                        <div class="c5-panel-header">
                            <h3><i class="fas fa-stream" style="color: #2563eb;"></i> Registros Reciente </h3>
                            <button style="background:none; border:none; color: #64748b; cursor:pointer;" title="Actualizar">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                        <div class="c5-panel-body">
                            <table class="c5-recent-table">
                                <thead>
                                    <tr>
                                        <th>Hora</th>
                                        <th>Folio C4</th>
                                        <th>Folio C5</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody id="c5-recent-body">
                                    <tr><td colspan="4" class="c5-empty-state"><i class="fas fa-spinner fa-spin"></i><br>Cargando actividad...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        `;
    }

    async loadRecentActivity() {
        const tbody = this.container.querySelector('#c5-recent-body');
        if (!tbody) return;

        try {
            let reportes = [];
            if (typeof C5Service !== 'undefined') {
                const resultado = await C5Service.obtenerReportes({ limite: 8 });
                if (resultado.success) {
                    reportes = resultado.data.slice(0, 8);
                }
            }

            if (reportes.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4">
                            <div class="c5-empty-state">
                                <i class="fas fa-inbox"></i>
                                <p>No hay actividad reciente registrada hoy</p>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            // Update stats
            const totalPendientes = reportes.filter(r => r.estado === 'pendiente' || !r.folio_c5).length;
            const conFolio = reportes.filter(r => r.folio_c5).length;

            const totalEl = this.container.querySelector('#stat-total');
            const penEl = this.container.querySelector('#stat-pendientes');
            const exiEl = this.container.querySelector('#stat-exito');

            if (totalEl) totalEl.textContent = reportes.length;
            if (penEl) penEl.textContent = totalPendientes;
            if (exiEl) {
                const exito = reportes.length > 0 ? Math.round((conFolio / reportes.length) * 100) : 0;
                exiEl.textContent = `${exito}%`;
            }

            let html = '';
            reportes.forEach(m => {
                const date = new Date(m.fecha_hora_recepcion || m.fecha_creacion || new Date());
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const c5Cell = m.folio_c5
                    ? `<span class="folio-c5">${m.folio_c5}</span>`
                    : `<span style="color: #94a3b8; font-size: 0.85rem;"><i class="fas fa-circle-notch fa-spin"></i> Pendiente</span>`;

                const statusCell = m.folio_c5
                    ? `<span style="color: #10b981; font-weight: 500;"><i class="fas fa-check-circle"></i> Sincronizado</span>`
                    : `<span class="folio-pending"><i class="fas fa-exclamation-circle"></i> Esperando Respuesta</span>`;

                html += `
                    <tr>
                        <td style="color: #64748b; font-weight: 500;">${timeStr}</td>
                        <td class="folio-c4">${m.folio_c4 || 'N/A'}</td>
                        <td>${c5Cell}</td>
                        <td>${statusCell}</td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;
        } catch (error) {
            console.error('Error cargando actividad reciente:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: var(--c5-accent-red); padding: 20px;">
                        <i class="fas fa-exclamation-triangle"></i> Error al cargar los datos
                    </td>
                </tr>
            `;
        }
    }
    bindEvents() {
        const btnNew = this.container.querySelector('.card-c5-new');
        if (btnNew) {
            btnNew.addEventListener('click', () => {
                this.controller.showNewReport();
            });
        }

        const btnList = this.container.querySelector('.card-c5-list');
        if (btnList) {
            btnList.addEventListener('click', () => {
                this.controller.showList();
            });
        }

        const btnBack = this.container.querySelector('.btn-back-to-dashboard');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                this.controller.appController.goToDashboard();
            });
        }
    }

    cleanup() {

    }
}

window.C5MainView = C5MainView;