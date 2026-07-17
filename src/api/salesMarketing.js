import apiClient from "./apiClient";

export const PIPELINE_DEPARTMENTS = [
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
];

export const PIPELINE_LEVELS = [
  { value: "lead", label: "Lead" },
  { value: "executive", label: "Executive" },
  { value: "junior", label: "Junior" },
];

export const PIPELINE_SOURCES = [
  { value: "upwork", label: "Upwork" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Other" },
];

export const PIPELINE_STAGES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export const PIPELINE_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export async function listPipelineItems(filters = {}) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value != null)
  );
  return apiClient.get("/sales-marketing/pipeline", { params });
}

export async function createPipelineItem(payload) {
  return apiClient.post("/sales-marketing/pipeline", payload);
}

export async function updatePipelineItem(itemId, payload) {
  return apiClient.put(`/sales-marketing/pipeline/${itemId}`, payload);
}

export async function deletePipelineItem(itemId) {
  return apiClient.delete(`/sales-marketing/pipeline/${itemId}`);
}

export async function getSalesPipelineReport() {
  return apiClient.get("/sales-marketing/reports/summary");
}
