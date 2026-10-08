const XML_ESCAPE = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

function escapeXml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => XML_ESCAPE[char]);
}

function wrapText(text, maxChars = 40) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    // If a single word is longer than maxChars, we should probably force split it, but keeping it simple for now
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function replacePlaceholders(svg, data) {
  if (!data.name || !data.occasion) {
    throw new Error("Missing required placeholders: 'name' and 'occasion' are required.");
  }

  // Find unsupported placeholders in data
  const allowed = ['name', 'occasion', 'date', 'message'];
  const dataKeys = Object.keys(data).filter(k => data[k] !== undefined && data[k] !== null && data[k] !== '');
  
  // We can just iterate the SVG for all {{...}}
  const regex = /\{\{\s*([^}]+?)\s*\}\}/g;
  let match;
  const foundInSvg = new Set();
  while ((match = regex.exec(svg)) !== null) {
    foundInSvg.add(match[1].trim());
  }

  for (const p of foundInSvg) {
    if (!allowed.includes(p)) {
      throw new Error(`Unsupported placeholder found in SVG: {{${p}}}`);
    }
  }

  const values = {
    name: escapeXml(data.name),
    occasion: escapeXml(data.occasion),
    date: escapeXml(data.date || ''),
    message: escapeXml(data.message || ''),
  };

  let result = svg;

  // For message, we might need to wrap it into tspans. 
  // Let's use a regex to find the <text> tag containing {{message}} to extract its 'x' attribute
  const msgRegex = /<text([^>]*)x="([^"]+)"([^>]*)>\{\{\s*message\s*\}\}<\/text>/;
  const msgMatch = result.match(msgRegex);
  
  if (msgMatch && values.message) {
    const textTagStart = `<text${msgMatch[1]}x="${msgMatch[2]}"${msgMatch[3]}>`;
    const xAttr = msgMatch[2];
    
    // wrap the text
    const lines = wrapText(values.message, 40);
    const tspanContent = lines.map((line, index) => {
      if (index === 0) return line;
      return `<tspan x="${xAttr}" dy="1.2em">${line}</tspan>`;
    }).join('');
    
    result = result.replace(msgMatch[0], `${textTagStart}${tspanContent}</text>`);
  } else {
    // Fallback if the regex didn't match perfectly, just replace it inline
    // It might overflow but it's safe
    result = result.replace(/\{\{\s*message\s*\}\}/g, values.message);
  }

  // Do the same for name just in case it is very long? Or just inline it
  result = result.replace(/\{\{\s*name\s*\}\}/g, values.name);
  result = result.replace(/\{\{\s*occasion\s*\}\}/g, values.occasion);
  result = result.replace(/\{\{\s*date\s*\}\}/g, values.date);

  return result;
}

module.exports = {
  escapeXml,
  wrapText,
  replacePlaceholders,
};
