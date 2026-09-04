export interface Conversation {
  id?: string;
  projectName?: string;
  messages: Array<{
    id?: string;
    status?: string;
    attachments?: unknown[];
    [key: string]: unknown;
  }>;
}
