import introJs from "intro.js";
import "intro.js/introjs.css";

export const initTour = (steps, onCompleteKey) => {
  const tourInstance = introJs();

  tourInstance.setOptions({
    steps,
    prevLabel: "Anterior",
    nextLabel: "Siguiente",
    skipLabel: "Salir",
    doneLabel: "Finalizar",
    showProgress: true,
    showBullets: true,
    exitOnOverlayClick: false,
    exitOnEsc: true,
    disableInteraction: true,
    scrollToElement: true,
    scrollPadding: 80,
    overlayOpacity: 0.8,
    tooltipClass: "modern-gray-tooltip",
    helperElementPadding: 10,
    highlightClass: "modern-gray-highlight",
    scrollTo: "tooltip",
  });

  tourInstance.onbeforechange(() => {
    return true;
  });

  tourInstance.oncomplete(() => {
    localStorage.setItem(onCompleteKey, "true");
  });

  tourInstance.onexit(() => {
    localStorage.setItem(onCompleteKey, "true");
  });

  return tourInstance;
};