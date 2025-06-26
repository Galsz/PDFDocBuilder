const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));

app.use('/relatorio', express.static(path.join(__dirname, 'public')));

app.post('/gerar-pdf', async (req, res) => {
  const { licencaId, orcamentoId, config } = req.body;

  if (!licencaId || !orcamentoId || !config) {
    return res.status(400).json({ error: 'Parâmetros ausentes.' });
  }

  try {
    const configStr = encodeURIComponent(JSON.stringify(config));
    const url = `http://localhost:3000/relatorio/index.html?licencaId=${licencaId}&orcamentoId=${orcamentoId}&config=${configStr}`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction('window.readyForPDF === true', { timeout: 10000 });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ORCAMENTO-${orcamentoId}.pdf"`
    });

    res.send(pdf);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: 'Erro ao gerar o PDF.' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
