export function stripMarkdownFences(text=''){return String(text).replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();}
export function compact(text=''){return String(text||'').replace(/\s+/g,' ').trim();}

export function joinPromptParts(parts = [], separator = ', ') {
  return (Array.isArray(parts) ? parts : [parts])
    .filter(Boolean)
    .map(x => String(x).trim())
    .filter(Boolean)
    .join(separator)
    .replace(/\s+/g, ' ')
    .trim();
}

