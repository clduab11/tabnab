export type ToolError = {
  code: string;
  message: string;
};

export type ToolResponse<T> = {
  ok: boolean;
  success: boolean;
  protocolVersion: 2;
  warnings: string[];
  data?: T;
  error?: ToolError;
};

export function ok<T>(data?: T, warnings: string[] = []): ToolResponse<T> {
  return {
    ok: true,
    success: true,
    protocolVersion: 2,
    data,
    warnings,
  };
}

export function fail(code: string, message: string, warnings: string[] = []): ToolResponse<never> {
  return {
    ok: false,
    success: false,
    protocolVersion: 2,
    error: {
      code,
      message,
    },
    warnings,
  };
}
