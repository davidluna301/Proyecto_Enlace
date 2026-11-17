import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { createApp } from "../app";

function pdfTextHex(pdf: string): string {
  return Array.from(pdf.matchAll(/\[([^\]]*)\]\s*TJ/g), ([, run]) =>
    Array.from(run.matchAll(/<([0-9a-f]+)>/gi), ([, text]) => text).join(""),
  )
    .join("\n")
    .toLowerCase();
}

test("login, casos, RBAC y cierre de sesión funcionan de extremo a extremo", async () => {
  const auditDirectory = await mkdtemp(
    path.join(tmpdir(), "enlace-audit-test-"),
  );
  const server = createApp({ auditDirectory }).listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address() as AddressInfo;
  const base = `http://127.0.0.1:${address.port}`;

  async function request(
    path: string,
    options: {
      cookie?: string;
      form?: Record<string, string>;
      json?: Record<string, unknown>;
    } = {},
  ) {
    const headers: Record<string, string> = {};
    if (options.cookie) headers.cookie = options.cookie;
    if (options.form)
      headers["content-type"] = "application/x-www-form-urlencoded";
    if (options.json) headers["content-type"] = "application/json";
    const response = await fetch(`${base}${path}`, {
      method: options.form || options.json ? "POST" : "GET",
      headers,
      body: options.form
        ? new URLSearchParams(options.form)
        : options.json
          ? JSON.stringify(options.json)
          : undefined,
      redirect: "manual",
    });
    const body = Buffer.from(await response.arrayBuffer());
    return {
      response,
      html: body.toString(
        response.headers.get("content-type")?.includes("application/pdf")
          ? "latin1"
          : "utf8",
      ),
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

    const legacy = await request("/login", {
      form: { email: "asesor@enlace.edu.co", password: "Asesor123*" },
    });
    assert.equal(legacy.response.status, 302);

    const advisor = await request("/login", {
      form: { email: "asesor@ucc.edu.co", password: "Asesor123*" },
    });
    assert.equal(advisor.response.status, 302);
    assert.match(advisor.response.headers.get("set-cookie") ?? "", /HttpOnly/i);
    assert.ok(advisor.cookie);
    const createForm = await request("/casos/nuevo", {
      cookie: advisor.cookie,
    });
    assert.equal(createForm.response.status, 200);
    assert.match(createForm.html, /Marcadores críticos/);
    assert.match(createForm.html, /aria-expanded="false"/);
    assert.match(createForm.html, /id="markers-panel" hidden/);
    assert.match(createForm.html, /aria-current="page"/);
    assert.match(createForm.html, /href="\/reportes\/nuevo"/);
    assert.match(createForm.html, /Generar reporte/);
    assert.doesNotMatch(
      createForm.html,
      /href="\/reportes\/nuevo" aria-current="page"/,
    );
    assert.match(createForm.html, /Navegación principal/);
    const reportEntry = await request("/reportes/nuevo", {
      cookie: advisor.cookie,
    });
    assert.equal(reportEntry.response.status, 200);
    assert.match(reportEntry.html, /Selecciona un caso/);
    assert.match(
      reportEntry.html,
      /data-section-id="DATOS_ESTUDIANTE" checked/,
    );
    assert.match(reportEntry.html, /data-section-id="LINEA_TIEMPO" checked/);
    assert.match(reportEntry.html, /Desmarcar todas/);
    assert.match(reportEntry.html, /empty-selection-warning/);
    assert.match(
      reportEntry.html,
      /href="\/reportes\/nuevo" aria-current="page"/,
    );
    assert.doesNotMatch(
      reportEntry.html,
      /href="\/casos\/nuevo" aria-current="page"/,
    );
    const reportSearch = await request("/reportes/casos?q=EN-2026-001", {
      cookie: advisor.cookie,
    });
    assert.equal(reportSearch.response.status, 200);
    const reportResults = JSON.parse(reportSearch.html) as {
      items: { id: string }[];
      total: number;
    };
    assert.equal(reportResults.total, 1);
    assert.equal(reportResults.items[0].id, "EN-2026-001");
    const reportCase = await request("/reportes/casos/EN-2026-001", {
      cookie: advisor.cookie,
    });
    assert.equal(reportCase.response.status, 200);
    const reportCaseBody = JSON.parse(reportCase.html) as {
      id: string;
      events: { type: string }[];
      advisorId?: string;
    };
    assert.equal(reportCaseBody.id, "EN-2026-001");
    assert.ok(reportCaseBody.events.length);
    assert.equal(reportCaseBody.advisorId, undefined);
    assert.equal(
      (await request("/reportes/casos/no-existe", { cookie: advisor.cookie }))
        .response.status,
      404,
    );
    assert.match(reportEntry.html, /id="preview-sections"/);
    assert.match(reportEntry.html, /logolink\.png/);
    assert.match(reportEntry.html, /Confirmar generación de reporte/);
    assert.match(reportEntry.html, /role="dialog" aria-modal="true"/);
    assert.match(reportEntry.html, /He revisado la información/);
    assert.match(reportEntry.html, /id="confirm-download"[^>]+disabled/);
    const unconfirmedReport = await request("/reportes/EN-2026-001/pdf", {
      cookie: advisor.cookie,
      json: {
        confirmado: false,
        secciones: ["DATOS_ESTUDIANTE"],
      },
    });
    assert.equal(unconfirmedReport.response.status, 400);
    const invalidReport = await request("/reportes/EN-2026-001/pdf", {
      cookie: advisor.cookie,
      json: {
        confirmado: true,
        secciones: ["METADATOS_INTERNOS"],
      },
    });
    assert.equal(invalidReport.response.status, 400);
    const generatedReport = await request("/reportes/EN-2026-001/pdf", {
      cookie: advisor.cookie,
      json: {
        confirmado: true,
        secciones: ["ESTADO_URGENCIA"],
      },
    });
    assert.equal(generatedReport.response.status, 200);
    assert.match(
      generatedReport.response.headers.get("content-type") ?? "",
      /application\/pdf/,
    );
    assert.match(
      generatedReport.response.headers.get("content-disposition") ?? "",
      /reporte-EN-2026-001-\d{8}\.pdf/,
    );
    assert.match(generatedReport.html, /^%PDF-/);
    const reportTextHex = pdfTextHex(generatedReport.html);
    assert.ok(
      reportTextHex.includes(
        Buffer.from("Estado y urgencia", "latin1").toString("hex"),
      ),
    );
    assert.ok(
      !reportTextHex.includes(
        Buffer.from("Descripción del caso", "latin1").toString("hex"),
      ),
    );
    const reportAudit = await readFile(
      path.join(auditDirectory, "auditoria.jsonl"),
      "utf8",
    );
    const reportEntryAudit = JSON.parse(
      reportAudit.trim().split("\n").at(-1) ?? "{}",
    ) as {
      action: string;
      actorId: string;
      caseId: string;
      metadata: { sections: string[] };
      timestamp: string;
    };
    assert.equal(reportEntryAudit.action, "REPORTE_GENERADO");
    assert.equal(reportEntryAudit.actorId, "usr-asesor-01");
    assert.equal(reportEntryAudit.caseId, "EN-2026-001");
    assert.deepEqual(reportEntryAudit.metadata.sections, ["ESTADO_URGENCIA"]);
    assert.ok(!Number.isNaN(Date.parse(reportEntryAudit.timestamp)));
    assert.doesNotMatch(reportAudit, /La estudiante solicita orientación/);
    assert.equal((await request("/reportes/casos")).response.status, 302);
    assert.doesNotMatch(createForm.html, /src="\/img\/logo\.png"/);
    const invalidCreate = await request("/casos", {
      cookie: advisor.cookie,
      form: {
        studentName: "Estudiante de prueba",
        email: "prueba@otro.edu.co",
        program: "Psicología",
        summary:
          "Descripción suficientemente detallada para registrar un caso.",
        includeMarkers: "on",
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
      includeMarkers: "on",
      markers: "AUSENTISMO",
      observacionesAsesor: "Se acordó una conversación de seguimiento.",
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
    const audit = await readFile(
      path.join(auditDirectory, "auditoria.jsonl"),
      "utf8",
    );
    const entry = audit
      .trim()
      .split("\n")
      .map(
        (line) =>
          JSON.parse(line) as {
            action: string;
            actorId: string;
            caseId: string;
            timestamp: string;
          },
      )
      .find((record) => record.action === "CASO_CREADO");
    assert.ok(entry);
    assert.equal(entry.action, "CASO_CREADO");
    assert.equal(entry.actorId, "usr-asesor-01");
    assert.equal(entry.caseId, newId);
    assert.ok(!Number.isNaN(Date.parse(entry.timestamp)));
    assert.doesNotMatch(audit, /prueba@campusucc|AUSENTISMO/);
    const newDetail = await request(`/casos/${newId}`, {
      cookie: advisor.cookie,
    });
    assert.match(newDetail.html, /Ausentismo crónico o intermitente/);
    assert.match(newDetail.html, /Se acordó una conversación de seguimiento/);
    const data = await request("/casos/data?estado=REGISTRADO&q=Estudiante", {
      cookie: advisor.cookie,
    });
    assert.equal(data.response.status, 200);
    const dataBody = JSON.parse(data.html) as {
      items: { id: string }[];
      total: number;
    };
    assert.equal(dataBody.total, 1);
    assert.equal(dataBody.items[0].id, newId);
    assert.equal((await request("/casos/data")).response.status, 302);
    const duplicate = await request("/casos", {
      cookie: advisor.cookie,
      form: validCase,
    });
    assert.equal(duplicate.response.status, 422);
    assert.match(duplicate.html, /Ya existe un caso con este correo/);
    const noInstitutionalEmailCase = await request("/casos", {
      cookie: advisor.cookie,
      form: {
        studentName: "Estudiante sin correo",
        email: "",
        sinCorreoInstitucional: "on",
        contactEmail: "contacto@example.com",
        program: "Psicología",
        summary: "Descripción del caso sin correo institucional.",
      },
    });
    assert.equal(noInstitutionalEmailCase.response.status, 302);
    const listWithoutEmail = await request("/casos", {
      cookie: advisor.cookie,
    });
    assert.match(listWithoutEmail.html, /Sin correo institucional/);
    assert.match(listWithoutEmail.html, /Sin marcadores registrados/);
    const noEmailId = listWithoutEmail.html.match(/CASO-\d{4}-\d{4}/g)?.[0];
    assert.ok(noEmailId);
    const noEmailDetail = await request(`/casos/${noEmailId}`, {
      cookie: advisor.cookie,
    });
    assert.match(noEmailDetail.html, /Sin correo institucional/);
    assert.match(noEmailDetail.html, /contacto@example.com/);
    assert.match(noEmailDetail.html, /Sin marcadores registrados/);
    assert.doesNotMatch(noEmailDetail.html, /Observaciones del asesor/);
    const auditAfterNoEmail = await readFile(
      path.join(auditDirectory, "auditoria.jsonl"),
      "utf8",
    );
    assert.match(auditAfterNoEmail, /"tieneCorreoInstitucional":false/);
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
    assert.match(adminHome.html, /href="\/home#usuarios"/);
    assert.doesNotMatch(adminHome.html, /href="\/casos\/nuevo"/);
    assert.doesNotMatch(adminHome.html, /src="\/img\/logo\.png"/);
    assert.equal(
      (await request("/reportes/nuevo", { cookie: admin.cookie })).response
        .status,
      403,
    );
    assert.equal(
      (
        await request("/reportes/EN-2026-001/pdf", {
          cookie: admin.cookie,
          json: {
            confirmado: true,
            secciones: ["DATOS_ESTUDIANTE"],
          },
        })
      ).response.status,
      403,
    );
    const forbidden = await request("/cases", { cookie: admin.cookie });
    assert.equal(forbidden.response.status, 403);
    assert.equal(
      (await request("/casos/data", { cookie: admin.cookie })).response.status,
      403,
    );
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
    await rm(auditDirectory, { recursive: true, force: true });
  }
});
