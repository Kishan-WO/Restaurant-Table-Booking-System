import { AsyncLocalStorage } from "async_hooks";

interface RequestContext {
  requestId: string;
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export const getRequestId = (): string | undefined =>
  asyncLocalStorage.getStore()?.requestId;
