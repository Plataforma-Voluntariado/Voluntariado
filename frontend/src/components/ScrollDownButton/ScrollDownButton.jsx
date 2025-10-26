import React, { useState, useEffect, useRef } from 'react';
import { FaCircleChevronDown } from 'react-icons/fa6';
import './ScrollDownButton.css';

const ScrollDownButton = () => {
  const [visible, setVisible] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const footer = document.querySelector('.footer');

      const scrolledEnough = scrollTop > 100;

      // If page doesn't have enough content to scroll, hide
      if (docHeight <= windowHeight + 50) {
        setVisible(false);
        return;
      }

      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        // show when scrolled enough and footer is not yet visible in viewport
        setVisible(scrolledEnough && footerRect.top > windowHeight + 20);
      } else {
        setVisible(scrolledEnough);
      }
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    // initial check
    handleScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToBottom = () => {
    const footer = document.querySelector('.footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  if (!visible) return null;

  return (
    <button
      className="scroll-down-button"
      onClick={scrollToBottom}
      aria-label="Desplazarse al final de la página"
    >
      <FaCircleChevronDown />
    </button>
  );
};

export default ScrollDownButton;