import {createContext, useContext} from "react";

export const themes = {
  dark : "",
  light: "white-content",
};

export interface Theme {
  theme: string;
  changeTheme: (newTheme: string) => void;
}

export const ThemeContext = createContext<Theme>({
    theme: themes.dark,
  changeTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

