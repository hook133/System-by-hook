const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');
const config = require('../config.json');

const FONT_PATH = config.suggestions?.fontPath || '';
if (FONT_PATH) {
  try {
    const absoluteFontPath = path.resolve(FONT_PATH);
    GlobalFonts.registerFromPath(absoluteFontPath, 'CustomFont');
    console.log('[fonts] Registered custom font from:', absoluteFontPath);
  } catch (e) {
    console.warn('[fonts] Could not register FONT_PATH:', e?.message || e);
  }
}

function applyRoundedImage(ctx, img, x, y, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, x, y, radius * 2, radius * 2);
  ctx.restore();
}

function wrapText(ctx, text, maxWidth, initialY, lineHeight) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';

  for (const w of words) {
    const test = current ? current + ' ' + w : w;
    const metrics = ctx.measureText(test);
    if (metrics.width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);

  let y = initialY;
  return { lines, yEnd: y + (lines.length - 1) * lineHeight };
}

async function renderSuggestionCard({
  username,
  avatarUrl,
  suggestion,
  backgroundUrl = '',
  width = 1000,
  height = 400,
}) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  if (backgroundUrl) {
    try {
      const bg = await loadImage(backgroundUrl);
      const scale = Math.max(width / bg.width, height / bg.height);
      const bw = bg.width * scale;
      const bh = bg.height * scale;
      const bx = (width - bw) / 2;
      const by = (height - bh) / 2;
      ctx.drawImage(bg, bx, by, bw, bh);
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(0,0,0,0.35)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } catch (_) {
      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, '#0f172a');
      g.addColorStop(1, '#1e293b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, '#0f172a');
    g.addColorStop(1, '#1e293b');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }

  const pad = 32;
  const panelRadius = 24;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;

  const panelX = pad;
  const panelY = pad;
  const panelW = width - pad * 2;
  const panelH = height - pad * 2;

  ctx.beginPath();
  const r = panelRadius;
  ctx.moveTo(panelX + r, panelY);
  ctx.arcTo(panelX + panelW, panelY, panelX + panelW, panelY + panelH, r);
  ctx.arcTo(panelX + panelW, panelY + panelH, panelX, panelY + panelH, r);
  ctx.arcTo(panelX, panelY + panelH, panelX, panelY, r);
  ctx.arcTo(panelX, panelY, panelX + panelW, panelY, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  let avatar; 
  try {
    avatar = await loadImage(avatarUrl);
  } catch (_) {
    avatar = null;
  }
  const avatarSize = 120;
  const avatarX = panelX + pad;
  const avatarY = panelY + pad;
  if (avatar) applyRoundedImage(ctx, avatar, avatarX, avatarY, avatarSize / 2);

  ctx.textBaseline = 'top';
  ctx.direction = 'rtl'; 

  const titleFontFamily = FONT_PATH ? 'CustomFont' : 'sans-serif';
  const textFontFamily = FONT_PATH ? 'CustomFont' : 'sans-serif';

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 36px ${titleFontFamily}`;
  ctx.textAlign = 'left';
  ctx.fillText(username, avatarX + avatarSize + 20, avatarY + 8);

  ctx.font = `500 24px ${textFontFamily}`;
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('اقتراح جديد', avatarX + avatarSize + 20, avatarY + 48);

  const boxX = panelX + pad;
  const boxY = avatarY + avatarSize + 20;
  const boxW = panelW - pad * 2;
  const boxH = panelH - (boxY - panelY) - pad;

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.moveTo(boxX + 16, boxY);
  ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + boxH, 16);
  ctx.arcTo(boxX + boxW, boxY + boxH, boxX, boxY + boxH, 16);
  ctx.arcTo(boxX, boxY + boxH, boxX, boxY, 16);
  ctx.arcTo(boxX, boxY, boxX + boxW, boxY, 16);
  ctx.closePath();
  ctx.fill();

  const textPad = 24;
  const maxTextWidth = boxW - textPad * 2;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#f8fafc';
  ctx.font = `28px ${textFontFamily}`;

  const startX = boxX + boxW - textPad; 
  const startY = boxY + textPad;
  const lineHeight = 36;
  const { lines } = wrapText(ctx, suggestion, maxTextWidth, startY, lineHeight);

  let y = startY;
  for (const line of lines) {
    ctx.fillText(line, startX, y);
    y += lineHeight;
    if (y > boxY + boxH - textPad) break; 
  }

  return await canvas.encode('png');
}

module.exports = { renderSuggestionCard };
