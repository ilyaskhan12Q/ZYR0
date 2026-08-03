// ---------------------------------------------------------------------------
// ZYRO premium internship certificate — single source of truth for the
// certificate HTML. Used both by the on-screen preview (rendered inside a
// scaled iframe via srcDoc) and by the "Print / Save as PDF" flow
// (window.open + document.write).
// ---------------------------------------------------------------------------

export const CERT_WIDTH = 1120;
export const CERT_HEIGHT = 792;

export interface CertificateTemplateOptions {
  recipientName: string;
  internshipTitle: string;
  companyName: string;
  dates: string;
  credentialId: string;
  issueDateStr: string;
  skills: string[];
  supervisorName: string;
  qrSrc: string;
  logoSrc: string;
  crestSrc: string;
  isoSrc: string;
  oLogoSrc: string;
  /** Optional real QCA/partner logo. Falls back to the generated badge when empty. */
  qcaSrc?: string | null;
  fontCss?: string | null;
}

// ── SVG assets (generated as strings, injected into the print window) ──────

/** Concentric wavy guilloché rings forming the large central "O" watermark. */
function wavyRingPath(cx: number, cy: number, r: number, wobbles: number, amplitude: number, phase: number): string {
  const N = 140;
  let d = '';
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * 2 * Math.PI;
    const rr = r + amplitude * Math.sin(wobbles * t + phase);
    const x = cx + rr * Math.cos(t);
    const y = cy + rr * Math.sin(t);
    d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
  }
  return d;
}

function guillocheSvg(): string {
  let rings = '';
  for (let r = 72; r <= 232; r += 20) {
    const purple = r % 40 === 0;
    const color = purple ? '#cdc2ea' : '#d6d2c6';
    const width = r === 192 ? 3.2 : 1.7;
    const dash = r === 192 ? '' : `stroke-dasharray="${r % 60 === 0 ? '14 10' : '2.5 5.5'}"`;
    rings += `<path d="${wavyRingPath(320, 240, r, 5, 7, r * 0.23)}" fill="none" stroke="${color}" stroke-width="${width}" ${dash}/>`;
  }
  return `
<svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block">
  <g opacity="0.55">${rings}</g>
</svg>`;
}

/** Fine engraved damask/filigree corner ornament (placed in the 4 corners). */
function filigreeSvg(): string {
  return `
<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#b89c56" stroke-width="1">
    <path d="M2 8 A6 6 0 0 1 8 2"/>
    <path d="M2 17 A15 15 0 0 1 17 2"/>
    <path d="M2 27 A25 25 0 0 1 27 2"/>
    <path d="M2 38 A36 36 0 0 1 38 2"/>
    <path d="M2 96 A94 94 0 0 1 96 2"/>
    <path d="M2 110 A108 108 0 0 1 110 2"/>
    <path d="M2 124 A122 122 0 0 1 124 2"/>
    <path d="M2 137 A135 135 0 0 1 137 2"/>
    <path d="M 20 20 L 140 140" stroke-width="0.8" opacity="0.55"/>
    <path d="M 44 14 L 14 44" stroke-width="0.8" opacity="0.55"/>
    <path d="M 76 14 L 14 76" stroke-width="0.8" opacity="0.55"/>
    <path d="M 96 96 C 104 88 112 82 120 84 C 128 86 130 94 124 99 C 119 103 111 101 112 95"/>
  </g>
  <g fill="#b89c56">
    <circle cx="141" cy="141" r="2"/>
    <circle cx="2" cy="17" r="1.8"/>
    <circle cx="17" cy="2" r="1.8"/>
    <circle cx="2" cy="137" r="1.8"/>
    <circle cx="137" cy="2" r="1.8"/>
  </g>
</svg>`;
}

/** Soft mottled clouds — low-frequency noise for cotton-paper feel. */
function mottleSvg(): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <filter id="m"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  <rect width="320" height="320" filter="url(#m)" opacity="0.5"/>
</svg>`;
}

/** Fine streaky cotton fibers. */
function fiberSvg(): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.22" numOctaves="2" seed="11" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  <rect width="320" height="320" filter="url(#f)" opacity="0.35"/>
</svg>`;
}

/** Subtle paper grain (feTurbulence noise tile). */
function noiseSvg(): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
  <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  <rect width="160" height="160" filter="url(#n)" opacity="0.05"/>
</svg>`;
}

/** QCA (UK) badge fallback — used only until a real partner logo is supplied. */
function qcaSvg(): string {
  return `
<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" style="width:42px;height:42px;display:block">
  <defs>
    <linearGradient id="qca-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1f9d6b"/>
      <stop offset="1" stop-color="#2b6cb0"/>
    </linearGradient>
  </defs>
  <rect x="3" y="3" width="90" height="90" rx="22" fill="url(#qca-grad)"/>
  <rect x="3" y="3" width="90" height="90" rx="22" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
  <text x="48" y="50" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="bold" fill="#ffffff">QCA</text>
  <text x="48" y="70" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="bold" fill="#ffffff">UK</text>
</svg>`;
}

// ── Main document builder ──────────────────────────────────────────────────

export function buildCertificateHTML(opts: CertificateTemplateOptions): string {
  const {
    recipientName,
    internshipTitle,
    companyName,
    dates,
    credentialId,
    issueDateStr,
    supervisorName,
    qrSrc,
    isoSrc,
    oLogoSrc,
    qcaSrc,
    fontCss,
  } = opts;

  const noiseDataUri = `url("data:image/svg+xml,${encodeURIComponent(noiseSvg())}")`;
  const mottleDataUri = `url("data:image/svg+xml,${encodeURIComponent(mottleSvg())}")`;
  const fiberDataUri = `url("data:image/svg+xml,${encodeURIComponent(fiberSvg())}")`;

  const css = `
    * { box-sizing: border-box; }
    @page { size: A4 landscape; margin: 0; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: 'Montserrat', sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: #f1ece0;
    }

    .cert-page {
      width: ${CERT_WIDTH}px;
      height: ${CERT_HEIGHT}px;
      margin: 0 auto;
      position: relative;
      overflow: hidden;
    }

    /* ── Cream cotton-paper texture (fine grain + soft mottle + fibers) ── */
    .paper {
      position: absolute;
      inset: 0;
      background:
        ${noiseDataUri},
        ${mottleDataUri},
        ${fiberDataUri},
        radial-gradient(ellipse at 50% 36%, #fffdf5 0%, #f7f0dd 68%, #efe5ca 100%);
      border: 9px double #b89c56;
      outline: 1px solid #b89c56;
      outline-offset: -13px;
    }
    /* Thin inner rule — sits just inside the double border */
    .inner-frame {
      position: absolute;
      inset: 9px;
      border: 1px solid rgba(184, 156, 86, .8);
      pointer-events: none;
    }

    /* ── Filigree corner ornaments ────────────────────────────────────── */
    .filigree { position: absolute; width: 118px; height: 118px; opacity: .9; pointer-events: none; }
    .filigree svg { width: 100%; height: 100%; display: block; }
    .fig-tl { top: 17px; left: 17px; }
    .fig-tr { top: 17px; right: 17px; transform: scaleX(-1); }
    .fig-bl { bottom: 17px; left: 17px; transform: scaleY(-1); }
    .fig-br { bottom: 17px; right: 17px; transform: scale(-1); }

    /* ── Layer B: guilloché "O" watermark + soft purple glow ──────────── */
    .glow {
      position: absolute;
      left: 50%;
      top: 46%;
      width: 720px;
      height: 560px;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle, rgba(140,115,255,.13) 0%, rgba(140,115,255,.05) 45%, transparent 70%);
      pointer-events: none;
    }
    .guilloche {
      position: absolute;
      left: 50%;
      top: 47%;
      width: 650px;
      height: 490px;
      transform: translate(-50%, -50%);
      opacity: .6;
      pointer-events: none;
    }

    /* ── Official ZYRO logo watermark ────────────────────────────────── */
    .zyro-wm {
      position: absolute;
      left: 50%;
      top: 46%;
      width: 330px;
      height: 330px;
      transform: translate(-50%, -50%);
      opacity: .1;
      pointer-events: none;
      user-select: none;
    }

    .inner {
      position: relative;
      z-index: 2;
      height: 100%;
      padding: 30px 88px 24px;
      display: flex;
      flex-direction: column;
    }

    /* ── Header row: Govt crest | award sub-header | ZYRO brand ──────── */
    .top-row { display: grid; grid-template-columns: 1fr 1.5fr 1fr; align-items: start; }
    .gov { display: flex; align-items: flex-end; }
    .logos-top { display: flex; gap: 14px; align-items: center; margin-top: 12px; }
    .logo-top { height: 64px; width: auto; display: block; object-fit: contain; }
    .award-sub {
      text-align: center;
      color: #1e40af;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-top: 26px;
    }
    .zyro-brand { text-align: right; }
    .brand-main { font-size: 34px; font-weight: 800; color: #1e3a8a; letter-spacing: 2.5px; line-height: 1; }
    .brand-main .brand-o { height: 36px; width: auto; display: inline-block; vertical-align: -5px; }
    .brand-sub { font-size: 10.5px; font-weight: 700; color: #333; letter-spacing: 2px; margin-top: 2px; text-transform: uppercase; }
    .brand-sub b { color: #a1262a; font-weight: 800; }

    /* ── Title block ─────────────────────────────────────────────────── */
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-top: 45px;
      min-height: 0;
    }
    .title-wrap { display: flex; align-items: center; justify-content: center; gap: 18px; }
    .title-line { flex: 0 0 92px; height: 2px; background: linear-gradient(90deg, transparent, #b89c56); }
    .title-line.r { transform: scaleX(-1); }
    .title {
      font-family: 'Cinzel', serif;
      font-size: 26px;
      font-weight: 700;
      color: #191512;
      letter-spacing: 1.8px;
      text-align: center;
      margin: 0;
      white-space: nowrap;
    }
    .presented {
      text-align: center;
      font-size: 13px;
      font-weight: 600;
      color: #4a4a4a;
      letter-spacing: 3.2px;
      margin: 10px 0 0;
      text-transform: uppercase;
    }

    /* ── Recipient name (gold underline) ──────────────────────────────── */
    .name-pill { margin: 16px auto 0; display: flex; justify-content: center; }
    .name-pill-inner { padding: 2px 8px 4px; }
    .name-text {
      font-family: 'Cinzel', serif;
      font-weight: 700;
      font-size: 28px;
      color: #191512;
      letter-spacing: 1.6px;
      padding: 0 18px 8px;
      border-bottom: 2.5px solid #b89c56;
      display: inline-block;
    }

    /* ── Body copy ───────────────────────────────────────────────────── */
    .body-text {
      margin: 13px auto 0;
      max-width: 830px;
      text-align: center;
      font-family: 'Playfair Display', serif;
      font-size: 15px;
      line-height: 1.72;
      color: #26221e;
    }
    .body-text p { margin: 0 0 7px; }
    .body-text b { font-weight: 700; color: #13100d; }
    .body-text .internship-title { font-weight: 900; font-size: 17px; color: #13100d; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; text-decoration-color: #b89c56; }
    .body-text .company-name { font-weight: 900; font-size: 17px; color: #13100d; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; text-decoration-color: #b89c56; }
    .body-text .cert-dates { font-weight: 900; font-size: 17px; color: #13100d; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; text-decoration-color: #b89c56; }

    .footer-left {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 9px;
    }
    .meta-row {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 3px;
      font-size: 10px;
      font-weight: 600;
      color: #333;
      letter-spacing: .5px;
      white-space: nowrap;
    }
    .meta-row b { color: #111; font-weight: 700; }

    /* ── Footer: signatures | seal + QR ───────────────────────────────── */
    .footer-row {
      margin-top: 14px;
      padding-top: 16px;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: end;
      gap: 28px;
    }
    .sig-block { display: flex; flex-direction: column; align-items: center; text-align: center; }
    .sig-block.sig-dir { transform: translate(14px, -20px); }
    .sig-script { font-family: 'Playfair Display', serif; font-style: italic; font-size: 26px; color: #1a1a1a; line-height: 1; margin-bottom: 6px; display: inline-block; padding-bottom: 6px; border-bottom: 1.5px solid #666; }
    .sig-name { font-size: 13px; font-weight: 600; color: #333; margin-top: 7px; letter-spacing: .3px; }
    .sig-title { font-size: 9.5px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
    .sig-company { font-size: 11px; font-weight: 700; color: #333; letter-spacing: .5px; margin-top: 3px; }
    .sig-meta { margin-top: 8px; font-size: 8.5px; font-weight: 600; color: #555; letter-spacing: .4px; line-height: 1.55; }
    .sig-meta b { color: #111; font-weight: 700; }
    .center-col { display: flex; flex-direction: column; align-items: center; }
    .seal-qr { display: flex; align-items: flex-end; gap: 16px; }
    .seal-col { display: flex; flex-direction: column; align-items: center; }
    .seal-gold {
      width: 80px;
      height: 80px;
      background: radial-gradient(circle, #f59e0b 0%, #d97706 100%);
      border-radius: 50%;
      border: 4px dashed #fff;
      box-shadow: 0 0 0 4px #d97706, 0 4px 10px rgba(0,0,0,.15);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .badge-text { font-family: 'Cinzel', serif; font-size: 10px; font-weight: 700; margin-top: 7px; color: #b89c56; letter-spacing: 1.5px; }
    .qr { display: flex; flex-direction: column; align-items: center; gap: 5px; }
    .qr-img { width: 70px; height: 70px; padding: 3px; background: #fff; border: 1px solid #d8d2c2; }
    .qr-label { font-size: 8.5px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: #4a4a4a; }

    @media print {
      body { width: 297mm; height: 210mm; }
      .cert-page { width: 297mm; height: 210mm; }
      .footer-row, .skills, .title-wrap { break-inside: avoid; page-break-inside: avoid; }
    }
  `;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Certificate - ${recipientName}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Montserrat:wght@300;400;600;800&family=Playfair+Display:ital,wght@1,600&display=swap" />
    <style>
      ${fontCss ?? ''}
      ${css}
    </style>
  </head>
  <body>
    <div class="cert-page">
      <div class="paper">
        <div class="inner-frame"></div>
        <div class="filigree fig-tl">${filigreeSvg()}</div>
        <div class="filigree fig-tr">${filigreeSvg()}</div>
        <div class="filigree fig-bl">${filigreeSvg()}</div>
        <div class="filigree fig-br">${filigreeSvg()}</div>
        <div class="glow"></div>
        <div class="guilloche">${guillocheSvg()}</div>
        <img class="zyro-wm" src="${opts.logoSrc}" alt="" />

        <div class="inner">
          <div class="top-row">
            <div class="gov">
              <div class="logos-top">
                <img class="logo-top" src="${isoSrc}" alt="ISO 9001:2015" />
                ${qcaSrc ? `<img class="logo-top" src="${qcaSrc}" alt="QCA UK" />` : qcaSvg()}
                <img class="logo-top" src="${oLogoSrc}" alt="ZYRO Platform" />
              </div>
            </div>
            <div class="award-sub">ZYRO Awarding this certificate of achievement</div>
            <div class="zyro-brand">
              <div class="brand-main">ZYR<img class="brand-o" src="${oLogoSrc}" alt="" /></div>
              <div class="brand-sub">Internship Platform</div>
            </div>
          </div>

          <div class="main">
            <div class="title-wrap">
            <div class="title-line"></div>
            <h1 class="title">CERTIFICATE OF INTERNSHIP COMPLETION</h1>
            <div class="title-line r"></div>
          </div>

          <div class="presented">This certificate is proudly presented to</div>

          <div class="name-pill">
            <div class="name-pill-inner">
              <span class="name-text">${recipientName}</span>
            </div>
          </div>

          <div class="body-text">
            <p>For successfully completing a <b class="internship-title">${internshipTitle}</b> at ZYRO through the ZYRO Platform from <b class="cert-dates">${dates}</b>, demonstrating exceptional proficiency, dedication, and technical skill in executing all professional responsibilities.</p>
            <p>The candidate has collaborated with <b class="company-name">${companyName}</b> through the ZYRO Platform.</p>
            <p>Congratulations on your achievement and continued interest in the vital subject of software engineering.</p>
            <p>Keep up the great work in developing innovative and efficient digital tools.</p>
            <p>Your contribution throughout the internship at ZYRO has been truly valuable and inspiring.</p>
          </div>
          </div>

          <div class="footer-row">
            <div class="sig-block">
              <div class="sig-script">${supervisorName}</div>
              <div class="sig-name">${supervisorName}</div>
              <div class="sig-title">Program Coordinator</div>
              <div class="sig-company">${companyName}</div>
              <div class="sig-meta">Certificate ID: <b>${credentialId}</b><br />Issue Date: <b>${issueDateStr}</b></div>
            </div>
            <div class="center-col">
              <div class="seal-qr">
                <div class="seal-col">
                  <div class="seal-gold">
                    <svg style="width:34px;height:34px;fill:none;stroke:currentColor;stroke-width:2.2" viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="M9 11l2 2 4-4"/>
                    </svg>
                  </div>
                  <div class="badge-text">VERIFIED SECURE</div>
                </div>
                <div class="qr">
                  <img class="qr-img" src="${qrSrc}" alt="Verification QR" width="70" height="70" />
                  <span class="qr-label">Scan to Verify</span>
                </div>
              </div>
            </div>
            <div class="sig-block sig-dir">
              <div class="sig-script">ilyas khan</div>
              <div class="sig-name">ZYRO Director</div>
              <div class="sig-title">ZYRO Platforms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
