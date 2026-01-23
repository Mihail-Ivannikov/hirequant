# Technical Specification: Intelligent Recruitment System

## 1. Project Overview
**Title:** Intelligent Automated Recruitment System with Competency Analysis
**Goal:** Develop a web service that automates candidate screening by extracting data from resumes, analyzing competencies via a custom-trained AI model, and ranking candidates against job requirements using vector similarity.

---

## 2. System Architecture
The system follows a **Microservices-based Architecture** consisting of two distinct services:
1.  **Main Application Service (Node.js/Nest.js):** Handles business logic, database management, authentication, and file storage.
2.  **Intelligence Microservice (Python):** A dedicated computational service for Natural Language Processing (NLP), ML inference, and vector mathematics.

---

## 3. Technology Stack

### A. Frontend (Client-Side)
*   **Framework:** **React 18** (built with **Vite** for performance).
*   **Language:** **TypeScript** (for type safety and better code structure).
*   **Styling:** **Tailwind CSS** (for rapid UI development).
    *   *UI Component Library:* **Shadcn/UI** or **Mantine** (to save time on pre-built components like buttons, modals, inputs).
*   **State Management:** **TanStack Query (React Query)** (efficiently managing server state and caching).
*   **Routing:** **React Router v6**.
*   **API Client:** **Axios** (for HTTP requests).

### B. Backend (Main Service)
*   **Framework:** **Nest.js** (Scalable Node.js framework).
*   **Language:** **TypeScript**.
*   **Database:** **PostgreSQL** (Relational database for Users, Jobs, Applications).
*   **ORM:** **Prisma** (Modern ORM, easier and faster to implement than TypeORM).
*   **Real-time Communication:** **Socket.io** (For the Chat feature between Candidate and Employer).
*   **File Handling:**
    *   **Multer:** For handling `multipart/form-data` (PDF/DOCX uploads).
    *   **PDF-Parse:** For extracting raw text strings from PDF files before processing.
*   **Authentication:** **Passport.js + JWT** (JSON Web Tokens).

### C. AI & Machine Learning Microservice (The Core Intelligence)
*This section replaces external APIs (like OpenAI) with local, custom-engineered solutions.*

*   **Language:** **Python 3.9+**.
*   **Web Framework:** **FastAPI** (High-performance, easy-to-use API for serving the model).
*   **NLP Framework:** **spaCy**.
    *   *Usage:* Used to build and train a **Custom Named Entity Recognition (NER)** model.
    *   *Task:* Automatically detecting and extracting entities labeled `SKILL`, `DEGREE`, `EXPERIENCE_YEARS` from unstructured text.
*   **Vector Embeddings:** **Sentence-Transformers** (HuggingFace).
    *   *Model:* `all-MiniLM-L6-v2` (Lightweight, fast, high accuracy).
    *   *Usage:* Converting Job Descriptions and Resumes into high-dimensional vector space.
*   **Math & Analysis:** **scikit-learn** & **NumPy**.
    *   *Usage:* Calculating **Cosine Similarity** between vectors to generate the "Suitability Score" (0-100%).
*   **Training Data Handling:** **Pandas**.

### D. DevOps & Tools
*   **Containerization:** **Docker** & **Docker Compose**.
    *   *Why:* To run the Nest.js backend, Python AI service, and PostgreSQL database simultaneously with a single command.
*   **Version Control:** **Git** / **GitHub**.
*   **API Testing:** **Postman** or **Swagger** (Built into Nest.js and FastAPI).

---

## 4. detailed AI Implementation Logic
To satisfy the requirement of "creating AI," the project implements a **Semantic Search & Extraction Pipeline**:

### Step 1: Custom Training (Offline Phase)
1.  **Dataset:** Utilization of an annotated Resume Entity dataset (JSON format).
2.  **Training:** Fine-tuning a `spaCy` blank model to recognize specific domain entities (Skills, Job Titles) that standard models miss.
3.  **Output:** A serialized model file (`model_best`) loaded into the Python service.

### Step 2: Resume Processing (Runtime)
1.  User uploads PDF to Nest.js.
2.  Nest.js extracts raw text -> Sends text to Python Service.
3.  **Extraction:** Python loads the **Custom NER Model** to tag specific skills (e.g., extracting "React," "Nest.js" as `SKILL`).

### Step 3: The Ranking Algorithm (Vector Space)
1.  **Encoding:** The system uses a Transformer model (BERT-based) to convert the **Job Requirements** and **Resume Text** into 384-dimensional dense vectors.
2.  **Comparison:** The system calculates the cosine similarity angle between the two vectors.
    *   *Formula:* `Similarity = (A . B) / (||A|| * ||B||)`
3.  **Result:** A percentage match (e.g., 85%) is returned to the dashboard.

---

## 5. Implementation Roadmap (4 Weeks)

*   **Week 1:** Setup Monorepo. Configure PostgreSQL and Nest.js Auth. Build Basic React Login/Register.
*   **Week 2 (AI Focus):** Setup Python environment. Download dataset. Write script to train spaCy model. Create FastAPI endpoint to accept text and return similarity score.
*   **Week 3:** Integration. Connect Nest.js upload to Python analysis. Store results in Postgres. Build Employer Dashboard to see ranked candidates.
*   **Week 4:** Chat feature (Socket.io). Candidate Questionnaires. UI Polish. Dockerize everything for final presentation.