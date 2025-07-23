const express = require("express");
const puppeteer = require("puppeteer-core");
const path = require("path");

const PORT = 8095;
const HOST = "0.0.0.0";
const app = express();

app.use(express.json({ limit: "10mb" }));
app.use("/relatorio", express.static(path.join(__dirname, "public")));

app.post("/gerar-pdf", async (req, res) => {
  const { licencaId, orcamentoId, config } = req.body;

  if (!licencaId || !orcamentoId || !config) {
    return res.status(400).json({ error: "Parâmetros ausentes." });
  }

  const browserOptions = {
    headless: true,
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };

  let browser;
  try {
    browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();

    const cfg = encodeURIComponent(JSON.stringify(config));
    const url = `http://127.0.0.1:${PORT}/relatorio/index.html?licencaId=${licencaId}&orcamentoId=${orcamentoId}&config=${cfg}`;

    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    await page.emulateMediaType("screen");
    await page.waitForFunction("window.readyForPDF === true", {
      timeout: 15000,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      scale: 1,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ORCAMENTO-${orcamentoId}.pdf"`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    res.status(500).json({ error: "Erro ao gerar o PDF." });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (err) {
        console.warn("Erro ao fechar o navegador:", err);
      }
    }
  }
});

app.listen(PORT, HOST, () => {
  console.log(`PDF service rodando em http://localhost:${PORT}`);
});
