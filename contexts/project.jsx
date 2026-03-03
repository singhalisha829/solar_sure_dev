import { requestHandler } from "@/services/ApiHandler";
import {
  getProjectDetails,
  getSalesPersons,
  getProjects,
  getBOMContigency,
} from "@/services/api";
import { useRouter } from "next/router";
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { dateFormatInYYYYMMDD } from "@/utils/formatter";

const ProjectContext = createContext();

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}

export function ProjectProvider({ children }) {
  const router = useRouter();
  const { projectId } = router.query;
  const [projectDetails, setProjectDetails] = useState(null);
  const [electricalSalespersons, setElectricalSalespersons] = useState([]);
  const [mechanicalSalespersons, setMechanicalSalespersons] = useState([]);
  const [isLoading, setIsLoading] = useState([]);
  const [projects, setProjects] = useState([]);
  const [contigencyBomList, setContingencyBomList] = useState([]);

  const getProjectsHandler = async (queryParams = {}) => {
    if (Object.keys(queryParams).length > 0) {
      Object.keys(queryParams).map((paramKey) => {
        if (paramKey === "start_date" || paramKey === "end_date") {
          queryParams[paramKey] = dateFormatInYYYYMMDD(queryParams[paramKey]);
        }
      });
    }
    await requestHandler(
      async () => await getProjects(queryParams),
      setIsLoading,
      (data) => {
        setProjects(data.data.output);
      },
      toast.error
    );
  };

  const fetchProjectContigency = async () => {
    await requestHandler(
      async () => await getBOMContigency({ project: projectId }),
      null,
      (data) => {
        setContingencyBomList(data.data.output);
      },
      toast.error
    );
  };

  const getProjectDetailsHandler = async () => {
    requestHandler(
      async () => await getProjectDetails(projectId),
      setIsLoading,
      (data) => {
        setProjectDetails(data.data.output[0]);
      },
      toast.error
    );
  };

  const fetchEngineeringSalespersons = async (role) => {
    await requestHandler(
      async () => await getSalesPersons(role),
      null,
      async (data) => {
        if (role === "in_roof_lead_electrical") {
          setElectricalSalespersons(data.data.output);
        } else if (role === "in_roof_lead_mechanical") {
          setMechanicalSalespersons(data.data.output);
        }
      },
      toast.error
    );
  };

  const refetchProjectDetails = () => {
    // Call getProjectDetailsHandler to fetch projectDetails again
    getProjectDetailsHandler();
  };

  useEffect(() => {
    getProjectsHandler();
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        isLoading,
        projectDetails,
        getProjectDetailsHandler,
        fetchEngineeringSalespersons,
        projectId,
        getProjectsHandler,
        projects,
        refetchProjectDetails,
        electricalSalespersons,
        mechanicalSalespersons,
        fetchProjectContigency,
        contigencyBomList,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
