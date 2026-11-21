# RemoteJob.io – Free, Skill-Based Job Recruitment Platform

A modern, responsive, 100% free recruitment web application connecting job seekers, freelancers, and recruiters. Built with **React.js**, **Django REST Framework**, and **Python**.

Designed to recreate the original reference UI with high fidelity while delivering advanced features:
- **Blind Hiring & Controlled Reveal**: Objective screening hiding candidate names, photos, and contact info until shortlisted.
- **Python Resume Parsing & Skill Matching**: Automatic PDF text extraction and Compatibility Score formula.
- **Role-Based Portals**: Dedicated workspaces for Candidates, Recruiters, and Administrators.
- **Interactive Interview Scheduling**: Multi-timezone meeting coordinator with `.ics` calendar exports.
- **100% Free Compliance**: No subscription plans, pricing tiers, or hidden fees.

---

## 🌟 Visual Originality & Reference UI Alignment

All 8 sections from the reference UI are faithfully recreated:
1. **Header & Navigation**: Brand logo `remotejob.io` with green accent, Jobs link, Insights dropdown, Sign Up pill button, and Log In.
2. **Hero Section**: Serif typography *"Work Globally. Locally."*, subtitle, *"Hire Independents"* & *"Get Hired"* buttons, and the floating avatar collage.
3. **Featured Opportunities**: Search bar with *"Jobs | People"* toggle, category tabs (*Featured*, *Software Engineers*, *UI/UX*, *Project Management*, *Accounting*, *Hybrid Jobs*, *International Companies*, *Remote*), and 4-column cards with matching badges.
4. **Discover Expert Talent**: 4 pastel-tinted cards (*Software Engineers*, *Creative Designer*, *Project Leaders*, *Software Engineers*) with skill tags.
5. **How It Works**: 3-step workflow (*Create Account*, *Explore Opportunities*, *Connect & Grow*) with an interactive *For Candidates / For Recruiters* toggle.
6. **Free Banner**: Exact styling `🎁 100% Free to Use — No Subscription Plans`.
7. **Frequently Asked Questions**: Accordion with all 7 questions and detailed answers.
8. **Footer**: Navigation columns (*About*, *Trending*, *Connect With Us*), social icons, and copyright.

---

## 🚀 Quick Start Guide

### 1. Start the Django Backend (Port 8000)
```powershell
# From the project root
.\run_backend.bat
# Or manually:
cd backend
python manage.py runserver 0.0.0.0:8000
```
Backend API will be running at: `http://localhost:8000/api/v1/`

### 2. Start the React Frontend (Port 5173)
```powershell
# In a separate terminal
.\run_frontend.bat
# Or manually:
cd frontend
npm.cmd run dev
```
Open your browser at: `http://localhost:5173`

---

## 🔑 Demo Accounts (Instant 1-Click Login)

The app features a **Demo Switcher** in the navigation bar and on the Auth modal for testing:

| Role | Email | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Candidate** | `candidate@demo.com` | `password123` | Upload resume, view compatibility %, apply, track timeline, export interviews |
| **Recruiter** | `recruiter@demo.com` | `password123` | Post vacancies, review blind candidate applications, reveal candidate identity, schedule interviews |
| **Administrator** | `admin@demo.com` | `password123` | System metrics, suspend/activate users, audit logs |

---

## 📐 Compatibility Score Formula

Computed dynamically on the backend (SRS Section 5.2):
$$\text{Compatibility}\,(\%) = \frac{2\,M_{\text{req}} + M_{\text{pref}}}{2\,N_{\text{req}} + N_{\text{pref}}} \times 100$$
- $M_{\text{req}}$ = Matched required skills
- $M_{\text{pref}}$ = Matched preferred skills
- $N_{\text{req}}$ = Total required skills
- $N_{\text{pref}}$ = Total preferred skills

---

## 📂 Project Architecture

```
Rec Portal/
├── backend/
│   ├── config/              # Django core settings & root URLs
│   ├── accounts/            # Custom User model, JWT authentication, RBAC
│   ├── profiles/            # Candidate & Recruiter profiles, Resumes, Experience
│   ├── jobs/                # Jobs, Categories, Skills, Saved Jobs
│   ├── applications/        # Applications, Status History timeline, Blind Hiring & Reveal
│   ├── interviews/          # Interview scheduler, .ics calendar exporter
│   ├── notifications/       # In-app notification center
│   ├── matching/            # PDF text extractor (pypdf), regex skill parser & scoring
│   ├── adminpanel/          # Metrics, FAQs, Audit Log
│   ├── seed_data.py         # Database seeding script with realistic data
│   └── test_features.py     # Automated test suite
│
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Hero, Featured, Talent, HowItWorks, FAQ, etc.)
│   │   ├── context/         # AuthContext (JWT tokens, user state, 1-click demo login)
│   │   ├── services/        # Axios API client (endpoints for all models)
│   │   ├── App.jsx          # Main application router
│   │   └── main.jsx         # React DOM mount point
│   ├── package.json
│   └── tailwind.config.js
│
├── run_backend.bat          # 1-click Windows backend launcher
├── run_frontend.bat         # 1-click Windows frontend launcher
└── README.md
```
