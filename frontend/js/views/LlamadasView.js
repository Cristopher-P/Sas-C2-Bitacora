/**
 * LLAMADASVIEW.JS - Vista para registrar llamadas
 */

class LlamadasView {
    constructor(currentUser, appController) {
        this.currentUser = currentUser;
        this.appController = appController;
    }

    async render(container) {
        this.container = container;
        this.container.innerHTML = this.getTemplate();
        this.setDefaultValues();
        this.bindEvents();
    }

getTemplate() {
    return `
        <div class="fade-in">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <button id="btn-volver" class="btn" style="margin-right: 15px; background: transparent; color: #666;">
                    <i class="fas fa-arrow-left fa-lg"></i>
                </button>
                <h2 style="margin: 0;"><i class="fas fa-phone-alt"></i> Registrar Nueva Llamada</h2>
            </div>
            
            <div style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <form id="llamada-form">
                    <div style="background: #f8f9fa; padding: 15px; border-left: 5px solid #4e54c8; margin-bottom: 20px; border-radius: 4px;">
                        <h4 style="margin: 0; color: #4e54c8;">Datos del Reporte</h4>
                    </div>
                    
                    <!-- Fila 1: Fecha, Hora, Turno -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div class="form-group">
                            <label for="fecha">Fecha *</label>
                            <input type="date" id="fecha" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="hora">Hora *</label>
                            <input type="time" id="hora" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="turno">Turno *</label>
                            <select id="turno" class="form-control" required>
                                <option value="${this.currentUser.turno}">${this.currentUser.turno} (Actual)</option>
                                <option value="matutino">Matutino</option>
                                <option value="vespertino">Vespertino</option>
                                <option value="nocturno">Nocturno</option>
                            </select>
                        </div>
                    </div>

                    <!-- Fila 2: Teléfono, Colonia, Ubicación -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div class="form-group">
                            <label for="telefono">Teléfono Reportante *</label>
                            <input type="tel" id="telefono" class="form-control" required>
                        </div>

                        <div class="form-group">
                            <label for="colonia">Colonia *</label>
                            <input type="text" id="colonia" class="form-control" required>
                        </div>

                        <div class="form-group">
                            <label for="ubicacion">Calle / Ubicación *</label>
                            <input type="text" id="ubicacion" class="form-control" required>
                        </div>
                    </div>

                    <!-- Motivo principal -->
                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <label for="motivo">Motivo Principal *</label>
                        <input type="text" id="motivo" class="form-control" required>
                    </div>

                    <!-- Descripción/Razonamiento -->
                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <label for="descripcion">Descripción / Razonamiento *</label>
                        <textarea id="descripcion" class="form-control" rows="3" required></textarea>
                    </div>

                    <!-- Campos ocultos pero requeridos por backend -->
                    <div style="display: none;">
                        <input type="hidden" id="seguimiento" value="Sin seguimiento">
                        <input type="hidden" id="motivo_radio_operacion" value="Llamada telefónica">
                        <input type="hidden" id="salida" value="no">
                        <input type="hidden" id="detenido" value="no">
                        <input type="hidden" id="vehiculo" value="">
                        <input type="hidden" id="peticionario" value="Anónimo">
                        <input type="hidden" id="agente" value="">
                        <input type="hidden" id="telefono_agente" value="">
                    </div>
                    
                    <div style="margin-top: 2rem; display: flex; gap: 10px; justify-content: flex-end;">
                        <button type="button" id="btn-cancelar" class="btn btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Guardar Bitácora
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

    setDefaultValues() {
        const now = new Date();
        document.getElementById('fecha').value = now.toISOString().split('T')[0];
        document.getElementById('hora').value = now.toTimeString().substring(0,5);
    }

    bindEvents() {
        // Botón volver
        document.getElementById('btn-volver').addEventListener('click', () => {
            this.appController.goToDashboard();
        });

        // Botón cancelar
        document.getElementById('btn-cancelar').addEventListener('click', () => {
            this.appController.goToDashboard();
        });

        // Formulario
        document.getElementById('llamada-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.procesarRegistro();
        });
    }
// En LlamadasView.js - BUSCA EL MÉTODO procesarRegistro y cámbialo:
async procesarRegistro() {
    const btn = this.container.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    btn.disabled = true;

    // Helper para obtener valores
    const getValue = (id, defaultValue = '') => {
        const el = document.getElementById(id);
        return el ? (el.value || defaultValue) : defaultValue;
    };

// En LlamadasView.js - método procesarRegistro():
const datos = {
    // Campos que coinciden con el backend
    fecha: getValue('fecha', new Date().toISOString().split('T')[0]),
    turno: getValue('turno', this.currentUser.turno || 'matutino'),
    hora: getValue('hora', new Date().toTimeString().substring(0,5)),
    motivo: getValue('motivo', ''),
    ubicacion: getValue('ubicacion', ''),
    colonia: getValue('colonia', ''),
    
    // IMPORTANTE: Usar nombres que espera el backend
    descripcion: getValue('descripcion', ''),  // El backend lo mapea a razonamiento
    telefono: getValue('telefono', ''),        // El backend lo mapea a numero_telefono
    
    // Campos con valores por defecto
    seguimiento: "Sin seguimiento",
    motivo_radio_operacion: "Llamada telefónica",
    salida: "no",
    detenido: "no",
    vehiculo: "",
    peticionario: "Anónimo",
    agente: "",
    telefono_agente: "",
    
    // usuario_id lo agrega el backend automáticamente
};



    try {
        if (typeof LlamadasService !== 'undefined') {
            const resultado = await LlamadasService.registrarLlamada(datos);
            
            if (resultado && resultado.success) {
                alert(' Llamada registrada exitosamente.');
                this.appController.goToDashboard();
            } else {
                const errorMsg = resultado?.message || 'Error del servidor';
                throw new Error(errorMsg);
            }
        } else {
            throw new Error('Servicio no disponible');
        }
        
    } catch (error) {
        console.error('💥 Error completo:', error);
        alert(`❌ Error: ${error.message}\n\nRevisa la consola para más detalles.`);
        
        // Restaurar botón
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

    cleanup() {
        // Limpiar event listeners
    }
}
window.LlamadasView = LlamadasView;
