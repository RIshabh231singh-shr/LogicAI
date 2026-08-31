import { aiClient } from './client';

export const securityApi = {
  /**
   * Run enterprise guardrail inspection (prompt injection, jailbreak, RBAC clearance)
   */
  runGuardrailInspection: ({ prompt, userRole = 'employee', docClearance = null }) => {
    return aiClient.post('/api/v1/security/guard', {
      prompt,
      user_role: userRole,
      doc_clearance: docClearance,
    });
  },
};
