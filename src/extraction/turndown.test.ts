import { describe, it, expect } from 'vitest';
import { htmlToMarkdown, truncateMarkdown } from './turndown';

describe('htmlToMarkdown', () => {
  it('converts basic HTML to markdown', () => {
    const html = '<h1>Hello World</h1><p>This is a paragraph.</p>';
    const markdown = htmlToMarkdown(html);

    expect(markdown).toContain('# Hello World');
    expect(markdown).toContain('This is a paragraph.');
  });

  it('converts links correctly', () => {
    const html = '<a href="https://example.com">Click here</a>';
    const markdown = htmlToMarkdown(html);

    expect(markdown).toBe('[Click here](https://example.com)');
  });

  it('converts lists correctly', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    const markdown = htmlToMarkdown(html);

    // Turndown may add varying whitespace after bullet
    expect(markdown).toContain('Item 1');
    expect(markdown).toContain('Item 2');
    expect(markdown).toMatch(/^-\s+Item 1/m);
    expect(markdown).toMatch(/^-\s+Item 2/m);
  });

  it('converts code blocks correctly', () => {
    const html = '<pre><code class="language-javascript">const x = 1;</code></pre>';
    const markdown = htmlToMarkdown(html);

    expect(markdown).toContain('```javascript');
    expect(markdown).toContain('const x = 1;');
    expect(markdown).toContain('```');
  });

  it('removes script tags', () => {
    const html = '<p>Content</p><script>alert("xss")</script>';
    const markdown = htmlToMarkdown(html);

    expect(markdown).not.toContain('alert');
    expect(markdown).toContain('Content');
  });

  it('handles images with alt text', () => {
    const html = '<img src="image.png" alt="A nice image">';
    const markdown = htmlToMarkdown(html);

    expect(markdown).toBe('![A nice image](image.png)');
  });
});

describe('truncateMarkdown', () => {
  it('does not truncate short content', () => {
    const markdown = 'Short content';
    const result = truncateMarkdown(markdown, 1000);

    expect(result).toBe(markdown);
  });

  it('truncates long content with message', () => {
    const markdown = 'A'.repeat(200);
    const result = truncateMarkdown(markdown, 100);

    expect(result.length).toBeLessThan(200);
    expect(result).toContain('[Content truncated...]');
  });

  it('tries to break at paragraph boundaries', () => {
    const markdown = 'First paragraph.\n\nSecond paragraph that is much longer and will cause truncation.\n\nThird paragraph.';
    const result = truncateMarkdown(markdown, 50);

    expect(result).toContain('[Content truncated...]');
  });
});
