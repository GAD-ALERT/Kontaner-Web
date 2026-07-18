import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useToast, type ToastTone } from '../stores/toast';
import { Icon } from './Icon';

const toneIcons: Record<ToastTone, string> = {
  info: 'info',
  success: 'check_circle',
  warn: 'warning',
  error: 'error',
};

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);

  return (
    <div className="toaster" aria-live="polite" aria-atomic="false">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          return (
            <motion.div
              key={t.id}
              className={`toast toast-${t.tone}`}
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              layout
              role="status"
            >
              <span className="toast-icon">
                <Icon name={toneIcons[t.tone]} size={20} filled />
              </span>
              <div className="toast-body">
                <strong>{t.title}</strong>
                {t.body && <span>{t.body}</span>}
              </div>
              {t.action && (
                <Link
                  className="toast-action"
                  to={t.action.href}
                  onClick={() => dismiss(t.id)}
                >
                  {t.action.label}
                </Link>
              )}
              <button
                className="toast-close"
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismiss(t.id)}
              >
                <Icon name="close" size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
