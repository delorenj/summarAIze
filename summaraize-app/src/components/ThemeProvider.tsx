import React, { useState, useEffect } from 'react';
import { ThemeContext, themes } from '../contexts/ThemeContext';

interface Props {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<Props> = (props) => {
  const [theme, setTheme] = useState<string>(themes.dark);

  function changeTheme(newTheme: string) {
    setTheme(newTheme);
  }

  useEffect(() => {
    switch (theme) {
      case themes.light:
        document.body.classList.add('white-content');
        break;
      case themes.dark:
      default:
        document.body.classList.remove('white-content');
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
