import { AnimatePresence, motion } from 'motion/react';
import { Bell, BellOff, CheckCheck, FolderHeart, ShieldCheck, UserPlus } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  relativeTime,
  useNotifications,
  type NotificationTone,
} from '../stores/notifications';

const icons: Record<NotificationTone, typeof Bell> = {
  system: Bell,
  collection: FolderHeart,
  social: UserPlus,
  security: ShieldCheck,
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ open, onClose }: Props) {
  const items = useNotifications((s) => s.items);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const markRead = useNotifications((s) => s.markRead);
  const remove = useNotifications((s) => s.remove);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onEsc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="notif-panel"
          ref={ref}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.14 } }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        >
          <header>
            <h3>Notifications</h3>
            {items.some((n) => !n.read) && (
              <button type="button" className="text-button" onClick={markAllRead}>
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </header>

          {items.length === 0 ? (
            <div className="notif-empty">
              <BellOff size={28} />
              <p>You're all caught up.</p>
            </div>
          ) : (
            <ul className="notif-list">
              {items.map((n) => {
                const Icon = icons[n.tone];
                const Wrapper: React.ElementType = n.href ? Link : 'div';
                return (
                  <li key={n.id} className={n.read ? 'read' : 'unread'}>
                    <Wrapper
                      {...(n.href ? { to: n.href } : {})}
                      className="notif-row"
                      onClick={() => {
                        markRead(n.id);
                        if (n.href) onClose();
                      }}
                    >
                      <span className={`notif-icon tone-${n.tone}`}>
                        <Icon size={15} />
                      </span>
                      <div className="notif-body">
                        <strong>{n.title}</strong>
                        <p>{n.body}</p>
                        <time>{relativeTime(n.createdAt)}</time>
                      </div>
                      {!n.read && <span className="notif-dot" aria-hidden="true" />}
                    </Wrapper>
                    <button
                      type="button"
                      className="notif-dismiss"
                      aria-label="Dismiss"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(n.id);
                      }}
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
