/**
 * DeepSeek chat provider. DeepSeek exposes BOTH wire shapes on one origin:
 * OpenAI-compatible at / (POST /chat/completions, Bearer auth, supports
 * `reasoning_effort`: low | medium | high | xhigh | max) and
 * Anthropic-compatible at /anthropic (POST /v1/messages, where its
 * web_search server tool lives — the OpenAI shape silently ignores web
 * search fields). The daemon proxy route picks the shape per request:
 * web search on → Anthropic shape + web_search tool; off → OpenAI shape
 * + reasoning_effort.
 *
 * Routes through the daemon proxy to avoid browser CORS issues.
 * BYOK — the key stays on the user's machine.
 */
import type { AppConfig, ChatMessage } from '../types';
import type { StreamHandlers } from './anthropic';
import { streamProxyEndpoint } from './api-proxy';

export async function streamMessageDeepSeek(
  cfg: AppConfig,
  system: string,
  history: ChatMessage[],
  signal: AbortSignal,
  handlers: StreamHandlers,
): Promise<void> {
  return streamProxyEndpoint('/api/proxy/deepseek/stream', cfg, system, history, signal, handlers);
}
