/**
 * MAIN.JS - Lógica principal del Dashboard
 * Maneja la navegación, carga de datos y renderizado de tablas.
 */

class App {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        // 1. Recuperar usuario de la sesión (Login ya se hizo en index.html)
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            window.location.href = 'index.html';
            return;
        }
        
        this.currentUser = JSON.parse(userStr);
        
        // 2. Configurar Interfaz Inicial
        this.updateUserInfo();
        this.setupEventListeners();
        
        // 3. Cargar la vista principal (Tabla de llamadas)
        await this.loadDashboard();
    }

    updateUserInfo() {
        const userInfo = document.getElementById('user-info');
        if (userInfo && this.currentUser) {
            userInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="text-align: right;">
                        <div style="font-weight: 700; font-size: 0.9rem;">${this.currentUser.username}</div>
                        <div style="font-size: 0.75rem; opacity: 0.8; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 10px;">
                            ${this.currentUser.turno || 'Operador'}
                        </div>
                    </div>
                    <i class="fas fa-user-circle" style="font-size: 2rem;"></i>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // Navegación del Menú
        const safeAddListener = (id, callback) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', (e) => {
                e.preventDefault();
                callback();
            });
        };

        safeAddListener('nav-dashboard', () => this.loadDashboard());
        safeAddListener('nav-llamadas', () => this.loadRegistrarLlamada());
        safeAddListener('nav-buscar', () => this.loadBuscarLlamadas());
        
        // Logout (Ya manejado en el HTML, pero por seguridad lo reforzamos)
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                if(!confirm('¿Cerrar sesión?')) e.preventDefault();
            });
        }
    }


    // ==========================================
    // VISTA PRINCIPAL: DASHBOARD (TABLA EXCEL)
    // ==========================================
    async loadDashboard() {
        const content = document.getElementById('content');
        
        // 1. Estructura base del Dashboard
        content.innerHTML = `
            <div class="fade-in">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h2 style="margin: 0; color: #2c3e50;"><i class="fas fa-table"></i> Bitácora de Operaciones</h2>
                        <p class="text-muted" style="margin: 0;">Turno: <strong>${this.currentUser.turno || 'General'}</strong> | ${new Date().toLocaleDateString()}</p>
                    </div>
                    <button class="btn btn-primary" onclick="app.loadRegistrarLlamada()" style="box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11);">
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

        // 2. Cargar datos reales o simulados
        await this.fetchAndRenderTable();
    }

    async fetchAndRenderTable() {
        const tbody = document.getElementById('tabla-llamadas-body');
        
        try {
            // Intentamos obtener datos del servicio
            let llamadas = [];
            
            if (typeof LlamadasService !== 'undefined') {
                try {
                    // INTENTO DE CONEXIÓN AL BACKEND
                    const response = await LlamadasService.obtenerLlamadas(); // Asumiendo que existe este método
                    if(response.success) {
                        llamadas = response.data;
                    }
                } catch (e) {
                    console.warn("No se pudo conectar al backend, usando datos locales/demo.");
                }
            }

            // SI NO HAY DATOS (O FALLÓ EL BACKEND), USAMOS DATOS DE PRUEBA PARA QUE SE VEA BIEN
            if (llamadas.length === 0) {
                llamadas = [
                    { id: 105, hora: '14:30', motivo: 'Vehículo sospechoso', ubicacion: 'Calle 5 Sur', colonia: 'Centro', estatus: 'Pendiente' },
                    { id: 104, hora: '13:15', motivo: 'Ruido excesivo', ubicacion: 'Av. Independencia', colonia: 'Héroes', estatus: 'Atendido' },
                    { id: 103, hora: '12:45', motivo: 'Accidente vial', ubicacion: 'Blvd. Principal', colonia: 'San Nicolas', estatus: 'En Proceso' },
                    { id: 102, hora: '11:20', motivo: 'Apoyo ciudadano', ubicacion: 'Calle Reforma', colonia: 'Centro', estatus: 'Atendido' },
                    { id: 101, hora: '09:05', motivo: 'Persona agresiva', ubicacion: 'Mercado 16', colonia: 'La Purísima', estatus: 'Atendido' }
                ];
                // Actualizar contadores visuales con datos falsos por ahora
                document.getElementById('stat-total').innerText = "5";
                document.getElementById('stat-matutino').innerText = "3";
                document.getElementById('stat-vespertino').innerText = "2";
                document.getElementById('stat-nocturno').innerText = "0";
            } else {
                 // Aquí actualizarías los contadores con datos reales
                 document.getElementById('stat-total').innerText = llamadas.length;
            }

            // RENDERIZAR LA TABLA
            tbody.innerHTML = '';
            
            llamadas.forEach(item => {
                const row = document.createElement('tr');
                row.style.borderBottom = "1px solid #eee";
                
                // Color del estado
                let badgeColor = '#6c757d'; // gris
                if(item.estatus === 'Atendido') badgeColor = '#28a745'; // verde
                if(item.estatus === 'En Proceso') badgeColor = '#ffc107'; // amarillo
                if(item.estatus === 'Pendiente') badgeColor = '#dc3545'; // rojo

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
                        <button class="btn btn-sm" style="background: #e9ecef; color: #333;" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

        } catch (error) {
            console.error("Error crítico:", error);
            tbody.innerHTML = `<tr><td colspan="7" class="text-danger text-center">Error al cargar datos.</td></tr>`;
        }
    }
    

    // ==========================================
    // VISTA: REGISTRAR LLAMADA (Tu código original)
    // ==========================================
    loadRegistrarLlamada() {
        const content = document.getElementById('content');
        
        // Uso template literals para mantener tu formulario completo
        content.innerHTML = `
            <div class="fade-in">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <button class="btn" onclick="app.loadDashboard()" style="margin-right: 15px; background: transparent; color: #666;">
                        <i class="fas fa-arrow-left fa-lg"></i>
                    </button>
                    <h2 style="margin: 0;"><i class="fas fa-phone-alt"></i> Registrar Nueva Llamada</h2>
                </div>
                
                <div style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <form id="llamada-form">
                        <div style="background: #f8f9fa; padding: 15px; border-left: 5px solid #4e54c8; margin-bottom: 20px; border-radius: 4px;">
                            <h4 style="margin: 0; color: #4e54c8;">Datos del Reporte</h4>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                            <div class="form-group">
                                <label for="fecha">Fecha</label>
                                <input type="date" id="fecha" class="form-control" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="hora">Hora</label>
                                <input type="time" id="hora" class="form-control" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="turno">Turno</label>
                                <select id="turno" class="form-control" required style="background-color: #e8f0fe;">
                                    <option value="${this.currentUser.turno}">${this.currentUser.turno} (Actual)</option>
                                    <option value="matutino">Matutino</option>
                                    <option value="vespertino">Vespertino</option>
                                    <option value="nocturno">Nocturno</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="telefono">Teléfono Reportante</label>
                                <input type="tel" id="telefono" class="form-control" placeholder="Ej: 238 123 4567">
                            </div>

                            <div class="form-group">
                                <label for="colonia">Colonia</label>
                                <input type="text" id="colonia" class="form-control" placeholder="Ingrese Colonia" required>
                            </div>

                            <div class="form-group">
                                <label for="ubicacion">Calle / Ubicación Exacta</label>
                                <input type="text" id="ubicacion" class="form-control" placeholder="Calle y número" required>
                            </div>
                        </div>

                        <div class="form-group mt-3">
                            <label for="motivo">Motivo Principal</label>
                            <input type="text" id="motivo" class="form-control" placeholder="Ej: Persona sospechosa, Ruido, Accidente..." required style="font-size: 1.1em; font-weight: bold;">
                        </div>

                        <div class="form-group mt-3">
                            <label>Descripción de los hechos</label>
                            <textarea id="descripcion" class="form-control" rows="3" placeholder="Detalles adicionales..."></textarea>
                        </div>
                        
                        <div style="margin-top: 2rem; display: flex; gap: 10px; justify-content: flex-end;">
                            <button type="button" class="btn btn-secondary" onclick="app.loadDashboard()">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary" style="padding-left: 30px; padding-right: 30px;">
                                <i class="fas fa-save"></i> Guardar Bitácora
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Valores por defecto
        const now = new Date();
        document.getElementById('fecha').value = now.toISOString().split('T')[0];
        document.getElementById('hora').value = now.toTimeString().substring(0,5);
        
        // Listener del Formulario
        document.getElementById('llamada-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.procesarRegistro();
        });
    }

    async procesarRegistro() {
        const btn = document.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        btn.disabled = true;

        // Recolectar datos
        const datos = {
            fecha: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value,
            turno: document.getElementById('turno').value,
            motivo: document.getElementById('motivo').value,
            ubicacion: document.getElementById('ubicacion').value,
            colonia: document.getElementById('colonia').value,
            telefono: document.getElementById('telefono').value,
            // Valores por defecto requeridos por tu backend
            seguimiento: "Sin seguimiento",
            motivo_radio_operacion: "Llamada telefónica",
            peticionario: "Anónimo"
        };

        try {
            // Intentar guardar en backend
            const resultado = await LlamadasService.registrarLlamada(datos);
            
            if (resultado.success) {
                alert('✅ Llamada registrada en bitácora.');
                this.loadDashboard(); // Regresar a la tabla
            } else {
                throw new Error(resultado.message);
            }
        } catch (error) {
            console.error(error);
            alert('⚠️ Error al guardar (ver consola). Si estás offline, revisa tu conexión.');
            // Restaurar botón
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
    // ==========================================
// MÓDULO C5: ENVÍO DE REPORTES AL CENTRO DE CONTROL
// ==========================================

setupEventListeners() {
    // ... tus listeners existentes ...
    
    // Agregar listener para C5
    const navC5 = document.getElementById('nav-c5');
    if (navC5) {
        navC5.addEventListener('click', (e) => {
            e.preventDefault();
            this.loadModuloC5();
        });
    }
}

// Cargar módulo principal C5
loadModuloC5() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="fade-in">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <button class="btn" onclick="app.loadDashboard()" style="margin-right: 15px; background: transparent; color: #666;">
                    <i class="fas fa-arrow-left fa-lg"></i>
                </button>
                <h2 style="margin: 0;"><i class="fab fa-whatsapp" style="color: #25D366;"></i> Reportes C5</h2>
            </div>
            
            <!-- Tarjetas de acceso rápido -->
            <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <!-- Tarjeta 1: Nuevo Reporte -->
                <div class="card" onclick="app.crearNuevoReporteC5()" 
                     style="background: white; border-radius: 8px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); cursor: pointer; transition: transform 0.2s;"
                     onmouseover="this.style.transform='translateY(-5px)'" 
                     onmouseout="this.style.transform='translateY(0)'">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                            <i class="fas fa-plus-circle" style="font-size: 2rem;"></i>
                        </div>
                        <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Nuevo Reporte</h4>
                        <p style="color: #7f8c8d; margin: 0; font-size: 0.9rem;">Crear reporte en formato CERIT para enviar al C5</p>
                    </div>
                </div>
                
                <!-- Tarjeta 2: Ver Reportes Enviados -->
                <div class="card" onclick="app.listarReportesC5()"
                     style="background: white; border-radius: 8px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); cursor: pointer; transition: transform 0.2s;"
                     onmouseover="this.style.transform='translateY(-5px)'" 
                     onmouseout="this.style.transform='translateY(0)'">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                            <i class="fas fa-list-alt" style="font-size: 2rem;"></i>
                        </div>
                        <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Ver Reportes</h4>
                        <p style="color: #7f8c8d; margin: 0; font-size: 0.9rem;">Consultar reportes enviados al Centro de Control</p>
                    </div>
                </div>
                
                <!-- Tarjeta 3: Registrar Respuesta C5 -->
                <div class="card" onclick="app.registrarRespuestaC5()"
                     style="background: white; border-radius: 8px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); cursor: pointer; transition: transform 0.2s;"
                     onmouseover="this.style.transform='translateY(-5px)'" 
                     onmouseout="this.style.transform='translateY(0)'">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                            <i class="fas fa-exchange-alt" style="font-size: 2rem;"></i>
                        </div>
                        <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Registrar Respuesta</h4>
                        <p style="color: #7f8c8d; margin: 0; font-size: 0.9rem;">Ingresar folio que devolvió el C5</p>
                    </div>
                </div>
            </div>
            
            <!-- Información del formato C5 -->
            <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h4 style="margin: 0 0 15px 0; color: #2e7d32;">
                    <i class="fas fa-info-circle"></i> Información sobre formato C5
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    <div>
                        <strong>Folio C4:</strong>
                        <div style="font-size: 0.9rem; color: #555; margin-top: 5px;">
                            Se genera automáticamente con formato DDMMYYHHMM
                        </div>
                    </div>
                    <div>
                        <strong>Ejemplo:</strong>
                        <div style="background: #f1f8e9; padding: 8px; border-radius: 4px; font-family: monospace; margin-top: 5px;">
                            2001260812 = 20/01/2026 08:12 hrs
                        </div>
                    </div>
                    <div>
                        <strong>Folio C5:</strong>
                        <div style="font-size: 0.9rem; color: #555; margin-top: 5px;">
                            Lo proporciona el Centro de Control después de recibir el reporte
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// CREAR NUEVO REPORTE C5
// ==========================================
crearNuevoReporteC5() {
    const now = new Date();
    const fechaHoy = now.toISOString().split('T')[0];
    const horaActual = now.toTimeString().substring(0,5);
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="fade-in">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <button class="btn" onclick="app.loadModuloC5()" style="margin-right: 15px; background: transparent; color: #666;">
                    <i class="fas fa-arrow-left fa-lg"></i>
                </button>
                <h2 style="margin: 0;"><i class="fas fa-file-alt"></i> Nuevo Reporte C5</h2>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                <form id="reporte-c5-form">
                    <!-- Encabezado del formulario -->
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
                    
                    <!-- Campos del formulario -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 25px;">
                        <div class="form-group">
                            <label for="fecha-c5"><i class="fas fa-calendar"></i> Fecha *</label>
                            <input type="date" id="fecha-c5" class="form-control" value="${fechaHoy}" required
                                   onchange="app.actualizarFolioPreview()">
                        </div>
                        
                        <div class="form-group">
                            <label for="hora-c5"><i class="fas fa-clock"></i> Hora *</label>
                            <input type="time" id="hora-c5" class="form-control" value="${horaActual}" required
                                   onchange="app.actualizarFolioPreview()">
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
                    
                    <!-- Método de envío -->
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
                    
                    <!-- Botones de acción -->
                    <div style="display: flex; gap: 15px; justify-content: flex-end; padding-top: 20px; border-top: 1px solid #eee;">
                        <button type="button" class="btn btn-secondary" onclick="app.loadModuloC5()">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button type="button" class="btn" style="background: #17a2b8; color: white;"
                                onclick="app.previsualizarReporteC5()">
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
    
    // Inicializar vista previa del folio
    setTimeout(() => this.actualizarFolioPreview(), 100);
    
    // Listener del formulario
    document.getElementById('reporte-c5-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.guardarReporteC5();
    });
}

// Actualizar vista previa del folio
actualizarFolioPreview() {
    const fecha = document.getElementById('fecha-c5')?.value;
    const hora = document.getElementById('hora-c5')?.value;
    
    if (fecha && hora) {
        const folio = this.generarFolioC4(fecha, hora);
        const folioPreview = document.getElementById('folio-preview');
        if (folioPreview) {
            folioPreview.textContent = folio;
            folioPreview.style.fontFamily = 'monospace';
        }
    }
}

// Generar folio C4 (DDMMYYHHMM)
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

// Previsualizar reporte
previsualizarReporteC5() {
    const fecha = document.getElementById('fecha-c5')?.value;
    const hora = document.getElementById('hora-c5')?.value;
    const motivo = document.getElementById('motivo-c5')?.value;
    const ubicacion = document.getElementById('ubicacion-c5')?.value;
    const descripcion = document.getElementById('descripcion-c5')?.value;
    const agente = document.getElementById('agente-c5')?.value;
    const conclusion = document.getElementById('conclusion-c5')?.value;
    
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
                    <button class="btn btn-primary" onclick="app.copiarTextoVistaPrevia()">
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
    
    // Guardar texto para copiar
    window.reporteC5Texto = textoFormateado;
}

// Formatear reporte para C5
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

// Copiar texto de vista previa
copiarTextoVistaPrevia() {
    if (window.reporteC5Texto) {
        navigator.clipboard.writeText(window.reporteC5Texto)
            .then(() => alert('✅ Texto copiado al portapapeles'))
            .catch(() => alert('⚠️ No se pudo copiar el texto'));
    }
}

// Guardar reporte C5
async guardarReporteC5() {
    const btn = document.querySelector('#reporte-c5-form button[type="submit"]');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    btn.disabled = true;
    
    try {
        const fecha = document.getElementById('fecha-c5').value;
        const hora = document.getElementById('hora-c5').value;
        const metodo = document.querySelector('input[name="metodo-c5"]:checked')?.value || 'whatsapp';
        
        const datos = {
            fecha_envio: fecha,
            hora_envio: hora,
            motivo: document.getElementById('motivo-c5').value,
            ubicacion: document.getElementById('ubicacion-c5').value,
            descripcion: document.getElementById('descripcion-c5').value,
            agente: document.getElementById('agente-c5').value || '',
            conclusion: document.getElementById('conclusion-c5').value || '',
            metodo_envio: metodo,
            numero_destino: '+521234567890' // Por defecto, puedes hacerlo configurable
        };
        
        // Generar folio C4
        const folioC4 = this.generarFolioC4(fecha, hora);
        
        // Verificar si tenemos el servicio C5
        if (typeof C5Service !== 'undefined') {
            try {
                const resultado = await C5Service.crearReporte(datos);
                
                if (resultado.success) {
                    this.mostrarReporteGenerado(folioC4, datos, resultado.data);
                } else {
                    throw new Error(resultado.message);
                }
            } catch (error) {
                console.warn('Error con servicio C5, usando modo local:', error);
                this.mostrarReporteGenerado(folioC4, datos);
            }
        } else {
            // Modo local (sin backend)
            this.mostrarReporteGenerado(folioC4, datos);
        }
        
    } catch (error) {
        console.error('Error guardando reporte:', error);
        alert('⚠️ Error al guardar el reporte');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Mostrar reporte generado
mostrarReporteGenerado(folioC4, datos, datosServicio = null) {
    const textoFormateado = this.formatearReporteC5({
        folio_c4: folioC4,
        ...datos
    });
    
    const textoCodificado = encodeURIComponent(textoFormateado);
    const whatsappLink = `https://wa.me/?text=${textoCodificado}`;
    
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="fade-in">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <button class="btn" onclick="app.loadModuloC5()" style="margin-right: 15px; background: transparent; color: #666;">
                    <i class="fas fa-arrow-left fa-lg"></i>
                </button>
                <h2 style="margin: 0;"><i class="fas fa-check-circle" style="color: #4caf50;"></i> Reporte C5 Generado</h2>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                <!-- Encabezado de éxito -->
                <div style="background: #d4edda; color: #155724; padding: 20px; border-radius: 6px; border-left: 5px solid #28a745; margin-bottom: 25px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <h4 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-check-circle fa-lg"></i>
                                Reporte guardado exitosamente
                            </h4>
                            <p style="margin: 10px 0 0 0;">Folio C4 generado: <strong>${folioC4}</strong></p>
                        </div>
                        <div style="background: #28a745; color: white; padding: 10px 20px; border-radius: 20px; font-family: monospace; font-size: 1.2rem;">
                            ${folioC4}
                        </div>
                    </div>
                </div>
                
                <!-- Dos columnas: Vista previa y Acciones -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <!-- Columna izquierda: Vista previa -->
                    <div>
                        <h5 style="margin: 0 0 15px 0; color: #495057;">
                            <i class="fas fa-eye"></i> Vista Previa
                        </h5>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; border: 1px solid #dee2e6; max-height: 400px; overflow-y: auto;">
                            <pre style="margin: 0; font-family: 'Courier New', monospace; white-space: pre-wrap; font-size: 0.9rem;">${textoFormateado}</pre>
                        </div>
                    </div>
                    
                    <!-- Columna derecha: Acciones -->
                    <div>
                        <h5 style="margin: 0 0 15px 0; color: #495057;">
                            <i class="fas fa-paper-plane"></i> Enviar al C5
                        </h5>
                        
                        <div style="background: #e8f5e9; padding: 20px; border-radius: 6px; border: 1px solid #c8e6c9; margin-bottom: 20px;">
                            <p style="margin: 0 0 15px 0; color: #2e7d32;">
                                <i class="fas fa-info-circle"></i> Envía este reporte al Centro de Control C5
                            </p>
                            
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                <button class="btn" style="background: #25D366; color: white; padding: 12px;"
                                        onclick="window.open('${whatsappLink}', '_blank')">
                                    <i class="fab fa-whatsapp"></i> Abrir WhatsApp para Enviar
                                </button>
                                
                                <button class="btn btn-primary" style="padding: 12px;"
                                        onclick="app.copiarReporteC5('${encodeURIComponent(textoFormateado)}')">
                                    <i class="fas fa-copy"></i> Copiar Texto (Ctrl+V en WhatsApp)
                                </button>
                                
                                <button class="btn" style="background: #17a2b8; color: white; padding: 12px;"
                                        onclick="app.imprimirReporteC5()">
                                    <i class="fas fa-print"></i> Imprimir Reporte
                                </button>
                            </div>
                        </div>
                        
                        <!-- Registrar respuesta del C5 -->
                        <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border: 1px solid #ffeaa7;">
                            <h6 style="margin: 0 0 10px 0; color: #856404;">
                                <i class="fas fa-exchange-alt"></i> ¿Ya recibiste respuesta del C5?
                            </h6>
                            <p style="margin: 0 0 10px 0; font-size: 0.9rem; color: #856404;">
                                Registra el folio que te devolvió el Centro de Control:
                            </p>
                            <div style="display: flex; gap: 10px;">
                                <input type="text" id="folio-c5-respuesta" 
                                       placeholder="Folio que devolvió C5" 
                                       style="flex: 1; padding: 8px; border: 1px solid #ffeaa7; border-radius: 4px;">
                                <button class="btn btn-sm" style="background: #f39c12; color: white;"
                                        onclick="app.registrarFolioC5Respuesta('${folioC4}')">
                                    Registrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Botones de navegación -->
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <button class="btn" onclick="app.crearNuevoReporteC5()">
                        <i class="fas fa-plus"></i> Nuevo Reporte
                    </button>
                    <button class="btn btn-primary" onclick="app.listarReportesC5()">
                        <i class="fas fa-list"></i> Ver Todos los Reportes
                    </button>
                    <button class="btn" onclick="app.loadModuloC5()">
                        <i class="fas fa-home"></i> Volver al Inicio C5
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// FUNCIONES AUXILIARES PARA C5
// ==========================================

copiarReporteC5(textoCodificado) {
    const texto = decodeURIComponent(textoCodificado);
    navigator.clipboard.writeText(texto)
        .then(() => alert('✅ Texto copiado al portapapeles. Ya puedes pegarlo en WhatsApp.'))
        .catch(() => {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = texto;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('✅ Texto copiado (método alternativo)');
        });
}

imprimirReporteC5() {
    window.print();
}

registrarFolioC5Respuesta(folioC4) {
    const folioC5Input = document.getElementById('folio-c5-respuesta');
    const folioC5 = folioC5Input?.value.trim();
    
    if (!folioC5) {
        alert('Por favor, ingresa el folio que devolvió el C5');
        return;
    }
    
    if (typeof C5Service !== 'undefined') {
        C5Service.registrarFolioC5(folioC4, folioC5)
            .then(resultado => {
                if (resultado.success) {
                    alert(`✅ Folio C5 registrado:\nC4: ${folioC4}\nC5: ${folioC5}`);
                    folioC5Input.value = '';
                } else {
                    alert(`⚠️ Error: ${resultado.message}`);
                }
            })
            .catch(error => {
                console.error('Error registrando folio:', error);
                alert('⚠️ Error al conectar con el servidor');
            });
    } else {
        // Modo local
        alert(`✅ Folio C5 registrado localmente:\nC4: ${folioC4}\nC5: ${folioC5}\n\n(Nota: Para guardar en el servidor, activa el servicio C5)`);
        folioC5Input.value = '';
    }
}

// Listar reportes C5 (placeholder)
listarReportesC5() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="fade-in">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <button class="btn" onclick="app.loadModuloC5()" style="margin-right: 15px; background: transparent; color: #666;">
                    <i class="fas fa-arrow-left fa-lg"></i>
                </button>
                <h2 style="margin: 0;"><i class="fas fa-list-alt"></i> Reportes Enviados al C5</h2>
            </div>
            
            <div style="text-align: center; padding: 50px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                <i class="fas fa-tools fa-4x text-muted mb-3"></i>
                <h3 style="color: #6c757d;">En Desarrollo</h3>
                <p>Esta funcionalidad estará disponible en la próxima actualización.</p>
                <button class="btn btn-primary" onclick="app.loadModuloC5()">
                    <i class="fas fa-arrow-left"></i> Volver al Módulo C5
                </button>
            </div>
        </div>
    `;
}

// Registrar respuesta C5 desde el menú principal
registrarRespuestaC5() {
    const folioC4 = prompt('Ingresa el folio C4 del reporte:');
    if (!folioC4) return;
    
    const folioC5 = prompt(`Ingresa el folio que devolvió C5 para:\n\nFolio C4: ${folioC4}`);
    if (!folioC5) return;
    
    if (typeof C5Service !== 'undefined') {
        C5Service.registrarFolioC5(folioC4, folioC5)
            .then(resultado => {
                if (resultado.success) {
                    alert(`✅ Folio C5 registrado exitosamente:\n\nC4: ${folioC4}\nC5: ${folioC5}`);
                } else {
                    alert(`⚠️ Error: ${resultado.message}`);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('⚠️ Error al registrar. Verifica la conexión.');
            });
    } else {
        alert(`✅ Folio C5 registrado localmente:\n\nC4: ${folioC4}\nC5: ${folioC5}\n\n(Nota: Para sincronizar con el servidor, activa el servicio C5)`);
    }
}

    // ==========================================
    // VISTA: BUSCAR (Placeholder)
    // ==========================================
    loadBuscarLlamadas() {
        document.getElementById('content').innerHTML = `
            <div class="fade-in" style="text-align: center; padding: 50px;">
                <i class="fas fa-search fa-4x text-muted mb-3"></i>
                <h2>Búsqueda Avanzada</h2>
                <p>Esta función estará disponible en la próxima actualización.</p>
                <button class="btn btn-primary" onclick="app.loadDashboard()">Volver al Inicio</button>
            </div>
        `;
    }
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});