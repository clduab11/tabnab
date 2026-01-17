import type { PolicyConfig } from './types.js';

export function parseAllowedDomains(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function parseAllowedPathPrefixes(raw: string | undefined): Record<string, string[]> {
  if (!raw) {
    return {};
  }

  const entries = raw.split(';').map((entry) => entry.trim());
  const prefixes: Record<string, string[]> = {};

  for (const entry of entries) {
    if (!entry) {
      continue;
    }

    const [domain, pathPrefix] = entry.split(':');
    if (!domain || !pathPrefix) {
      continue;
    }

    const normalizedDomain = domain.trim().toLowerCase();
    const normalizedPrefix = pathPrefix.trim();
    if (!normalizedDomain || !normalizedPrefix.startsWith('/')) {
      continue;
    }

    prefixes[normalizedDomain] ??= [];
    prefixes[normalizedDomain].push(normalizedPrefix);
  }

  return prefixes;
}

export function isUrlAllowed(url: URL, config: PolicyConfig): { allowed: boolean; reasonCodes: string[] } {
  const reasonCodes: string[] = [];
  const host = url.hostname.toLowerCase();

  if (config.allowedDomains.length === 0) {
    reasonCodes.push('allowlist_missing');
    return { allowed: false, reasonCodes };
  }

  if (!config.allowedDomains.includes(host)) {
    reasonCodes.push('allowlist_blocked');
    return { allowed: false, reasonCodes };
  }

  const prefixes = config.allowedPathPrefixes[host];
  if (prefixes && prefixes.length > 0) {
    const isAllowedPrefix = prefixes.some((prefix) => url.pathname.startsWith(prefix));
    if (!isAllowedPrefix) {
      reasonCodes.push('path_prefix_blocked');
      return { allowed: false, reasonCodes };
    }
  }

  return { allowed: true, reasonCodes };
}
