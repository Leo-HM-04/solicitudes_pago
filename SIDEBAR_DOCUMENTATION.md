# Componentes Reutilizables de Navegación

Este proyecto incluye componentes reutilizables para la barra de navegación lateral (sidebar) que evitan la duplicación de código en diferentes páginas.

## Componentes Creados

### 1. `Sidebar.jsx` - Componente de Barra de Navegación

**Ubicación:** `src/components/Sidebar.jsx`

**Descripción:** Componente reutilizable que contiene toda la lógica y UI de la barra de navegación lateral.

**Props:**
- `isOpen`: Boolean que controla si el sidebar está abierto
- `onClose`: Función para cerrar el sidebar
- `activeMenuItem`: String con el título del elemento de menú activo
- `setActiveMenuItem`: Función para cambiar el elemento activo
- `isLoggingOut`: Boolean que indica si se está cerrando sesión
- `setIsLoggingOut`: Función para controlar el estado de logout

**Características:**
- Navegación automática entre páginas
- Gestión del estado de logout
- Animaciones con Framer Motion
- Click fuera para cerrar
- Reloj en tiempo real
- Responsive design

### 2. `useSidebar.js` - Hook Personalizado

**Ubicación:** `src/hooks/useSidebar.js`

**Descripción:** Hook personalizado que maneja todo el estado del sidebar de manera centralizada.

**Parámetros:**
- `initialActiveItem`: String opcional con el elemento inicial activo (por defecto: "Pagina de inicio")

**Retorna:**
- `isMenuOpen`: Estado del menú (abierto/cerrado)
- `activeMenuItem`: Elemento de menú actualmente activo
- `isLoggingOut`: Estado de logout
- `setActiveMenuItem`: Función para cambiar elemento activo
- `setIsLoggingOut`: Función para controlar logout
- `openMenu`: Función para abrir el menú
- `closeMenu`: Función para cerrar el menú
- `toggleMenu`: Función para alternar el menú

## Cómo Usar en Nuevas Páginas

### Paso 1: Importar las dependencias

```jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../hooks/useSidebar";
```

### Paso 2: Configurar el hook en el componente

```jsx
const MiPagina = () => {
  // Use custom sidebar hook
  const {
    isMenuOpen,
    activeMenuItem,
    isLoggingOut,
    setActiveMenuItem,
    setIsLoggingOut,
    toggleMenu,
    closeMenu
  } = useSidebar("Nombre del Item Activo"); // Opcional: especifica cual item debe estar activo

  // Resto de tu lógica de componente...
```

### Paso 3: Agregar el componente Sidebar al JSX

```jsx
return (
  <div className="app-container" role="main">
    {/* Sidebar Component */}
    <Sidebar
      isOpen={isMenuOpen}
      onClose={closeMenu}
      activeMenuItem={activeMenuItem}
      setActiveMenuItem={setActiveMenuItem}
      isLoggingOut={isLoggingOut}
      setIsLoggingOut={setIsLoggingOut}
    />

    {/* Main Content */}
    <motion.div
      className="main-content"
      animate={{ marginLeft: isMenuOpen ? "280px" : "0" }}
      transition={{ type: "spring", damping: 20 }}
    >
      {/* Tu contenido aquí */}
    </motion.div>
  </div>
);
```

### Paso 4: Agregar el botón del menú

```jsx
<button
  className="menu-button"
  onClick={toggleMenu}
  aria-label="Abrir menú"
>
  <span>☰</span>
  <span>Menú</span>
</button>
```

## Elementos de Menú Disponibles

El sidebar incluye los siguientes elementos de navegación:

1. **Pagina de inicio** (🏠) → `/home`
2. **Solicitar un pago** (💸) → `/solicitar-pago`
3. **Estado de solicitudes** (📊) → `/solicitudes`
4. **Reportes de actividad** (📝) → `/reportes`
5. **Centro de administración** (⚙️) → `/usuarios`
6. **Cerrar sesión** (🚪) → Logout y redirección a `/`

## Páginas que ya usan estos componentes

- ✅ `HomePage.jsx` - Actualizada
- ✅ `SolicitudesPage.jsx` - Actualizada
- ✅ `UsuariosPage.jsx` - Actualizada

## Beneficios

1. **No repetición de código:** El sidebar se define una sola vez
2. **Mantenimiento centralizado:** Cambios en un lugar se reflejan en todas las páginas
3. **Consistencia:** Comportamiento uniforme en toda la aplicación
4. **Facilidad de uso:** Simple integración en nuevas páginas
5. **Estado compartido:** Manejo centralizado del estado del sidebar

## CSS Requerido

Asegúrate de que tus archivos CSS incluyan los estilos para:
- `.app-container`
- `.sidebar`
- `.main-content`
- `.menu-button`
- Clases de animación de Framer Motion

Los estilos existentes en `HomePage.jsx`, `SolicitudesPage.jsx` y `UsuariosPage.jsx` son compatibles con este componente reutilizable.
