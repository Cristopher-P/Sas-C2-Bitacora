/**
 * FORMATTERS.JS - Utilidades para formatear datos
 */

class Formatters {
    // Fechas y horas
    static formatDate(date, format = 'es-MX') {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString(format);
    }
    
    static formatDateTime(dateTime, format = 'es-MX') {
        if (!dateTime) return '';
        const d = new Date(dateTime);
        return d.toLocaleString(format);
    }
    
    static formatTime(time) {
        if (!time) return '';
        // Si time es un string "HH:MM"
        if (typeof time === 'string' && time.includes(':')) {
            const [hours, minutes] = time.split(':');
            return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }
        return new Date(time).toTimeString().substring(0, 5);
    }
    
    // Teléfonos
    static formatPhone(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 12 && cleaned.startsWith('52')) {
            // Número mexicano con código de país
            return `+${cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4')}`;
        }
        
        return phone;
    }
    
    // Moneda
    static formatCurrency(amount, currency = 'MXN') {
        if (amount === null || amount === undefined) return '';
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
    
    // Texto
    static capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    
    static capitalizeWords(text) {
        if (!text) return '';
        return text.split(' ').map(word => this.capitalize(word)).join(' ');
    }
    
    static truncate(text, length = 50) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }
    
    // Folios C5
    static generateFolioC4(fecha, hora) {
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
    
    // Formato para WhatsApp C5
    static formatC5Report(data) {
        return `FOLIO: ${data.folio_c4}
HORA: ${data.hora_envio}
MOTIVO: ${data.motivo}
UBICACIÓN: ${data.ubicacion}
DESCRIPCIÓN: ${data.descripcion}
AGENTE: ${data.agente || 'No especificado'}
CONCLUSIÓN: ${data.conclusion || 'Sin conclusión'}

*Enviado desde SAS C4*
*Turno: ${data.turno || 'N/A'}*
*Supervisor: ${data.supervisor || 'N/A'}*`;
    }
    
    // Formatear JSON para visualización
    static prettifyJson(obj) {
        try {
            return JSON.stringify(obj, null, 2);
        } catch {
            return String(obj);
        }
    }
}

// Hacer disponible globalmente
window.Formatters = Formatters;