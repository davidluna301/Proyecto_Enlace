# PROMPT — Desarrollo MVP Visual Plataforma ENLACE UCC

Eres un **desarrollador web profesional** con dominio de TypeScript, Express y Bootstrap, buenas prácticas de código limpio y gestión rigurosa de repositorios en GitHub. Trabajas bajo la supervisión de **David Alejandro Luna**. Tu tarea es construir, con **código real y funcional**, el primer MVP visual de la plataforma ENLACE, listo para correr en `localhost`.

---

## 1. Misión del MVP

Entregar una aplicación web que permita **validar el aspecto visual y un nivel funcional básico** de la plataforma ENLACE, mediante dos flujos completos:

1. **Inicio de sesión** con credenciales y control de acceso por rol.
2. **Vista de casos de estudiantes** accesible para el rol **Asesor** (profesor enlace), con listado y detalle humanizados.

No es un prototipo ni una maqueta: es una aplicación que arranca, autentica y muestra casos reales desde datos mock, lista para conectar a base de datos en una siguiente iteración.

---

## 2. Stack técnico (obligatorio, sin excepciones)

- **Node.js 20 LTS + TypeScript**
- **Express** con renderizado del lado del servidor
- **EJS** como motor de plantillas
- **Bootstrap 5** servido **localmente** (nada de CDN)
- **express-session** para manejo de sesión
- **bcrypt** para hash de contraseñas

**Prohibido en este MVP:**
- **Prisma** o cualquier ORM.
- **Docker** o cualquier contenedor.
- React, Vue, Angular ni build de frontend.
- CDN, servicios cloud en runtime, telemetría externa.
- Bases de datos conectadas (se implementa capa de datos mock, ver Sección 6).

---

## 3. Alcance funcional

### 3.1. Inicio de sesión
- Formulario de login con email y contraseña.
- Validación de credenciales contra usuarios **mock** precargados.
- Mensaje de error genérico ante credenciales inválidas (no revelar si falló email o contraseña).
- Sesión con cookie `HttpOnly`, expiración por inactividad y cierre manual.
- Redirección al dashboard correspondiente según el rol autenticado.
- Rutas protegidas: sin sesión activa, cualquier ruta privada redirige al login.
- **Usuarios mock mínimos:**
  - `asesor@enlace.edu.co` / `Asesor123*` → rol **ASESOR**
  - `admin@enlace.edu.co` / `Admin123*` → rol **ADMIN** (para validar RBAC)

### 3.2. Vista de casos de estudiantes (rol Asesor)
- **Listado de casos** accesible solo para el rol ASESOR:
  - **Tarjetas de caso** (no tabla fría) con: identificador, nombre del estudiante, programa, estado, indicador de urgencia, fecha del último movimiento.
  - Indicador de urgencia con **texto + ícono + color** (nunca solo color).
  - **Filtros** por estado y programa, y **búsqueda** por nombre/identificador.
  - **Estado vacío** orientador cuando no hay resultados o no hay casos.
- **Detalle del caso** al hacer clic:
  - Cabecera con datos del estudiante y estado del caso.
  - **Línea de tiempo** de eventos (creación, cambios registrados) en orden cronológico.
  - Acciones visuales de "volver al listado" y marcador de siguiente paso (sin implementar acción aún).
- **Datos mock**: entre 8 y 12 casos de ejemplo representativos, con distintos estados, programas y urgencias, servidos desde un archivo TypeScript (`src/data/cases.mock.ts`).

### 3.3. Home por rol
- Pantalla posterior al login que contextualice el rol.
- Para ASESOR: acceso directo a la vista de casos.
- Para ADMIN: mensaje de MVP en construcción y acceso al listado de usuarios mock (opcional, mínimo).

---

## 4. Arquitectura propuesta
enlace-mvp1/
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
├── src/
│ ├── server.ts
│ ├── config/
│ │ └── env.ts
│ ├── middlewares/
│ │ ├── auth.ts # requireAuth
│ │ ├── rbac.ts # requireRole('ASESOR')
│ │ └── errors.ts # manejo centralizado
│ ├── modules/
│ │ ├── auth/
│ │ │ ├── auth.controller.ts
│ │ │ ├── auth.routes.ts
│ │ │ └── auth.service.ts
│ │ └── cases/
│ │ ├── cases.controller.ts
│ │ ├── cases.routes.ts
│ │ └── cases.service.ts
│ ├── data/
│ │ ├── users.mock.ts
│ │ └── cases.mock.ts
│ ├── views/
│ │ ├── layouts/main.ejs
│ │ ├── auth/login.ejs
│ │ ├── home/asesor.ejs
│ │ ├── home/admin.ejs
│ │ ├── cases/list.ejs
│ │ └── cases/detail.ejs
│ └── public/
│ ├── css/styles.css
│ ├── css/bootstrap.min.css # copiado local
│ ├── js/bootstrap.bundle.min.js
│ └── img/
│ ├── logo.png
│ └── logolink.png

text

**Regla arquitectónica:** controladores delgados (validan y delegan), servicios con reglas y datos, vistas solo presentación. Sin lógica de negocio en `.ejs` ni en controladores.

---

## 5. Aspecto visual (obligatorio)

### 5.1. Paleta institucional
Definir como **variables CSS** en `styles.css` y usar en todo el proyecto (prohibido hardcodear hex en componentes):

```css
:root {
  --color-primary: #189FBA;    /* navegación, botones primarios, enlaces */
  --color-secondary: #74B033;  /* estados positivos, avance */
  --color-surface: #F5F6F7;    /* fondo general */
  --color-accent: #BBC400;     /* badges, acentos, urgencia media */
  --color-text: #1F2933;
  --color-danger: #C0392B;     /* urgencia alta */
}
Reglas:

#189FBA = color de acción principal.

#74B033 = estados positivos y confirmaciones; no como color de acción genérico.

#F5F6F7 = fondo; el contenido va sobre superficies blancas.

#BBC400 = acento y categorización; nunca como texto corrido.

Garantizar contraste WCAG AA (4.5:1 texto, 3:1 componentes); derivar variantes oscuras si hace falta.

5.2. Logos
logo.png en login y en la barra superior del layout (logo institucional).

logolink.png junto o dentro de la barra de navegación como logo de la plataforma.

Mantener proporción original, sin deformar, con espacio de respeto.

Tamaño mínimo 32 px de alto en navegación, 96 px en login.

5.3. Humanización de los casos (crítico)
Esta es la diferencia con un dashboard frío:

Tarjetas de caso con jerarquía visual clara: nombre del estudiante primero, estado y urgencia en un chip visible, último movimiento al pie.

Línea de tiempo en el detalle: cada evento con fecha, tipo y breve descripción.

Urgencia siempre con texto + ícono + color (Alta, Media, Baja); no depender del color.

Estados vacíos con mensaje útil y acción sugerida.

Español (Colombia), lenguaje claro, sin jerga técnica.

5.4. Bootstrap
Copiar los archivos minificados de Bootstrap 5 a public/ y servirlos desde Express.

Usar utilidades de Bootstrap, pero personalizar con las variables CSS propias para respetar la identidad institucional.

Cero CDN, cero fuentes externas; si se usan iconos, servirlos desde public/.

6. Persistencia (Render, sin conectar aún)
La base de datos productiva vivirá en Render (PostgreSQL) en una siguiente iteración.

En este MVP no se conecta: implementar la capa de datos como interfaces + repositorios mock para que la sustitución futura sea limpia:

typescript
// src/modules/cases/cases.service.ts
export interface CasesRepository {
  list(filter?: CaseFilter): Promise<Case[]>;
  getById(id: string): Promise<Case | null>;
}

export class CasesService {
  constructor(private repo: CasesRepository) {}
  // ...
}
Inyectar MockCasesRepository en server.ts. Cuando se conecte Render, solo se reemplaza la implementación por PostgresCasesRepository sin tocar controladores ni vistas.

Dejar en .env.example el placeholders DATABASE_URL (comentado) para la futura conexión a Render.

