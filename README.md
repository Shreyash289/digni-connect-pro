# Digital Survivor Repository — Interactive Mockup

A fully functional, clickable mockup of the CAREVIA platform showing all 4 user portals, security features, and complete user flows.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# Opens at http://localhost:5173
```

## 📱 What You Can Do in the Mockup

### Login Flow
- Go to home page
- Choose demo account (Survivor / NGO / Recruiter / Admin)
- Enter OTP (auto-fill available)
- Select role
- Enter respective portal

### Survivor Portal
- ✅ View dashboard with profile completion status
- ✅ See progress tracker (5 stages)
- ✅ View job recommendations
- ✅ Create/edit profile (4-step form)
- ✅ Upload documents
- ✅ Apply for jobs

### Recruiter Portal
- ✅ Search survivor profiles
- ✅ Filter by location, skills, education, experience
- ✅ View survivor cards with masking
- ✅ Shortlist survivors
- ✅ Download resumes
- ✅ View detailed profiles

### NGO Portal
- ✅ View all managed survivors
- ✅ See placement stats
- ✅ Update survivor progress
- ✅ Upload documents
- ✅ Track placements

### Admin Portal
- ✅ Approve pending profiles
- ✅ View all analytics
- ✅ See NGO partner stats
- ✅ Monitor platform health
- ✅ View skill distribution

## 🔒 Security Features Demonstrated

1. **OTP-Only Login** — No passwords
2. **Data Masking** — Recruiters see limited info
3. **Role-Based Dashboards** — Each role sees different data
4. **Document Vault** — Secure file uploads
5. **Audit Trail** — Activity logging shown

## 📁 Project Structure

```
src/
├── pages/
│   ├── Login.jsx              # Login page
│   ├── OTPVerify.jsx          # OTP verification
│   ├── RoleSelect.jsx         # Role selection
│   ├── SecurityInfo.jsx       # Security showcase
│   ├── survivor/
│   │   ├── SurvivorDashboard.jsx
│   │   └── CreateProfile.jsx
│   ├── recruiter/
│   │   └── RecruiterDashboard.jsx
│   ├── ngo/
│   │   └── NGODashboard.jsx
│   └── admin/
│       └── AdminDashboard.jsx
├── components/
│   └── Layout.jsx             # Sidebar + header layout
├── data/
│   └── mockData.js            # Fake data (10 survivors, 6 jobs, etc)
├── App.jsx                    # Router setup
└── index.css                  # Tailwind + animations
```

## 🎨 Design System

- **Color palette**: Navy (#0C1F3F), Blue (#2563EB), Teal (#0D9488)
- **Typography**: Plus Jakarta Sans (display), Inter (body)
- **Components**: Cards, buttons, badges, progress bars
- **Animations**: Fade in, slide in, float, shimmer

## 🔐 Demo Accounts

```
Survivor:  survivor@demo.com    (OTP: 427891)
NGO:       ngo@demo.com         (OTP: 427891)
Recruiter: recruiter@demo.com   (OTP: 427891)
Admin:     admin@demo.com       (OTP: 427891)

All use same OTP for demo purposes
```

## 📊 Mock Data Included

- **10 survivors** with varied skills, education, and stages
- **6 job postings** from different companies
- **4 NGO partners** with different stats
- **Analytics dashboard** with skill distribution and placement rates

## 🛠️ Tech Stack

- React 18
- Vite (ultra-fast bundler)
- Tailwind CSS
- React Router v6
- Mock data (no backend required)

## 📝 Demo Script for Tomorrow

1. **Login**: "No passwords. Just OTP authentication."
2. **Role Select**: "4 different portals for 4 user types."
3. **Survivor Dashboard**: "Survivors track their journey to employment."
4. **Profile Form**: "Multi-step form captures all required information."
5. **Recruiter Portal**: "Recruiters search by skills, location, education."
6. **Data Masking**: "Notice recruiters see initials, not names."
7. **Admin**: "Admin approves profiles and monitors analytics."
8. **Security Info** (optional route): "Show the 4-layer privacy shield."

## 🚀 For Production

This mockup is a **visual prototype**. For real deployment, you need:
- ✅ Supabase backend (database, auth, storage)
- ✅ Real RLS policies
- ✅ Document encryption
- ✅ Payment gateway (recruiter subscriptions)
- ✅ Email service (OTP, notifications)
- ✅ AI agent integration
- ✅ Analytics tracking

See `SECURITY_PRIVACY_ARCHITECTURE.md` for full production requirements.

## 📄 Documentation

- `SECURITY_DEMO_REFERENCE.md` — Quick security reference for presentation
- `SECURITY_PRIVACY_ARCHITECTURE.md` — Complete security architecture (separate file)

## 💡 Tips for Demo

- Use Chrome DevTools to show responsive design
- Shortlist a few survivors to show functionality
- Try different filter combinations
- Use Admin portal to approve pending profiles
- Point out data masking in recruiter portal

---

**Built for**: SRM University × RRU Pondicherry × CAREVIA
**Purpose**: Interactive mockup for government project demo
**Demo Date**: Tomorrow (show it off! 🎉)
