# Security Documentation: Authentication & Identity Module

This documentation provides a comprehensive security overview of the **HR-Helper Authentication Module**. It is designed for use in security audits and technical documentation.

---

## 1. Executive Summary

The HR-Helper identity system is built on the **OpenID Connect (OIDC) protocol**, utilizing **Auth0** as the Managed Identity Provider. The architecture follows a **Zero-Trust client model**, where the frontend is treated as an untrusted public client and the backend acts as a strict validator.

---

## 2. Core Architecture

### 2.1 Protocol & Flow

- **Standard:** OAuth 2.0 + OpenID Connect  
- **Grant Type:** Authorization Code Flow with PKCE (Proof Key for Code Exchange)  
- **Security Impact:** PKCE prevents authorization code injection and interception attacks, a critical requirement for SPAs where secrets cannot be stored safely.

### 2.2 Token Management (Client-Side)

- **Storage:** In-Memory Cache (tokens are never persisted to `localStorage` or `sessionStorage`)  
- **XSS Mitigation:** Tokens in RAM are inaccessible to malicious scripts  
- **Session Persistence:** Refresh Token Rotation — old tokens are invalidated when refreshed  
- **Scopes:** `openid profile email offline_access`

---

## 3. Backend Security (The Gatekeeper)

### 3.1 JWT Validation Logic

The NestJS backend employs a `JwtStrategy` validating incoming Access Tokens:

- **Signature Verification:** Validates RS256 digital signature using Auth0 JWKS  
- **Issuer & Audience:** Ensures token is issued by correct Auth0 tenant and intended for HR-Helper API  
- **Namespaced Claims:** Custom claims (email, verification status) use a private namespace (`https://hr-helper.com/`) to prevent claim collision  

### 3.2 Identity Hardening

- **Verified Email Enforcement:** Rejects tokens where `email_verified` is not `true`, preventing pre-registration hijacking  
- **Account Linking:** Only performed after cryptographic proof and verified email  

---

## 4. Infrastructure & Database Security

### 4.1 Database Layer (Prisma)

- **Identifier Strategy:** Uses CUID for all primary keys, preventing ID enumeration attacks  
- **Unique Constraints:** Strict `@unique` constraints on `email` and `auth0Id`  
- **Credential Isolation:** Database stores **no passwords**; all credential management is offloaded to Auth0  

### 4.2 HTTP Hardening

- **Security Headers:** Helmet.js sets security-focused headers:  
  - `Content-Security-Policy`: Restricts script sources  
  - `X-Frame-Options`: Prevents clickjacking  
- **CORS Policy:** Whitelists only the specific frontend production domain  

---

## 5. Best Practices Evaluation

| Practice               | Rating      | Description                                                     |
|------------------------|------------|-----------------------------------------------------------------|
| Identity Verification  | ⭐⭐⭐⭐⭐      | Strict enforcement of `email_verified` claim                    |
| Token Storage          | ⭐⭐⭐⭐⭐      | Memory-only storage with rotation                               |
| Secret Management      | ⭐⭐⭐⭐⭐      | No secrets/passwords stored in local DB                         |
| ID Logic               | ⭐⭐⭐⭐⭐      | Use of CUIDs prevents horizontal privilege escalation           |
| Transport Security     | ⭐⭐⭐⭐☆      | Ready for HTTPS; requires TLS termination at proxy             |

---

## 6. Areas for Improvement (Future Roadmap)

- **Rate Limiting:**  
  - *Issue:* `/auth/sync` endpoint could be spammed  
  - *Improvement:* Implement `ThrottlerModule` in NestJS to limit requests per IP/User  

- **Multi-Factor Authentication (MFA):**  
  - *Status:* Dependent on Auth0 settings  
  - *Improvement:* Force MFA for all users, specifically with EMPLOYER role  

- **Audit Logging:**  
  - *Issue:* Current logs are ephemeral  
  - *Improvement:* Create `AuditLog` table recording identity links and role changes, with IPs and timestamps  

- **CORS Dynamic Whitelisting:**  
  - *Status:* Single environment variable  
  - *Improvement:* Implement dynamic CORS checking for multi-environment setups  

---

## Final Security Verdict

- **Status:** SECURE (Production-Ready)  
- HR-Helper Authentication implements modern defensive patterns protecting against **OWASP Top 10 vulnerabilities**, specifically:  
  - Broken Access Control  
  - Identification and Authentication Failures  
  - Insecure Design
