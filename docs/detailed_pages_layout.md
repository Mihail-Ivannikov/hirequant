# Landing Page — Detailed Description & Structure

## 1. Detailed Description & Functional Logic

The **Landing Page** serves two critical purposes: **Education** and **Routing**.  
Since the system relies on complex backend logic (AI analysis, vector comparison), the frontend must simplify this for the user immediately. It also acts as a **traffic controller**, instantly separating user flows (**Candidate** vs **Employer**) to avoid confusion.

---

### A. Header (Navigation Hub)

**Purpose:**  
Provides persistent access to authentication and brand identity.

**Functionality:**
- **Logo**
  - Resets the state
  - Returns the user to the top of the landing page
- **Auth Actions**
  - **"Sign In"** button checks if a session exists
  - If no session is found, redirects to `/auth`
  - Role selection can be toggled on the auth page

---

### B. Hero Section (The Value Proposition)

**Purpose:**  
Capture the user’s attention within the first **3 seconds** and force a role selection.

**Functionality:**
- **The Hook**
  - Headline emphasizing speed and intelligence  
    _(e.g., "AI-Driven Hiring")_
- **The Split**
  - Two dominant buttons:
    - **"Find a Job"**
      - Redirects to Job Market (or Candidate Auth)
    - **"Hire Talent"**
      - Redirects to Employer Dashboard (or Employer Auth)
- **Logic**
  - Buttons pre-select the **Role** state in the registration form to save one extra step

---

### C. "The AI Engine" Section (Educational)

**Purpose:**  
Prove that the **AI** is not just a buzzword by explaining the **Competency Analysis** visually.

**Functionality:**
- Step-by-step visual explanation:
  - **Input:** PDF CV
  - **Process:** Python-based vector analysis
  - **Output:** Match Score
- Builds trust by showing the ranking is **fair and mathematical**

---

### D. Features Grid (Capabilities)

**Purpose:**  
Showcase secondary features beyond AI ranking.

**Functionality:**
- Highlights ecosystem tools:
  - Real-time Chat (Socket.io)
  - Quiz / Testing module
  - Kanban board for candidate tracking

---

## 2. Hierarchical Structure

### [Page: Landing Page]

#### [Parent: Global Header]
- **Brand Container**
  - Logo Icon *(Stylized Brain / Magnifying Glass)*
  - Project Name: **"SmartRecruit AI"**
- **Authentication Controls**
  - Login Button → `/auth`
  - Register Button → `/auth?mode=register`

---

#### [Parent: Hero Section]
- **Text Column**
  - Main Headline:  
    **"Stop Reading Resumes. Let AI Do It."**
  - Sub-Headline:  
    *"Automated competency analysis and candidate ranking based on vector similarity."*
  - Call-to-Action Group:
    - Candidate Button: **"I want to find a Job"**  
      *(Style: Secondary / Outline)*
    - Employer Button: **"I am an Employer"**  
      *(Style: Primary / Solid)*
- **Visual Column**
  - Illustration: *Dashboard Mockup*
  - Dynamic Element:
    - Animated badge: **"Resume Parsed: 92% Match"**

---

#### [Parent: "How It Works" Section]
- **Section Title:**  
  *"From PDF to Ranked Candidate in Seconds"*
- **Steps Container**
  - **Step 1**
    - Icon: Document Upload
    - Text: *"Candidate uploads PDF / DOCX"*
  - **Arrow Connector**
  - **Step 2**
    - Icon: AI Chip
    - Text: *"System extracts skills & calculates vector distance"*
  - **Arrow Connector**
  - **Step 3**
    - Icon: Ranked List
    - Text: *"Employer sees top 10 matches instantly"*

---

#### [Parent: Ecosystem Features]
- **Grid Container**
  - **Feature Card: Testing**
    - Title: *"Competency Quizzes"*
    - Description: *"Verify skills with custom tests."*
  - **Feature Card: Communication**
    - Title: *"Real-time Chat"*
    - Description: *"Discuss details directly on the platform."*
  - **Feature Card: Parsing**
    - Title: *"Smart Auto-Fill"*
    - Description: *"No manual data entry for candidates."*

---

#### [Parent: Global Footer]
- Copyright:
  - *"2024 Student Project"*
- Social Links:
  - GitHub (repository link)
  - LinkedIn
- Tech Stack Info:
  - *"Powered by React, NestJS, Python"*
