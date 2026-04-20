import type { DefaultTheme } from 'vitepress';

/**
 * Sidebar is scoped by URL prefix so each section shows its own navigation.
 * Each path is relative to /docs (the VitePress srcDir).
 */
export const sidebar: DefaultTheme.Sidebar = {
  '/dev-experience/': [
    {
      text: 'Getting Started',
      items: [
        { text: 'Introduction', link: '/introduction' },
        { text: 'Quickstart', link: '/dev-experience/Quickstart_Developer_Onboarding' },
        { text: 'CLI Usage Guide', link: '/dev-experience/CLI_Usage_Guide' },
      ],
    },
    {
      text: 'Next Steps',
      items: [
        { text: 'Build Your First Component', link: '/engineering/frontend/Component_Development_Guidelines' },
        { text: 'Register a Tool', link: '/engineering/backend/Tool_Registration_API_Reference' },
        { text: 'Understand the Schema', link: '/engineering/backend/FerroUILayout_JSON_Schema_Specification' },
      ],
    },
  ],

  '/architecture/': [
    {
      text: 'Overview',
      items: [
        { text: 'System Architecture', link: '/architecture/System_Architecture_Document' },
        { text: 'Monorepo Governance', link: '/architecture/Monorepo_Architecture_Package_Governance' },
      ],
    },
    {
      text: 'Architecture Decision Records',
      collapsed: false,
      items: [
        { text: 'Index', link: '/architecture/ADRs/' },
        { text: 'ADR-001 Dual-Phase Pipeline', link: '/architecture/ADRs/ADR-001-Dual-Phase-Pipeline' },
        { text: 'ADR-002 Semantic Caching', link: '/architecture/ADRs/ADR-002-Semantic-Caching' },
        { text: 'ADR-003 Atomic Components', link: '/architecture/ADRs/ADR-003-Atomic-Component-Hierarchy' },
        { text: 'ADR-004 Registry Versioning', link: '/architecture/ADRs/ADR-004-Component-Registry-Versioning' },
        { text: 'ADR-005 Streaming', link: '/architecture/ADRs/ADR-005-Streaming-Architecture' },
        { text: 'ADR-006 Session State', link: '/architecture/ADRs/ADR-006-Session-State-Management' },
        { text: 'ADR-007 LLM Abstraction', link: '/architecture/ADRs/ADR-007-LLM-Provider-Abstraction' },
        { text: 'ADR-008 Forward Compatibility', link: '/architecture/ADRs/ADR-008-Forward-Compatibility-Strategy' },
      ],
    },
    {
      text: 'Request for Comments',
      collapsed: false,
      items: [
        { text: 'Index', link: '/architecture/RFCs/' },
        { text: 'RFC-001 Layout Actions & State', link: '/architecture/RFCs/RFC-001-Layout-Actions-State-Machines' },
        { text: 'RFC-002 Shared Semantic Cache', link: '/architecture/RFCs/RFC-002-Shared-Semantic-Cache' },
        { text: 'RFC-003 Partial Layout Updates', link: '/architecture/RFCs/RFC-003-Partial-Layout-Updates' },
        { text: 'RFC-004 Multi-Modal Input', link: '/architecture/RFCs/RFC-004-Multi-Modal-Input-Support' },
      ],
    },
  ],

  '/engineering/': [
    {
      text: 'Frontend',
      collapsed: false,
      items: [
        { text: 'Component Development Guidelines', link: '/engineering/frontend/Component_Development_Guidelines' },
        { text: 'Design Token & Theming', link: '/engineering/frontend/Design_Token_Theming_Specification' },
        { text: 'i18n & RTL', link: '/engineering/frontend/I18n_RTL_Implementation_Guide' },
        { text: 'Accessibility Checklist', link: '/engineering/frontend/A11y_Compliance_Checklist' },
      ],
    },
    {
      text: 'Backend',
      collapsed: false,
      items: [
        { text: 'CLI Architecture Reference', link: '/engineering/backend/CLI_Architecture_Reference' },
        { text: 'FerroUILayout JSON Schema', link: '/engineering/backend/FerroUILayout_JSON_Schema_Specification' },
        { text: 'Tool Registration API', link: '/engineering/backend/Tool_Registration_API_Reference' },
        { text: 'Semantic Caching Strategy', link: '/engineering/backend/Semantic_Caching_Strategy_Invalidation' },
      ],
    },
  ],

  '/api/': [
    {
      text: 'Registries',
      items: [
        { text: 'Overview', link: '/api/' },
        { text: 'Components', link: '/api/components' },
        { text: 'Tools', link: '/api/tools' },
        { text: 'FerroUI Layout Schema', link: '/api/schema' },
      ],
    },
    {
      text: 'Packages',
      collapsed: false,
      items: [
        { text: 'Overview', link: '/api/packages/' },
        { text: '@ferroui/engine', link: '/api/packages/engine' },
        { text: '@ferroui/schema', link: '/api/packages/schema' },
        { text: '@ferroui/registry', link: '/api/packages/registry' },
        { text: '@ferroui/tools', link: '/api/packages/tools' },
        { text: '@ferroui/i18n', link: '/api/packages/i18n' },
        { text: '@ferroui/telemetry', link: '/api/packages/telemetry' },
        { text: '@ferroui/tokens', link: '/api/packages/tokens' },
        { text: '@ferroui/renderer', link: '/api/packages/renderer' },
        { text: '@ferroui/cli', link: '/api/packages/cli' },
        { text: '@ferroui/shared', link: '/api/packages/shared' },
        { text: '@ferroui/mcp-server', link: '/api/packages/mcp-server' },
        { text: '@ferroui/vscode-extension', link: '/api/packages/vscode-extension' },
      ],
    },
    {
      text: 'Applications',
      collapsed: true,
      items: [
        { text: 'Overview', link: '/api/apps/' },
        { text: 'Web (Reference Renderer)', link: '/api/apps/web' },
        { text: 'Edge (Cloudflare Worker)', link: '/api/apps/edge' },
        { text: 'Desktop', link: '/api/apps/desktop' },
        { text: 'Playground', link: '/api/apps/playground' },
      ],
    },
  ],

  '/ops/': [
    {
      text: 'Operations',
      items: [
        { text: 'Observability & Telemetry', link: '/ops/Observability_Telemetry_Dictionary' },
        { text: 'Runbooks & Incidents', link: '/ops/Runbooks_Incident_Response' },
        { text: 'SLA Definitions', link: '/ops/SLA_Definitions' },
        { text: 'Disaster Recovery', link: '/ops/Disaster_Recovery_Business_Continuity' },
      ],
    },
    {
      text: 'Deployment',
      collapsed: false,
      items: [
        { text: 'Overview', link: '/ops/deployment-guides/' },
      ],
    },
  ],

  '/security/': [
    {
      text: 'Security',
      items: [
        { text: 'Threat Model', link: '/security/Security_Threat_Model' },
        { text: 'Acceptable Use Policy', link: '/security/Acceptable_Use_Policy' },
      ],
    },
    {
      text: 'Privacy & Compliance',
      items: [
        { text: 'Data Privacy & Compliance', link: '/security/Data_Privacy_Compliance_Guide' },
        { text: 'Sub-processor Agreements', link: '/security/Data_Sub_processor_Agreements' },
        { text: 'C2PA Provenance', link: '/security/C2PA_Provenance' },
      ],
    },
    {
      text: 'Audits & Licensing',
      items: [
        { text: 'Third-Party Security Audits', link: '/security/Third_Party_Security_Audit_Reports' },
        { text: 'OSS Licensing Matrix', link: '/security/Open_Source_Licensing_Dependency_Matrix' },
      ],
    },
  ],

  '/compliance/': [
    {
      text: 'Compliance',
      items: [
        { text: 'Compliance Matrix', link: '/compliance/Compliance_Matrix' },
        { text: 'SOC 2 Readiness', link: '/compliance/SOC2_Readiness_Checklist' },
      ],
    },
  ],

  '/enterprise/': [
    {
      text: 'Enterprise',
      items: [
        { text: 'Admin Console Spec', link: '/enterprise/Admin_Console_Spec' },
        { text: 'SSO Integration Guide', link: '/enterprise/SSO_Integration_Guide' },
        { text: 'SIEM Export', link: '/enterprise/SIEM_Export' },
      ],
    },
    {
      text: 'Readiness',
      items: [
        { text: 'Enterprise Readiness Plan', link: '/audit/Enterprise_Readiness_Plan' },
        { text: 'Compliance Matrix', link: '/compliance/Compliance_Matrix' },
      ],
    },
  ],

  '/product/': [
    {
      text: 'Product',
      items: [
        { text: 'User Personas & Journeys', link: '/product/User_Personas_Developer_Journeys' },
        { text: 'Competitor Matrix', link: '/product/Competitor_Feature_Matrix' },
        { text: 'Launch & PR Plan', link: '/product/Launch_Communications_PR_Plan' },
        { text: 'Release Notes & Changelogs', link: '/product/Release_Notes_Changelogs' },
      ],
    },
    {
      text: 'PRDs',
      collapsed: false,
      items: [
        { text: 'Index', link: '/product/PRDs/' },
        { text: 'PRD-001 Core Framework', link: '/product/PRDs/PRD-001-Core-Framework' },
        { text: 'PRD-002 CLI DevEx', link: '/product/PRDs/PRD-002-CLI-Developer-Experience' },
      ],
    },
  ],

  '/ai/': [
    {
      text: 'AI Engineering',
      items: [
        { text: 'System Prompt SOP', link: '/ai/System_Prompt_SOP' },
        { text: 'Prompt Evaluation Rubric', link: '/ai/Prompt_Evaluation_Rubric_Testing_Playbook' },
      ],
    },
  ],

  '/audit/': [
    {
      text: 'Audit',
      items: [
        { text: 'Enterprise Readiness Plan', link: '/audit/Enterprise_Readiness_Plan' },
        { text: 'Documentation Audit 2026-04', link: '/audit/Documentation_Audit_2026_04' },
        { text: 'Internal Audit Report', link: '/audit/AUDIT_REPORT' },
        { text: 'Enterprise Audit v4', link: '/audit/AUDIT_REPORT_v4_ENTERPRISE' },
      ],
    },
  ],

  '/support/': [
    {
      text: 'Support',
      items: [
        { text: 'End-User FAQ', link: '/support/End_User_FAQ' },
        { text: 'Known Issues & Troubleshooting', link: '/support/Known_Issues_Troubleshooting' },
        { text: 'Support Escalation Paths', link: '/support/Support_Escalation_Paths' },
      ],
    },
  ],

  '/meta/': [
    {
      text: 'Meta',
      items: [
        { text: 'Contributing', link: '/meta/contributing' },
        { text: 'Code of Conduct', link: '/meta/code-of-conduct' },
        { text: 'Security Policy', link: '/meta/security-policy' },
        { text: 'Monitoring', link: '/meta/monitoring' },
        { text: 'License', link: '/meta/license' },
      ],
    },
  ],

  '/whitepapers/': [
    {
      text: 'Whitepapers',
      items: [
        { text: 'Index', link: '/whitepapers/' },
      ],
    },
  ],
};
