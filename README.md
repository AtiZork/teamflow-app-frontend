
# TeamFlow Frontend

The **TeamFlow Frontend** is a React-based web application that serves as the user interface for the **TeamFlow** platform — a modern team collaboration and project management system inspired by tools like Jira and Trello.  
It provides an intuitive and responsive interface for managing organizations, projects, tasks, team members, and invitations, seamlessly integrating with the FastAPI backend.

Repository: [https://github.com/haroonsajid-ai/teamflow-frontend](https://github.com/haroonsajid-ai/teamflow-frontend)



## Project Overview

The **TeamFlow Frontend** is built with **React** and **Vite**, focusing on speed, modularity, and scalability.  
It allows organizations to manage their workflows through an interactive dashboard, task boards, and dynamic collaboration features.  
This frontend consumes RESTful APIs from the FastAPI backend to provide real-time updates and secure user experiences.

Backend Repository: [https://github.com/haroonsajid-ai/teamflow-backend](https://github.com/haroonsajid-ai/teamflow-backend)



## Key Features

- **Authentication System** – Secure login and registration integrated with JWT-based backend authentication.
- **Organization Management** – Create and manage organizations with member role assignments.
- **Project Dashboard** – View and manage multiple projects with progress tracking.
- **Task Management** – Create, update, assign, and track tasks across projects.
- **Invitation System** – Send and accept invitations via email.
- **Collaboration Interface** – Task commenting, work logs, and activity tracking.
- **AI Chat Integration** – Built-in AI assistant for quick help and recommendations.
- **Responsive Design** – Fully optimized for desktops, tablets, and mobile devices.
- **Reusable Components** – Modular architecture for scalability and maintainability.



## Tech Stack

| Category | Technology |
|-----------|-------------|
| Framework | React 18+ |
| Build Tool | Vite |
| Routing | React Router |
| API Communication | Axios |
| State Management | React Context API & Custom Hooks |
| Styling | Tailwind CSS / CSS Modules |
| Backend Integration | FastAPI REST APIs |
| Deployment | Vercel / Netlify / Static Hosting |



## Folder Structure

```markdown
teamflow-frontend/
├── node_modules/ 
├── public/
│   └── index.html
├── src/
│   ├── api/                # Centralized API calls (axios/fetch wrappers)
│   ├── components/         # Reusable UI components
│   ├── context/            # Global state management (Auth, Dashboard)
│   ├── hooks/              # Custom React hooks
│   ├── modals/             # Reusable modal components
│   ├── pages/              # Main route-level pages (Dashboard, Login, etc.)
│   ├── styles/             # Global styles (CSS/Tailwind)
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
└── .gitignore 
└── eslint.config.js
└── index.html
└── package.json 
└── package-lock.json
└── README.md
└── vercel.json
└── vite.config.js

````

### Key Directories

* **src/api/** – Contains all API request handlers using Axios.
* **src/components/** – Reusable UI components and modals.
* **src/context/** – Global state management using React Context API.
* **src/pages/** – Page-level components for routing and UI screens.
* **src/hooks/** – Custom hooks for authentication and logic reuse.
* **src/assets/** – Application assets such as images and icons.



## Installation Guide

Clone the repository:

```bash
git clone https://github.com/haroonsajid-ai/teamflow-frontend.git
cd teamflow-frontend
```

Install dependencies:

```bash
npm install
```



## Environment Configuration

Create a `.env` file in the root directory and define the following environment variable:

```
VITE_API_BASE_URL=https://your-backend-domain.com
```



## Running Locally

Start the development server:

```bash
npm run dev
```

By default, the application runs on:

```
http://localhost:5173
```

To build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## Backend Connection

This frontend consumes RESTful APIs from the **TeamFlow FastAPI backend**.
All Axios requests are configured using the `VITE_API_BASE_URL` defined in the `.env` file.
For detailed API specifications, refer to the backend documentation:

**Backend Repository:** [https://github.com/haroonsajid-ai/teamflow-backend](https://github.com/haroonsajid-ai/teamflow-backend)


## Build & Deployment

To deploy the TeamFlow frontend:

1. Build the production version:

   ```bash
   npm run build
   ```
2. Deploy the generated `dist/` folder to a hosting platform such as:

   * **Vercel**
   * **Netlify**
   * **GitHub Pages**
   * **Any static web hosting service**

Ensure the environment variable `VITE_API_BASE_URL` is set correctly in the deployment environment.


## Contribution Guidelines

Contributions are welcome and encouraged.

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:

   ```bash
   git commit -m "Add your feature description"
   ```
4. Push to your fork and submit a Pull Request.

Ensure your code follows ESLint standards and includes clear comments where necessary.



## License

This project is licensed under the **MIT License**.
See the [LICENSE](LICENSE) file for more information.

---

## Contact

**Maintainer:** [Haroon Sajid](https://github.com/haroonsajid-ai)
**Project Repositories:**

* Frontend: [https://github.com/haroonsajid-ai/teamflow-frontend](https://github.com/haroonsajid-ai/teamflow-frontend)
* Backend: [https://github.com/haroonsajid-ai/teamflow-backend](https://github.com/haroonsajid-ai/teamflow-backend)

```
