import type { DefaultTheme } from 'vitepress';

export const nav: DefaultTheme.NavItem[] = [
  {
    text: 'Guide',
    items: [
      { text: 'Introduction', link: '/introduction' },
      { text: 'Quickstart', link: '/dev-experience/Quickstart_Developer_Onboarding' },
      { text: 'CLI Guide', link: '/dev-experience/CLI_Usage_Guide' },
      { text: 'Monorepo Architecture', link: '/architecture/Monorepo_Architecture_Package_Governance' },
      { text: 'Whitepapers', link: '/whitepapers/' },
    ],
  },
  {
    text: 'Architecture',
    items: [
      { text: 'System Architecture', link: '/architecture/System_Architecture_Document' },
      { text: 'ADRs', link: '/architecture/ADRs/' },
      { text: 'RFCs', link: '/architecture/RFCs/' },
    ],
  },
  {
    text: 'API',
    items: [
      { text: 'Overview', link: '/api/' },
      { text: 'Components', link: '/api/components' },
      { text: 'Tools', link: '/api/tools' },
      { text: 'FerroUI Layout Schema', link: '/api/schema' },
      { text: 'Packages', link: '/api/packages/' },
    ],
  },
  {
    text: 'Engineering',
    items: [
      {
        text: 'Frontend',
        items: [
          { text: 'Component Guidelines', link: '/engineering/frontend/Component_Development_Guidelines' },
          { text: 'Design Tokens', link: '/engineering/frontend/Design_Token_Theming_Specification' },
          { text: 'i18n & RTL', link: '/engineering/frontend/I18n_RTL_Implementation_Guide' },
          { text: 'A11y Checklist', link: '/engineering/frontend/A11y_Compliance_Checklist' },
        ],
      },
      {
        text: 'Backend',
        items: [
          { text: 'CLI Architecture', link: '/engineering/backend/CLI_Architecture_Reference' },
          { text: 'FerroUILayout Schema', link: '/engineering/backend/FerroUILayout_JSON_Schema_Specification' },
          { text: 'Tool Registration', link: '/engineering/backend/Tool_Registration_API_Reference' },
          { text: 'Semantic Caching', link: '/engineering/backend/Semantic_Caching_Strategy_Invalidation' },
        ],
      },
    ],
  },
  {
    text: 'Ops & Security',
    items: [
      { text: 'Observability', link: '/ops/Observability_Telemetry_Dictionary' },
      { text: 'Runbooks', link: '/ops/Runbooks_Incident_Response' },
      { text: 'SLAs', link: '/ops/SLA_Definitions' },
      { text: 'Disaster Recovery', link: '/ops/Disaster_Recovery_Business_Continuity' },
      { text: 'Security Threat Model', link: '/security/Security_Threat_Model' },
      { text: 'Acceptable Use Policy', link: '/security/Acceptable_Use_Policy' },
      { text: 'Privacy & Compliance', link: '/security/Data_Privacy_Compliance_Guide' },
      { text: 'C2PA Provenance', link: '/security/C2PA_Provenance' },
      { text: 'Sub-Processor Agreements', link: '/security/Data_Sub_processor_Agreements' },
      { text: 'Security Audits', link: '/security/Third_Party_Security_Audit_Reports' },
      { text: 'Licensing Matrix', link: '/security/Open_Source_Licensing_Dependency_Matrix' },
    ],
  },
  {
    text: 'Product',
    items: [
      { text: 'Personas', link: '/product/User_Personas_Developer_Journeys' },
      { text: 'Competitor Matrix', link: '/product/Competitor_Feature_Matrix' },
      { text: 'Launch Communications', link: '/product/Launch_Communications_PR_Plan' },
      { text: 'Release Notes', link: '/product/Release_Notes_Changelogs' },
      { text: 'PRDs', link: '/product/PRDs/' },
    ],
  },
  {
    text: 'Audit',
    items: [
      { text: 'Documentation Audit 2026-04', link: '/audit/Documentation_Audit_2026_04' },
      { text: 'Enterprise Audit v4', link: '/audit/AUDIT_REPORT_v4_ENTERPRISE' },
      { text: 'Internal Audit Report', link: '/audit/AUDIT_REPORT' },
      { text: 'Readiness Report', link: '/audit/Enterprise_Readiness_Report' },
    ],
  },
  {
    text: 'Enterprise',
    items: [
      { text: 'Admin Console', link: '/enterprise/Admin_Console_Spec' },
      { text: 'SSO Integration', link: '/enterprise/SSO_Integration_Guide' },
      { text: 'SIEM Export', link: '/enterprise/SIEM_Export' },
      { text: 'SOC 2 Readiness', link: '/compliance/SOC2_Readiness_Checklist' },
      { text: 'Compliance Matrix', link: '/compliance/Compliance_Matrix' },
      { text: 'Enterprise Readiness', link: '/audit/Enterprise_Readiness_Plan' },
    ],
  },
  {
    text: 'AI',
    items: [
      { text: 'System Prompt SOP', link: '/ai/System_Prompt_SOP' },
      { text: 'Prompt Eval Rubric', link: '/ai/Prompt_Evaluation_Rubric_Testing_Playbook' },
      { text: 'LLM Provider Benchmarks', link: '/ai/LLM_Provider_Benchmarking_Reports' },
      { text: 'Hallucination Case Studies', link: '/ai/Hallucination_Mitigation_Case_Studies' },
      { text: 'Prompt Versioning', link: '/ai/Prompt_Versioning_Rollback_Ledger' },
    ],
  },
  {
    text: 'Support',
    items: [
      { text: 'FAQ', link: '/support/End_User_FAQ' },
      { text: 'Troubleshooting', link: '/support/Known_Issues_Troubleshooting' },
      { text: 'Escalation Paths', link: '/support/Support_Escalation_Paths' },
      { text: 'KB Article Templates', link: '/support/KB_Article_Templates' },
      { text: 'Contributing', link: '/meta/contributing' },
      { text: 'Security Policy', link: '/meta/security-policy' },
      { text: 'Code of Conduct', link: '/meta/code-of-conduct' },
      { text: 'License', link: '/meta/license' },
      { text: 'Monitoring & CI', link: '/meta/monitoring' },
    ],
  },
  {
    text: 'v1.0',
    items: [
      { text: 'Changelog', link: '/product/Release_Notes_Changelogs' },
      { text: 'GitHub Releases', link: 'https://github.com/jxoesneon/FerroUI/releases' },
    ],
  },
];
