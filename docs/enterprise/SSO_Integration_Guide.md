# SSO Integration Guide (E.1)

FerroUI supports enterprise SSO via SAML 2.0 and OIDC.

## Supported Providers

- Okta
- Azure AD
- Google Workspace
- OneLogin
- Ping Identity

## Configuration

### Environment Variables

```bash
# SAML
SAML_ISSUER=https://ferroui.yourcompany.com
SAML_CERT_PATH=/etc/ferroui/saml.crt
SAML_ENTRY_POINT=https://your-idp.com/saml/sso
SAML_CALLBACK_URL=https://ferroui.yourcompany.com/auth/saml/callback

# OIDC
OIDC_ISSUER_URL=https://your-okta-domain.okta.com
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_REDIRECT_URI=https://ferroui.yourcompany.com/auth/oidc/callback
```

## SCIM Provisioning (E.1.3)

FerroUI implements SCIM 2.0 for automated user provisioning:

- **Endpoint**: `https://ferroui.yourcompany.com/scim/v2`
- **Authentication**: Bearer token (set `SCIM_TOKEN` env var)
- **Supported Operations**: GET, POST, PUT, PATCH, DELETE on `/Users` and `/Groups`

## Admin Console (E.2)

The admin console provides:
- User management
- Role assignment
- Usage analytics
- Audit log viewer
- Rate limit configuration

Access at: `https://ferroui.yourcompany.com/admin`

## License Entitlements (E.4)

| Tier | Users | Requests/day | Features |
|------|-------|--------------|----------|
| Starter | 10 | 1,000 | Basic UI |
| Growth | 100 | 10,000 | + Custom components |
| Enterprise | Unlimited | 100,000 | + SSO, SCIM, SLA |
