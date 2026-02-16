# Guía de Uso - Exportación y Usabilidad

## 🎯 FASE 1: Exportación (COMPLETADA)

### Backend - Endpoints Disponibles

#### Exportar Llamadas
```javascript
// Excel mensual
GET /api/export/llamadas/excel?year=2026&month=2

// CSV con filtros
GET /api/export/llamadas/csv?turno=Matutino&fecha=2026-02-06

// PDF individual
GET /api/export/llamadas/pdf?id=123

// PDF mensual
GET /api/export/llamadas/pdf?year=2026&month=2
```

#### Exportar Reportes C5
```javascript
// Excel mensual
GET /api/export/c5/excel?year=2026&month=2

// PDF mensual
GET /api/export/c5/pdf?year=2026&month=2
```

### Frontend - Uso desde JavaScript

```javascript
// Exportar llamadas del mes actual
ExportClient.showMonthSelector(async (filtros) => {
    await ExportClient.exportLlamadasExcel(filtros);
    Toast.success('Reporte descargado');
});

// Exportar directamente
await ExportClient.exportLlamadasPDF({ fecha: '2026-02-06' });

// Imprimir tabla
PrintManager.printTable('tabla-llamadas', 'Registro de Llamadas');
```

## 🎨 FASE 2: Usabilidad (COMPLETADA)

### Tema Oscuro/Claro

El toggle se agrega automáticamente al navbar. Usuario puede cambiar con un clic.

```javascript
// Cambiar tema programáticamente
ThemeManager.setTheme('dark');
ThemeManager.toggle();
```

### Notificaciones Toast

```javascript
Toast.success('Operación exitosa');
Toast.error('Error en la operación');
Toast.warning('Advertencia');
Toast.info('Información', 5000); // 5 segundos
```

### Modales

```javascript
const modalId = Modal.show({
    title: 'Confirmar Acción',
    content: '<p>¿Estás seguro?</p>',
    size: 'medium', // small, medium, large
    footer: `
        <button onclick="Modal.close('${modalId}')">Cancelar</button>
        <button onclick="confirmar()">Aceptar</button>
    `
});
```

### Loading Overlay

```javascript
Loading.show('Procesando datos...');
// ... operación
Loading.hide();

// O con wrapper async
const data = await Loading.wrap(
    fetch('/api/data'),
    'Cargando datos...'
);
```

### Confirmaciones

```javascript
// Confirmación simple
const confirmed = await Confirm.confirm('¿Continuar?');
if (confirmed) {
    // hacer algo
}

// Confirmación de eliminación
if (await Confirm.delete('este registro')) {
    // eliminar
    Toast.success('Eliminado');
}

// Advertencia
if (await Confirm.warning('Esto no se puede deshacer')) {
    // acción peligrosa
}
```

## 🚀 Integración en Vistas Existentes

### Ejemplo: Agregar botones de exportación a una tabla

```javascript
// En LlamadasView.js o BuscarView.js
function renderExportButtons() {
    return `
        <div class="export-buttons">
            <button onclick="exportarMensual()" class="btn-export">
                <i class="fas fa-calendar"></i> Exportar Mes
            </button>
            <button onclick="exportarActual()" class="btn-export">
                <i class="fas fa-file-excel"></i> Excel
            </button>
            <button onclick="exportarPDF()" class="btn-export">
                <i class="fas fa-file-pdf"></i> PDF
            </button>
            <button onclick="imprimir()" class="btn-export">
                <i class="fas fa-print"></i> Imprimir
            </button>
        </div>
    `;
}

async function exportarMensual() {
    ExportClient.showMonthSelector(async (filtros) => {
        Loading.show('Generando reporte mensual...');
        try {
            await ExportClient.exportLlamadasExcel(filtros);
            Toast.success('✅ Reporte descargado');
        } catch (error) {
            Toast.error('Error al exportar');
        } finally {
            Loading.hide();
        }
    });
}

async function exportarActual() {
    Loading.show('Generando Excel...');
    try {
        await ExportClient.exportLlamadasExcel();
        Toast.success('Excel descargado');
    } catch (error) {
        Toast.error('Error: ' + error.message);
    } finally {
        Loading.hide();
    }
}

async function exportarPDF() {
    if (await Confirm.confirm('¿Generar PDF con los registros actuales?')) {
        await Loading.wrap(
            ExportClient.exportLlamadasPDF(),
            'Generando PDF...'
        );
        Toast.success('PDF generado');
    }
}

function imprimir() {
    PrintManager.printTable('tabla-id', 'Registro de Llamadas');
}
```

## 📦 Archivos Creados

**Backend:**
- `backend/utils/exporters.js`
- `backend/utils/pdfGenerator.js`
- `backend/routes/exportRoutes.js`

**Frontend CSS:**
- `frontend/css/theme.css`
- `frontend/css/animations.css`
- `frontend/css/components.css`

**Frontend JS:**
- `frontend/js/utils/exporters.js`
- `frontend/js/utils/printManager.js`
- `frontend/js/components/ToastNotifications.js`
- `frontend/js/components/ModalManager.js`
- `frontend/js/components/LoadingOverlay.js`
- `frontend/js/components/ConfirmDialog.js`
- `frontend/js/components/ThemeToggle.js`

## ✅ Próximos Pasos

Ejecutar `npm install` y reiniciar servidor para probar las nuevas features.
