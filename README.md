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

| Rol           | Correo              | Contraseña |
| ------------- | ------------------- | ---------- |
| Asesor        | asesor@ucc.edu.co   | Asesor123* |
| Administrador | admin@enlace.edu.co | Admin123*  |

El administrador puede entrar a su inicio, pero no puede acceder a las rutas de asesor.
Para mantener el acceso de la demostración anterior, `asesor@enlace.edu.co` también funciona como alias del asesor.

## Funcionalidades

- Inicio/cierre de sesión con contraseñas verificadas mediante bcrypt, cookie `HttpOnly` y expiración por inactividad.
- Autorización por rol y rutas protegidas.
- Inicio diferenciado para asesor y administrador.
- Navegación lateral adaptable por rol; el asesor puede visitar `/casos` y registrar un caso en `/casos/nuevo`.
- Registro en memoria con correo estudiantil `@campusucc.edu.co`, validación y al menos un marcador del [catálogo de investigación](./docs/investigacion/marcadores-desercion.md). Los casos y la comprobación de duplicados se reinician al detener el proceso.
- Búsqueda y filtros por estado/programa en vivo, con primera carga renderizada en el servidor. Sin JavaScript se utiliza el botón «Buscar». «Limpiar» permanece visible para facilitar el restablecimiento.
- Detalle de caso con cronología y marcadores agrupados por categoría.
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

La bitácora local `logs/auditoria.jsonl` registra el identificador del asesor, la acción, el identificador del caso y la fecha, sin guardar el correo ni los marcadores. Está excluida de Git. Los marcadores son señales de acompañamiento, no diagnósticos; no se deben utilizar datos personales reales en este MVP.
