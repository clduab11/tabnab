import os from 'node:os';
import { readFileSync } from 'node:fs';
import { parseAllowedDomains, parseAllowedPathPrefixes, isUrlAllowed } from './allowlist.js';
import { isSensitiveAction } from './sensitive.js';
import type { PolicyConfig, PolicyContext, PolicyDecision, ConfirmationMode } from './types.js';

const DEFAULT_MAX_STEPS = 30;
const DEFAULT_CONFIRMATION_MODE: ConfirmationMode = 'confirm-on-sensitive';

export function loadPolicyConfig(): PolicyConfig {
  const configPath = process.env.TABNAB_POLICY_CONFIG_PATH;
  const fileConfig = configPath ? readPolicyFile(configPath) : {};

  const allowedDomains = parseAllowedDomains(
    process.env.TABNAB_ALLOWED_DOMAINS ?? fileConfig.TABNAB_ALLOWED_DOMAINS
  );
  const allowedPathPrefixes = parseAllowedPathPrefixes(
    process.env.TABNAB_ALLOWED_PATH_PREFIXES ?? fileConfig.TABNAB_ALLOWED_PATH_PREFIXES
  );
  const confirmationMode = normalizeConfirmationMode(
    process.env.TABNAB_CONFIRMATION_MODE ??
      fileConfig.TABNAB_CONFIRMATION_MODE ??
      DEFAULT_CONFIRMATION_MODE
  );
  const auditLogPath =
    process.env.TABNAB_AUDIT_LOG_PATH ??
    fileConfig.TABNAB_AUDIT_LOG_PATH ??
    `${os.tmpdir()}/tabnab-audit.log`;
  const maxSteps = parsePositiveInt(
    process.env.TABNAB_MAX_STEPS ?? fileConfig.TABNAB_MAX_STEPS,
    DEFAULT_MAX_STEPS
  );
  const selectorLogMode = normalizeSelectorLogMode(
    process.env.TABNAB_AUDIT_LOG_SELECTOR_MODE ?? fileConfig.TABNAB_AUDIT_LOG_SELECTOR_MODE
  );

  return {
    allowedDomains,
    allowedPathPrefixes,
    confirmationMode,
    auditLogPath,
    maxSteps,
    selectorLogMode,
  };
}

export function enforcePolicy(context: PolicyContext, config: PolicyConfig): PolicyDecision {
  const reasonCodes: string[] = [];
  const sensitive = isSensitiveAction({
    selector: context.selector,
    url: context.url,
    elementText: context.elementText,
    actionType: context.actionType,
    key: context.key,
  });

  if (context.url && !context.isReadOnly) {
    const url = new URL(context.url);
    const allowDecision = isUrlAllowed(url, config);
    if (!allowDecision.allowed) {
      reasonCodes.push(...allowDecision.reasonCodes);
      return {
        allowed: false,
        requiresConfirmation: false,
        reasonCodes,
        sensitive,
      };
    }
  }

  if (sensitive) {
    reasonCodes.push('sensitive_action');
  }

  const requiresConfirmation = shouldRequireConfirmation(context, config.confirmationMode, sensitive);
  if (requiresConfirmation) {
    reasonCodes.push('confirmation_required');
  }

  return {
    allowed: true,
    requiresConfirmation,
    reasonCodes,
    sensitive,
  };
}

function shouldRequireConfirmation(
  context: PolicyContext,
  mode: ConfirmationMode,
  sensitive: boolean
): boolean {
  if (sensitive) {
    return true;
  }

  if (mode === 'always-confirm') {
    return !context.isReadOnly;
  }

  if (mode === 'confirm-on-navigation') {
    return Boolean(context.isNavigation);
  }

  if (mode === 'confirm-on-sensitive') {
    return false;
  }

  return false;
}

function normalizeConfirmationMode(mode: string): ConfirmationMode {
  switch (mode) {
    case 'auto':
    case 'confirm-on-navigation':
    case 'confirm-on-sensitive':
    case 'always-confirm':
      return mode;
    default:
      return DEFAULT_CONFIRMATION_MODE;
  }
}

function normalizeSelectorLogMode(mode: string | undefined): PolicyConfig['selectorLogMode'] {
  switch (mode) {
    case 'plaintext':
    case 'hash':
    case 'truncate':
      return mode;
    default:
      return 'truncate';
  }
}

function readPolicyFile(path: string): Record<string, string> {
  try {
    const raw = readFileSync(path, 'utf8');
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
