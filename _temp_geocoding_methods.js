    
    mostrarIndicadorGeocoding(mostrar) {
        const indicador = document.getElementById('indicador-geocoding');
        if (indicador) {
            indicador.style.display = mostrar ? 'flex' : 'none';
        }
    }
    
    actualizarProgresoGeocoding(actual, total) {
        const textoEl = document.getElementById('texto-geocoding');
        if (textoEl) {
            const porcentaje = Math.round((actual / total) * 100);
            textoEl.textContent = `Geocodificando ${actual}/${total} (${porcentaje}%)`;
        }
    }
