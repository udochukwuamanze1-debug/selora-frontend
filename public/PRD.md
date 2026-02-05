# Selora Product Requirements Document (PRD)

**Version:** 1.0  
**Last Updated:** February 2026  
**Status:** MVP Development  

---

## 1. Executive Summary

Selora is a decentralized health data management platform built on the IOTA blockchain. It empowers patients to own, control, and monetize their health records while enabling seamless, secure data sharing with healthcare providers, researchers, and insurers.

### Vision
"Your health data, your control, your rewards."

### Mission
To create a patient-centric health data ecosystem where individuals have complete sovereignty over their medical records, with the ability to securely share data and earn rewards for contributing to medical research.

---

## 2. Current State (As-Is Features)

### 2.1 Authentication & Identity

| Feature | Status | Description |
|---------|--------|-------------|
| IOTA Wallet Connect | ✅ Implemented | Native wallet connection via @iota/dapp-kit |
| zkLogin (Google OAuth) | ✅ Implemented | Passwordless login using zero-knowledge proofs |
| Session Persistence | ✅ Implemented | Maintains login state across sessions |
| Multi-Portal Access | ✅ Implemented | Single wallet accesses multiple role-based portals |

### 2.2 Patient Portal

| Feature | Status | Description |
|---------|--------|-------------|
| Dashboard Home | ✅ Implemented | Personalized greeting, health score, quick stats |
| Health Archive | ✅ Implemented | Upload, view, and manage health records |
| Secure Vault | ✅ Implemented | Encrypted storage for sensitive documents |
| Prescriptions | ✅ Implemented | View and manage medication prescriptions |
| Data Exchange | ✅ Implemented | Share data with authorized parties |
| Care Network | ✅ Implemented | View connected healthcare providers |
| Doctors Directory | ✅ Implemented | Search and connect with verified doctors |
| Trusted Contacts | ✅ Implemented | Manage emergency contacts and guardians |
| Health Assistant | ✅ Implemented | AI-powered health guidance |
| Profile & Preferences | ✅ Implemented | User settings and preferences |
| Patient Inbox | ✅ Implemented | Messages and notifications |
| Analytics Dashboard | ✅ Implemented | Health insights and coverage overview |

### 2.3 Doctor Portal

| Feature | Status | Description |
|---------|--------|-------------|
| Care Workspace | ✅ Implemented | Main working area for patient care |
| Patient Insights | ✅ Implemented | View patient health summaries |
| Prescription Creation | ✅ Implemented | Create and sign prescriptions |
| Visit Report Creator | ✅ Implemented | Document patient visits |
| Doctor Profile | ✅ Implemented | Professional profile management |
| Vault Access | ✅ Implemented | Access shared patient records |

### 2.4 Lab Portal

| Feature | Status | Description |
|---------|--------|-------------|
| Diagnostics Hub | ✅ Implemented | Process and upload test results |
| Inventory Management | ✅ Implemented | Manage lab supplies |

### 2.5 Insurer Portal

| Feature | Status | Description |
|---------|--------|-------------|
| Risk Overview | ✅ Implemented | Assess patient risk profiles |
| Data Marketplace | ✅ Implemented | Purchase anonymized data sets |

### 2.6 Researcher Portal

| Feature | Status | Description |
|---------|--------|-------------|
| Research Console | ✅ Implemented | Main research interface |
| Data Pools | ✅ Implemented | Access anonymized data pools |
| Consent Management | ✅ Implemented | Manage research consent requests |

### 2.7 Storage & Encryption

| Feature | Status | Description |
|---------|--------|-------------|
| IPFS Storage (Pinata) | ✅ Implemented | Decentralized file storage |
| AES-256 Encryption | ✅ Implemented | Client-side encryption before upload |
| OCR Document Scanner | ✅ Implemented | Extract text from scanned documents |

### 2.8 Notifications & Engagement

| Feature | Status | Description |
|---------|--------|-------------|
| In-App Notifications | ✅ Implemented | Real-time notification bell |
| Login Reminders | ✅ Implemented | 3-day inactivity reminders |
| Audio Feedback | ✅ Implemented | Three-tone chime for notifications |
| Haptic Feedback | ✅ Implemented | Vibration on mobile devices |
| XP Rewards System | ✅ Implemented | Gamification for engagement |

### 2.9 Platform Features

| Feature | Status | Description |
|---------|--------|-------------|
| PWA Support | ✅ Implemented | Install as mobile/desktop app |
| Dark/Light Theme | ✅ Implemented | Theme toggle with persistence |
| Responsive Design | ⚠️ Partial | Desktop optimized, mobile needs work |
| Onboarding Tutorial | ✅ Implemented | First-time user walkthrough |

### 2.10 Marketing & Documentation

| Feature | Status | Description |
|---------|--------|-------------|
| Landing Page | ✅ Implemented | Hero, features, how it works |
| Waitlist | ✅ Implemented | Email collection with referrals |
| Whitepaper | ✅ Implemented | Technical documentation |
| Executive Summary | ✅ Implemented | Investor one-pager |
| Demo Script | ✅ Implemented | 5-minute walkthrough |
| Investor FAQ | ✅ Implemented | Common investor questions |

---

## 3. Gap Analysis (Features Needed for MVP)

### 3.1 Critical (Must Have for MVP)

#### 3.1.1 Mobile Responsiveness 🔴
**Current State:** Portals are desktop-first, mobile experience is poor  
**Required:**
- [ ] Responsive sidebar that collapses to bottom nav on mobile
- [ ] Touch-optimized UI components
- [ ] Mobile-first forms and modals
- [ ] Swipe gestures for navigation
- [ ] Mobile-optimized file upload

#### 3.1.2 Real Blockchain Integration 🔴
**Current State:** Placeholder contract addresses (all zeros)  
**Required:**
- [ ] Deploy Selora smart contracts to IOTA testnet
- [ ] Implement on-chain access control
- [ ] On-chain prescription verification
- [ ] Token-based data marketplace transactions
- [ ] Wallet balance display with real tokens

#### 3.1.3 Notification Preferences UI 🔴
**Current State:** Sound/vibration work but no UI to control them  
**Required:**
- [ ] Settings page for notification preferences
- [ ] Toggle sound on/off
- [ ] Toggle vibration on/off
- [ ] Different sounds per notification type
- [ ] Test button to preview sounds

#### 3.1.4 Doctor Verification System 🔴
**Current State:** Database has `verified` field but no verification flow  
**Required:**
- [ ] Document upload for credentials
- [ ] Admin review queue
- [ ] Verification badge display
- [ ] License number validation

### 3.2 High Priority (Should Have)

#### 3.2.1 QR Code Access System
**Current State:** Component exists but not fully functional  
**Required:**
- [ ] Generate time-limited QR codes for record access
- [ ] Scan QR to request access
- [ ] One-time vs. recurring access options
- [ ] Audit trail for QR-based access

#### 3.2.2 Push Notifications
**Current State:** In-app only  
**Required:**
- [ ] Web Push API integration
- [ ] Background notifications when app closed
- [ ] Notification permission request flow
- [ ] Push notification preferences

#### 3.2.3 Data Export & Portability
**Current State:** No export functionality  
**Required:**
- [ ] Export all records as encrypted ZIP
- [ ] FHIR-compliant data export
- [ ] PDF generation for records
- [ ] Transfer data to another wallet

#### 3.2.4 Emergency Access
**Current State:** Trusted contacts exist but no emergency protocol  
**Required:**
- [ ] Emergency access activation
- [ ] Trusted contact notification
- [ ] Time-limited emergency access
- [ ] Access revocation

### 3.3 Medium Priority (Nice to Have)

#### 3.3.1 Appointment Scheduling
- [ ] Book appointments with connected doctors
- [ ] Calendar integration
- [ ] Appointment reminders
- [ ] Video consultation links

#### 3.3.2 Medication Reminders
- [ ] Set reminders for prescriptions
- [ ] Track medication adherence
- [ ] Refill alerts
- [ ] Drug interaction warnings

#### 3.3.3 Health Metrics Tracking
- [ ] Manual vitals entry
- [ ] Wearable device integration
- [ ] Trend visualization
- [ ] Health goal setting

#### 3.3.4 Multi-Language Support
- [ ] i18n infrastructure
- [ ] English (default)
- [ ] Spanish, French, German
- [ ] RTL language support

#### 3.3.5 Accessibility (WCAG 2.1)
- [ ] Screen reader optimization
- [ ] Keyboard navigation
- [ ] High contrast mode
- [ ] Focus indicators

---

## 4. Technical Architecture

### 4.1 Frontend Stack
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** React Query + Context
- **Routing:** React Router v6
- **Animations:** Framer Motion

### 4.2 Blockchain Layer
- **Network:** IOTA (testnet → mainnet)
- **Wallet SDK:** @iota/dapp-kit
- **Auth:** zkLogin (Zero-Knowledge)

### 4.3 Backend (Lovable Cloud)
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth (supplementary)
- **Edge Functions:** Deno runtime
- **Storage:** IPFS via Pinata

### 4.4 Security
- **Encryption:** AES-256 (client-side)
- **Key Management:** BIP-39 mnemonics
- **Access Control:** On-chain + RLS policies

---

## 5. User Personas

### 5.1 Patient (Primary)
**Sarah, 34, Software Engineer**
- Wants control over her health data
- Frustrated with fragmented records across providers
- Values privacy and security
- Tech-savvy, early adopter

### 5.2 Doctor
**Dr. Raj, 45, General Practitioner**
- Needs quick access to patient history
- Values verified, complete records
- Wants seamless prescription workflow
- Limited time, needs efficiency

### 5.3 Researcher
**Dr. Chen, 38, Medical Researcher**
- Needs large anonymized datasets
- Values ethical data sourcing
- Requires consent transparency
- Needs diverse population data

### 5.4 Insurer
**Mike, 42, Underwriting Manager**
- Needs accurate risk assessment
- Values verified health records
- Wants fraud prevention
- Requires regulatory compliance

---

## 6. Success Metrics

### 6.1 Acquisition
- Waitlist signups: 10,000 pre-launch
- Referral rate: 20%+ users refer others
- Wallet connections: 80%+ conversion from landing

### 6.2 Activation
- Onboarding completion: 90%+
- First record upload: 70% within 24hrs
- Profile completion: 60%+

### 6.3 Engagement
- DAU/MAU ratio: 30%+
- Average session duration: 5+ minutes
- Records uploaded per user: 5+

### 6.4 Retention
- Week 1 retention: 60%+
- Month 1 retention: 40%+
- Login reminder response: 25%+

### 6.5 Revenue (Future)
- Data marketplace transactions
- Premium subscription conversion
- B2B enterprise licenses

---

## 7. Competitive Analysis

| Feature | Selora | PatientSky | Health Gorilla | Medicalchain |
|---------|--------|------------|----------------|--------------|
| Blockchain | IOTA | None | None | Ethereum |
| Patient Ownership | ✅ Full | ❌ | ❌ | ✅ Partial |
| Data Monetization | ✅ | ❌ | ❌ | ✅ |
| zkLogin | ✅ | ❌ | ❌ | ❌ |
| IPFS Storage | ✅ | ❌ | ❌ | ✅ |
| Multi-Portal | ✅ | ❌ | ✅ | ❌ |
| PWA | ✅ | ✅ | ❌ | ❌ |

---

## 8. Roadmap

### Phase 1: MVP (Current → Q1 2026)
- ✅ Core patient portal
- ✅ Doctor portal basics
- 🔄 Mobile responsiveness
- 🔄 Notification preferences
- ⏳ Smart contract deployment
- ⏳ Doctor verification

### Phase 2: Beta (Q2 2026)
- Push notifications
- QR access system
- Data export
- Appointment scheduling
- 1,000 beta users

### Phase 3: Launch (Q3 2026)
- Mainnet deployment
- Multi-language support
- Wearable integration
- 10,000 users
- First B2B partnerships

### Phase 4: Scale (Q4 2026+)
- Research marketplace live
- Insurance integrations
- 100,000 users
- Series A fundraise

---

## 9. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Blockchain adoption barriers | High | Medium | zkLogin removes wallet friction |
| HIPAA compliance | High | Low | Encryption + access controls |
| User data loss | Critical | Low | IPFS redundancy + backups |
| Smart contract bugs | High | Medium | Audits + testnet validation |
| Low user engagement | Medium | Medium | Gamification + reminders |

---

## 10. Appendix

### 10.1 Database Schema (Current)
- `doctor_profiles` - Verified doctor information
- `notifications` - User notifications
- `user_stats` - Gamification metrics
- `waitlist` - Pre-launch signups

### 10.2 Key Integrations
- IOTA Network (blockchain)
- Pinata (IPFS gateway)
- Lovable Cloud (backend)

### 10.3 Documentation Links
- `/whitepaper` - Technical whitepaper
- `/executive-summary` - Investor overview
- `/demo-script` - Product walkthrough
- `/investor-faq` - Common questions

---

*This PRD is a living document and will be updated as the product evolves.*
