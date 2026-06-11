import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ProntuarioPDF from '../components/Modal/ProntuarioPDF';

export async function downloadProntuarioPDF(prontuario) {
  const tema = 'light';
  const bgColor = '#ffffff';

  // Overlay que cobre a tela enquanto o PDF renderiza (esconde do usuário)
  const cover = document.createElement('div');
  cover.style.cssText = `position:fixed;inset:0;background:${bgColor};z-index:100000;pointer-events:none;`;
  document.body.appendChild(cover);

  // Contêiner do PDF — fica abaixo do cover, invisível para o usuário
  const container = document.createElement('div');
  container.style.cssText =
    'position:fixed;top:0;left:0;width:794px;pointer-events:none;z-index:99999;';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(createElement(ProntuarioPDF, { prontuario, tema }));

  // Dois frames de animação garantem que o React terminou o commit + estilos aplicados
  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 400)));
  });

  try {
    const pdfEl = container.querySelector('.pront-pdf');
    if (!pdfEl) throw new Error('Elemento .pront-pdf não encontrado após render.');

    const canvas = await html2canvas(pdfEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      // sem scroll offset — o elemento está no topo-esquerdo
      scrollX: 0,
      scrollY: 0,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const PAGE_W = 210;  // mm
    const PAGE_H = 297;  // mm
    const imgH = (canvas.height * PAGE_W) / canvas.width;

    if (imgH <= PAGE_H) {
      // Cabe em uma página
      pdf.addImage(imgData, 'PNG', 0, 0, PAGE_W, imgH);
    } else {
      // Divide em páginas A4
      const slicePx = Math.floor((PAGE_H * canvas.width) / PAGE_W);
      let yOffset = 0;
      let first = true;

      while (yOffset < canvas.height) {
        const h = Math.min(slicePx, canvas.height - yOffset);
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = h;
        const ctx = slice.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, -yOffset);

        if (!first) pdf.addPage();
        first = false;
        pdf.addImage(slice.toDataURL('image/png'), 'PNG', 0, 0, PAGE_W, (h * PAGE_W) / canvas.width);
        yOffset += slicePx;
      }
    }

    const nome = (prontuario.pacienteNome || 'paciente').replace(/\s+/g, '_');
    const data = prontuario.dataRegistro
      ? new Date(prontuario.dataRegistro).toISOString().slice(0, 10)
      : '';
    pdf.save(`prontuario_${nome}_${data}.pdf`);
  } finally {
    root.unmount();
    document.body.removeChild(container);
    document.body.removeChild(cover);
  }
}
