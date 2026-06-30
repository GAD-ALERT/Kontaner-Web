import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useToast, type ToastTone } from '../stores/toast';

const icons: Record<ToastTone, typeof CheckCircle2> = {
  info: Info,
  success: CheckCircle2,
  warn: TriangleAlert,
  error: AlertCircle,
};

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);

  return (
    <div className="toaster" aria-live="polite" aria-atomic="false">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = icons[t.tone];
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
                <Icon size={18} />
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
                <X size={15} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
