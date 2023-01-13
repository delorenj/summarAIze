import {createContext, useContext} from "react";

export interface Theme {
  theme: any;
  changeTheme: (newTheme: string) => void;
}

export const ThemeContext = createContext<Theme>({
    theme: 'dark',
  changeTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

