import Timer from './pages/Timer';
import SpacedRepetition from './pages/SpacedRepetition';
import __Layout from './Layout.tsx';


export const PAGES = {
    "Timer": Timer,
    "SRS": SpacedRepetition,
}

export const pagesConfig = {
    mainPage: "Timer",
    Pages: PAGES,
    Layout: __Layout,
};
