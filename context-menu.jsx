import { createContext, useContext } from 'react';
import { THEMES } from '../components/common/ThemeSelector';

const ThemeContext = createContext({ theme: 'warm', colors: THEMES[0].colors });
export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
