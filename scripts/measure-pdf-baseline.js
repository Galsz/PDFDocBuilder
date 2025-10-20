const baselinePort = 40000 + Math.floor(Math.random() * 10000);
process.env.PORT = String(baselinePort);
process.env.HOST = "127.0.0.1";
process.env.NODE_ENV = process.env.NODE_ENV || "baseline";
process.env.LOG_LEVEL = process.env.LOG_LEVEL || "warn";
process.env.PREWARM_ENABLED = "false";
process.env.ENABLE_PAGE_POOL = "false";

const { performance } = require("perf_hooks");
const http = require("http");

const PDFServer = require("../server");

async function run() {
  const server = new PDFServer();
  await server.start();
  const port = server.getPort();
  let metrics = null;

  const payload = {
    licencaId: "baseline-licenca",
    orcamentoId: "baseline-orcamento",
    templateId: "default",
    reportType: "orcamento",
    config: {
      imprimirLogoEmTodas: true,
      imprimirParcelas: true,
      imprimirPromissorias: false,
      imprimirVariaveis: true,
      imprimirValorUnitario: true,
      imprimirMedidas: true
    }
  };

  const options = {
    hostname: "127.0.0.1",
    port,
    path: "/gerar-pdf",
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  };

  const start = performance.now();

  try {
    const result = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        const chunks = [];
        res.on("data", (chunk) => {
          chunks.push(chunk);
        });
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve({ res, buffer });
        });
      });
      req.on("error", reject);
      req.write(JSON.stringify(payload));
      req.end();
    });

    const duration = performance.now() - start;
    const sizeBytes = result.buffer.length;
    metrics = {
      status: result.res.statusCode,
      durationMs: Number(duration.toFixed(2)),
      sizeBytes,
      sizeKB: Number((sizeBytes / 1024).toFixed(2)),
      contentType: result.res.headers["content-type"],
      templateHeader: result.res.headers["x-template-id"],
      reportHeader: result.res.headers["x-report-type"],
      contentDisposition: result.res.headers["content-disposition"]
    };

    console.log(JSON.stringify(metrics, null, 2));
  } finally {
    await server.stop();
  }
  return metrics;
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
