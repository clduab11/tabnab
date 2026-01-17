import type { SensitiveActionRules } from './types.js';

const DEFAULT_RULES: SensitiveActionRules = {
  selectorKeywords: [
    'submit',
    'confirm',
    'delete',
    'remove',
    'unsubscribe',
    'checkout',
    'purchase',
    'pay',
    'order',
    'transfer',
  ],
  urlKeywords: ['checkout', 'billing', 'payment', 'confirm', 'delete', 'unsubscribe', 'order'],
  elementTextKeywords: [
    'submit',
    'confirm',
    'delete',
    'remove',
    'unsubscribe',
    'place order',
    'pay',
    'purchase',
    'checkout',
  ],
};

export function isSensitiveAction(params: {
  selector?: string;
  url?: string;
  elementText?: string;
  actionType: string;
  key?: string;
}): boolean {
  const selector = params.selector?.toLowerCase() ?? '';
  const url = params.url?.toLowerCase() ?? '';
  const elementText = params.elementText?.toLowerCase() ?? '';
  const actionType = params.actionType.toLowerCase();
  const key = params.key?.toLowerCase();

  if (actionType === 'submit') {
    return true;
  }

  if (actionType === 'press_key' && (key === 'enter' || key === 'numpadenter')) {
    return true;
  }

  const matchesSelector = DEFAULT_RULES.selectorKeywords.some((keyword) => selector.includes(keyword));
  const matchesUrl = DEFAULT_RULES.urlKeywords.some((keyword) => url.includes(keyword));
  const matchesText = DEFAULT_RULES.elementTextKeywords.some((keyword) => elementText.includes(keyword));

  return matchesSelector || matchesUrl || matchesText;
}
