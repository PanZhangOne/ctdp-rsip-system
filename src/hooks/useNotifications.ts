import { useEffect } from 'react';
import { usePolicyStore } from '../store/usePolicyStore';

export const useNotifications = () => {
  const { policies } = usePolicyStore();

  useEffect(() => {
    // Request permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    // Keep track of notified policies today to avoid spamming
    const notifiedKey = `notified_${new Date().toISOString().split('T')[0]}`;
    const getNotified = (): string[] => {
      try {
        return JSON.parse(localStorage.getItem(notifiedKey) || '[]');
      } catch {
        return [];
      }
    };

    const markNotified = (id: string) => {
      const current = getNotified();
      if (!current.includes(id)) {
        localStorage.setItem(notifiedKey, JSON.stringify([...current, id]));
      }
    };

    const checkAlarms = () => {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;
      const notified = getNotified();

      policies.forEach(policy => {
        if (policy.isActive && policy.reminderTime && policy.reminderTime === currentTime) {
          if (!notified.includes(policy.id)) {
            new Notification('体系稳态提醒: ' + policy.title, {
              body: `IF: ${policy.conditionIf}\nTHEN: ${policy.actionThen}`,
              icon: '/favicon.svg'
            });
            markNotified(policy.id);
          }
        }
      });
    };

    // Check every minute
    const intervalId = setInterval(checkAlarms, 60000);
    // Initial check
    checkAlarms();

    return () => clearInterval(intervalId);
  }, [policies]);
};
