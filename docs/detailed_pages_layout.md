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


# Application Wizard Page

## 1. Detailed Description & Functional Logic

This page is the critical conversion point of the application. It is designed as a **Multi-Step Wizard** to guide the candidate through the process of submitting their data. It combines static profile data with dynamic, job-specific requirements (such as the **Competency Test**).

### A. Auto-Fill & Resume Logic

**Purpose**  
Reduce friction. Candidates should not have to enter the same information twice.

**Functionality**
- **State Hydration**  
  - On page load, the application fetches the user’s Profile data from **Nest.js**.
  - Fields such as **Name**, **Email**, and the default **Resume path** are pre-filled.
- **Resume Override**  
  - The user can choose to keep their **Master Resume** (from their profile) or upload a job-specific PDF.

---

### B. Competency Assessment (The “Test” Module)

**Purpose**  
Validate the skills claimed in the resume. This is the project’s unique selling point.

**Functionality**
- **Conditional Rendering**  
  - This section appears only if the employer attached a quiz to the Job ID.
- **Question Types Supported**
  - Multiple Choice (Radio)
  - Multiple Select (Checkbox)
  - Short Answer (Text)
- **Scoring**
  - Answers are sent to the backend.
  - The backend grades objective questions immediately.
  - The resulting score is attached to the user’s application.

---

### C. Submission & Feedback

**Purpose**  
Finalize the application.

**Functionality**
- **AI Trigger**
  - When **Submit** is clicked, the frontend sends the full payload to **Nest.js**.
  - Nest.js queues a **Python microservice** to re-analyze the selected resume against the specific job description.
  - A final `match_score` is generated.
- **Redirect**
  - On success, the user is redirected to the **My Applications** dashboard.

---

## 2. Hierarchical Structure

```text
[Page] Application Wizard (/jobs/:id/apply)
├── [Header] Minimal Header (distraction-free mode)
│   ├── [Link] ← Back to Job Details
│   └── [Job Context]
│       ├── [Text] Applying for Senior React Developer
│       └── [Text] at TechCorp Inc.
│
├── [Progress Stepper]
│   ├── [Step] 1. Contact Info (Active)
│   ├── [Step] 2. Resume
│   ├── [Step] 3. Skills Test (Conditional)
│   └── [Step] 4. Review
│
├── [Step 1] Personal Information
│   └── [Form Container]
│       ├── [Input] Full Name (Read-only / Editable)
│       ├── [Input] Email Address (Read-only)
│       ├── [Input] Phone Number (Auto-filled)
│       └── [Input] LinkedIn / Portfolio URL
│
├── [Step 2] CV Selection
│   ├── [Option Card] Use Profile CV
│   │   ├── [Radio] Selected
│   │   ├── [Icon] PDF File
│   │   └── [Text] my_master_resume.pdf (Uploaded on 12/05/2024)
│   └── [Option Card] Upload New
│       ├── [Radio] Unselected
│       └── [Upload Zone] Drop custom resume for this job
│
├── [Step 3] Competency Assessment (Dynamic)
│   ├── [Alert] This job requires a short skills test (5 mins)
│   └── [Question Container] (Repeater)
│       ├── [Question] What is the output of console.log(typeof null)?
│       ├── [Code Snippet] (Optional, syntax highlighted)
│       └── [Answers]
│           ├── ( ) A) Object
│           ├── ( ) B) Null
│           └── ( ) C) Undefined
│
├── [Step 4] Final Details
│   ├── [Cover Letter]
│   │   ├── [Label] Why are you a good fit?
│   │   └── [Textarea] Rich text or plain text
│   └── [Summary Card]
│       ├── [Text] You are applying as John Doe
│       ├── [Text] Resume: Custom.pdf
│       └── [Text] Test Status: Completed
│
└── [Action Footer]
    ├── [Button] Cancel (Back to Job Page)
    ├── [Button] Submit Application
    ├── [Text] Submit Application
    └── [Loading State] Analyzing compatibility...

```

# Candidate Profile (Personal Cabinet)

## 1. Detailed Description & Functional Logic

The **Candidate Profile** acts as the **Single Source of Truth (SSOT)** for the user.  
Its primary purpose is **data persistence and automation**.

Instead of repeatedly entering the same information for every job application, the user builds and maintains their profile once. This profile then powers AI-driven matching, recommendations, and auto-filled applications across the platform.


### A. Master Resume & Parsing Engine

**Purpose**  
To serve as the default resume for all applications and as the primary input source for AI recommendations.

**Functionality**

- **Upload & Parse**
  - When a user uploads a resume file, the frontend triggers the **Python Resume Parser**.
  - Supported formats: PDF (initially).

- **Auto-Population**
  - Parsed content is automatically mapped into:
    - Skills
    - Work Experience
    - Education
  - These sections are immediately reflected in the profile UI.

- **User Verification & Correction**
  - Parsing accuracy is not assumed to be perfect.
  - Users can:
    - Edit extracted entries
    - Add missing skills (e.g., adding `PostgreSQL` when the resume only states `SQL`)
  - Manual edits override AI-detected data.


### B. Skill Management (Vector Inputs)

**Purpose**  
To fine-tune the AI job-matching and recommendation algorithm.

**Functionality**

- **Tag-Based Skill System**
  - Skills are stored as discrete tags.
  - Each tag is converted into a vector embedding.

- **Weighting Logic**
  - Skills listed in the profile increase the user’s **Suitability Score** for roles requiring those skills.
  - Manually added skills and frequently confirmed skills can be weighted higher.

- **AI Awareness**
  - Auto-detected skills are visually differentiated from user-added skills.
  - User confirmation improves confidence scoring.


### C. Profile Completeness Gamification

**Purpose**  
To encourage users to provide richer, more accurate data.

**Functionality**

- **Profile Strength Indicator**
  - A progress bar displays overall profile completeness (e.g., `Profile 60% Complete`).

- **Completion Incentive**
  - Missing sections trigger contextual tips.
  - Higher completeness results in:
    - Better AI matching accuracy
    - More relevant job recommendations
    - Higher application success probability


## 2. Hierarchical Structure

### Page Structure

```

[Page: Candidate Profile] (/profile)

```


### Global Navigation

```

[Parent: Global Navigation]
├── [Child: Logo]
└── [Child: Links]
├── Jobs
├── Applications
└── Profile (Active)

```


### Page Layout Grid

```

[Parent: Page Layout Grid]
├── Left Sidebar (Identity & Contact)
├── Main Content Area (Resume & Details)
└── Sticky Footer / Action Bar

```

---

## Left Sidebar — Identity & Contact

```

[Child: Left Sidebar]
├── Avatar Module
│   ├── Image Container (Photo or Initials)
│   └── Upload Action (Camera Icon)
│
├── Identity Fields
│   ├── Input: Full Name
│   └── Input: Professional Headline
│       (e.g., "Senior Backend Engineer")
│
├── Contact Information
│   ├── Input: Email (Read-only / Verified)
│   ├── Input: Phone Number
│   └── Input: Location / City
│
├── Social Links
│   ├── Input: LinkedIn URL
│   └── Input: GitHub / Portfolio URL
│
└── Profile Strength Widget
├── Progress Bar (e.g., 85%)
└── Tip Text: "Add a bio to reach 100%"

```

---

## Main Content Area — Resume & Details

### Section: Master Resume

```

[Section: Master Resume]
├── Header: "Resume / CV"
└── Upload Card
├── Dropzone Area
│   └── Text: "Drag PDF here to auto-fill profile"
├── Current File Preview
│   ├── Icon: PDF
│   ├── Filename: My_CV_2024.pdf
│   └── Timestamp: "Uploaded 2 days ago"
└── Actions
├── Delete
└── Replace

```

---

### Section: Skills (AI Powered)

```

[Section: Skills]
├── Header: "Key Competencies"
├── Tag Container
│   ├── Skill Tag (Auto): "React"
│       Style: Blue (Detected from PDF)
│   ├── Skill Tag (Auto): "Node.js"
│   └── Skill Tag (Manual): "System Design"
│       Style: Gray (Added by user)
│
└── Add Skill Input
├── Typeahead Input: "Add a skill..."
└── Button: "Add"

```

---

### Section: Work Experience

```

[Section: Work Experience]
├── Experience Card (Repeater)
│   ├── Input: Job Title
│   ├── Input: Company Name
│   ├── Date Range Picker
│   │   └── Start Date – End Date
│   ├── Textarea: Description
│   └── Delete Button
│
└── Button: "+ Add Position"

```

---

### Section: Education

```

[Section: Education]
├── Education Card (Repeater)
│   ├── Input: Degree
│   ├── Input: University
│   └── Input: Graduation Year
│
└── Button: "+ Add Education"

```

---

## Sticky Footer / Action Bar

```

[Parent: Sticky Footer]
├── Status Message
│   └── "All changes saved" (Auto-save indicator)
└── Save Button
└── Primary Action: Persist profile to database

```

---

## Summary

The **Candidate Profile** is the foundation of the platform:

- Centralized data ownership
- AI-powered parsing and enrichment
- User-verified accuracy
- Gamified completeness
- Optimized for automation and scalability

It ensures users spend less time re-entering data and more time applying to the right opportunities.




# My Applications (Inbox) Page

## 1. Detailed Description & Functional Logic

This page is the candidate's personal tracking dashboard. Its primary function is to provide **clarity and communication**.

It answers the key question:

> "What is the status of my job applications?"

It also acts as a gateway to direct communication with recruiters once mutual interest is established.

---

### A. Status Tracking & Information Hub

**Purpose:**  
Provide a transparent, real-time view of the application pipeline.

**Functionality:**

- **Visual Status Indicators**
  - Color-coded badges for quick scanning
  - Eliminates the need to read each entry in detail

- **Sorting & Filtering**
  - Sort by: `Last Updated`, `Status`
  - Filter by: `Interview Stage`, etc.
  - Essential for users managing many applications

---

### B. Communication Gateway ("Inbox")

**Purpose:**  
Enable communication only when relevant and appropriate.

**Functionality:**

- **Conditional Access**
  - Chat is unlocked only when status is:
    - `Accepted`
    - `Contact`
    - `Interview`
  - Prevents spam and unsolicited messages

- **Notification System**
  - Visual indicators:
    - Red dot
    - "New Message" badge
  - Appears when recruiter sends a message

---

### C. Chat Interface

**Purpose:**  
Provide seamless in-app messaging.

**Functionality:**

- **Modal / Drawer UI**
  - Opens as overlay (no page navigation)
  - Keeps user in context

- **Real-time Communication**
  - Powered by Socket.io
  - Supports:
    - Instant messaging
    - "Typing..." indicators

---

## 2. Hierarchical Structure

### Page
- **My Applications** (`/my-applications`)

---

### Global Navigation
- Jobs
- Applications (Active)
- Profile

---

### Page Header
- **Title:** "My Applications"

- **Filter Bar**
  - **Sort Dropdown**
    - Newest
    - Status
  - **Filter Dropdown**
    - All
    - Under Review
    - Accepted

---

### Main Content: Application List Container

#### Application Item Card (Repeatable Component)

**Job Information**
- Job Title: *Senior Frontend Developer*
- Company: *Tech Solutions Inc.*

**Application Details**
- Timestamp: *Applied on: May 15, 2024*

- **Status Badge (Dynamic)**
  - Under Review → Yellow
  - Interview Stage → Blue
  - Accepted → Green
  - Rejected → Red

**Actions**
- **Button (Dynamic)**
  - "View Job" → Default / Inactive
  - "Open Chat" → Active *(only if status = Accepted)*

- **Notification Dot**
  - Visible if unread messages exist

---

### Empty State (Conditional)

- Icon: Empty Box
- Text:  
  > You haven't applied to any jobs yet.
- Link:  
  - "Find jobs now"

---

### Chat Modal / Drawer (Initially Hidden)

**Header**
- Recipient Info:  
  - "Chat with John Smith from Tech Solutions Inc."
- Close Button: `X`

**Message Area**
- Employer Message Bubble (repeated)
- Candidate Message Bubble (repeated)

**Input Area**
- Text Input
  - Placeholder: "Type your message..."
- Send Button
  - Icon: Paper Plane

# ================================================================
# EMPLOYER ZONE
# ================================================================


# Employer Dashboard (My Vacancies)

## 1. Detailed Description & Functional Logic

This page is the employer's **command center**. Its primary function is to provide an **operational overview** and act as the main **navigation hub** for recruitment activities.

It answers key questions:

> "What is the status of my open positions?"  
> "Where should I focus my attention right now?"

---

### A. At-a-Glance Analytics

**Purpose:**  
Provide a quick, data-driven summary of the recruitment pipeline.

**Functionality:**

- **Key Performance Indicators (KPIs)**
  - Displayed as **Stat Cards**
  - Includes:
    - Total Active Jobs
    - Total Applicants
    - New Applicants Requiring Review *(high priority)*
  - The "New Applicants" metric creates urgency and guides user action

---

### B. Vacancy Management Control Panel

**Purpose:**  
Manage and monitor all employer-created job postings.

**Functionality:**

- **Centralized List**
  - Table or list of all vacancies
  - Each entry acts as a mini-dashboard
  - Shows:
    - Job status (Open / Closed)
    - Applicant count (live)

- **Action-Oriented Design**
  - Each job includes key actions:
    - **View Applicants**
      - Navigates to AI-powered candidate list
    - **Edit / Manage**
      - Modify job details or close position

---

### C. Funnel Starting Point

**Purpose:**  
Provide a clear path to creating a new job posting.

**Functionality:**

- **Primary CTA: "Add Vacancy"**
  - Most visually prominent element
  - Starts recruitment workflow
  - Navigates to Job Constructor page

---

## 2. Hierarchical Structure

### Page
- **Employer Dashboard** (`/employer/dashboard`)

---

### Global Navigation (Employer Context)
- Logo
- Links:
  - Dashboard *(Active)*
  - Company Profile
- User Avatar / Logout

---

### Page Header
- **Title:** "My Vacancies Dashboard"

- **Primary Action Button**
  - `+ Add New Vacancy`
  - Style: Solid, prominent color

---

### Analytics Summary Row

- **Statistic Card 1**
  - Value: `5`
  - Label: "Active Jobs"

- **Statistic Card 2**
  - Value: `124`
  - Label: "Total Applicants"

- **Statistic Card 3**
  - Value: `12`
  - Label: "New Applicants (Needs Review)"
  - Style: Highlight / alert color

---

### Vacancy List Table

#### Table Header
- Job Title
- Status
- Applicants
- Actions

---

#### Vacancy Row (Repeatable Component)

**Job Info**
- Title: *Senior Backend Engineer*
- Date: *Created on: May 10, 2024*

**Status**
- Badge:
  - Open → Green
  - Closed → Gray

**Applicants**
- Text: `25 Total (8 New)`

**Actions**
- **Primary Button**
  - "View Applicants"
  - Route: `/employer/jobs/:id/applicants`

- **Secondary Button**
  - "Edit"
  - Route: `/employer/jobs/edit/:id`

- **More Menu (`...`)**
  - Close Vacancy
  - Delete

---

### Empty State (Conditional)

- Icon: Large `+` or empty folder
- Text:
  > You haven't posted any jobs yet.
- Button:
  - "Create Your First Vacancy"
  - Route: `/employer/jobs/create`


# Job Constructor (Create / Edit) Page

## 1. Detailed Description & Functional Logic

This page is one of the most critical components in the entire system. It is not just a job posting form — it is the **configuration panel for the AI Matching Engine**.

The data entered here directly influences how the backend vector similarity algorithm ranks and evaluates candidates.

---

## A. AI Competency Profiling (Required Skills Engine)

### Purpose
Define precise parameters used by the AI to evaluate candidate resumes.

### Functionality

- Employers input **Required Skills** as structured tags:
  - Example: `Node.js`, `System Architecture`, `B2B Sales`

- These tags are converted into a **Job Vector** by a Python microservice.

- The job description + skills together define ranking accuracy.

- If skipped, AI matching becomes less precise → UI must strongly emphasize importance.

---

## B. Candidate Fit Questionnaire (Pre-Screening Engine)

### Purpose
Create a structured questionnaire to evaluate whether a candidate is a good fit for the position before deeper evaluation.

This is **not a quiz**, but a **fit assessment tool** used to filter and qualify candidates based on role alignment, experience, and expectations.

---

### Functionality

- **Dynamic Form Engine**
  - Add, reorder, delete questions

- **Structured Evaluation Setup**
  - Questions are used to assess candidate suitability
  - Responses contribute to the overall matching and filtering process

- **No grading system**
  - Unlike a quiz, there are no correct/incorrect answers
  - Instead, responses are used for qualitative evaluation by the system or recruiter

---

## C. Contextual Modes (Create vs Edit)

### Purpose
Reuse the same UI for both job creation and editing.

### Functionality

- Route-based behavior:
  - `/employer/jobs/create`
  - `/employer/jobs/edit/:id`

- In **edit mode**:
  - Existing job data is fetched from backend (Nest.js)
  - Form fields are pre-filled
  - Tags and questionnaire items are restored

- UI changes:
  - "Publish Vacancy" → "Save Changes"

---

## 2. Hierarchical Structure

## Page
- **Job Constructor**
  - `/employer/jobs/create`
  - `/employer/jobs/edit/:id`

---

## Page Header

- Back Navigation
  - `← Back to Dashboard`

- Page Title
  - Create New Vacancy / Edit Vacancy

- Status Indicator
  - "Draft saved at 14:05"

---

## Main Form Layout

---

### Section 1: Basic Information

#### Header
- "Job Details"

#### Fields

- Job Title  
  - Placeholder: "e.g., Senior React Developer"

- Location & Work Model  
  - Dropdown:
    - Remote
    - Hybrid
    - On-site

- Salary Range  
  - Min / Max inputs

- Job Description  
  - Rich text editor (responsibilities, benefits, etc.)

---

### Section 2: AI Matching Criteria (Highlighted)

#### Header
- "Required Skills (For AI Analysis)"

#### Info Tooltip
> Add key skills here. Our AI uses these exact terms to parse and rank candidate resumes.

#### Fields

- Tags Input
  - Input: "Type a skill and press Enter..."
  - Example tags:
    - TypeScript [x]
    - REST API [x]

- Minimum Experience Level
  - Dropdown (e.g., 3+ years)

---

### Section 3: Candidate Fit Questionnaire (Optional)

#### Header
- "Candidate Fit Questionnaire (Optional)"

#### Toggle
- Enable Questionnaire for this job

---

### Questions Container (Conditional)

#### Question Block (Repeatable)

- Question Header
  - "Question 1"
  - Delete Icon

- Question Input
  - Example: "How do you prefer working in a team environment?"

---

#### Answer Fields (No Correct Option)

- Answer Input Row
  - Free-text or structured response input

- Button
  - "+ Add Answer Field" (if structured format is used)

- Button
  - "+ Add Another Question"

---

## Sticky Action Footer

- Cancel Button
  - "Discard"

- Secondary Button
  - "Save as Draft"

- Primary Button
  - "Publish Vacancy"
  - Triggers validation + POST/PUT request

