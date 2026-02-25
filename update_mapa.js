const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, 'frontend/js/views/MapaCalorView.js');
let code = fs.readFileSync(targetPath, 'utf8');

const renderRegex = /async render\(container\) \{[\s\S]*?async cargarDatosMapa\(\);\n    \}/;
const newRender = `async render(container) {
        this.container = container;
        // Se elimina la clase global 'mapa-fullscreen'
        this.container.innerHTML = this.getTemplate();
        await this.initMapa();
        this.bindEvents();
        this.iniciarAnimaciones();

        // Cargar datos iniciales
        await this.cargarDatosMapa();
    }`;
code = code.replace(renderRegex, newRender);

const cleanupRegex = /cleanup\(\) \{\n\s*document\.body\.classList\.remove\('mapa-fullscreen'\);/;
code = code.replace(cleanupRegex, `cleanup() {`);

const templateRegex = /getTemplate\(\) \{[\s\S]*?getEstilos\(\)\n\s*`;\n\s*\}/;
const newTemplate = `getTemplate() {
        return \`
            <div class="cerit-dashboard view-shell--xl">
                <div class="mapa-main-grid" style="display: grid; grid-template-columns: 350px 1fr; gap: 20px; align-items: start; height: calc(100vh - 120px); min-height: 600px;">

                    <!-- Columna Izquierda: Panel de Control (Scrollable) -->
                    <div class="mapa-panel-controls custom-scrollbar" style="display: flex; flex-direction: column; gap: 20px; height: 100%; overflow-y: auto; padding-right: 5px;">

                        <!-- Tarjeta Título / Header -->
                        <div style="background: white; border-radius: 10px; padding: 20px; border: 1px solid \${this.colors.border}; border-left: 4px solid \${this.colors.accentGreen}; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                            <h3 style="margin: 0; color: \${this.colors.primary}; font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-map-marked-alt"></i> MAPA DE CALOR
                            </h3>
                            <p style="margin: 5px 0 0 0; color: \${this.colors.textLight}; font-size: 0.85rem;">Análisis espacial de incidencias CERIT</p>
                        </div>

                        <!-- Estadísticas Rápidas -->
                        <div class="stats-rapidas" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div style="background: linear-gradient(135deg, \${this.colors.primary} 0%, \${this.colors.primaryLight} 100%); padding: 15px; border-radius: 10px; color: white; box-shadow: 0 4px 12px rgba(0,51,102,0.15);">
                                <div style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; opacity: 0.9;">Total</div>
                                <div id="total-incidencias" style="font-size: 1.8rem; font-weight: 700; line-height: 1.2;">0</div>
                                <div style="font-size: 0.75rem; opacity: 0.9;">Registros</div>
                            </div>
                            <div style="background: linear-gradient(135deg, \${this.colors.accent} 0%, #ff8c5a 100%); padding: 15px; border-radius: 10px; color: white; box-shadow: 0 4px 12px rgba(255,107,53,0.15);">
                                <div style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; opacity: 0.9;">Visibles</div>
                                <div id="mostradas-incidencias" style="font-size: 1.8rem; font-weight: 700; line-height: 1.2;">0</div>
                                <div style="font-size: 0.75rem; opacity: 0.9;">En mapa</div>
                            </div>
                        </div>

                        <!-- Filtros -->
                        <div style="background: white; border-radius: 10px; padding: 20px; border: 1px solid \${this.colors.border}; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h4 style="margin: 0; color: \${this.colors.primary}; font-size: 0.95rem; font-weight: 700;"><i class="fas fa-filter"></i> FILTROS</h4>
                                <button id="btn-limpiar-filtros-mapa" style="background: none; border: none; color: \${this.colors.textLight}; font-size: 0.8rem; font-weight: 600; cursor: pointer;">Limpiar</button>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 15px;">
                                <div>
                                    <label style="display: block; font-size: 0.8rem; font-weight: 600; color: \${this.colors.text}; margin-bottom: 5px;">Rango de Fechas</label>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                        <input type="date" id="filtro-fecha-inicio" style="width: 100%; padding: 8px; border: 1px solid \${this.colors.border}; border-radius: 6px; font-size: 0.85rem; padding-right: 5px; box-sizing: border-box;">
                                        <input type="date" id="filtro-fecha-fin" style="width: 100%; padding: 8px; border: 1px solid \${this.colors.border}; border-radius: 6px; font-size: 0.85rem; padding-right: 5px; box-sizing: border-box;">
                                    </div>
                                </div>

                                <button id="btn-aplicar-filtros-mapa" style="width: 100%; padding: 10px; background: \${this.colors.primary}; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
                                    <i class="fas fa-search"></i> Aplicar Filtros
                                </button>
                            </div>
                        </div>

                        <!-- Últimos Registros -->
                        <div style="background: white; border-radius: 10px; padding: 20px; border: 1px solid \${this.colors.border}; box-shadow: 0 2px 8px rgba(0,0,0,0.05); flex: 1; display: flex; flex-direction: column;">
                            <h4 style="margin: 0 0 15px 0; color: \${this.colors.primary}; font-size: 0.95rem; font-weight: 700;"><i class="fas fa-history"></i> ÚLTIMOS REGISTROS</h4>
                            <div id="lista-ultimos-registros" style="display: flex; flex-direction: column; gap: 10px; overflow-y: auto; flex: 1;">
                                <div style="text-align: center; color: \${this.colors.textLight}; font-size: 0.85rem; padding: 10px;">
                                    <i class="fas fa-spinner fa-spin"></i> Cargando...
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- Columna Derecha: Mapa Principal -->
                    <div style="background: white; border-radius: 10px; border: 1px solid \${this.colors.border}; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; height: 100%; position: relative; display: flex; flex-direction: column;">

                        <div id="mapa-tehuacan" style="flex: 1; width: 100%; height: 100%; z-index: 1;"></div>

                        <!-- Controles flotantes del mapa (Columna Vertical Derecha) -->
                        <div class="controles-flotantes" style="position: absolute; top: 20px; right: 20px; display: flex; flex-direction: column; gap: 12px; z-index: 400;">

                            <!-- Control de zoom personalizado -->
                            <div style="background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); overflow: hidden;">
                                <button id="btn-zoom-in" style="width: 40px; height: 40px; background: white; border: none; border-bottom: 1px solid \${this.colors.border}; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fas fa-plus" style="color: \${this.colors.primary}; font-size: 1rem;"></i></button>
                                <button id="btn-zoom-out" style="width: 40px; height: 40px; background: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;"><i class="fas fa-minus" style="color: \${this.colors.primary}; font-size: 1rem;"></i></button>
                            </div>

                            <!-- Control de ubicación -->
                            <button id="btn-mi-ubicacion" style="width: 40px; height: 40px; background: white; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.15);"><i class="fas fa-crosshairs" style="color: \${this.colors.primary}; font-size: 1rem;"></i></button>

                            <!-- Control pantalla completa -->
                            <button id="btn-pantalla-completa" style="width: 40px; height: 40px; background: white; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.15);"><i class="fas fa-expand" style="color: \${this.colors.primary}; font-size: 1rem;"></i></button>

                            <!-- Divisor visual -->
                            <div style="height: 5px;"></div>

                            <!-- Modos de Vista -->
                            <div class="grupo-vistas-vertical" style="background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); overflow: hidden; display: flex; flex-direction: column;">
                                <button class="btn-vista-mapa active" data-vista="calor" style="width: 40px; height: 40px; background: \${this.colors.light}; border: none; border-bottom: 1px solid \${this.colors.border}; cursor: pointer; color: \${this.colors.primary};"><i class="fas fa-fire"></i></button>
                                <button class="btn-vista-mapa" data-vista="marcadores" style="width: 40px; height: 40px; background: white; border: none; border-bottom: 1px solid \${this.colors.border}; cursor: pointer; color: \${this.colors.textLight};"><i class="fas fa-map-pin"></i></button>
                                <button class="btn-vista-mapa" data-vista="clusters" style="width: 40px; height: 40px; background: white; border: none; cursor: pointer; color: \${this.colors.textLight};"><i class="fas fa-th"></i></button>
                            </div>
                        </div>

                        <!-- Leyenda Flotante (Bottom Center) -->
                        <div id="leyenda-flotante" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: white; padding: 10px 15px; border-radius: 30px; display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 400; max-width: 90%; overflow-x: auto;">
                            \${Object.entries(this.tiposIncidencia).map(([key, tipo]) => \`
                                <div class="leyenda-item-flotante" data-tipo="\${key}" title="\${tipo.nombre}" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                    <div style="width: 12px; height: 12px; background: \${tipo.color}; border-radius: 50%;"></div>
                                    <span style="font-size: 0.8rem; font-weight: 600; color: \${this.colors.dark};">\${tipo.nombre}</span>
                                </div>
                            \`).join('')}
                        </div>

                        <!-- Loading del Mapa Mejorado -->
                        <div id="loading-mapa" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(2px);">
                            <i class="fas fa-circle-notch fa-spin fa-3x" style="color: \${this.colors.primary}; margin-bottom: 15px;"></i>
                            <h4 style="color: \${this.colors.primary}; font-weight: 700;">Cargando Mapa de Tehuacán</h4>
                        </div>
                    </div>
                </div>
                \${this.getEstilos()}
            </div>
        \`;
    }`;
code = code.replace(templateRegex, newTemplate);

const estilosRegex = /getEstilos\(\) \{\n\s*return `\n\s*<style>[\s\S]*?<\/style>\n\s*`;\n\s*\}/;
const newEstilos = `getEstilos() {
        return \`
            <style>
                /* Layout base grid para responsividad */
                .mapa-main-grid {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 20px;
                    align-items: start;
                    height: calc(100vh - 120px);
                    min-height: 600px;
                }

                @media (max-width: 900px) {
                    .mapa-main-grid {
                        grid-template-columns: 1fr;
                        height: auto;
                    }
                    .mapa-panel-controls {
                        height: auto !important;
                        max-height: 400px;
                    }
                    #mapa-tehuacan {
                        min-height: 500px;
                    }
                }

                .btn-vista-mapa.active {
                    background: \${this.colors.light};
                    color: \${this.colors.primary} !important;
                    border-left: 3px solid \${this.colors.primary};
                }
                .btn-vista-mapa:hover {
                    background: \${this.colors.light};
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }

                /* Markers y clusters */
                .custom-div-icon {
                    background: transparent;
                    border: none;
                }
                .marker-pin {
                    width: 30px;
                    height: 30px;
                    border-radius: 50% 50% 50% 0;
                    background: #c30b82;
                    position: absolute;
                    transform: rotate(-45deg);
                    left: 50%;
                    top: 50%;
                    margin: -15px 0 0 -15px;
                    box-shadow: -1px 1px 4px rgba(0,0,0,0.3);
                }
                .marker-icon-wrapper {
                    position: absolute;
                    width: 22px;
                    height: 22px;
                    background: white;
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .marker-icon-wrapper i {
                    font-size: 10px;
                }

                .cluster-marker {
                    background: transparent;
                }
                .cluster-inner {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.3);
                }

                /* Popups en el mapa */
                .leaflet-popup-content-wrapper {
                    border-radius: 8px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    padding: 0;
                    overflow: hidden;
                }
                .leaflet-popup-content {
                    margin: 0;
                    width: auto !important;
                    min-width: 280px;
                }
                .leaflet-popup-close-button {
                    color: white !important;
                    padding: 5px !important;
                }

                /* Listado ultimos registros panel */
                .registro-item {
                    background: white;
                    border: 1px solid \${this.colors.border};
                    border-radius: 6px;
                    padding: 12px;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .registro-item:hover {
                    border-color: \${this.colors.primaryLight};
                    transform: translateX(3px);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }
            </style>
        \`;
    }`;
code = code.replace(estilosRegex, newEstilos);

fs.writeFileSync(targetPath, code);
console.log('MapaCalorView.js updated successfully!');
