const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'public', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace sidebar block
const sidebarStartRegex = /\.sidebar\s*\{[\s\S]*?\.sidebar-logout\s*\{[\s\S]*?border-top:[^;]+;\s*\}/;

const newSidebarCss = `.sidebar {
  --bs-offcanvas-width: 260px;
  width: 260px;
  background: var(--color-white);
  border-right: 1px solid var(--color-border);
  display: flex !important;
  flex-direction: column !important;
  height: 100vh !important;
  max-height: 100vh !important;
  overflow: hidden !important;
}

.sidebar-header {
  flex-shrink: 0;
  min-height: 85px;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-header img,
.mobile-header img {
  display: block;
  width: auto;
  max-width: 150px;
  height: 45px;
  object-fit: contain;
}

.sidebar-body {
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 1rem 0 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  scrollbar-width: thin;
  scrollbar-color: rgba(24, 159, 186, 0.4) transparent;
}

.sidebar-body::-webkit-scrollbar {
  width: 6px;
}

.sidebar-body::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-body::-webkit-scrollbar-thumb {
  background: rgba(24, 159, 186, 0.35);
  border-radius: 10px;
}

.sidebar-body::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}

.sidebar-role {
  margin: 0 1.5rem 0.5rem;
  color: var(--color-muted);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.sidebar-links {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-grow: 1;
}

.sidebar-link {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1.5rem;
  color: var(--color-text);
  background: transparent;
  border: 0;
  border-left: 4px solid transparent;
  font-weight: 650;
  text-align: left;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.sidebar-link:hover {
  color: var(--color-primary-dark);
  background: var(--color-primary-soft);
  border-left-color: var(--color-primary);
  transform: translateX(4px);
}

.sidebar-link.active {
  color: var(--color-primary-dark);
  background: var(--color-primary-soft);
  border-left-color: var(--color-primary-dark);
  font-weight: 750;
}

.sidebar-logout {
  margin-top: auto;
  padding: 1rem 0 0.5rem;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}`;

css = css.replace(sidebarStartRegex, newSidebarCss);

// Replace media query
const mediaQueryRegex = /@media\s*\(min-width:\s*992px\)\s*\{\s*\.sidebar\.offcanvas-lg\s*\{[\s\S]*?margin-left:\s*250px;\s*\}\s*\}/;
const newMediaQuery = `@media (min-width: 992px) {
  .sidebar.offcanvas-lg {
    position: fixed;
    inset: 0 auto 0 0;
    height: 100vh;
    max-height: 100vh;
    visibility: visible;
    transform: none;
    z-index: 1020;
  }

  .sidebar .sidebar-header {
    display: flex;
  }

  .authenticated-content,
  .authenticated-footer {
    margin-left: 260px;
  }
}`;

css = css.replace(mediaQueryRegex, newMediaQuery);

// Append modern styles for Login Card, New Case form, Cases List and Reports
const extraStyles = `
/* ════════════════════════════════════════════════════════════════════════════
   MODERN STYLES: LOGIN, NUEVO CASO, CASOS Y REPORTES ENLACE UCC
   ════════════════════════════════════════════════════════════════════════════ */

/* ── Login Card Elevated ── */
.login-card--elevated {
  background: rgba(255, 255, 255, 0.96) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1.5px solid rgba(24, 159, 186, 0.22) !important;
  border-radius: 26px !important;
  box-shadow: 0 24px 60px rgba(14, 101, 119, 0.16), 0 4px 12px rgba(0, 0, 0, 0.04) !important;
  padding: 2.5rem !important;
  position: relative;
  overflow: hidden;
  animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.login-card--elevated::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #0e6577, #189fba, #74b033);
}

.login-card-top-badge {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.badge-institutional {
  font-size: 0.75rem;
  font-weight: 750;
  color: var(--color-primary-dark);
  background: var(--color-primary-soft);
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  border: 1px solid rgba(24, 159, 186, 0.25);
}

.badge-secure {
  font-size: 0.72rem;
  font-weight: 700;
  color: #15803d;
  background: #dcfce7;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  border: 1px solid #bbf7d0;
}

.login-header-group {
  margin-bottom: 1.5rem;
}

.login-subtitle {
  color: var(--color-muted);
  font-size: 0.92rem;
  line-height: 1.5;
  margin-top: 0.35rem;
}

.form-input-styled {
  border: 1.5px solid var(--color-border) !important;
  border-radius: 12px !important;
  padding: 0.75rem 1rem !important;
  font-size: 0.95rem !important;
  transition: all 0.2s ease !important;
  background-color: #fafbfc !important;
}

.form-input-styled:focus {
  background-color: #ffffff !important;
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 4px rgba(24, 159, 186, 0.16) !important;
}

.form-hint {
  font-size: 0.76rem;
  color: var(--color-muted);
  margin-top: 0.35rem;
  display: block;
}

.btn-toggle-password {
  background: none;
  border: none;
  color: var(--color-primary-dark);
  font-weight: 650;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  transition: background 0.15s;
}

.btn-toggle-password:hover {
  background: var(--color-primary-soft);
}

.demo-accounts-pillbox {
  background: #f8fafc;
  border: 1px dashed var(--color-border);
  border-radius: 14px;
  padding: 0.85rem 1rem;
}

.demo-pillbox-label {
  font-size: 0.76rem;
  font-weight: 750;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: block;
  margin-bottom: 0.5rem;
}

.demo-buttons-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-demo-pill {
  background: #ffffff;
  border: 1.5px solid var(--color-border);
  color: var(--color-text);
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.btn-demo-pill:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-login-submit {
  border-radius: 14px !important;
  padding: 0.85rem 1.5rem !important;
  font-size: 1.02rem !important;
  font-weight: 750 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.6rem !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.btn-login-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(24, 159, 186, 0.35);
}

.login-footer-links {
  text-align: center;
  margin-top: 1.25rem;
}

.link-back-portal {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-primary-dark);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  transition: background 0.15s;
}

.link-back-portal:hover {
  background: var(--color-primary-soft);
  text-decoration: none;
}

.pulse-focus {
  animation: pulseButton 0.4s ease-in-out;
}

@keyframes pulseButton {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

/* ── Página de Nuevo Caso & Detalle ── */
.case-elevated-card {
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 22px;
  padding: clamp(1.75rem, 4vw, 3rem);
  box-shadow: 0 14px 40px rgba(22, 57, 67, 0.07);
}

.case-hero-header {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
}

.case-section-box {
  background: #fafbfc;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.75rem;
}

.case-section-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-primary-dark);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
}

.step-num-pill {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #fff;
  font-size: 0.8rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Botón de Dictado por Voz (Micrófono) */
.voice-mic-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.voice-mic-btn {
  background: #ffffff;
  border: 1.5px solid var(--color-border);
  color: var(--color-text);
  border-radius: 30px;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.voice-mic-btn:hover {
  border-color: #ef4444;
  color: #b91c1c;
  background: #fef2f2;
}

.voice-mic-btn.listening {
  background: #fef2f2;
  border-color: #ef4444;
  color: #dc2626;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25);
  animation: pulseListening 1.5s infinite;
}

@keyframes pulseListening {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.voice-status-indicator {
  font-size: 0.78rem;
  font-weight: 650;
  color: #dc2626;
  display: none;
}

.voice-status-indicator.active {
  display: inline;
}

/* ── Mejoras en Listado de Casos ── */
.case-card {
  border: 1px solid var(--color-border) !important;
  border-radius: 18px !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  position: relative;
  overflow: hidden;
}

.case-card:hover {
  transform: translateY(-3px) !important;
  box-shadow: 0 14px 32px rgba(15, 76, 92, 0.1) !important;
  border-color: var(--color-primary) !important;
}

.case-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.case-card:hover::before {
  opacity: 1;
}

/* ── Wizard de Generar Reporte ── */
.report-steps {
  display: flex !important;
  gap: 0.85rem !important;
  padding: 0 !important;
  list-style: none !important;
  margin-bottom: 2rem !important;
}

.report-steps li {
  flex: 1 !important;
  background: #ffffff !important;
  border: 1.5px solid var(--color-border) !important;
  border-radius: 14px !important;
  padding: 0.85rem 1rem !important;
  font-size: 0.88rem !important;
  font-weight: 700 !important;
  color: var(--color-muted) !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.6rem !important;
  transition: all 0.2s ease !important;
}

.report-steps li.is-current {
  background: var(--color-primary-soft) !important;
  border-color: var(--color-primary) !important;
  color: var(--color-primary-dark) !important;
  box-shadow: 0 4px 14px rgba(24, 159, 186, 0.15) !important;
}

.report-steps li span {
  width: 26px !important;
  height: 26px !important;
  border-radius: 50% !important;
  background: #e2e8f0 !important;
  color: var(--color-text) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 0.8rem !important;
}

.report-steps li.is-current span {
  background: var(--color-primary) !important;
  color: #ffffff !important;
}
`;

css += extraStyles;

fs.writeFileSync(cssPath, css, 'utf8');
console.log('CSS patched successfully!');
