import { Form } from "react-bootstrap";
import {useTheme} from "../contexts/ThemeContext";

export const DarkModeToggle = () => {
    const {theme, changeTheme} = useTheme();
    return (
        <Form.Check
                    type="switch"
                    style={ {width: 'auto'} }
                    id="theme-toggle"
                    label="Dark Mode"
                    checked={theme !== 'light'}
                    onChange={() => {changeTheme(theme !== 'light' ? 'light' : 'dark')}}
        />
    );
}
