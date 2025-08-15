'use client';

import { useState, useEffect } from 'react';

interface ActiveReadersCounterProps {
  initialCount: number;
}

export function ActiveReadersCounter({ initialCount }: ActiveReadersCounterProps) {
  const [count, setCount] = useState(initialCount);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        const change = Math.floor(Math.random() * 20) - 10;
        const newCount = prev + change;
        return Math.max(150, Math.min(500, newCount)); // Keep between 150-500
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return <span>{count.toLocaleString()}</span>;
}