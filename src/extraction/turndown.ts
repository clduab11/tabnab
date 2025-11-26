import TurndownService from 'turndown';

/**
 * Create a configured Turndown instance for HTML to Markdown conversion
 */
export function createTurndownService(): TurndownService {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    fence: '```',
    emDelimiter: '_',
    strongDelimiter: '**',
    linkStyle: 'inlined',
    linkReferenceStyle: 'full',
  });

  // Remove script tags
  turndown.remove('script');
  turndown.remove('style');
  turndown.remove('noscript');

  // Custom rule for images - include alt text and src
  turndown.addRule('images', {
    filter: 'img',
    replacement: (_content, node) => {
      const element = node as HTMLImageElement;
      const alt = element.getAttribute('alt') ?? '';
      const src = element.getAttribute('src') ?? '';
      const title = element.getAttribute('title') ?? '';

      if (!src) return '';

      // Skip tracking pixels and icons
      const width = element.getAttribute('width');
      const height = element.getAttribute('height');
      if ((width === '1' && height === '1') || src.includes('tracking') || src.includes('pixel')) {
        return '';
      }

      if (title) {
        return `![${alt}](${src} "${title}")`;
      }
      return alt ? `![${alt}](${src})` : `![image](${src})`;
    },
  });

  // Custom rule for links - preserve href
  turndown.addRule('links', {
    filter: 'a',
    replacement: (content, node) => {
      const element = node as HTMLAnchorElement;
      const href = element.getAttribute('href') ?? '';
      const title = element.getAttribute('title') ?? '';

      if (!href || href.startsWith('javascript:') || href === '#') {
        return content;
      }

      // Clean the content
      const cleanContent = content.trim().replace(/\n+/g, ' ');

      if (!cleanContent) {
        return '';
      }

      if (title) {
        return `[${cleanContent}](${href} "${title}")`;
      }
      return `[${cleanContent}](${href})`;
    },
  });

  // Custom rule for code blocks
  turndown.addRule('codeBlocks', {
    filter: (node) => {
      return (
        node.nodeName === 'PRE' &&
        node.firstChild !== null &&
        node.firstChild.nodeName === 'CODE'
      );
    },
    replacement: (_content, node) => {
      const codeElement = (node as HTMLPreElement).querySelector('code');
      const code = codeElement?.textContent ?? '';
      const lang = codeElement?.className.match(/language-(\w+)/)?.[1] ?? '';

      return `\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
    },
  });

  // Custom rule for tables
  turndown.addRule('tables', {
    filter: 'table',
    replacement: (_content, node) => {
      const table = node as HTMLTableElement;
      const rows: string[][] = [];

      // Extract table data
      const tableRows = table.querySelectorAll('tr');
      tableRows.forEach((row) => {
        const cells: string[] = [];
        row.querySelectorAll('th, td').forEach((cell) => {
          cells.push(cell.textContent?.trim().replace(/\n/g, ' ') ?? '');
        });
        if (cells.length > 0) {
          rows.push(cells);
        }
      });

      if (rows.length === 0) return '';

      // Find max column count
      const maxCols = Math.max(...rows.map((row) => row.length));

      // Normalize rows
      const normalizedRows = rows.map((row) => {
        while (row.length < maxCols) {
          row.push('');
        }
        return row;
      });

      // Build markdown table
      const firstRow = normalizedRows[0];
      if (!firstRow) return '';

      let markdown = '\n\n| ' + firstRow.join(' | ') + ' |\n';
      markdown += '| ' + firstRow.map(() => '---').join(' | ') + ' |\n';

      for (let i = 1; i < normalizedRows.length; i++) {
        const row = normalizedRows[i];
        if (row) {
          markdown += '| ' + row.join(' | ') + ' |\n';
        }
      }

      return markdown + '\n';
    },
  });

  // Remove empty paragraphs and cleanup
  turndown.addRule('removeEmpty', {
    filter: (node) => {
      const tagName = node.nodeName.toLowerCase();
      const isEmpty =
        ['p', 'div', 'span'].includes(tagName) &&
        !node.textContent?.trim() &&
        !node.querySelector('img');
      return isEmpty;
    },
    replacement: () => '',
  });

  return turndown;
}

/**
 * Convert HTML to Markdown
 */
export function htmlToMarkdown(html: string): string {
  const turndown = createTurndownService();
  let markdown = turndown.turndown(html);

  // Post-processing cleanup
  markdown = cleanupMarkdown(markdown);

  return markdown;
}

/**
 * Clean up markdown output
 */
function cleanupMarkdown(markdown: string): string {
  return markdown
    // Remove excessive blank lines
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace from lines
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    // Remove leading blank lines
    .replace(/^\n+/, '')
    // Remove trailing blank lines
    .replace(/\n+$/, '\n')
    // Fix bullet list spacing
    .replace(/(\n- )/g, '\n- ')
    // Fix header spacing
    .replace(/\n(#{1,6} )/g, '\n\n$1')
    // Normalize whitespace in links
    .replace(/\[\s+/g, '[')
    .replace(/\s+\]/g, ']')
    .trim();
}

/**
 * Truncate markdown to a maximum length while preserving structure
 */
export function truncateMarkdown(markdown: string, maxLength: number): string {
  if (markdown.length <= maxLength) {
    return markdown;
  }

  // Find a good breaking point
  const truncated = markdown.substring(0, maxLength);
  const lastNewline = truncated.lastIndexOf('\n\n');

  if (lastNewline > maxLength * 0.7) {
    return truncated.substring(0, lastNewline) + '\n\n[Content truncated...]';
  }

  const lastSentence = truncated.lastIndexOf('. ');
  if (lastSentence > maxLength * 0.7) {
    return truncated.substring(0, lastSentence + 1) + '\n\n[Content truncated...]';
  }

  return truncated + '...\n\n[Content truncated...]';
}
