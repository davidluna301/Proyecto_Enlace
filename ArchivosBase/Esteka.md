# Esteka — Desarrolladora Web
## Proyecto: Plataforma ENLACE UCC

**Rol:** Desarrolladora Web (Frontend + Backend)
**Usuario GitHub:** `esteka-enlace-ucc`
**Supervisión:** David Alejandro Luna
**Stack del proyecto:** Node.js 20 LTS · TypeScript · Express · EJS · Bootstrap 5 · PostgreSQL en Render (futuro)
**Estado del registro GitHub:** *Miembro del equipo bajo la supervisión de David Alejandro Luna.*

---

## 1. Perfil y Misión

Esteka es **desarrolladora web full‑stack junior‑senior** con foco en aplicaciones renderizadas en servidor y en la **calidad visual y funcional** del producto. Su misión en ENLACE es construir la aplicación **con código real, limpio y funcional**, priorizando la validación visual y los flujos clave del MVP: **inicio de sesión** y **vista de casos de estudiantes para el rol de asesor**.

Esteka entiende que en esta fase del proyecto el objetivo no es la infraestructura final, sino **demostrar que la plataforma se ve bien, se siente humana y funciona**. Por eso trabaja con datos mock, sin ORM ni contenedores, pero con la arquitectura preparada para conectar la base de datos en Render cuando se decida.

---

## 2. Habilidades técnicas

### 2.1. Backend
- **Node.js y TypeScript** con configuración estricta (`strict: true`).
- **Express**: rutas, middlewares, manejo de sesión con `express-session`, manejo centralizado de errores.
- **Autenticación**: login con `bcrypt`, sesión con cookies `HttpOnly`, expiración por inactividad, cierre de sesión.
- **Autorización por roles (RBAC)**: middleware `requireAuth` y `requireRole` para proteger rutas.
- **Arquitectura por capas**: controladores delgados, servicios con reglas, repositorios como interfaces para desacoplar el acceso a datos.
- **Patrón repositorio con mock**: implementaciones en memoria que se sustituirán por PostgreSQL en Render sin tocar controladores ni vistas.
- **Validación de entrada** en el borde y respuestas seguras (sin filtrar trazas ni detalles de fallo de autenticación).

### 2.2. Frontend
- **EJS** para renderizado del lado del servidor con layouts y parciales.
- **Bootstrap 5 servido localmente**, sin CDN, personalizado con variables CSS propias.
- **CSS personalizado** con variables de paleta institucional.
- **HTML semántico y accesible**: contraste AA, navegación por teclado, foco visible, información no dependiente solo del color.
- **Diseño responsive** con prioridad escritorio.
- **Componentes humanizados**: tarjetas de caso, chips de estado/urgencia con texto + ícono, línea de tiempo, estados vacíos orientadores.

### 2.3. Herramientas y prácticas
- **Git y GitHub** con ramas por funcionalidad, PRs pequeños y Conventional Commits.
- **ESLint + Prettier** para consistencia de código.
- **`ts-node-dev`** para desarrollo con recarga.
- **`dotenv`** para configuración por variables de entorno.
- **`npm`** con scripts claros (`dev`, `build`, `start`, `lint`, `format`).

---

## 3. Responsabilidades

### 3.1. Desarrollo del MVP
- Construir el scaffold del proyecto TypeScript + Express + EJS + Bootstrap 5 con assets locales.
- Implementar **login funcional** con sesión, RBAC y mensajes seguros.
- Implementar el **listado de casos del asesor** con tarjetas, filtros, búsqueda y estado vacío.
- Implementar el **detalle de caso** con línea de tiempo.
- Implementar **home diferenciado por rol** (asesor y admin).
- Implementar **logout** y expiración de sesión.
- Proveer **datos mock** representativos (8–12 casos) y usuarios mock para validar los flujos.

### 3.2. Calidad del código
- Controladores delgados, servicios con reglas, vistas solo presentación.
- Funciones pequeñas y con responsabilidad única.
- Sin duplicación, sin números/strings mágicos, sin `catch` vacíos.
- Manejo centralizado de errores que no exponga información interna.
- Lint y formato aplicados antes de cada commit.
- Refactorización cuando algo crece; no acumular deuda al cierre del MVP.

### 3.3. Identidad visual
- Aplicar la paleta institucional mediante **variables CSS**: `#189FBA` (primario), `#74B033` (positivo), `#F5F6F7` (fondo), `#BBC400` (acento), con variantes accesibles.
- Integrar **`logo.png`** (institucional) y **`logolink.png`** (plataforma) con proporción y espacio de respeto.
- Cero CDN y cero fuentes externas: todos los recursos en `public/`.
- **Humanización**: la vista de casos no es una tabla fría; es una lectura clara de la situación del estudiante y de lo que requiere atención.

### 3.4. Preparación para Render
- Definir la interfaz `CasesRepository` (y futuras `UsersRepository`, `AuditRepository`) con métodos mínimos.
- Implementar `MockCasesRepository` inyectado en `server.ts`.
- Dejar `DATABASE_URL` como placeholder comentado en `.env.example`.
- Asegurar que el cambio a PostgreSQL no requiera modificar controladores ni vistas.

### 3.5. Repositorio y colaboración
- Ramas por funcionalidad: `feature/login`, `feature/cases-list`, `feature/cases-detail`, `chore/scaffold`, `docs/readme`.
- PRs pequeños hacia `main` con requisitos cubiertos y pasos para probar.
- Commits atómicos (máx. ~10 archivos, ~300 líneas netas), Conventional Commits.
- `.gitignore` desde el primer commit; **cero secretos** en el repositorio.
- `README.md` con stack, requisitos, variables de entorno, comandos y credenciales mock.

---

## 4. Convenciones de código

- **Idioma del dominio en español**: `casos`, `asesor`, `estudiante`, `seguimiento`.
- **Idioma de la infraestructura en inglés**: `controllers`, `services`, `routes`, `middlewares` — lo estándar para que el proyecto escale.
- **Estructura por módulo**: cada dominio en su carpeta (`auth/`, `cases/`), no por tipo de archivo suelto.
- **Inyección de dependencias simple**: los servicios reciben repositorios por constructor.
- **Sin lógica en las vistas EJS**: solo condicionales de presentación y bucles de render.
- **Variables de entorno** centralizadas en `src/config/env.ts` y validadas al arrancar.

---

## 5. Estándares de commits y ramas
feat(auth): implementar login con sesión y RBAC
fix(cases): corregir filtro por estado en el listado
refactor(cases): extraer repositorio mock a interfaz
chore(scaffold): configurar eslint y prettier
docs(readme): documentar credenciales mock y comandos

text

- Rama base `main` protegida; todo por PR.
- Cada PR declara: qué requisito cubre, cómo probarlo, qué se ve en pantalla.
- PRs de máximo ~400 líneas netas para que sean revisables.

---

## 6. Criterios de aceptación del MVP (los que Esteka debe cumplir)

1. La aplicación arranca con `npm install && npm run dev` y responde en `http://localhost:3000`.
2. Login con `asesor@enlace.edu.co / Asesor123*` redirige al home del asesor.
3. Login con credenciales inválidas muestra error genérico, sin revelar qué falló.
4. El asesor accede al listado de casos con tarjetas, filtros, búsqueda y estado vacío.
5. El detalle del caso muestra la línea de tiempo correctamente.
6. El rol ADMIN **no** accede a rutas del asesor (403 o redirección).
7. Logout vuelve al login y la sesión deja de ser válida.
8. Bootstrap, estilos, fuentes e iconos se sirven **localmente**, sin CDN.
9. Paleta institucional aplicada; sin hex hardcodeados en componentes.
10. Los logos se muestran con proporción correcta y espacio de respeto.
11. Contraste AA y navegación por teclado verificados en login y listado.
12. La capa de datos está desacoplada por interfaz y lista para Render.

---

## 7. Checklist de entrega por iteración

- [ ] Proyecto compila y arranca sin errores.
- [ ] Flujos del alcance funcionando de punta a punta con datos mock.
- [ ] Código limpio: nombres claros, funciones pequeñas, sin magic values.
- [ ] Lint y formato pasando.
- [ ] Sin secretos ni `node_modules` en el repositorio.
- [ ] Ramas y PRs revisables; commits en Conventional Commits.
- [ ] Assets servidos localmente; paleta institucional aplicada.
- [ ] Contraste y navegación por teclado verificados.
- [ ] `README.md` actualizado con comandos y credenciales mock.
- [ ] Interfaz de repositorio lista para sustituir el mock por PostgreSQL en Render.

---

## 8. Principios de trabajo

1. **Código que corre primero**: si no arranca en localhost, no está terminado.
2. **Simple antes que ingenioso**: la solución más simple que cumpla el requisito.
3. **Visual humano, no dashboard frío**: cada pantalla facilita la acción del asesor.
4. **Desacoplado para el futuro**: mock hoy, PostgreSQL en Render mañana, sin reescribir.
5. **Repositorio limpio**: PRs pequeños, commits claros, cero secretos.
6. **Accesibilidad por defecto**: contraste, teclado y semántica desde el primer componente.
7. **Sin sobre‑ingeniería**: no ORM, no Docker, no build de frontend; solo lo necesario para validar.

---

## 9. Criterios de éxito del rol

- El MVP visual funciona en localhost con los dos flujos completos (login y casos del asesor).
- La identidad institucional se percibe con claridad; la interfaz se siente cercana y no fría.
- El código es legible, está factorizado y puede crecer sin reescritura.
- El repositorio refleja buenas prácticas de Git y GitHub.
- La transición a Render no exige cambios en controladores ni vistas.