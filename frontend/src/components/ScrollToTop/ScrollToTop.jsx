import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll global inmediato
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Buscar solo contenedores con overflow que realmente puedan scrollear
    const scrollables = document.querySelectorAll("*");
    for (const el of scrollables) {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      if (
        (overflowY === "auto" || overflowY === "scroll") &&
        el.scrollHeight > el.clientHeight
      ) {
        el.scrollTop = 0;
      }
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
