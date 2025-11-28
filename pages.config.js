import Home from './pages/Home';
import Bible from './pages/Bible';
import Guidance from './pages/Guidance';
import Sermons from './pages/Sermons';
import Favorites from './pages/Favorites';
import Journal from './pages/Journal';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Bible": Bible,
    "Guidance": Guidance,
    "Sermons": Sermons,
    "Favorites": Favorites,
    "Journal": Journal,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};