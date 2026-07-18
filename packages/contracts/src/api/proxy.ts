import type { ReasoningExecutionRequestFields } from './reasoningExecution';

export type ProxyMessageRole = 'system' | 'user' | 'assistant' | 'tool';

export type ProxyMessageContent =
  | string
  | Array<ProxyTextContentBlock | ProxyImageContentBlock>;

export interface ProxyTextContentBlock {
  type: 'text';
  text: string;
}

export interface ProxyImageContentBlock {
  type: 'image';
  source: {
    type: 'base64';
    media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    data: string;
  };
}

export interface ProxyMessage {
  role: ProxyMessageRole;
  content: ProxyMessageContent;
}

export interface ProxyStreamRequest extends ReasoningExecutionRequestFields {
  baseUrl: string;
  apiKey: string;
  model: string;
  systemPrompt?: string;
  messages: ProxyMessage[];
  // Caps the upstream completion length. Defaults to 8192 when unset so
  // pre-existing clients keep their old behavior.
  maxTokens?: number;
  // Azure OpenAI only. Defaults at the daemon when omitted.
  apiVersion?: string;
  // DeepSeek only. Passed through as `reasoning_effort` on the OpenAI-shaped
  // endpoint; the daemon validates against DeepSeek's accepted variants
  // (low | medium | high | xhigh | max) and drops anything else.
  reasoningEffort?: string;
  // DeepSeek only. DeepSeek's web_search server tool exists solely on its
  // Anthropic-shaped endpoint, so when set the daemon routes the request
  // through /anthropic/v1/messages with the web_search tool attached.
  webSearch?: boolean;
}

export interface ProxyStreamStartPayload {
  model?: string;
}

export interface ProxyStreamDeltaPayload {
  delta: string;
}

export interface ProxyStreamEndPayload {
  code?: number;
}
