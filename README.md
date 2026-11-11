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
- Registro en memoria con validación en cliente y servidor. El dominio del correo estudiantil se configura en `INSTITUTIONAL_EMAIL_DOMAIN` (por defecto, `campusucc.edu.co`); también se puede registrar un caso sin correo institucional y proporcionar un correo alternativo opcional. Los casos y la comprobación de duplicados entre casos no cerrados se reinician al detener el proceso.
- El nombre admite solo letras y espacios; la descripción tiene entre 20 y 1000 caracteres y las observaciones opcionales del asesor hasta 500. Los marcadores están desactivados por defecto; si se habilitan, se requiere al menos uno del [catálogo de investigación](./docs/investigacion/marcadores-desercion.md). Al apagarlos se limpia la selección.
- Búsqueda y filtros por estado/programa en vivo, con primera carga renderizada en el servidor. Sin JavaScript se utiliza el botón «Buscar». «Limpiar» permanece visible para facilitar el restablecimiento.
- Detalle de caso adaptable con datos del estudiante, cronología, marcadores agrupados por categoría y observaciones del asesor cuando existen; el resumen de estado aparece en un panel que se ubica primero en pantallas pequeñas.
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

Para registrar estudiantes sin acceso a su correo institucional, el formulario lo hace opcional y ofrece un correo de contacto alternativo, también opcional (no se solicita teléfono). Esta decisión refleja la realidad operativa del asesor sin bloquear el registro ni pedir más datos de contacto de los necesarios. La selección de marcadores se limpia al desactivar el control y no se exige ninguno si permanece apagado.
