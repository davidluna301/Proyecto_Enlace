# ENLACE UCC — MVP 1

Aplicación web renderizada en el servidor para validar el inicio de sesión por roles y el seguimiento de casos estudiantiles. Los datos son de demostración y viven en memoria; no hay una base de datos conectada.

## Requisitos

- Node.js 20 LTS o superior
- npm

## Inicio local

```powershell
npm install
npm run dev
```

Abre <http://localhost:3000>. Para compilar y ejecutar la versión de producción:

```powershell
npm run build
npm start
```

En desarrollo, la aplicación genera un secreto de sesión aleatorio para ese proceso. En producción, configura `SESSION_SECRET` con un valor secreto y `NODE_ENV=production`. Consulta [.env.example](./.env.example) para las variables disponibles.

## Credenciales de demostración

| Rol           | Correo               | Contraseña |
| ------------- | -------------------- | ---------- |
| Asesor        | asesor@enlace.edu.co | Asesor123* |
| Administrador | admin@enlace.edu.co  | Admin123*  |

El administrador puede entrar a su inicio, pero no puede acceder a las rutas de asesor.

## Funcionalidades

- Inicio/cierre de sesión con contraseñas verificadas mediante bcrypt, cookie `HttpOnly` y expiración por inactividad.
- Autorización por rol y rutas protegidas.
- Inicio diferenciado para asesor y administrador.
- Casos mock con búsqueda, filtros por estado/programa, estado vacío y cronología de eventos.
- Bootstrap 5, estilos y logos servidos desde `public/`; sin CDN ni fuentes remotas.

## Validación

```powershell
npm run lint
npm run build
npm test
npm run format:check
```

Los casos y usuarios mock están en `src/data/`. El servicio de casos depende de la interfaz `CasesRepository`; el servidor inyecta `MockCasesRepository` para facilitar una futura implementación PostgreSQL sin acoplarla a las rutas ni a las vistas.

## Nota de seguridad

Las cuentas y los casos son únicamente de demostración. La sesión usa el almacén en memoria predeterminado de Express, apropiado solo para este MVP local; antes de desplegar producción, se debe reemplazar por un almacén persistente y configurar secretos seguros.
