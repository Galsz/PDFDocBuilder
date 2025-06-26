
const express   = require('express');
const puppeteer = require('puppeteer');
const path      = require('path');

const PORT = 8095;                       
const HOST = '0.0.0.0';                 
const app  = express();

app.use(express.json({ limit: '10mb' }));

app.use('/relatorio', express.static(path.join(__dirname, 'public')));

app.post('/gerar-pdf', async (req, res) => {
  const { licencaId, orcamentoId, config } = req.body;

  if (!licencaId || !orcamentoId || !config) {
    return res.status(400).json({ error: 'Parâmetros ausentes.' });
  }

  try {
    const cfg  = encodeURIComponent(JSON.stringify(config));
    const url  = `http://localhost:${PORT}/relatorio/index.html?licencaId=${licencaId}&orcamentoId=${orcamentoId}&config=${cfg}`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction('window.readyForPDF === true', { timeout: 10000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ORCAMENTO-${orcamentoId}.pdf"`
    });
    res.send(pdfBuffer);

  } catch (err) {
    console.error('Erro ao gerar PDF:', err);
    res.status(500).json({ error: 'Erro ao gerar o PDF.' });
  }
});


app.listen(PORT, HOST, () => {
  console.log(`Servidor PDF rodando em http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
});
