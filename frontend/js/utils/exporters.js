// Frontend - Cliente de exportación
class ExportClient {
    static baseURL = '/api/export';
    
    // Exportar con progress
    static async download(url, filename) {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename || 'descarga';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
            
            return true;
        } catch (error) {
            console.error('Error descargando:', error);
            throw error;
        }
    }
    
    // Exportar llamadas a Excel
    static async exportLlamadasExcel(filtros = {}) {
        const params = new URLSearchParams(filtros);
        const url = `${this.baseURL}/llamadas/excel?${params}`;
        await this.download(url, this.generateFilename('llamadas', 'xlsx', filtros));
    }
    
    // Exportar llamadas a CSV
    static async exportLlamadasCSV(filtros = {}) {
        const params = new URLSearchParams(filtros);
        const url = `${this.baseURL}/llamadas/csv?${params}`;
        await this.download(url, this.generateFilename('llamadas', 'csv', filtros));
    }
    
    // Exportar llamadas a PDF
    static async exportLlamadasPDF(filtros = {}) {
        const params = new URLSearchParams(filtros);
        const url = `${this.baseURL}/llamadas/pdf?${params}`;
        await this.download(url, this.generateFilename('bitacora', 'pdf', filtros));
    }
    
    // Exportar reportes C5 a Excel
    static async exportC5Excel(filtros = {}) {
        const params = new URLSearchParams(filtros);
        const url = `${this.baseURL}/c5/excel?${params}`;
        await this.download(url, this.generateFilename('reportes_c5', 'xlsx', filtros));
    }
    
    // Exportar reportes C5 a PDF
    static async exportC5PDF(filtros = {}) {
        const params = new URLSearchParams(filtros);
        const url = `${this.baseURL}/c5/pdf?${params}`;
        await this.download(url, this.generateFilename('reportes_c5', 'pdf', filtros));
    }
    
    // Generar nombre de archivo
    static generateFilename(prefix, extension, filtros) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        if (filtros.year && filtros.month) {
            return `${prefix}_${filtros.year}_${filtros.month}.${extension}`;
        }
        return `${prefix}_${year}${month}${day}.${extension}`;
    }
    
    // Mostrar selector de mes
    static showMonthSelector(callback) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        const html = `
            <div class="month-selector-overlay" id="monthSelectorOverlay">
                <div class="month-selector-modal">
                    <h3>Exportar Reporte Mensual</h3>
                    <div class="month-selector-form">
                        <label>Año:</label>
                        <select id="exportYear">
                            ${[currentYear, currentYear - 1, currentYear - 2].map(y => 
                                `<option value="${y}">${y}</option>`
                            ).join('')}
                        </select>
                        
                        <label>Mes:</label>
                        <select id="exportMonth">
                            ${Array.from({length: 12}, (_, i) => i + 1).map(m => 
                                `<option value="${m}" ${m === currentMonth ? 'selected' : ''}>
                                    ${new Date(2000, m - 1).toLocaleDateString('es-MX', { month: 'long' })}
                                </option>`
                            ).join('')}
                        </select>
                        
                        <div class="month-selector-buttons">
                            <button class="btn-cancel" onclick="ExportClient.closeMonthSelector()">Cancelar</button>
                            <button class="btn-export" onclick="ExportClient.confirmMonthExport()">Exportar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', html);
        this.monthSelectorCallback = callback;
    }
    
    static closeMonthSelector() {
        document.getElementById('monthSelectorOverlay')?.remove();
    }
    
    static confirmMonthExport() {
        const year = document.getElementById('exportYear').value;
        const month = document.getElementById('exportMonth').value;
        this.closeMonthSelector();
        if (this.monthSelectorCallback) {
            this.monthSelectorCallback({ year, month });
        }
    }
}

// Hacer disponible globalmente
window.ExportClient = ExportClient;
