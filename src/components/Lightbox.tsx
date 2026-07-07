import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}

export function Lightbox({ open, src, alt, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="lightbox"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={onClose}
            aria-label="Close preview"
          >
            <X size={24} />
          </button>
          <motion.img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
