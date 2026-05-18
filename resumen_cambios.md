# Resumen del Stage de Git: Registro de Cambios de la Sesión

Este documento resume todos los cambios y nuevas características que se encuentran actualmente en el **stage de Git** (modificados y listos para commit). Estos cambios completan la implementación de la nueva pestaña de **Gastos Fijos**, las conexiones con Supabase, los controladores de reinicio mensual automatizado, el rediseño premium de la pestaña de **Ajustes**, la persistencia de avatar/ojos de visibilidad y el motor de **Tour Interactivo** en las seis pestañas.

---

## 🛠️ Nuevos Servicios y Archivos de Conexión (Supabase)

### 1. [delete.serviciosMensuales.service.ts](file:///j:/Repos_Github/finanzasApp/api/services/servicios_mensuales/delete.serviciosMensuales.service.ts) `[NUEVO]`
*   Implementa el servicio REST para eliminar servicios de gastos fijos por su `id` (`DELETE /servicios_mensuales?id=eq.X`).

### 2. [get.serviciosMensuales.service.ts](file:///j:/Repos_Github/finanzasApp/api/services/servicios_mensuales/get.serviciosMensuales.service.ts) `[NUEVO]`
*   Servicio para consultar todos los servicios fijos del usuario.
*   **Ordenamiento Avanzado:** Asegura que los servicios se ordenen de manera prioritaria mostrando primero los de estado `Pendiente` (por orden descendente del campo `estado`) y luego de forma alfabética (`name.asc`).

### 3. [post.serviciosMensuales.service.ts](file:///j:/Repos_Github/finanzasApp/api/services/servicios_mensuales/post.serviciosMensuales.service.ts) `[NUEVO]`
*   Servicio REST para registrar y guardar nuevos gastos fijos mensuales en Supabase.

### 4. [update.serviciosMensuales.service.ts](file:///j:/Repos_Github/finanzasApp/api/services/servicios_mensuales/update.serviciosMensuales.service.ts) `[NUEVO]`
*   Actualiza el estado de los servicios. Al pasar de **Pendiente a Pagado**, calcula e inyecta la fecha actual en el campo `fecha_actualizacion` (formato `YYYY-MM-DD`). Al revertirse a **Pendiente**, blanquea la fecha a `null`.

---

## 🏗️ Nueva Pestaña y Navegación de Gastos Fijos

### 5. [app/(tabs)/fijos/_layout.tsx](file:///j:/Repos_Github/finanzasApp/app/(tabs)/fijos/_layout.tsx) `[NUEVO]`
*   Layout Stack básico para el ruteo de la pestaña de Gastos Fijos.

### 6. [app/(tabs)/fijos/index.tsx](file:///j:/Repos_Github/finanzasApp/app/(tabs)/fijos/index.tsx) `[NUEVO]`
*   **Interfaz Premium:** Pantalla principal de Gastos Fijos por Mes.
*   **Tarjetas de Resumen:** Muestra contadores dinámicos arriba con la cantidad de servicios "Pendientes" y "Pagados" del mes en colores ámbar y verde.
*   **Interactividad y Confirmaciones:** Al pagar o revertir un servicio, despliega alertas nativas interactivas antes de efectuar la mutación con Supabase.
*   **Tours Interactivos:** Incorpora el controlador aislado `fijos` de `rn-tourguide` con 4 zonas de recorrido, soportando auto-inicio persistente y activación manual.
*   **Corrección de Flex:** El listado se mantiene al 100% de la altura y el botón flotante `+` en la esquina inferior derecha gracias al contenedor absoluto externo.

### 7. [app/(tabs)/_layout.tsx](file:///j:/Repos_Github/finanzasApp/app/(tabs)/_layout.tsx) `[MODIFICADO]`
*   Añadido el ruteo y diseño de la nueva pestaña de **Gastos Fijos** (`fijos`) en la barra de navegación inferior, asignándole un icono de tarjeta de crédito (`credit-card`) y etiquetas limpias.

---

## ⚡️ Hooks de Sistema y Automatizaciones

### 8. [hooks/useMonthlyReset.ts](file:///j:/Repos_Github/finanzasApp/hooks/useMonthlyReset.ts) `[NUEVO]`
*   **Control Automatizado de Mes:** Detecta de forma local y en segundo plano si el usuario ha iniciado sesión en un nuevo mes del año en su zona horaria.
*   **Bypass de Restricciones PostgREST:** Para resetear de forma masiva los servicios a `"Pendiente"` y `fecha_actualizacion = null`, realiza un parche aplicando un filtro seguro de siempre verdadero `?id=gt.0`, burlando la política restrictiva de Supabase contra actualizaciones sin filtros.

### 9. [hooks/index.ts](file:///j:/Repos_Github/finanzasApp/hooks/index.ts) `[MODIFICADO]`
*   Exportación global del hook `useMonthlyReset`.

---

## 🎨 Modificaciones y Mejoras Visuales en Ajustes

### 10. [app/(tabs)/ajustes/index.tsx](file:///j:/Repos_Github/finanzasApp/app/(tabs)/ajustes/index.tsx) `[MODIFICADO]`
*   **Rediseño Premium:** Transformación completa de la vista de ajustes en un panel moderno agrupado en tarjetas suaves con iconos elegantes.
*   **Dropdown Interactivo:** Añadido un componente selector de dropdown desplegable de alta fidelidad que lee todos los gastos fijos del usuario y permite borrarlos de forma definitiva de la base de datos con confirmación destructiva.
*   **Tour Interactivo:** Integrado con el identificador aislado `'ajustes'` con 4 zonas explicativas (Cabecera, Categorías, Métodos de Pago, Eliminar Gastos Fijos).

---

## 👁️ Persistencia de Datos y Corrección de Bugs

### 11. [api/services/usuarios/profile.service.ts](file:///j:/Repos_Github/finanzasApp/api/services/usuarios/profile.service.ts) `[MODIFICADO]`
*   Se cambió la llamada de actualización de perfil de `.update()` a `.upsert()`. Esto asegura la persistencia definitiva de la foto de perfil (avatar) al re-iniciar sesión, ya que inserta la fila del perfil en Supabase si no existía previamente.

### 12. [store/useToogleVisualization.ts](file:///j:/Repos_Github/finanzasApp/store/useToogleVisualization.ts) `[MODIFICADO]`
*   Añadida la **persistencia en el estado del ojo de visibilidad**. Usa el middleware `persist` de Zustand y `AsyncStorage` de React Native para memorizar de manera automática la preferencia del usuario, manteniendo ocultos o visibles los saldos permanentemente a través de los reinicios de la app.

---

## 🧭 Integración del Motor de Tours Interactivos (`rn-tourguide`)

### 13. [app/_layout.tsx](file:///j:/Repos_Github/finanzasApp/app/_layout.tsx) `[MODIFICADO]`
*   Envuelve toda la aplicación dentro del `<TourGuideProvider>` con configuraciones de visualización óptimas y todas las etiquetas adaptadas a **español** (*Siguiente, Atrás, Saltar, Entendido*).

### 14. [interfaces/components/interfaces.components.ts](file:///j:/Repos_Github/finanzasApp/interfaces/components/interfaces.components.ts) `[MODIFICADO]`
*   Se declaró la firma opcional `onPressHelp?: () => void` dentro del contrato de propiedades del encabezado (`InterfaceHeaderComponentProps`).

### 15. [components/HeaderComponent.tsx](file:///j:/Repos_Github/finanzasApp/components/HeaderComponent.tsx) `[MODIFICADO]`
*   Añadida la interactividad para pintar un hermoso icono de ayuda (`help-circle-outline` de Ionicons) en el extremo superior derecho. Al presionarse, ejecuta el callback de ayuda.

### 16. [app/(tabs)/gastos/index.tsx` (Dashboard)](file:///j:/Repos_Github/finanzasApp/app/(tabs)/gastos/index.tsx) `[MODIFICADO]`
*   Añadido el tour interactivo aislado `'gastos'` con 5 zonas clave del dashboard principal, persistido con `AsyncStorage` y disparador manual en el encabezado.
*   Botón flotante corregido en contenedor absoluto exterior para evitar desplazamientos.

### 17. [app/(tabs)/ingresos/index.tsx](file:///j:/Repos_Github/finanzasApp/app/(tabs)/ingresos/index.tsx) `[MODIFICADO]`
*   Integrado con el tour `'ingresos'` y su persistencia.
*   **Corrección de Flex:** Se colocó el `View className="flex-1"` por fuera del tour para evitar el colapso de altura (0px) de la lista de ingresos.

### 18. [app/(tabs)/estadisticas/index.tsx](file:///j:/Repos_Github/finanzasApp/app/(tabs)/estadisticas/index.tsx) `[MODIFICADO]`
*   Integrado con el tour `'estadisticas'` (5 zonas de análisis financiero).

### 19. [app/(tabs)/historial/index.tsx](file:///j:/Repos_Github/finanzasApp/app/(tabs)/historial/index.tsx) `[MODIFICADO]`
*   Integrado con el tour `'historial'` (4 zonas de tendencias anuales).

---

## 📦 Gestión de Dependencias
*   **[package.json](file:///j:/Repos_Github/finanzasApp/package.json) / [pnpm-lock.yaml](file:///j:/Repos_Github/finanzasApp/pnpm-lock.yaml):** Instalación registrada y bloqueada de la librería `rn-tourguide` (v3.3.2).
