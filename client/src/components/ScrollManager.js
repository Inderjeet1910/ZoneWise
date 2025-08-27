import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function readPositions() {
  try {
    const raw = sessionStorage.getItem('scrollPositions');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writePositions(positions) {
  try {
    sessionStorage.setItem('scrollPositions', JSON.stringify(positions));
  } catch {}
}

export default function ScrollManager() {
  const location = useLocation();
  const routeKeyRef = useRef('');
  const tickingRef = useRef(false);

  const getRouteKey = () => `${location.pathname}${location.search}`;

  // Save scroll position on scroll (throttled with rAF)
  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const key = routeKeyRef.current || getRouteKey();
        const positions = readPositions();
        positions[key] = window.scrollY || window.pageYOffset || 0;
        writePositions(positions);
        tickingRef.current = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleScroll);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handleScroll();
    });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore scroll on route change
  useEffect(() => {
    const key = getRouteKey();
    routeKeyRef.current = key;
    const positions = readPositions();
    const y = typeof positions[key] === 'number' ? positions[key] : 0;
    // Restore after paint
    setTimeout(() => {
      window.scrollTo({ top: y, behavior: 'instant' in window ? 'instant' : 'auto' });
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, location.pathname, location.search]);

  return null;
}


