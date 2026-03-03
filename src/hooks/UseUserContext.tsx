import React, { createContext, useContext, useState, ReactNode } from "react";

// Define a dynamic user object interface
interface UserProfile {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allows any properties with any type
}

// Define the context type, including the setter function
interface UserContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  guardianActiveClassID: number;
  setGuardianActiveClassID: React.Dispatch<React.SetStateAction<number>>;
  guardianActiveStudentID: { id: number; isUserLoading: boolean };
  setGuardianActiveStudentID: React.Dispatch<
    React.SetStateAction<{ id: number; isUserLoading: boolean }>
  >;
}

// Create the context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Create a Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>({}); // Initialize with an empty object
  const [guardianActiveClassID, setGuardianActiveClassID] = useState<number>(0);
  const [guardianActiveStudentID, setGuardianActiveStudentID] = useState<{
    id: number;
    isUserLoading: boolean;
  }>({ id: 0, isUserLoading: true });
  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        guardianActiveClassID,
        setGuardianActiveClassID,
        guardianActiveStudentID,
        setGuardianActiveStudentID,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
