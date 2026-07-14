import {
  Bell,
  Camera,
  Cloud,
  CreditCard,
  MapPin,
  ShieldCheck,
  UserRound,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../stores/auth';
import { useLibrary } from '../stores/library';
import { useFavorites } from '../stores/favorites';
import { useCollections } from '../stores/collections';
import { useNotifications } from '../stores/notifications';
import { toast } from '../stores/toast';
import { apiRequest } from '../lib/api';
import type { NotificationPreferences, StorageUsage } from '../types';

type SettingsTab = 'profile' | 'account' | 'notifications' | 'storage' | 'billing';

interface SettingsItem {
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
}

const items: readonly SettingsItem[] = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'account', label: 'Account', icon: WalletCards },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'storage', label: 'Storage', icon: Cloud },
  { id: 'billing', label: 'Billing', icon: CreditCard },
] as const;

export function AccountSettings() {
  const user = useAuth((s) => s.user);
  const updateProfile = useAuth((s) => s.updateProfile);
  const uploadAvatar = useAuth((s) => s.uploadAvatar);
  const logout = useAuth((s) => s.logout);
  const uploads = useLibrary((s) => s.uploads);
  const downloads = useLibrary((s) => s.downloads);
  const favorites = useFavorites((s) => s.ids);
  const collections = useCollections((s) => s.collections);
  const notifSettings = user?.notificationPreferences ?? {
    digest: true, activity: true, promotions: false, security: true,
  };

  const [tab, setTab] = useState<SettingsTab>('profile');
  const [name, setName] = useState<string>(user?.name ?? '');
  const [role, setRole] = useState<string>(user?.role ?? 'Visual Designer');
  const [bio, setBio] = useState<string>(user?.bio ?? '');
  const [location, setLocation] = useState<string>(user?.location ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl ?? '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInput = useRef<HTMLInputElement | null>(null);
  const [storage, setStorage] = useState<StorageUsage | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void apiRequest<StorageUsage>('/uploads/usage', { auth: true, signal: controller.signal })
      .then(setStorage)
      .catch(() => undefined);
    return () => controller.abort();
  }, []);
  const [dirty, setDirty] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const markDirty = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setDirty(true);
  };

  const handleAvatar = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const updated = await uploadAvatar(file);
      setAvatarUrl(updated.avatarUrl);
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error('Photo upload failed', err instanceof Error ? err.message : undefined);
    } finally {
      setAvatarUploading(false);
      event.target.value = '';
    }
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      await updateProfile({ name, role, bio, location, avatarUrl });
      setDirty(false);
      toast.success('Profile saved');
    } catch (err) {
      toast.error('Profile could not be saved', err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page settings-page">
      <aside className="settings-sidebar">
        <section className="settings-menu">
          <h2>Settings</h2>
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={tab === id ? 'active' : ''}
              type="button"
              onClick={() => setTab(id)}
            >
              <Icon size={22} />
              {label}
            </button>
          ))}
        </section>
        <section className="hub-card">
          <h3>Ghana Creative Hub</h3>
          <p>Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '—'}. You have {uploads.length} uploaded assets.</p>
        </section>
      </aside>

      <section className="settings-content">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          {tab === 'profile' && (
            <>
              <section className="profile-card">
                <div className="profile-photo">
                  <div className="portrait-art">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" />
                    ) : (
                      <span>{user?.avatarInitials ?? 'AM'}</span>
                    )}
                  </div>
                  <button type="button" aria-label="Upload profile photo" disabled={avatarUploading} onClick={() => avatarInput.current?.click()}>
                    <Camera size={18} />
                  </button>
                  <input ref={avatarInput} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void handleAvatar(event)} />
                </div>
                <form
                  className="profile-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSave();
                  }}
                >
                  <div className="form-grid">
                    <label>
                      Full Name
                      <input
                        value={name}
                        onChange={(e) => markDirty(setName)(e.target.value)}
                      />
                    </label>
                    <label>
                      Role
                      <select
                        value={role}
                        onChange={(e) => markDirty(setRole)(e.target.value)}
                      >
                        <option>Visual Designer</option>
                        <option>Photographer</option>
                        <option>Illustrator</option>
                        <option>Creative Director</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Bio
                    <textarea
                      value={bio}
                      onChange={(e) => markDirty(setBio)(e.target.value)}
                    />
                  </label>
                  <label className="location-field">
                    Location
                    <span>
                      <MapPin size={18} />
                      <input
                        value={location}
                        onChange={(e) => markDirty(setLocation)(e.target.value)}
                      />
                    </span>
                  </label>
                  <button
                    className="primary-button save-button"
                    type="submit"
                    disabled={!dirty || saving}
                  >
                    {saving ? 'Saving…' : dirty ? 'Save Changes' : 'Saved'}
                  </button>
                </form>
              </section>
            </>
          )}

          {tab === 'account' && (
            <>
              <section className="settings-card">
                <h2>Account</h2>
                <dl className="settings-dl">
                  <div>
                    <dt>Email</dt>
                    <dd>{user?.email ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>Password</dt>
                    <dd><a href="/forgot">Send a password reset email</a></dd>
                  </div>
                  <div>
                    <dt>Two-factor auth</dt>
                    <dd>
                      <span className="status-pill ok">
                        <ShieldCheck size={13} /> Not configured
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>Member since</dt>
                    <dd>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</dd>
                  </div>
                </dl>
                <div className="settings-actions">
                  <button
                    type="button"
                    className="text-button danger"
                    onClick={() => {
                      if (window.confirm('Sign out of Kontaner?')) {
                        logout();
                        toast.info('Signed out');
                      }
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </section>
            </>
          )}

          {tab === 'notifications' && (
            <NotificationsPrefs initial={notifSettings} />
          )}

          {tab === 'storage' && (
            <>
              <section className="storage-card">
                <div className="section-heading">
                  <h2>
                    <Cloud size={24} />
                    Storage Overview
                  </h2>
                </div>
                <div className="storage-layout">
                  <div className="donut">
                    <strong>{storage ? `${Math.round((storage.usedBytes / Math.max(1, storage.quotaBytes)) * 100)}%` : '—'}</strong>
                    <span>Used</span>
                  </div>
                  <div className="storage-details">
                    <div className="usage-bar">
                      <span className="images" />
                      <span className="videos" />
                      <span className="docs" />
                      <span className="other" />
                    </div>
                    <div className="legend">
                      <span>
                        <i className="images" />
                        Images ({formatStorage(storage?.breakdown.find((item) => item.type === 'PHOTO')?.bytes ?? 0)})
                      </span>
                      <span>
                        <i className="videos" />
                        Videos ({formatStorage(storage?.breakdown.find((item) => item.type === 'VIDEO')?.bytes ?? 0)})
                      </span>
                      <span>
                        <i className="docs" />
                        Other ({formatStorage((storage?.breakdown ?? []).filter((item) => !['PHOTO', 'VIDEO'].includes(item.type)).reduce((sum, item) => sum + item.bytes, 0))})
                      </span>
                    </div>
                    <h3>Activity summary</h3>
                    <p>{storage ? `${formatStorage(storage.usedBytes)} of ${formatStorage(storage.quotaBytes)} used · ${formatStorage(storage.remainingBytes)} remaining` : 'Loading storage usage…'}</p>
                    <article className="file-row">
                      <Camera size={22} />
                      <div>
                        <strong>{uploads.length} uploads</strong>
                        <p>{downloads.length} downloads this period</p>
                      </div>
                      <span>{collections.length} collections</span>
                    </article>
                    <article className="file-row">
                      <Camera size={22} />
                      <div>
                        <strong>{favorites.length} favorited assets</strong>
                        <p>Backed up across all devices</p>
                      </div>
                      <span>—</span>
                    </article>
                  </div>
                </div>
              </section>
            </>
          )}

          {tab === 'billing' && (
            <>
              <section className="settings-card">
                <h2>Billing</h2>
                <div className="plan-card">
                  <div>
                    <strong>No billing plan</strong>
                    <p>Billing is not configured for this deployment.</p>
                  </div>
                  <span className="plan-price">—</span>
                </div>
                <dl className="settings-dl">
                  <div>
                    <dt>Next renewal</dt>
                    <dd>Not scheduled</dd>
                  </div>
                  <div>
                    <dt>Payment method</dt>
                    <dd>Not configured</dd>
                  </div>
                </dl>
              </section>
            </>
          )}
        </motion.div>
      </section>
    </div>
  );
}

interface NotifPrefs {
  digest: boolean;
  activity: boolean;
  promotions: boolean;
  security: boolean;
}

function formatStorage(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function NotificationsPrefs({ initial }: { initial: NotifPrefs }) {
  const [prefs, setPrefs] = useState<NotifPrefs>(initial);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const updatePreferences = useAuth((s) => s.updatePreferences);

  const set = (key: keyof NotifPrefs) => (v: boolean): void => {
    const next: NotificationPreferences = { ...prefs, [key]: v };
    setPrefs(next);
    void updatePreferences(next).then(() => {
      toast.success('Notification preferences saved');
    }).catch((err: unknown) => {
      setPrefs(prefs);
      toast.error('Preferences could not be saved', err instanceof Error ? err.message : undefined);
    });
  };

  return (
    <section className="settings-card">
      <h2>Notifications</h2>
      <ul className="notif-prefs">
        <PrefRow
          title="Weekly digest"
          body="A summary of trending assets and new uploads from creators you follow."
          checked={prefs.digest}
          onChange={set('digest')}
        />
        <PrefRow
          title="Activity"
          body="When your assets are downloaded, favorited, or added to a collection."
          checked={prefs.activity}
          onChange={set('activity')}
        />
        <PrefRow
          title="Promotions"
          body="Offers, partner highlights, and seasonal campaigns."
          checked={prefs.promotions}
          onChange={set('promotions')}
        />
        <PrefRow
          title="Security alerts"
          body="Sign-ins from new devices and password changes."
          checked={prefs.security}
          onChange={set('security')}
        />
      </ul>
      <div className="settings-actions">
        <button
          type="button"
          className="outline-button compact"
          onClick={() => {
            markAllRead();
            toast.success('Inbox cleared');
          }}
        >
          Mark all read
        </button>
      </div>
    </section>
  );
}

interface PrefRowProps {
  title: string;
  body: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function PrefRow({ title, body, checked, onChange }: PrefRowProps) {
  return (
    <li>
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={checked ? 'toggle on' : 'toggle'}
        onClick={() => onChange(!checked)}
      />
    </li>
  );
}
