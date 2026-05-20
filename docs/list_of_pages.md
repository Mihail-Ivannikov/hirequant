# 1. Public Zone (Unauthenticated)

## 1.1 Landing Page (Home)
- **Route:** `/`
- **Accessed From:** Direct URL, Logo click
- **Purpose:** Introduction. Contains the two main entry buttons: **"I am a Candidate"** and **"I am an Employer"**

## 1.2 Auth Page (Login/Register)
- **Route:** `/auth` (or `/login`)
- **Accessed From:** Buttons on the Landing Page
- **Purpose:** User inputs credentials
- **Features:** Toggle/tab to switch between **"Sign In"** and **"Sign Up"**
- **Next Step:** Redirects to Candidate Market or Employer Dashboard upon success


# 2. Candidate Zone

## 2.1 Vacancy Market (Job Feed)
- **Route:** `/jobs`
- **Accessed From:** Login success, Navigation Bar (Job Search)
- **Purpose:** List of all open vacancies
- **Key Features:**
  - Filters (Level, Type, Salary)
  - Search bar

## 2.2 Vacancy Details Page
- **Route:** `/jobs/:id`
- **Accessed From:** Clicking a job card on the Vacancy Market page
- **Purpose:** Detailed description of the job
- **Key Features:**
  - **"Apply"** button (opens Application Page/Modal)

## 2.3 Application Wizard (Apply Page)
- **Route:** `/jobs/:id/apply`
- **Accessed From:** **"Apply"** button on Vacancy Details Page
- **Purpose:** Form to submit the application
- **Key Features:**
  - Auto-filled personal info (if Profile exists)
  - CV upload/confirmation
  - Questionnaire/Test (if required by employer)

## 2.4 Candidate Profile (Personal Cabinet)
- **Route:** `/profile`
- **Accessed From:** Navigation Bar (Avatar/Name)
- **Purpose:** Edit personal data and upload the **"Master CV"**
- **Key Features:**
  - Data entered here automatically fills the Application Wizard

## 2.5 My Applications (Inbox)
- **Route:** `/my-applications`
- **Accessed From:** Navigation Bar
- **Purpose:** List of all jobs the candidate applied to with status (Review / Accepted / Rejected)
- **Key Features:**
  - Clicking a specific application opens the Chat if the status is **"Accepted / Contact"**


# 3. Employer Zone

## 3.1 Employer Dashboard (My Vacancies)
- **Route:** `/employer/dashboard`
- **Accessed From:** Login success, Navigation Bar
- **Purpose:** List of jobs created by this employer
- **Key Features:**
  - **"Add Vacancy"** button
  - **"View Applicants"** button on existing jobs

## 3.2 Job Constructor (Create / Edit)
- **Route:** `/employer/jobs/create`  
  or `/employer/jobs/edit/:id`
- **Accessed From:** **"Add Vacancy"** button on Employer Dashboard
- **Purpose:** Create a new job post
- **Key Features:**
  - Job description form
  - **"Required Skills"** input (for AI)
  - Quiz Builder

## 3.3 Applicant List (AI Ranking Page)
- **Route:** `/employer/jobs/:id/applicants`
- **Accessed From:** Clicking a specific job on Employer Dashboard
- **Purpose:** View all candidates for this job
- **Key Features:**
  - **Top 10 Section:** Candidates sorted by AI Suitability Score
  - **All Candidates Section:** Unsorted list (or sorted by date)

## 3.4 Candidate Review (Detailed View)
- **Route:** `/employer/applications/:applicationId`
- **Accessed From:** Clicking a candidate's name on the Applicant List
- **Purpose:** Deep dive into one candidate
- **Key Features:**
  - View CV (PDF)
  - View AI Analysis (why they matched)
  - Action buttons: **"Reject"**, **"Contact / Accept"**
  - Chat interface opens if **"Contact"** is clicked


# 4. Summary of Navigation Fl
