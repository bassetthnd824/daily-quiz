import React, { ReactNode, useCallback, useState } from "react";
import { SessionData } from '@/models/session-data.types';

type UserContextObj = {
  sessionData?: SessionData,
  setSessionData: (sessionData: SessionData) => void,
  clearSessionData: () => void,
};

type UserContextProviderProps = {
  children: ReactNode;
}

export const UserContext = React.createContext<UserContextObj>({
  sessionData: undefined,
  setSessionData: () => {},
  clearSessionData: () => {},
});

const UserContextProvider = (props: UserContextProviderProps) => {
  const [ sessionData, setSessionData ] = useState<SessionData>({ username: '' })

  const setSessionDataHandler = useCallback((sessionData: SessionData) => {
    setSessionData(sessionData);
  }, [])

  const clearSessionDataHandler = useCallback(() => {
    setSessionData({ username: '' });
  }, [])

  const contextValue: UserContextObj = {
    sessionData,
    setSessionData: setSessionDataHandler,
    clearSessionData: clearSessionDataHandler,
  }

  return <UserContext.Provider value={contextValue}>{props.children}</UserContext.Provider>
}

export default UserContextProvider;