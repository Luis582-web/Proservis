/* PROSERVIS - Fase 3 | JavaScript básico y legible (< 200 líneas) */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  let siguienteFolio = 47;
  let filaDetalle = document.querySelector('#coord-orders-tbody tr');
  let filaTecnico = document.querySelector('#tech-orders-tbody tr');
  const BADGES = { Recibida: 'badge-amber', 'En espera de repuesto': 'badge-amber', 'En reparación': 'badge-blue', 'Lista para entrega': 'badge-green', Entregada: 'badge-green', Cancelada: 'badge-red', Activo: 'badge-green', Inactivo: 'badge-red' };
  const roles = {
    coordinator: ['Coordinadora de Taller', 'Laura Méndez', 'laura.mendez@proservis.local'],
    technician: ['Técnico Especialista', 'Carlos Ruiz', 'carlos.ruiz@proservis.local'],
    client: ['Cliente de Mostrador', 'María López', 'maria.lopez@correo.com'],
    admin: ['Administrador del Sistema', 'Andrés Salazar', 'admin@proservis.local']
  };
  const vistas = {
    'view-login': { t: 'Iniciar sesión en Proservis (1.0)', s: 'Acceso para personal del taller y consulta de clientes en mostrador.', m: '1.0 Iniciar sesión', a: '', r: '' },
    'view-coordinator': { t: 'Bandeja general de órdenes (2.2)', s: 'Supervisión de órdenes activas en taller, asignación y entregas en mostrador.', m: '2.2 Bandeja del Coordinador', a: 'action-go-new-order', r: 'coordinator' },
    'view-order-detail': { t: 'Detalle de orden (3.0)', s: 'Trazabilidad completa, reasignación técnica, entrega y cancelación.', m: '3.0 Detalle de orden', a: 'action-back-coordinator', r: 'coordinator' },
    'view-new-order': { t: 'Formulario de Recepción · Nueva orden (2.3)', s: 'Captura ágil en mostrador con los 6 campos esenciales (RNF-01).', m: '2.3 Recepción · Nueva orden', a: 'action-back-coordinator', r: 'coordinator' },
    'view-technician': { t: 'Cola de trabajo del Técnico (2.4)', s: 'Diagnóstico y registro de intervenciones técnicas (RF-06).', m: '2.4 Cola del Técnico', a: 'action-tech-switcher', r: 'technician' },
    'view-client': { t: 'Mis órdenes de servicio (2.1)', s: 'Cliente: María López · Consulta de estado en tiempo real (Solo lectura).', m: '2.1 Mis órdenes (Cliente)', a: 'action-client-readonly', r: 'client' },
    'view-admin': { t: 'Usuarios del personal del taller (2.5)', s: 'Administración de cuentas internas de Técnicos, Coordinadores y Administradores.', m: '2.5 Usuarios del personal', a: 'btn-open-staff-modal', r: 'admin' }
  };

  const setBadge = (el, est) => { el.className = `badge ${BADGES[est] || 'badge-neutral'}`; el.textContent = est; };
  const mostrarError = (id, msg) => { $(id).textContent = msg; $(id).classList.toggle('hidden', !msg); };
  const marcarFila = (tr) => { tr.parentElement.querySelectorAll('tr').forEach((r) => r.classList.remove('is-selected')); tr.classList.add('is-selected'); };
  const mostrarAviso = (txt) => {
    const p = Object.assign(document.createElement('p'), { className: 'toast', textContent: txt });
    $('toast-container').appendChild(p); setTimeout(() => p.remove(), 3000);
  };

  function actualizarContadores() {
    const coord = [...document.querySelectorAll('#coord-orders-tbody tr')];
    $('kpi-open').textContent = coord.filter((r) => !['Entregada', 'Cancelada'].includes(r.dataset.status)).length;
    $('kpi-unassigned').textContent = coord.filter((r) => r.dataset.status === 'Recibida' && r.dataset.tech === 'Sin asignar').length;
    $('kpi-repair').textContent = coord.filter((r) => r.dataset.status === 'En reparación').length;
    $('kpi-ready').textContent = coord.filter((r) => r.dataset.status === 'Lista para entrega').length;
    const tec = [...document.querySelectorAll('#tech-orders-tbody tr')].filter((r) => r.dataset.tech === $('tech-switcher').value);
    $('tech-kpi-assigned').textContent = tec.length;
    $('tech-kpi-repair').textContent = tec.filter((r) => r.dataset.status === 'En reparación').length;
    $('tech-kpi-parts').textContent = tec.filter((r) => r.dataset.status === 'En espera de repuesto').length;
  }

  // 1. Filtrar menú lateral según rol (RF-02) y menú móvil
  const cerrarMenuMovil = () => { $('sidebar').classList.remove('is-menu-open'); $('btn-mobile-menu').setAttribute('aria-expanded', 'false'); };
  $('btn-mobile-menu').addEventListener('click', () => $('btn-mobile-menu').setAttribute('aria-expanded', String($('sidebar').classList.toggle('is-menu-open'))));
  function cambiarRol(rol) {
    if (!roles[rol]) return;
    [$('active-user-role').textContent, $('active-user-name').textContent, $('active-user-email').textContent] = roles[rol];
    document.querySelectorAll('#menu-navegacion [data-role-nav]').forEach((el) => el.classList.toggle('hidden', el.dataset.roleNav !== rol));
  }

  // 2. Alternar vistas y actualizar único <h1> + enlaces activos
  function cambiarVista(vistaId) {
    const info = vistas[vistaId], esLogin = vistaId === 'view-login';
    $('app-shell').classList.toggle('app-shell--login', esLogin);
    $('page-header').classList.toggle('page-header--centered', esLogin);
    document.querySelectorAll('.view-section').forEach((s) => s.classList.toggle('hidden', s.id !== vistaId));
    if (info.r) cambiarRol(info.r);
    const resalte = vistaId === 'view-order-detail' ? 'view-coordinator' : vistaId;
    document.querySelectorAll('.demo-pill, .nav-link').forEach((b) => {
      const activo = b.dataset.targetView === resalte; b.classList.toggle('is-active', activo);
      activo ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current');
    });
    $('page-main-title').textContent = vistaId === 'view-order-detail' ? `Detalle de orden ${filaDetalle.dataset.folio} (3.0)` : info.t;
    $('page-main-subtitle').textContent = info.s; $('breadcrumb-current').textContent = info.m;
    ['action-go-new-order', 'action-back-coordinator', 'action-tech-switcher', 'action-client-readonly', 'btn-open-staff-modal'].forEach((id) => $(id).classList.toggle('hidden', info.a !== id));
    cerrarMenuMovil();
  }

  // 3. Filtros en Bandeja del Coordinador (2.2)
  function filtrarBandeja() {
    const q = $('filter-search').value.trim().toLowerCase(), est = $('filter-status').value, tec = $('filter-tech').value;
    document.querySelectorAll('#coord-orders-tbody tr').forEach((f) => f.classList.toggle('hidden', !((!q || f.textContent.toLowerCase().includes(q)) && (est === 'ALL' || f.dataset.status === est) && (tec === 'ALL' || f.dataset.tech === tec))));
  }
  ['filter-search', 'filter-status', 'filter-tech'].forEach((id) => $(id).addEventListener('input', filtrarBandeja));
  $('btn-clear-filters').addEventListener('click', () => { $('coord-filter-form').reset(); filtrarBandeja(); });

  // 4. Detalle de orden (3.0) y cancelación obligatoria (RF-08 / RNF-02)
  function toggleCancelBox(abrir) {
    $('cancel-confirm-box').classList.toggle('hidden', !abrir);
    $('btn-toggle-cancel').setAttribute('aria-expanded', String(abrir));
    if (abrir) $('cancel-reason-input').focus(); else mostrarError('cancel-reason-error', '');
  }
  function guardarCambioOrden(est, tec, msg) {
    filaDetalle.dataset.status = est; filaDetalle.dataset.tech = tec;
    setBadge(filaDetalle.cells[3].firstElementChild, est); filaDetalle.cells[4].textContent = tec; $('detail-tech').textContent = tec; setBadge($('detail-status-badge'), est);
    const li = Object.assign(document.createElement('li'), { className: 'timeline-item' });
    li.innerHTML = '<div class="timeline-item__header"><span class="timeline-item__author">Laura Méndez (Coordinadora)</span><time class="timeline-item__date">Ahora</time></div><p class="timeline-item__body"></p>';
    li.lastElementChild.textContent = msg; $('detail-timeline').prepend(li); actualizarContadores();
  }
  $('detail-manage-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const tec = $('detail-select-tech').value, est = $('detail-select-status').value, nota = $('detail-comment').value.trim();
    guardarCambioOrden(est, tec, nota || `Estado: "${est}" · Técnico: ${tec}.`);
    $('detail-comment').value = ''; mostrarAviso(`Cambios guardados en ${filaDetalle.dataset.folio}.`);
  });
  $('btn-mark-delivered').addEventListener('click', () => { guardarCambioOrden('Entregada', filaDetalle.dataset.tech, 'Equipo entregado en mostrador local.'); mostrarAviso(`Orden ${filaDetalle.dataset.folio} marcada como Entregada.`); });
  $('btn-toggle-cancel').addEventListener('click', () => toggleCancelBox($('cancel-confirm-box').classList.contains('hidden')));
  $('btn-abort-cancel').addEventListener('click', () => toggleCancelBox(false));
  $('btn-confirm-cancel').addEventListener('click', () => {
    const motivo = $('cancel-reason-input').value.trim();
    if (!motivo) { mostrarError('cancel-reason-error', 'Debe ingresar el motivo obligatorio (RF-08).'); return $('cancel-reason-input').focus(); }
    guardarCambioOrden('Cancelada', filaDetalle.dataset.tech, `ORDEN CANCELADA. Motivo: ${motivo}`);
    $('cancel-reason-input').value = ''; toggleCancelBox(false); mostrarAviso(`Orden ${filaDetalle.dataset.folio} cancelada.`);
  });

  // 5. Formularios: Login (1.0), Recepción (2.3), Técnico (2.4) y Modal Personal (2.5)
  $('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const m = $('login-email').value.trim().toLowerCase(), p = $('login-password').value.trim();
    if (!m || !p) return mostrarError('login-error', 'Ingrese correo y contraseña.');
    mostrarError('login-error', '');
    cambiarVista(m.includes('carlos') || m.includes('diego') ? 'view-technician' : m.includes('maria') ? 'view-client' : m.includes('admin') ? 'view-admin' : 'view-coordinator');
  });
  $('reception-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const [nom, tel, mail, tipo, marca, falla] = ['rec-client-name', 'rec-client-phone', 'rec-client-email', 'rec-device-type', 'rec-device-brand', 'rec-fault'].map((id) => $(id).value.trim());
    if (!nom || !tel || !mail || !tipo || !marca || !falla) return mostrarError('reception-error', 'Complete los 6 campos esenciales obligatorios.');
    mostrarError('reception-error', '');
    const folio = `PS-2610-${String(siguienteFolio++).padStart(4, '0')}`;
    $('next-folio-preview').textContent = `PS-2610-${String(siguienteFolio).padStart(4, '0')}`;
    const tr = document.createElement('tr');
    Object.assign(tr.dataset, { folio, client: nom, contact: `${tel} · ${mail}`, device: `${tipo} · ${marca}`, status: 'Recibida', tech: 'Sin asignar', date: 'Hoy', fault: falla });
    tr.innerHTML = `<th scope="row"><span class="folio-tag">${folio}</span></th><td><strong></strong><p class="cell-subtext"></p></td><td></td><td><span class="badge badge-amber">Recibida</span></td><td>Sin asignar</td><td>Hoy</td><td><button type="button" class="table-action-btn" data-open-detail aria-label="Ver detalle de la orden ${folio}">Ver orden <span aria-hidden="true">→</span></button></td>`;
    tr.querySelector('strong').textContent = nom; tr.querySelector('.cell-subtext').textContent = tel; tr.cells[2].textContent = `${tipo} · ${marca}`;
    $('coord-orders-tbody').prepend(tr); e.target.reset(); actualizarContadores(); cambiarVista('view-coordinator'); mostrarAviso(`Orden ${folio} registrada.`);
  });
  $('tech-switcher').addEventListener('change', (e) => {
    $('tech-session-name').textContent = e.target.value;
    document.querySelectorAll('#tech-orders-tbody tr').forEach((r) => r.classList.toggle('hidden', r.dataset.tech !== e.target.value));
    actualizarContadores();
  });
  $('tech-intervention-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const diag = $('tech-diagnosis').value.trim(), est = $('tech-status-select').value;
    if (!diag) return mostrarError('tech-error', 'Ingrese el diagnóstico y trabajo realizado.');
    mostrarError('tech-error', ''); filaTecnico.dataset.status = est; filaTecnico.dataset.diagnosis = diag;
    setBadge(filaTecnico.cells[3].firstElementChild, est); actualizarContadores(); mostrarAviso(`Intervención guardada en ${filaTecnico.dataset.folio}.`);
  });
  $('btn-open-staff-modal').addEventListener('click', () => { $('staff-modal-backdrop').classList.remove('hidden'); $('staff-name').focus(); });
  ['btn-close-staff-modal', 'btn-cancel-staff-modal'].forEach((id) => $(id).addEventListener('click', () => $('staff-modal-backdrop').classList.add('hidden')));
  $('staff-create-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const [nom, mail, rol] = ['staff-name', 'staff-email', 'staff-role'].map((id) => $(id).value.trim());
    if (!nom || !mail) return mostrarError('staff-modal-error', 'Complete nombre y correo.');
    mostrarError('staff-modal-error', '');
    const tr = document.createElement('tr');
    tr.innerHTML = '<th scope="row"></th><td></td><td><span class="badge badge-neutral"></span></td><td><span class="badge badge-green">Activo</span></td><td><button type="button" class="btn btn-danger-outline btn-sm" data-toggle-staff>Desactivar</button></td>';
    tr.cells[0].textContent = nom; tr.cells[1].textContent = mail; tr.querySelector('.badge-neutral').textContent = rol;
    tr.querySelector('[data-toggle-staff]').setAttribute('aria-label', `Desactivar cuenta de ${nom}`);
    $('admin-staff-tbody').appendChild(tr); e.target.reset(); $('staff-modal-backdrop').classList.add('hidden'); mostrarAviso(`Colaborador ${nom} registrado.`);
  });

  // 6. Delegación global de clics y atajo Escape
  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-target-view]');
    if (nav) return cambiarVista(nav.dataset.targetView);
    if (e.target.closest('[data-open-detail]')) {
      filaDetalle = e.target.closest('tr');
      ['folio', 'date', 'client', 'contact', 'device', 'tech', 'fault'].forEach((k) => { $(`detail-${k}`).textContent = filaDetalle.dataset[k]; });
      $('detail-select-tech').value = filaDetalle.dataset.tech;
      if (filaDetalle.dataset.status !== 'Cancelada') $('detail-select-status').value = filaDetalle.dataset.status;
      setBadge($('detail-status-badge'), filaDetalle.dataset.status); toggleCancelBox(false);
      return cambiarVista('view-order-detail');
    }
    if (e.target.closest('[data-select-tech]')) {
      filaTecnico = e.target.closest('tr'); marcarFila(filaTecnico);
      $('tech-selected-folio').textContent = filaTecnico.dataset.folio; $('tech-selected-device').textContent = filaTecnico.dataset.device;
      [['tech-status-select', 'status'], ['tech-diagnosis', 'diagnosis'], ['tech-part', 'part'], ['tech-time', 'minutes']].forEach(([id, k]) => { $(id).value = filaTecnico.dataset[k]; });
    } else if (e.target.closest('[data-select-client]')) {
      const f = e.target.closest('tr'), paso = Number(f.dataset.step); marcarFila(f);
      [['folio', 'client-active-folio'], ['device', 'client-active-device'], ['update', 'client-latest-update']].forEach(([k, id]) => { $(id).textContent = f.dataset[k]; });
      setBadge($('client-active-badge'), f.dataset.status);
      document.querySelectorAll('#client-stepper .step-item').forEach((s) => {
        const n = Number(s.dataset.step), current = n === paso && f.dataset.status !== 'Entregada';
        s.classList.toggle('is-completed', n < paso || f.dataset.status === 'Entregada');
        s.classList.toggle('is-current', current); current ? s.setAttribute('aria-current', 'step') : s.removeAttribute('aria-current');
      });
    } else if (e.target.closest('[data-toggle-staff]')) {
      const btn = e.target.closest('[data-toggle-staff]'), tr = btn.closest('tr'), badge = tr.cells[3].firstElementChild, on = badge.textContent === 'Inactivo';
      setBadge(badge, on ? 'Activo' : 'Inactivo');
      btn.className = `btn btn-sm ${on ? 'btn-danger-outline' : 'btn-secondary'}`; btn.textContent = on ? 'Desactivar' : 'Reactivar';
      btn.setAttribute('aria-label', `${btn.textContent} cuenta de ${tr.cells[0].textContent}`);
    }
  });
  $('forgot-password-link').addEventListener('click', (e) => { e.preventDefault(); mostrarAviso('Enlace de recuperación enviado.'); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { $('staff-modal-backdrop').classList.add('hidden'); toggleCancelBox(false); cerrarMenuMovil(); } });
});
