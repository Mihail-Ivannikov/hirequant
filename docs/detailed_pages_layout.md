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


# Auth Page — Detailed Description & Structure

# 1. Detailed Description & Functional Logic

The **Auth Page** is the security gateway of the application. Its primary function is **Identity Verification (Authentication)** and **Role Assignment (Authorization)**.  
Since the application behaves completely differently for an **Employer (Job Creator)** versus a **Candidate (Job Seeker)**, this page must enforce a clear distinction between the two user types during the registration process.

---

## A. Mode Switching (Login vs. Register)

**Purpose:**  
Allow users to switch between creating a new account and accessing an existing one without leaving the page.

**Functionality:**
- **Login Mode**
  - Requires only **Email** and **Password**
  - The backend automatically identifies the user’s role based on the database record
- **Register Mode**
  - Expands the form to include **Role Selection**
  - This is the critical moment where the user defines their path

---

## B. Role Selection (The “Fork in the Road”)

**Purpose:**  
Determine which database table the user belongs to (`users_candidate` vs `users_employer`) and which dashboard to load next.

**Functionality:**
- **“I am a Candidate”**
  - Registers the user as a job seeker
  - On success, redirects to the **Profile Builder** or **Job Market**
- **“I am an Employer”**
  - Reveals an additional **Company Name** field
  - On success, redirects to the **Employer Dashboard**

---

## C. Feedback & Validation

**Purpose:**  
Prevent invalid data (e.g., incorrect email format, weak passwords) from reaching the **NestJS backend**.

**Functionality:**
- Real-time validation  
  - Example: *“Password must be at least 8 characters”*
- API error handling  
  - Example: *“User already exists”*
- Feedback is shown via:
  - Toast notifications, or
  - Red alert message boxes

---

# 2. Hierarchical Structure

- **[Page: Authentication]** (`/auth`)
  - **[Parent] Split Layout Container**
    - **[Child] Left Panel (Branding & Visuals)**
      - **Logo Area**
        - **Icon:** SmartRecruit Logo
        - **Text:** *SmartRecruit AI*
      - **Value Proposition Text**
        - **Headline:** *“Unlock your potential.”*
        - **Subtext:**  
          *“Join the platform where AI connects skills to opportunities.”*
      - **Dynamic Testimonial** *(Optional)*  
        - Example: *“Helped me hire in 2 days!”*

    - **[Child] Right Panel (Interactive Form)**
      - **Mode Toggle Tabs**
        - **Tab Button:** *Sign In*  
          - Active state hides extra fields
        - **Tab Button:** *Sign Up*  
          - Active state reveals role selection
      - **Form Container**
        - **Role Selection Group** *(Visible only in “Sign Up” mode)*
          - **Radio/Button:** Candidate *(Default)*
          - **Radio/Button:** Employer
        - **Input Fields**
          - **Full Name**  
            - Placeholder: *“John Doe”*
          - **Email Address**  
            - Validation: must be a valid email format
          - **Company Name**  
            - Conditional: visible only if *Employer + Sign Up* is selected
          - **Password**  
            - Type: password  
            - Includes *Show / Hide* eye icon
        - **Utilities**
          - **Checkbox:** Remember me
          - **Link:** Forgot Password?
        - **Submit Action**
          - **Primary Button:**  
            - Text changes dynamically: *“Login”* / *“Create Account”*
          - **Loading Spinner:**  
            - Visible during API requests
        - **Social Auth Divider** *(Optional Extension)*
          - **Text:** *“Or continue with”*
          - **Button:** Google Login
          - **Button:** GitHub Login
        - **Error / Success Toaster**
          - Floating element for API feedback



## 2.1 Vacancy Market (Job Feed) — Detailed Description & Structure

### 1. Detailed Description & Functional Logic

The **Vacancy Market** is the central hub for the **Candidate**. It acts as a job search engine.  
Unlike a standard job board, this page integrates **AI Competency Analysis** directly into the browsing experience.

---

### A. The Search & Filter Engine

**Purpose:**  
Narrow down hundreds of job listings to those that best match the user’s criteria.

**Functionality:**
- **Real-time Filtering**
  - Users can toggle options like **“Remote only”** or **“Junior level”**
  - The job list updates instantly (powered by **React Query**)
- **Keyword Search**
  - Searches job titles and descriptions
  - Implemented on the **NestJS backend** using **PostgreSQL ILIKE** or **full-text search**

---

### B. The AI-Enhanced Feed (The “Smart” Part)

**Purpose:**  
Guide candidates toward vacancies where they have a higher probability of success.

**Functionality:**
- **Visual Ranking**
  - If the candidate is logged in and has an uploaded resume, each job card displays a **Match Score** badge
- **Logic**
  - The frontend receives a `matchPercentage` field from the API
- **Match Score Indicators**
  - **Green Badge (>80%)** — *High Match* (strongly encourages applying)
  - **Yellow Badge (50–79%)** — *Potential Match*
  - **Red / Gray Badge (<50%)** — *Low Match* (indicates missing skills)

---

### C. The Job Card (UI Component)

**Purpose:**  
Provide a quick snapshot of the vacancy.

**Functionality:**
- Displays key metadata:
  - Salary
  - Location
  - Technology stack tags
- Clicking anywhere on the card navigates to the **Vacancy Details Page**

---

## 2. Hierarchical Structure

- **[Page: Vacancy Market]** (`/jobs`)
  - **[Parent] Global Navigation** *(Shared Component)*
    - **Logo**
    - **User Avatar / Profile Link**

  - **[Parent] Page Layout Grid**
    - **[Child] Sidebar Filter Panel** *(Left Column)*
      - **Filter Group: Experience Level**
        - Checkbox: Junior
        - Checkbox: Middle
        - Checkbox: Senior
      - **Filter Group: Job Type**
        - Checkbox: Remote
        - Checkbox: On-site
        - Checkbox: Hybrid
      - **Filter Group: Salary Range**
        - Input: Minimum ($)
        - Input: Maximum ($)
      - **Action**
        - Button: Reset Filters

    - **[Child] Main Feed Column** *(Right Column)*
      - **Search Header**
        - Search Input  
          - Placeholder: *“Search by title, skill, or company…”*
        - Search Button  
          - Icon: Magnifying Glass
        - Result Counter  
          - Example: *“Showing 42 jobs”*

      - **Job List Container**
        - **Job Card Component** *(Repeated for each job)*
          - **Header Row**
            - Job Title (e.g., *React Developer*)
            - Post Date (e.g., *2 days ago*)
          - **Company Info**
            - Company Name
            - Location (e.g., *New York / Remote*)
          - **AI Insight Badge** *(Conditional: only if CV exists)*
            - Icon: Sparkles / Brain
            - Score Text: *“92% Match”* (Green)
          - **Tags Container**
            - Skill Pill: React
            - Skill Pill: TypeScript
            - Skill Pill: Node.js
          - **Footer Row**
            - Salary Badge (e.g., *$4k – $6k*)
            - Apply / View Button  
              - Action: Navigate to `/jobs/:id`

      - **Pagination Controls**
        - Button: Previous
        - Page Numbers: 1, 2, 3…
        - Button: Next


# Vacancy Details Page

## 1. Detailed Description & Functional Logic

The **Vacancy Details Page** is the landing page for a specific job posting.  
Its primary goal is to convert a visitor into an applicant.

Because the project focuses on **Competency Analysis**, this page goes beyond static job information. It actively demonstrates how well a candidate fits the role *before* they apply.

---

### A. Job Hero & Meta Data

**Purpose**  
Provide instant confirmation of the job’s key attributes.

**Functionality**
- Clearly displays:
  - Job Title
  - Salary Range
  - Location
- A highly visible **Apply** button
  - Stays sticky or prominently positioned
  - Ensures the user never has to search for it

---

### B. AI Insight Widget (Core Feature)

**Purpose**  
Explain the candidate’s **Match Score** using real data.

**Functionality**
- **Score Visualization**
  - Large circular or bar chart
  - Displays a percentage (example: `85%`)
- **Gap Analysis**
  - Dynamic skill comparison
    - Skills you have (green indicators)
    - Skills missing (red indicators)
- **Logic**
  - Data is generated by the same Python microservice used to rank candidates for employers
  - Ensures consistency between candidate view and employer view

---

### C. Detailed Content

**Purpose**  
Provide a legal and professional description of the role.

**Functionality**
- Rich text rendering using Markdown or HTML
- Sections include:
  - About the Role
  - Responsibilities
  - Requirements
  - Benefits

---

### D. Application Trigger

**Purpose**  
Start the application process.

**Functionality**
- Clicking **Apply** opens the Application Wizard (modal)
- Authentication logic:
  - If the user is not logged in, redirect to authentication
  - After login, return the user to the application flow

---

## 2. Hierarchical Structure

### Page Routing
- **Page:** Vacancy Details  
  - Route: `/jobs/:id`

---

### Global Navigation
- **Back Button**
  - Text: `← Back to Jobs`

---

### Main Layout Grid

#### Content Column (Left / Center)

##### Job Hero Section
- **Job Title**
  - H1: `Senior React Developer`
- **Meta Row**
  - Location: `London / Remote`
  - Salary: `$70k - $90k`
  - Posted Date: `Posted 3 hours ago`
- **Skill Tags**
  - `React`
  - `Nest.js`

---

##### AI Analysis Widget  
*Visible only if the candidate has an uploaded resume*

- **Header**
  - `Your Compatibility Profile`
- **Score Container**
  - Circular progress indicator: `85%`
  - Text feedback: `Great Match`
- **Skills Breakdown**
  - Matched Skills:
    - React
    - TypeScript
  - Missing Skills:
    - Docker

---

##### Job Description Body

- **About the Role**
  - Text block
- **Responsibilities**
  - Bullet list
- **Requirements**
  - Bullet list
- **Benefits**
  - Text block

---

#### Action Sidebar (Right)

##### Company Card
- Company Logo
- Company Name
- Short Bio  
  - Example: `Fintech startup focused on payments...`
- Link:
  - `View all jobs by this company`

---

##### Sticky Apply Box
- **Primary Button**
  - Text: `Apply Now`
  - Action: Opens Application Modal
- **Secondary Button**
  - Text: `Save for Later`
- **Info Text**
  - Example: `25 people have applied already`

---

### Application Modal  
*Hidden by default, displayed when "Apply Now" is clicked*

- **Modal Header**
  - `Apply for [Job Title]`
- **User Info Summary**
  - Example: `Applying as John Doe`
- **Resume Preview**
  - Example: `Attached: my_cv.pdf`
- **Dynamic Quiz Section** (optional)
  - Alert:
    - `This job requires a short test.`
  - Button:
    - `Start Assessment`
- **Final Action**
  - Button: `Send Application`


