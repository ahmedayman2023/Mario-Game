import Timer from './pages/Timer';
import SpacedRepetition from './pages/SpacedRepetition';
import Nutrition from './pages/Nutrition';
import __Layout from './Layout.tsx';


export const PAGES = {
    "Timer": Timer,
    "SRS": SpacedRepetition,
    "Nutrition": Nutrition,
}

export const pagesConfig = {
    mainPage: "Timer",
    Pages: PAGES,
    Layout: __Layout,
};
