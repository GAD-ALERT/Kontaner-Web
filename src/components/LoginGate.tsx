import { Lock, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useLoginGate } from '../stores/favorites';
import { modalSpring } from '../lib/motion';

export function LoginGate() {
  const { open, reason, hide } = useLoginGate();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="gate-layer"
          role="dialog"
          aria-modal="true"
          onClick={hide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="gate-card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.15 } }}
            transition={modalSpring}
          >
            <button
              className="gate-close"
              aria-label="Dismiss"
              type="button"
              onClick={hide}
            >
              <X size={22} />
            </button>
            <div className="gate-icon">
              <Lock size={28} />
            </div>
            <h2>{reason}</h2>
            <p>
              Save assets, build collections, and upload your own work to the
              Kontaner library.
            </p>
            <div className="gate-actions">
              <Link className="primary-button wide" to="/signup" onClick={hide}>
                <Sparkles size={18} />
                Create free account
              </Link>
              <Link className="outline-button wide" to="/login" onClick={hide}>
                Sign in
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
