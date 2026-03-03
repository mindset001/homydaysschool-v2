import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getClass } from "../services/api/calls/getApis";
import { getAccessToken } from "../utils/authTokens";

// import React from 'react'
interface classesInterface {
  id: string;
  name: string;
  abbreviation?: string;
  grade: string;
  section?: string;
}
interface useClassesI {
    classNameData: classesInterface[];
    classError: Error | null;
    isClassError: boolean;
    isClassLoading: boolean;
}
const useClasses = () : useClassesI => {
  // Check if user is authenticated
  const token = getAccessToken();
  
//   const [classNameData, setClassNameData] = useState<classesInterface[]>([]);
  // GETTING CLASS Data
  const {
    data: classData,
    isError: isClassError,
    error: classError,
    isLoading: isClassLoading,
  } = useQuery({
    queryKey: ["class"],
    queryFn: () => getClass(),
    enabled: !!token, // Only run query if token exists
    retry: 2, // Retry twice on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Log for debugging
  if (classError) {
    console.error('Error fetching classes:', classError);
  }
  
//   const classes: classesInterface[] = useMemo(() => {
//     return (classData && classData.data.data) || [];
//   }, [classData]);
  const classNameData: classesInterface[] = useMemo(() => {
    if (!classData || !classData.data) {
      console.log('No class data available');
      return [];
    }
    
    // Handle backend response structure { classes: [...] }
    const classes = classData.data.classes;
    if (!Array.isArray(classes)) {
      console.log('Classes is not an array:', classes);
      return [];
    }
    
    console.log('Successfully fetched classes:', classes);
    
    // Map backend class structure to frontend structure
    return classes.map((cls: any) => ({
      id: cls._id || cls.id,
      name: cls.name,
      grade: cls.grade,
      section: cls.section,
      abbreviation: cls.name, // Use name as abbreviation
    }));
  }, [classData]);
//   useEffect(() => {
//     classes.length > 0 && setClassNameData(classes);
//   }, [classes]);

  return { classNameData, classError, isClassError, isClassLoading };
};

export default useClasses;
