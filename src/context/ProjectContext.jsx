import { createContext, useContext, useState } from "react";

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [projectCount, setProjectCount] = useState(0);
  return (
    <ProjectContext.Provider value={{ projectCount, setProjectCount }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}
