import React, { useState, useEffect } from 'react';
import { LoginForm } from '../contexts/LoginFormContext';

interface Props {
  children: React.ReactNode;
}

const LoginFormProvider: React.FC<Props> = (props) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');


  return (
    <LoginForm.Provider value={{ email, setEmail, password, setPassword }}>
      {props.children}
    </LoginForm.Provider>
  );
}

export default LoginFormProvider;
