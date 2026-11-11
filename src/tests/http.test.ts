import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { createApp } from "../app";

test("login, casos, RBAC y cierre de sesión funcionan de extremo a extremo", async () => {
  const server = createApp().listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address() as AddressInfo;
  const base = `http://127.0.0.1:${address.port}`;

  async function request(
    path: string,
    options: { cookie?: string; form?: Record<string, string> } = {},
  ) {
    const headers: Record<string, string> = {};
    if (options.cookie) headers.cookie = options.cookie;
    if (options.form)
      headers["content-type"] = "application/x-www-form-urlencoded";
    const response = await fetch(`${base}${path}`, {
      method: options.form ? "POST" : "GET",
      headers,
      body: options.form ? new URLSearchParams(options.form) : undefined,
      redirect: "manual",
    });
    return {
      response,
      html: await response.text(),
      cookie: response.headers.get("set-cookie")?.split(";")[0],
    };
  }

  try {
    const unauthenticated = await request("/cases");
    assert.equal(unauthenticated.response.status, 302);
    assert.equal(unauthenticated.response.headers.get("location"), "/login");
    const invalid = await request("/login", {
      form: { email: "asesor@enlace.edu.co", password: "incorrecta" },
    });
    assert.equal(invalid.response.status, 401);
    assert.match(invalid.html, /No pudimos validar tus datos/);

    const advisor = await request("/login", {
      form: { email: "asesor@enlace.edu.co", password: "Asesor123*" },
    });
    assert.equal(advisor.response.status, 302);
    assert.match(advisor.response.headers.get("set-cookie") ?? "", /HttpOnly/i);
    assert.ok(advisor.cookie);
    const createForm = await request("/casos/nuevo", {
      cookie: advisor.cookie,
    });
    assert.equal(createForm.response.status, 200);
    assert.match(createForm.html, /Marcadores críticos/);
    const invalidCreate = await request("/casos", {
      cookie: advisor.cookie,
      form: {
        studentName: "Estudiante de prueba",
        email: "prueba@otro.edu.co",
        program: "Psicología",
        summary:
          "Descripción suficientemente detallada para registrar un caso.",
      },
    });
    assert.equal(invalidCreate.response.status, 422);
    assert.match(invalidCreate.html, /Estudiante de prueba/);
    assert.match(invalidCreate.html, /Selecciona al menos un marcador válido/);
    const validCase = {
      studentName: "Estudiante de prueba",
      email: "prueba@campusucc.edu.co",
      program: "Psicología",
      summary: "Descripción suficientemente detallada para registrar un caso.",
      markers: "AUSENTISMO",
    };
    const created = await request("/casos", {
      cookie: advisor.cookie,
      form: validCase,
    });
    assert.equal(created.response.status, 302);
    assert.equal(created.response.headers.get("location"), "/casos");
    const newList = await request("/casos", { cookie: advisor.cookie });
    assert.match(newList.html, /El caso se registró correctamente/);
    assert.match(newList.html, /Estudiante de prueba/);
    const newId = newList.html.match(/CASO-\d{4}-\d{4}/)?.[0];
    assert.ok(newId);
    const newDetail = await request(`/casos/${newId}`, {
      cookie: advisor.cookie,
    });
    assert.match(newDetail.html, /Ausentismo crónico o intermitente/);
    const duplicate = await request("/casos", {
      cookie: advisor.cookie,
      form: validCase,
    });
    assert.equal(duplicate.response.status, 422);
    assert.match(duplicate.html, /Ya existe un caso con este correo/);
    const cases = await request(
      "/cases?estado=NUEVO&programa=Ingenier%C3%ADa%20de%20Sistemas",
      {
        cookie: advisor.cookie,
      },
    );
    assert.equal(cases.response.status, 200);
    assert.match(cases.html, /EN-2026-002/);
    assert.doesNotMatch(cases.html, /EN-2026-005/);
    const empty = await request("/cases?buscar=sin-coincidencias", {
      cookie: advisor.cookie,
    });
    assert.match(empty.html, /No encontramos casos con esos filtros/);
    const detail = await request("/cases/EN-2026-001", {
      cookie: advisor.cookie,
    });
    assert.equal(detail.response.status, 200);
    assert.ok(
      detail.html.indexOf("Caso creado") <
        detail.html.indexOf("Contacto inicial"),
    );
    const asset = await request("/css/bootstrap.min.css");
    assert.equal(asset.response.status, 200);

    const logout = await request("/logout", {
      cookie: advisor.cookie,
      form: {},
    });
    assert.equal(logout.response.status, 302);
    const afterLogout = await request("/home", { cookie: advisor.cookie });
    assert.equal(afterLogout.response.status, 302);

    const admin = await request("/login", {
      form: { email: "admin@enlace.edu.co", password: "Admin123*" },
    });
    assert.equal(admin.response.status, 302);
    assert.ok(admin.cookie);
    const adminHome = await request("/home", { cookie: admin.cookie });
    assert.equal(adminHome.response.status, 200);
    assert.match(adminHome.html, /Usuarios disponibles/);
    const forbidden = await request("/cases", { cookie: admin.cookie });
    assert.equal(forbidden.response.status, 403);
    assert.equal(
      (await request("/casos/nuevo", { cookie: admin.cookie })).response.status,
      403,
    );
    assert.equal(
      (await request("/casos", { cookie: admin.cookie, form: validCase }))
        .response.status,
      403,
    );
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
