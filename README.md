# SAS C4 – Bitácora de Llamadas

Sistema web para la gestión y registro de llamadas del **C4**, enfocado en el control, seguimiento y visualización de envíos al **C5** mediante una bitácora digital.

El proyecto está diseñado bajo una arquitectura **frontend modular** y un **backend con controladores y rutas**, priorizando la mantenibilidad, escalabilidad y claridad del código.

---

## 🧩 Características principales

- Registro y consulta de llamadas
- Envío de información al sistema C5
- Dashboard con vistas organizadas
- Arquitectura frontend separada por vistas, servicios y utilidades
- Backend con controladores y rutas
- Conexión a base de datos para persistencia de información

---

## 🏗️ Estructura del proyecto

```text
sas-c4-bitacora/
├── backend/
│   ├── controllers/
│   │   └── LlamadaController.js
│   ├── routes/
│   │   └── enviosC5Routes.js
│   └── (configuración de BD)
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js
│   │   ├── services/
│   │   │   ├── C5Service.js
│   │   │   └── LlamadasService.js
│   │   ├── utils/
│   │   │   ├── helpers.js
│   │   │   ├── formatters.js
│   │   │   └── notifications.js
│   │   └── views/
│   │       ├── LoginView.js
│   │       ├── DashboardView.js
│   │       ├── LlamadasView.js
│   │       ├── BuscarView.js
│   │       └── c5/
│   │           ├── C5MainView.js
│   │           ├── C5ListView.js
│   │           ├── C5DetailsView.js
│   │           ├── C5NewView.js
│   │           └── C5SuccessView.js
│   └── dashboard.html
└── README.md
```

---

## 🔧 Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Node.js
- Express
- Base de datos SQL
- Git & GitHub

---

## ♻️ Refactorización realizada

Se llevó a cabo una refactorización del frontend con los siguientes objetivos:

- Separar la lógica por vistas
- Modularizar servicios y utilidades
- Eliminar archivos legacy
- Mejorar la mantenibilidad y legibilidad del código

Además, se corrigieron errores relacionados con el guardado de información en la base de datos.

---

## 🚀 Ejecución del proyecto

1. **Clonar el repositorio:**
    ```bash
    git clone https://github.com/Cristopher-P/Sas-C2-Bitacora.git
    ```

2. **Instalar dependencias del backend:**
    ```bash
    npm install
    ```

3. **Configurar la conexión a la base de datos**

4. **Ejecutar el servidor:**
    ```bash
    npm start
    ```

5. **Abrir el archivo `dashboard.html` en el navegador**

---

## 📌 Notas

Este proyecto forma parte de un desarrollo académico y puede seguir evolucionando con nuevas funcionalidades, validaciones y mejoras de seguridad.

---

## 👤 Autor

**Cristopher P.**  
Proyecto académico – Sistema SAS C4