import React, { useContext, useState, createContext, useCallback } from 'react';
import {
  UserContextProps,
  UserProps,
} from '../../Definitions/InterfacesAndType/userInformationContext.definitions';
import { useConnection } from '../ConnectionContext/connectionContext';
import jwt_decode from 'jwt-decode';

export const UserContext = createContext<UserContextProps>({
  setUserInfo: () => {},
  removeUserInfo: () => {},
  IsAuthenticated: () => false,
});

export const UserInformationContextProvider = ({ children }: React.PropsWithChildren) => {
  const { token } = useConnection();
  const initialUserProps: UserProps = {
    id: '',
    userRole: '',
  };
  const [userInfoState, setUserInfoState] = useState<UserProps>(initialUserProps);

  const setUserInfo = (value: UserProps) => {
    const { id, userRole } = value;
    if (id) {
      setUserInfoState((prev) => ({ ...prev, id }));
      localStorage.setItem('userId', id);
    }

    if (userRole) {
      setUserInfoState((prev) => ({ ...prev, userRole }));
      localStorage.setItem('userRole', userRole);
    }
  };

  const IsAuthenticated = useCallback((): boolean => {
    let tokenVal: string | null;
    if (token) {
      tokenVal = token;
    } else {
      tokenVal = localStorage.getItem('token');
    }
    try {
      if (tokenVal) {
        const { exp } = jwt_decode(tokenVal) as any;
        return Date.now() < exp * 1000;
      }
      return false;
    } catch (err) {
      return false;
    }
  }, [token]);

  const removeUserInfo = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    setUserInfoState(initialUserProps);
  };

  return (
    <UserContext.Provider
      value={{
        userInfoState,
        setUserInfo,
        removeUserInfo,
        IsAuthenticated,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;

export const useUserContext = (): UserContextProps => {
  return useContext(UserContext);
};