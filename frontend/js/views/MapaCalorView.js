

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

        this.colors = {
            primary: '#0F528C',      // Azul oscuro
            secondary: '#4393D9',    // Azul claro
            primaryDark: '#0D0D0D',  // Negro
            accent: '#ff6b35',
            accentRed: '#dc3545',
            accentGreen: '#28a745',
            warning: '#ffc107',
            info: '#17a2b8',
            dark: '#0D0D0D',
            light: '#C9CCD4',        // Gris claro
            border: '#899090',       // Gris medio oscuro
            text: '#0D0D0D',
            textLight: '#899090'
        };

        this.coordenadasTehuacan = {
            lat: 18.4614,
            lng: -97.3928,
            zoom: 13
        };

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
                color: '#899090',
                gradient: 'linear-gradient(135deg, #899090 0%, #C9CCD4 100%)',
                icon: 'user-secret',
                nombre: 'Sospechosos',
                descripcion: 'Personas o situaciones sospechosas'
            },
            'vehiculo': {
                color: '#4393D9',
                gradient: 'linear-gradient(135deg, #4393D9 0%, #899090 100%)',
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

        this.panelAbierto = true;

        this.modoVista = 'calor';

        this.geocodingDisponible = true;
        this.geocodingErrorNotificado = false;
    }

    async render(container) {
        this.container = container;
        this.container.className = 'dashboard-cerit-tehuacan view-bleed view-shell view-form';

        const footer = document.querySelector('.institutional-footer');
        if (footer) footer.style.display = 'none';

        const wrapper = document.querySelector('.content-wrapper');
        if (wrapper) {
            wrapper.style.overflow = 'hidden';
            wrapper.style.padding = '0';
        }

        // Obtener API Key local desde backend para mantener seguridad en .env
        await this.obtenerApiKeyAmazon();

        this.container.innerHTML = this.getTemplate();
        await this.initMapa();
        this.bindEvents();
        this.iniciarAnimaciones();

        await this.cargarDatosMapa();
    }

    async obtenerApiKeyAmazon() {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = window.AppConfig?.API_BASE_URL || '/api';
            const response = await fetch(`${apiUrl}/config/amazon-location`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                this.amazonLocationApiKey = data.apiKey;
            } else {
                console.error('No se pudo obtener la llave de Amazon API desde el servidor seguro');
            }
        } catch (e) {
            console.error('Error al solicitar API Key:', e);
        }
    }

    getTemplate() {
        return `
            <div class="cerit-dashboard view-shell--xl cerit-heatmap-fullscreen">

                <!-- Mapa a pantalla completa -->
                <div id="mapa-tehuacan" class="fullscreen-mapa"></div>

                <!-- Panel superior izquierdo: Título + Stats -->
                <div class="panel-flotante-top">
                    <div class="panel-titulo hm-card">
                        <div class="panel-titulo__icon">
                            <i class="fas fa-map-marked-alt"></i>
                        </div>
                        <div class="panel-titulo__text">
                            <h3>MAPA DE CALOR</h3>
                            <p>Análisis espacial · CERIT Tehuacán</p>
                        </div>
                    </div>
                    <div class="panel-stats">
                        <div class="stat-card stat-total hm-card">
                            <div class="stat-icon"><i class="fas fa-database"></i></div>
                            <div id="total-incidencias" class="stat-value">0</div>
                            <div class="stat-label">Total</div>
                        </div>
                        <div class="stat-card stat-visibles hm-card">
                            <div class="stat-icon"><i class="fas fa-eye"></i></div>
                            <div id="mostradas-incidencias" class="stat-value">0</div>
                            <div class="stat-label">En mapa</div>
                        </div>
                    </div>
                </div>

                <!-- Panel derecho: Filtros -->
                <div class="panel-flotante-right hm-card custom-scrollbar">
                    <div class="panel-header">
                        <div class="panel-header__title">
                            <span class="panel-header__dot"></span>
                            <h4>FILTROS</h4>
                        </div>
                        <button id="btn-limpiar-filtros-mapa" class="btn-clean">Limpiar</button>
                    </div>
                    <div class="filtros-body">
                        <div class="filtro-grupo">
                            <label class="filtro-label"><i class="fas fa-calendar-alt"></i> Rango de Fechas</label>
                            <div class="filtro-fechas">
                                <div class="input-wrapper">
                                    <span class="input-prefix">Desde</span>
                                    <input type="date" id="filtro-fecha-inicio">
                                </div>
                                <div class="input-wrapper">
                                    <span class="input-prefix">Hasta</span>
                                    <input type="date" id="filtro-fecha-fin">
                                </div>
                            </div>
                        </div>
                        <button id="btn-aplicar-filtros-mapa" class="btn-primary-hm">
                            <i class="fas fa-search"></i> Aplicar Filtros
                        </button>
                    </div>
                </div>

                <!-- Panel inferior derecho: Últimos Registros -->
                <div class="panel-flotante-bottom-right hm-card">
                    <div class="panel-header">
                        <div class="panel-header__title">
                            <span class="panel-header__dot panel-header__dot--accent"></span>
                            <h4>ÚLTIMOS REGISTROS</h4>
                        </div>
                    </div>
                    <div id="lista-ultimos-registros" class="lista-registros custom-scrollbar">
                        <div class="loading-state">
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>Cargando...</span>
                        </div>
                    </div>
                </div>

                <!-- Controles del mapa (izquierda, centrados verticalmente) -->
                <div class="controles-flotantes-left">
                    <div class="control-group hm-card">
                        <button id="btn-zoom-in" class="ctrl-btn" title="Acercar"><i class="fas fa-plus"></i></button>
                        <hr class="control-divider">
                        <button id="btn-zoom-out" class="ctrl-btn" title="Alejar"><i class="fas fa-minus"></i></button>
                    </div>
                    <button id="btn-mi-ubicacion" class="control-btn single hm-card ctrl-btn" title="Centrar Mapa">
                        <i class="fas fa-crosshairs"></i>
                    </button>
                    <div class="control-group hm-card modos-vista-grupo">
                        <button class="btn-vista-mapa ctrl-btn active" data-vista="calor" title="Mapa de Calor"><i class="fas fa-fire"></i></button>
                        <hr class="control-divider">
                        <button class="btn-vista-mapa ctrl-btn" data-vista="marcadores" title="Marcadores"><i class="fas fa-map-pin"></i></button>
                        <hr class="control-divider">
                        <button class="btn-vista-mapa ctrl-btn" data-vista="clusters" title="Agrupación"><i class="fas fa-layer-group"></i></button>
                    </div>
                </div>

                <!-- Leyenda flotante (inferior izquierda) -->
                <div id="leyenda-flotante" class="leyenda-flotante hm-card">
                    <div class="leyenda-titulo"><i class="fas fa-circle-dot"></i> INCIDENCIAS</div>
                    <div class="leyenda-grid">
                        ${Object.entries(this.tiposIncidencia).map(([key, tipo]) => `
                            <div class="leyenda-item-flotante" data-tipo="${key}" title="${tipo.nombre}">
                                <div class="leyenda-color" style="background: ${tipo.color};"></div>
                                <span>${tipo.nombre}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Loading overlay -->
                <div id="loading-mapa" class="loading-mapa-overlay">
                    <div class="loading-inner">
                        <i class="fas fa-map-marked-alt fa-2x"></i>
                        <div class="loading-spinner"></div>
                        <h4>Cargando Mapa...</h4>
                        <p>Iniciando visualización</p>
                    </div>
                </div>
            </div>
        `;
    }

    getEmojiForTipo(tipo) {
        return {
            'accidente': '🚗', 'robo': '🚨', 'disturbio': '⚠️',
            'sospechoso': '🔍', 'vehiculo': '🚙', 'medica': '🚑'
        }[tipo] || '📍';
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

        if (this.mapa !== null) {
            this.mapa.remove();
            this.mapa = null;
        }

        const mapContainer = document.getElementById('mapa-tehuacan');
        if (!mapContainer) return;

        this.mapa = L.map('mapa-tehuacan', {
            center: [this.coordenadasTehuacan.lat, this.coordenadasTehuacan.lng],
            zoom: this.coordenadasTehuacan.zoom,
            zoomControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(this.mapa);

        const loadingMap = document.getElementById('loading-mapa');
        if (loadingMap) {
            loadingMap.style.display = 'none';
        }
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

        document.querySelectorAll('.btn-vista-mapa').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.cambiarModoVista(e.currentTarget.dataset.vista);
            });
        });

        document.getElementById('btn-aplicar-filtros-mapa').addEventListener('click', () => {
            this.aplicarFiltrosMapa();
        });

        document.getElementById('btn-limpiar-filtros-mapa').addEventListener('click', () => {
            this.limpiarFiltrosMapa();
        });

        document.getElementById('btn-zoom-in').addEventListener('click', () => {
            this.mapa.zoomIn();
        });

        document.getElementById('btn-zoom-out').addEventListener('click', () => {
            this.mapa.zoomOut();
        });

        document.getElementById('btn-mi-ubicacion').addEventListener('click', () => {
            this.centrarEnTehuacan();
        });

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

        const elementos = [
            '.stat-card',
            '.seccion-filtros',
            '.seccion-leyenda'
        ];

        elementos.forEach(selector => {
            const els = document.querySelectorAll(selector);
            els.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
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
            indicadorIcono.className = `fas ${iconos[modo]} `;
        }
        const nombreModo = document.getElementById('nombre-modo-vista');
        if (nombreModo) {
            nombreModo.textContent = nombres[modo];
        }

        this.syncBotonesModoVista(modo);

        this.aplicarModoVista();

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

        this.limpiarMarcadores();

        const datosFiltrados = this.aplicarFiltrosADatos(this.datosMapa || []);

        switch (this.modoVista) {
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
        notif.className = 'hm-notif';
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

            this.datosMapa = this.normalizarDatosMapa(datos);
            if (!Array.isArray(this.datosMapa)) {
                this.datosMapa = [];
            }

            // Renderizamos primero solo stats y listas visuales
            this.actualizarEstadisticas(this.datosMapa.length, this.datosMapa.length);
            this.actualizarContadoresTipo(this.datosMapa);
            this.actualizarUltimosRegistros(this.datosMapa);

            // Geocodificamos en background, y HASTA que haya terminado (o parcialmente validado), dibujamos el mapa.
            // Para lotes muy grandes, la barra de geocodificación mostrará el progreso
            await this.resolverCoordenadasIncidencias(this.datosMapa);

            // Ahora sí, con coordenadas (reales o fallback) listas, dibujamos el mapa sin "saltos"
            this.aplicarModoVista();

            if (this.mapa) {
                setTimeout(() => this.mapa.invalidateSize(), 100);
            }

        } catch (error) {
            console.error('Error cargando datos del mapa:', error);
            this.mostrarAlerta('⚠️ ERROR', 'Error cargando datos del mapa', 'error');
        }
    }

    actualizarEstadisticas(total, mostradas) {

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

        document.querySelectorAll('.contador-tipo').forEach(el => {
            el.textContent = '0';
        });

        const conteo = {};
        datos.forEach(incidencia => {
            const tipo = this.determinarTipoIncidencia(incidencia.motivo);
            conteo[tipo] = (conteo[tipo] || 0) + 1;
        });

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

        this.mostrarIndicadorGeocoding(true);

        // Función para guardar coordenadas en la BD (fuego y olvida, sin bloquear el mapa)
        const guardarCoordenadasEnBD = async (incidencia, coords) => {
            if (!incidencia.id) return;
            try {
                const token = localStorage.getItem('token');
                const apiUrl = window.AppConfig?.API_BASE_URL || '/api';
                await fetch(`${apiUrl}/llamadas/${incidencia.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        latitud: coords.lat,
                        longitud: coords.lng,
                        ubicacion_exacta: 1,
                        fecha: incidencia.fecha ? incidencia.fecha.split('T')[0] : null  // Formato YYYY-MM-DD para MySQL
                    })
                });
            } catch (e) {
                // Silencioso: si falla el guardado, el mapa sigue funcionando
            }
        };

        const procesarLote = async (lote, index) => {
            await Promise.all(lote.map(async (incidencia) => {
                const coords = await this.geocodificarIncidencia(incidencia);
                if (coords) {
                    incidencia.latitud = coords.lat;
                    incidencia.longitud = coords.lng;
                    incidencia._coords = coords;
                    // Guardar en BD para que la próxima carga no necesite geocodificar
                    guardarCoordenadasEnBD(incidencia, coords);
                } else {
                    incidencia._coords = this.obtenerCoordenadasFallback(incidencia);
                }
            }));

            const procesados = Math.min((index + 1) * lote.length, pendientes.length);
            this.actualizarProgresoGeocoding(procesados, pendientes.length);
        };

        const tamañoLote = 3; // Procesar 3 registros en paralelo para mayor velocidad
        for (let i = 0; i < pendientes.length; i += tamañoLote) {
            const lote = pendientes.slice(i, i + tamañoLote);
            await procesarLote(lote, i);

            if (i + tamañoLote < pendientes.length) {
                await new Promise(resolve => setTimeout(resolve, 600)); // 600ms entre lotes (era 1100ms)
            }
        }

        this.mostrarIndicadorGeocoding(false);

    }

    async geocodificarIncidencia(incidencia) {
        let query = `${incidencia.calle || incidencia.ubicacion || ''} `;
        if (incidencia.numero) query += ` ${incidencia.numero} `;
        query += 'Tehuacán, Puebla';
        query = query.trim();

        if (this.coordenadasCache && this.coordenadasCache.has(query)) {
            return this.coordenadasCache.get(query);
        }

        const fetchGeocodeText = async (text) => {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = window.AppConfig?.API_BASE_URL || '/api';
                const response = await fetch(`${apiUrl}/config/geocode`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ QueryText: text })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data?.ResultItems?.length > 0) {
                        const [lng, lat] = data.ResultItems[0].Position;
                        if (Number.isFinite(lat) && Number.isFinite(lng) && this.validarCoordenadasTehuacan(lat, lng)) {
                            const resultado = { lat, lng };
                            if (this.coordenadasCache) this.coordenadasCache.set(text, resultado);
                            return resultado;
                        }
                    }
                }
            } catch (e) {
                console.warn('Geocoding falló para:', text, e);
            }
            return null;
        };

        let result = await fetchGeocodeText(query);
        if (result) return result;

        if (incidencia.colonia && incidencia.colonia.trim()) {
            const queryColonia = `Colonia ${incidencia.colonia.trim()}, Tehuacán`;
            if (this.coordenadasCache && this.coordenadasCache.has(queryColonia)) {
                return this.coordenadasCache.get(queryColonia);
            }
            result = await fetchGeocodeText(queryColonia);
            if (result) return result;
        }

        return null;
    }

    mostrarIndicadorGeocoding(mostrar) {
        let indicador = document.getElementById('geocoding-indicator');

        if (mostrar) {
            if (!indicador) {
                indicador = document.createElement('div');
                indicador.id = 'geocoding-indicator';
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
        return '/api/llamadas/geocode';
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
        HTMLCanvasElement.prototype.getContext = function (type, options) {
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
        const m = motivo.toLowerCase();

        if (/(accidente|choque|vehicular)/.test(m)) return 'accidente';
        if (/(robo|asalto|hurto)/.test(m)) return 'robo';
        if (/(disturbio|pelea|altercado)/.test(m)) return 'disturbio';
        if (/(sospechoso|merodeando|sospecha)/.test(m)) return 'sospechoso';
        if (/(vehículo|automóvil|carro)/.test(m)) return 'vehiculo';
        if (/(médica|herido|ambulancia)/.test(m)) return 'medica';

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

        this.mostrarMarcadores(datos);

    }

    crearMarcadorMejorado(lat, lng, tipoInfo, incidencia, index) {
        const icono = L.divIcon({
            className: 'marcador-custom',
            html: `
                <div class="marcador-custom-body">
                    <div class="marcador-custom-pin" style="background: ${tipoInfo.gradient}; box-shadow: 0 3px 10px ${tipoInfo.color}60;">
                        <i class="fas fa-${tipoInfo.icon} marcador-custom-icon"></i>
                    </div>
                    <div class="marcador-custom-shadow" style="background: ${tipoInfo.color}40;"></div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        const marcador = L.marker([lat, lng], {
            icon: icono,
            draggable: true,
            id_incidencia: incidencia.id
        });

        marcador.on('dragend', async (event) => {
            const nuevaPosicion = event.target.getLatLng();

            const confirmar = confirm(`¿Deseas actualizar la ubicación exacta de este registro?\n\nNueva posición: ${nuevaPosicion.lat.toFixed(6)}, ${nuevaPosicion.lng.toFixed(6)}`);

            if (confirmar) {

                try {
                    const servicio = new LlamadasService();

                    const resultado = await window.LlamadasService.actualizarLlamada(incidencia.id, {
                        latitud: nuevaPosicion.lat,
                        longitud: nuevaPosicion.lng,
                        ubicacion_exacta: true
                    });

                    if (resultado.success) {

                        incidencia.latitud = nuevaPosicion.lat;
                        incidencia.longitud = nuevaPosicion.lng;
                    } else {
                        throw new Error(resultado.message || 'Error al guardar');
                    }
                } catch (error) {
                    console.error('Error actualizando ubicación:', error);
                    alert('❌ Error al guardar la nueva ubicación: ' + error.message);

                    event.target.setLatLng([lat, lng]);
                }
            } else {

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
            <div class="popup-mejorado">
                <div class="popup-mejorado-header" style="background: ${tipoInfo.gradient};">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <div class="popup-mejorado-icon-wrap">
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
                        <i class="fas fa-clock"></i> ${incidencia.hora ? incidencia.hora.substring(0, 5) : 'N/A'}
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
            return `<span class="btn-hm-estado" style="background: ${this.colors.accentGreen};">
                <i class="fas fa-check-circle"></i> CONCLUIDO
            </span>`;
        } else if (incidencia.seguimiento) {
            return `<span class="btn-hm-estado" style="background: ${this.colors.accent};">
                <i class="fas fa-spinner"></i> SEGUIMIENTO
            </span>`;
        } else {
            return `<span class="btn-hm-estado" style="background: ${this.colors.textLight};">
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

        const currentTipo = (this.filtrosActivos && this.filtrosActivos.tipo) ? this.filtrosActivos.tipo : 'todos';

        const fechaInicio = document.getElementById('filtro-fecha-inicio') ? document.getElementById('filtro-fecha-inicio').value : '';
        const fechaFin = document.getElementById('filtro-fecha-fin') ? document.getElementById('filtro-fecha-fin').value : '';

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
        this.actualizarUIFiltrosActivos();

    }

    actualizarUltimosRegistros(datos) {
        const contenedor = document.getElementById('lista-ultimos-registros');
        if (!contenedor) return;

        contenedor.innerHTML = '';

        const ordenados = [...datos].sort((a, b) => {
            const fechaA = new Date(`${a.fecha}T${a.hora || '00:00:00'}`);
            const fechaB = new Date(`${b.fecha}T${b.hora || '00:00:00'}`);
            return fechaB - fechaA;
        });

        const ultimos = ordenados.slice(0, 10);

        if (ultimos.length === 0) {
            contenedor.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox" style="font-size: 1.5rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                    No hay registros recientes
                </div>
            `;
            return;
        }

        ultimos.forEach(incidencia => {
            const tipoInfo = this.tiposIncidencia[this.determinarTipoIncidencia(incidencia.motivo)];

            const item = document.createElement('div');
            item.className = 'item-registro item-registro-hover';
            item.style.cssText = `
                background: white;
                border-left: 4px solid ${tipoInfo.color};
                padding: 10px;
                border-radius: 6px;
                cursor: pointer;
                border: 1px solid ${this.colors.border};
                border-left-width: 4px;
            `;

            item.onclick = () => this.centrarEnIncidencia(incidencia.id);

            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                    <span style="font-weight: 700; color: ${this.colors.text}; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-${tipoInfo.icon}" style="color: ${tipoInfo.color}; font-size: 0.8rem;"></i>
                        ${tipoInfo.nombre}
                    </span>
                    <span style="font-size: 0.75rem; color: ${this.colors.textLight}; background: ${this.colors.light}; padding: 2px 6px; border-radius: 4px;">
                        ${incidencia.hora ? incidencia.hora.substring(0, 5) : '--:--'}
                    </span>
                </div>
                <div style="color: ${this.colors.textLight}; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;">
                    ${incidencia.ubicacion || 'Ubicación no especificada'}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;">
                    <span style="color: ${this.colors.info}; font-weight: 600;">${incidencia.colonia || ''}</span>
                    <span style="color: ${this.colors.textLight};">${incidencia.fecha}</span>
                </div>
            `;

            contenedor.appendChild(item);
        });
    }

    centrarEnIncidencia(id) {
        const incidencia = this.datosMapa.find(d => d.id == id);
        if (!incidencia) {

            return;
        }

        const coords = this.obtenerCoordenadas(incidencia);

        if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {

            return;
        }

        const { lat, lng } = coords;

        this.mapa.flyTo([lat, lng], 18, {
            animate: true,
            duration: 1.5
        });

        let marcadorEncontrado = null;
        this.mapa.eachLayer(layer => {

            if (layer instanceof L.Marker && String(layer.options.id_incidencia) === String(id)) {
                marcadorEncontrado = layer;
            }
        });

        if (marcadorEncontrado) {

            setTimeout(() => {
                if (marcadorEncontrado.__parent) {
                    marcadorEncontrado.__parent.spiderfy();
                }
                marcadorEncontrado.openPopup();
            }, 1000);
        } else {

            if (this.modoVista === 'calor') {
                this.cambiarModoVista('marcadores');

                setTimeout(() => this.centrarEnIncidencia(id), 500);
            }
        }
    }

    filtrarPorTipo(tipo) {
        if (!this.filtrosActivos) this.filtrosActivos = {};

        if (this.filtrosActivos.tipo === tipo) {
            this.filtrosActivos.tipo = 'todos';
        } else {
            this.filtrosActivos.tipo = tipo;
        }

        this.aplicarFiltrosMapa();
        this.actualizarUIFiltrosActivos();
    }

    actualizarUIFiltrosActivos() {

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
        alertDiv.className = 'hm-alert';
        alertDiv.style.borderLeft = `4px solid ${tipoInfo.bg}`;
        alertDiv.style.border = `1px solid ${this.colors.border}`;

        alertDiv.innerHTML = `
            <div class="hm-alert-body">
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



    cleanup() {
        const footer = document.querySelector('.institutional-footer');
        if (footer) footer.style.display = 'block';

        const wrapper = document.querySelector('.content-wrapper');
        if (wrapper) {
            wrapper.style.overflow = '';
            wrapper.style.padding = '';
        }

        try {
            if (this.mapa) {
                this.mapa.remove();
                this.mapa = null;
            }

            const mapContainer = document.getElementById('mapa-tehuacan');
            if (mapContainer && mapContainer._leaflet_id) {
                mapContainer._leaflet_id = null;
            }
        } catch (e) {
            console.warn("Advertencia al limpiar Mapa", e);
        }

        if (this.intervaloActualizacion) {
            clearInterval(this.intervaloActualizacion);
        }

        this.marcadores = [];
        this.capasCalor = [];
        this.datosMapa = null;
    }
}

window.MapaCalorView = MapaCalorView;