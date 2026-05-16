# Finanzas App 💰 (v4.0)

Bienvenido a **Finanzas App**, una aplicación móvil desarrollada con **React Native** y **Expo** para el control y gestión de finanzas personales. Este proyecto ha sido recientemente refactorizado siguiendo los principios **SOLID**, garantizando un código limpio, mantenible y escalable.

## 🚀 Descripción del Proyecto

Finanzas App es una solución moderna para mantener un registro claro de la economía personal. Permite a los usuarios registrar ingresos y gastos, visualizar tendencias de dinero mediante gráficos interactivos y gestionar categorías y métodos de pago personalizados.

## 🌟 Novedades de la Versión 4.0

- **Arquitectura SOLID**: Completa separación de la lógica de negocio del renderizado UI mediante **Custom Hooks**.
- **Filtrado Global por Mes**: Implementación de **Zustand** para la gestión del estado global del mes seleccionado. Ahora puedes navegar entre meses anteriores y futuros con un solo clic.
- **Gráficos Interactivos**: Mejoras visuales significativas en la pantalla de estadísticas, con gráficos de líneas por usuario y gráficos de torta por categoría.
- **Documentación Completa**: Todos los archivos clave cuentan con comentarios descriptivos en español (**JSDoc**) para facilitar la comprensión de la lógica.
- **Consistencia de Datos**: Integración robusta con **React Query** para el manejo de caché y sincronización en tiempo real con el backend.
- **Actualizaciones Over-The-Air (OTA)**: Implementación de **Expo Updates** para enviar mejoras a los dispositivos de forma instantánea sin necesidad de reinstalar el APK.
- **Seguridad de Datos (RLS)**: Políticas de seguridad a nivel de fila en Supabase para garantizar que cada usuario solo acceda a sus propios datos.

## 🛠️ Tecnologías Utilizadas

- **Core**: [React Native](https://reactnative.dev/), [Expo](https://expo.dev/), [Expo Router](https://docs.expo.dev/router/introduction/).
- **Gestión de Estado**: [Zustand](https://github.com/pmndrs/zustand) (Mes seleccionado, Autenticación).
- **Datos Asíncronos**: [@tanstack/react-query](https://tanstack.com/query/latest) (Fetching & Caching).
- **Estilos & UI**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS), [React Native Gifted Charts](https://gifted-charts.web.app/).
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL + PostgREST).
- **Utilidades**: [Day.js](https://day.js.org/), [React Hook Form](https://react-hook-form.com/).

## 📂 Organización del Proyecto

- **`app/`**: Pantallas y rutas (Expo Router).
- **`api/`**: Servicios de comunicación con Supabase.
- **`components/`**: Componentes reutilizables.
- **`hooks/`**: Lógica de negocio (Hooks SOLID).
- **`store/`**: Estados globales de la aplicación.
- **`eas.json`**: Configuración de los perfiles de construcción y canales de actualización.
- **`.npmrc`**: Configuración crítica para la compatibilidad de `pnpm` con Expo/Babel.
- **`PROJECT_GUIDE.md`**: Guía técnica detallada sobre la arquitectura y funcionalidades.

## 🚀 Comandos Rápidos

| Acción | Comando |
| :--- | :--- |
| **💻 Desarrollo** | `pnpm start` |
| **⚡ Actualizar App (OTA)** | `pnpm dlx eas-cli update --branch main --platform android --message "Tu mensaje"` |
| **📦 Crear nuevo APK** | `pnpm dlx eas-cli build --profile production --platform android` |
| **🧹 Limpiar librerías** | `Remove-Item -Recurse -Force node_modules; pnpm install` |

## ⚡ Instalación y Ejecución Local

1.  **Clonar:** `git clone <URL_DEL_REPOSITORIO>`
2.  **Instalar:** `npm install`
3.  **Configurar:** Asegura tus credenciales de Supabase en `app.json`.
4.  **Iniciar:** `npx expo start`

## 📱 Funcionalidades

- **Dashboard**: Vista rápida del balance mensual actual.
- **Movimientos**: Lista de ingresos y gastos con edición directa.
- **Filtro Temporal**: Navega por cualquier periodo para ver históricos.
- **Estadísticas**: Gráficos dinámicos comparativos por usuario y categoría.

## 👤 Autor

**Edinson Madrid**

---
Desarrollado con ❤️ usando React Native & Expo.

## 🚀 Flujo de Desarrollo y Despliegue

Este proyecto utiliza un sistema de **Actualizaciones Instantáneas (OTA)** para agilizar el mantenimiento.

### 1. Desarrollo (Local)
Para trabajar en nuevas funciones:
```powershell
pnpm start
```
*Usa el APK de "Development Build" para previsualizar cambios en tiempo real.*

### 2. Producción (Envío a la familia)
Para enviar actualizaciones a todos los dispositivos instalados:
```powershell
pnpm dlx eas-cli update --branch main --platform android --message "Descripción del cambio"
```
*La app descargará automáticamente el nuevo código al abrirse.*

### 3. Cambio de Versión Nativa
Solo es necesario generar un nuevo APK si se instalan librerías con código nativo o si se cambia la `version` en `app.json`:
```powershell
pnpm dlx eas-cli build --profile production --platform android
```

## 🔒 Seguridad (Supabase RLS)

Se han implementado políticas de **Row Level Security (RLS)** para proteger la integridad de los datos:
- **Aislamiento de Usuarios**: Cada usuario solo tiene permisos de `SELECT`, `INSERT`, `UPDATE` y `DELETE` sobre registros donde `user_id = auth.uid()`.
- **Roles Administrativos**: Solo los usuarios con `role = 'admin'` en la tabla `profiles` pueden gestionar categorías globales.
- **Funciones Protegidas**: Las funciones de base de datos están revocadas para el rol `public` y solo son ejecutables por servicios autorizados.

## ⚠️ Notas de Instalación (pnpm)

Para garantizar la visibilidad de los módulos de Babel y Expo al usar `pnpm`, el proyecto requiere la siguiente configuración en `.npmrc`:
```text
node-linker=hoisted
shamefully-hoist=true
```
Si experimentas errores de "Module not found", elimina la carpeta `node_modules` y ejecuta `pnpm install` para reconstruir la estructura plana.
