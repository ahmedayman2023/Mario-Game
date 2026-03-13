import ADHD from './pages/ADHD';
import Stats from './pages/Stats';
import Timer from './pages/Timer';
import __Layout from './Layout.tsx';


export const PAGES = {
    "ADHD": ADHD,
    "Stats": Stats,
    "Timer": Timer,
}

export const pagesConfig = {
    mainPage: "Timer",
    Pages: PAGES,
    Layout: __Layout,
};
