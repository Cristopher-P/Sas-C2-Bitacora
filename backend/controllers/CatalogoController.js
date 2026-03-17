const Catalogo = require('../models/Catalogo');
const SystemLogger = require('../utils/logger');

class CatalogoController {
    // PUBLIC: Get active catalogs by type
    static async getByType(req, res) {
        try {
            const { tipo } = req.params;
            const catalogos = await Catalogo.getAll(tipo);
            
            res.json({
                success: true,
                data: catalogos
            });
        } catch (error) {
            console.error('Error in getByType:', error);
            res.status(500).json({ success: false, message: 'Error al obtener catálogos' });
        }
    }

    // ADMIN: Get all catalogs
    static async getAll(req, res) {
        try {
            const catalogos = await Catalogo.getAll();
            
            res.json({
                success: true,
                data: catalogos
            });
        } catch (error) {
            console.error('Error in getAll catalogs:', error);
            res.status(500).json({ success: false, message: 'Error al obtener catálogos' });
        }
    }

    // ADMIN: Create catalog item
    static async create(req, res) {
        try {
            const { tipo, valor } = req.body;
            
            if (!tipo || !valor) {
                return res.status(400).json({ success: false, message: 'Tipo y valor son requeridos' });
            }

            const id = await Catalogo.create(tipo, valor);
            
            if (req.user) {
                await SystemLogger.log(req.user.id, 'crear_catalogo', `Tipo: ${tipo}, Valor: ${valor}`);
            }

            res.status(201).json({
                success: true,
                message: 'Item de catálogo creado exitosamente',
                data: { id, tipo, valor, activo: 1 }
            });
        } catch (error) {
            console.error('Error in create catalog:', error);
            res.status(500).json({ success: false, message: 'Error al crear item de catálogo' });
        }
    }

    // ADMIN: Update catalog item (enable/disable or change text)
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { valor, activo } = req.body;

            if (!valor) {
                return res.status(400).json({ success: false, message: 'Valor es requerido' });
            }

            const isActive = activo === undefined ? 1 : (activo ? 1 : 0);
            
            await Catalogo.update(id, valor, isActive);
            
            if (req.user) {
                await SystemLogger.log(req.user.id, 'actualizar_catalogo', `ID: ${id}, Nuevo Valor: ${valor}, Activo: ${isActive}`);
            }

            res.json({
                success: true,
                message: 'Item actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error in update catalog:', error);
            res.status(500).json({ success: false, message: 'Error al actualizar item' });
        }
    }

    // ADMIN: Hard Delete catalog item (optional, better to just disable)
    static async delete(req, res) {
        try {
            const { id } = req.params;
            await Catalogo.delete(id);
            
            if (req.user) {
                await SystemLogger.log(req.user.id, 'borrar_catalogo', `ID eliminado: ${id}`);
            }

            res.json({
                success: true,
                message: 'Item eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error in delete catalog:', error);
            res.status(500).json({ success: false, message: 'Error al eliminar item' });
        }
    }
}

module.exports = CatalogoController;
