import {createContext, useContext} from "react";

export interface ILoginForm {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
}

export const LoginForm = createContext<ILoginForm>({
    email: '',
    password: '',
    setEmail: (email: string): void => {},
    setPassword(password: string): void {}
});

export const useLoginForm = () => useContext(LoginForm);

