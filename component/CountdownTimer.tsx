"use client";

import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 2,
    hours: 14,
    minutes: 35,
    seconds: 20,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          days--;
        }
        if (days < 0) {
          days = 0;
          hours = 0;
          minutes = 0;
          seconds = 0;
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNum = (n: number) => n.toString().padStart(2, '0');

  const units = [
    { value: timeLeft.days, label: 'يوم' },
    { value: timeLeft.hours, label: 'ساعة' },
    { value: timeLeft.minutes, label: 'دقيقة' },
    { value: timeLeft.seconds, label: 'ثانية' },
  ];

  return (
    <div className="flex gap-3 justify-center md:justify-start">
      {units.map((unit, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="bg-white text-pink-dark font-bold text-xl md:text-2xl w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center shadow-lg">
            {formatNum(unit.value)}
          </div>
          <span className="text-white text-xs mt-1 font-tajawal">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
