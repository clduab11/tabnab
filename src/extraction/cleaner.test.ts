import { describe, it, expect } from 'vitest';
import { cleanHtml, extractMainContent, getSimplifiedText } from './cleaner';

describe('cleanHtml', () => {
  it('removes script tags', () => {
    const html = '<div><p>Content</p><script>alert("xss")</script></div>';
    const cleaned = cleanHtml(html);

    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('alert');
    expect(cleaned).toContain('Content');
  });

  it('removes style tags', () => {
    const html = '<div><style>.foo { color: red; }</style><p>Content</p></div>';
    const cleaned = cleanHtml(html);

    expect(cleaned).not.toContain('<style>');
    expect(cleaned).not.toContain('color: red');
    expect(cleaned).toContain('Content');
  });

  it('removes navigation elements', () => {
    const html = '<div><nav><a href="/">Home</a></nav><main><p>Main content</p></main></div>';
    const cleaned = cleanHtml(html);

    expect(cleaned).not.toContain('<nav>');
    expect(cleaned).toContain('Main content');
  });

  it('removes ad-related elements', () => {
    const html = '<div><div class="advertisement">Ad here</div><p>Content</p></div>';
    const cleaned = cleanHtml(html);

    expect(cleaned).not.toContain('advertisement');
    expect(cleaned).not.toContain('Ad here');
    expect(cleaned).toContain('Content');
  });

  it('removes inline styles and classes', () => {
    const html = '<p style="color: red" class="fancy">Content</p>';
    const cleaned = cleanHtml(html);

    expect(cleaned).not.toContain('style=');
    expect(cleaned).not.toContain('class=');
    expect(cleaned).toContain('Content');
  });
});

describe('extractMainContent', () => {
  it('extracts main element content', () => {
    const html = '<body><header>Header</header><main><p>Main content here</p></main><footer>Footer</footer></body>';
    const content = extractMainContent(html);

    // Should prioritize main element if it has substantial content
    expect(content).toContain('Main content here');
  });

  it('extracts article content', () => {
    const html = '<body><div><article><h1>Title</h1><p>Article content that is long enough to be considered substantial content for extraction purposes.</p></article></div></body>';
    const content = extractMainContent(html);

    expect(content).toContain('Article content');
  });

  it('falls back to body if no main area found', () => {
    const html = '<body><div><p>Just some content</p></div></body>';
    const content = extractMainContent(html);

    expect(content).toContain('Just some content');
  });
});

describe('getSimplifiedText', () => {
  it('extracts text content only', () => {
    const html = '<div><h1>Title</h1><p>Paragraph with <strong>bold</strong> text.</p></div>';
    const text = getSimplifiedText(html);

    expect(text).toContain('Title');
    expect(text).toContain('Paragraph with bold text.');
    expect(text).not.toContain('<');
    expect(text).not.toContain('>');
  });

  it('removes scripts before extracting text', () => {
    const html = '<div><p>Content</p><script>var x = 1;</script></div>';
    const text = getSimplifiedText(html);

    expect(text).toContain('Content');
    expect(text).not.toContain('var x');
  });

  it('normalizes whitespace', () => {
    const html = '<div>  \n\n  Multiple   spaces   \n\n  </div>';
    const text = getSimplifiedText(html);

    expect(text).not.toContain('  ');
    expect(text).toBe('Multiple spaces');
  });
});
