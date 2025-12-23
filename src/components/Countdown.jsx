
import React, { useState, useEffect } from 'react';

const Countdown = () => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [nextBackupDate, setNextBackupDate] = useState(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            let target = new Date(now);

            // Find next Wednesday (3)
            const dayOfWeek = now.getDay();
            const difference = (3 + 7 - dayOfWeek) % 7;

            target.setDate(now.getDate() + difference);
            target.setHours(10, 0, 0, 0);

            // If today is Wednesday and it's past 10 AM, move to next week
            if (difference === 0 && now > target) {
                target.setDate(target.getDate() + 7);
            }

            setNextBackupDate(target);

            const diff = target - now;
            if (diff > 0) {
                return {
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                };
            }
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        setTimeLeft(calculateTimeLeft()); // Init immediately

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        if (!date) return "";
        // Using pt-BR locale
        return date.toLocaleDateString('pt-BR', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) +
            " às " + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="countdown-container">
            <h1 className="main-title">Próximo backup será executado em</h1>

            <div className="timer-grid">
                <div className="time-box">
                    <span className="time-value">{timeLeft.days}</span>
                    <span className="time-label">Dias</span>
                </div>
                <div className="time-box">
                    <span className="time-value">{timeLeft.hours}</span>
                    <span className="time-label">Horas</span>
                </div>
                <div className="time-box">
                    <span className="time-value">{timeLeft.minutes}</span>
                    <span className="time-label">Minutos</span>
                </div>
                <div className="time-box">
                    <span className="time-value">{timeLeft.seconds}</span>
                    <span className="time-label">Segundos</span>
                </div>
            </div>

            <p className="next-execution-text">
                Próxima execução: {formatDate(nextBackupDate)}
            </p>
        </div>
    );
};

export default Countdown;
