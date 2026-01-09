export function parseCSV(content: string, delimiter: string = ";"): any[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return [];

  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ""));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    // Simple split doesn't handle quoted values with delimiters inside. 
    // But for this specific case, if we assume standard CSV:
    // We'll use a regex to match values.
    
    // Fallback to simple split for now as a robust regex parser is complex 
    // and the prompt implies a standard CSV export.
    // If we needed robust parsing, we'd use a library.
    // Let's try a slightly better regex split.
    
    const values: string[] = [];
    let match;
    // Regex to match semicolon-delimited values, handling quotes
    const regex = /(?:^|;)(?:"([^"]*)"|([^;]*))/g;
    
    let line = currentLine;
    // This simple regex approach can be buggy. 
    // Let's stick to a simple split if complex parsing isn't strictly required, 
    // OR implement a state machine parser which is safer.
    
    // State machine parser for single line
    let value = '';
    let insideQuotes = false;
    
    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      
      if (char === '"') {
        if (insideQuotes && line[charIndex + 1] === '"') {
          value += '"'; // Escaped quote
          charIndex++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        values.push(value.trim());
        value = '';
      } else {
        value += char;
      }
    }
    values.push(value.trim());

    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
  }

  return data;
}

export function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;
  
  // Try parsing DD/MM/YYYY
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    // Check if first part is year or day
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    } else {
      // DD-MM-YYYY
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  
  // Fallback to Date parse
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  
  return null;
}
