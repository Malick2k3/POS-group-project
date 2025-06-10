# WD2 Final Project Specifications

This document outlines the requirements for the final projects of the Web Dev 2 course Soring 2025.
Each project must adhere to the following specifications to ensure a comprehensive and well-executed deliverable.

**1. Project Repository and Documentation:**

* A dedicated GitHub repository is required for each project.
* The repository must include a comprehensive `README.md` file containing the following information:
    * **Project Overview:** A clear description of the project's purpose and its key components (both frontend and backend).
    * **Component Breakdown:** Detailed explanations of each component, including its functionality and technologies used.
    * **Setup and Execution:** Clear and concise instructions on how to run both the frontend and backend components locally.

**2. Contribution Tracking:**

* The commit history within the GitHub repository should clearly demonstrate the individual contributions of each team member.

**3. Deployment Requirements:**

* **Frontend Deployment:** The frontend application must be deployed to a publicly accessible URL using one of the following platforms:
    * Vercel
    * Netlify
    * Firebase Hosting (Note: Firebase App Hosting is not permitted)
    * A self-managed server
* **Backend and Database Deployment:**
    * The backend application and its associated database can be deployed on the same server or on separate infrastructure.
    * Acceptable database technologies include:
        * MySQL
        * PostgreSQL
        * MongoDB
    * Serverless database solutions like Firebase Realtime Database or Firestore may be used as supplementary data storage alongside the primary backend database.
    * Use an ORM framework of your choice for the backend and database communication

**4. Security and Authentication:**

* **Robust Authentication:** Implement strong authentication mechanisms to secure the application.
* **Role-Based Access Control (RBAC):** Where applicable, implement role-based access control on API endpoints. This should be achieved through middleware or similar mechanisms to enforce authorization based on user roles.
* **Token Management:** Implement a secure token management system that includes both access tokens and refresh tokens.

**5. API Logging:**

* Implement comprehensive logging for all backend API endpoints. Utilize established logging packages for Node.js (or the chosen backend framework) to track relevant metrics and application behavior.

**6. API Documentation:**

* The `README.md` file must include a detailed description of each backend API endpoint, including:
    * HTTP method (e.g., `GET`, `POST`, `PUT`, `DELETE`)
    * Endpoint URL
    * Request parameters (if any)
    * Request body format (if applicable)
    * Response format (including data structure and possible status codes)

**7. Deployment URLs:**
In the global Readme  file include the link of the deployed frontend (knowing that it will communicate with it's backend)