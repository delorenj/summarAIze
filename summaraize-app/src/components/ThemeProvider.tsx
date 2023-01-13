import React, { useState, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

interface Props {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<Props> = (props) => {
  const [theme, setTheme] = useState<string>('dark');

  function changeTheme(newTheme: string) {
    setTheme(newTheme);
  }

  useEffect(() => {
    switch (theme) {
      case 'light':
        document.body.classList.add('light');
        document.body.classList.remove('dark');

        break;
      case 'dark':
      default:
        document.body.classList.remove('light');
        document.body.classList.add('dark');
        break;
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {props.children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
