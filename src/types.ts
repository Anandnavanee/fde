export type Page = "queue" | "tracker" | "chase";
export type DocumentStatus = "Received" | "Unconfirmed" | "Missing";

export interface DocumentRecord {
  id: string;
  name: string;
  description: string;
  required: boolean;
  status: DocumentStatus;
  source?: string;
  reference?: string;
  updated?: string;
}

export interface CaseRecord {
  id: string;
  client: string;
  type: string;
  code: string;
  jurisdiction: string;
  rm: string;
  initials: string;
  activity: string;
  recipientEmail?: string;
  documents: DocumentRecord[];
}
