export type ConfirmationMode =
  | 'auto'
  | 'confirm-on-navigation'
  | 'confirm-on-sensitive'
  | 'always-confirm';

export type SelectorLogMode = 'plaintext' | 'truncate' | 'hash';

export interface PolicyConfig {
  allowedDomains: string[];
  allowedPathPrefixes: Record<string, string[]>;
  confirmationMode: ConfirmationMode;
  auditLogPath: string;
  maxSteps: number;
  selectorLogMode: SelectorLogMode;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  toolName: string;
  actionType: string;
  url?: string;
  selector?: string;
  outcome: 'allowed' | 'denied' | 'needs_confirmation' | 'confirmed';
  reasonCodes?: string[];
}

export interface SensitiveActionRules {
  selectorKeywords: string[];
  urlKeywords: string[];
  elementTextKeywords: string[];
}

export interface PolicyContext {
  toolName: string;
  url?: string;
  selector?: string;
  actionType: string;
  elementText?: string;
  key?: string;
  isNavigation?: boolean;
  isReadOnly?: boolean;
}

export interface PolicyDecision {
  allowed: boolean;
  requiresConfirmation: boolean;
  reasonCodes: string[];
  sensitive: boolean;
}
