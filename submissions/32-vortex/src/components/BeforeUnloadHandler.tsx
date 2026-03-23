"use client";

import { useEffect } from "react";

export function BeforeUnloadHandler() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      navigator.sendBeacon('/api/simulate/reset');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
}
