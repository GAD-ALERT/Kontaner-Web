import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { Icon } from '../components/Icon';
import { useAuth } from '../stores/auth';
import { useLibrary } from '../stores/library';
import { useFavorites } from '../stores/favorites';
import { useCollections } from '../stores/collections';
import { useNotifications } from '../stores/notifications';
import { toast } from '../stores/toast';

type SettingsTab = 'profile' | 'account' | 'notifications' | 'storage' | 'billing';

interface SettingsItem {
  id: SettingsTab;
  label: string;
  icon: string;
}

const items: readonly SettingsItem[] = [
  { id: 'profile', label: 'Profile', icon: 'person' },
  { id: 'account', label: 'Account', icon: 'wallet' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'storage', label: 'Storage', icon: 'cloud' },
  { id: 'billing', label: 'Billing', icon: 'credit_card' },
] as const;

export function AccountSettings() {
  const user = useAuth((s) => s.user);
  const updateProfile = useAuth((s) => s.updateProfile);
  const logout = useAuth((s) => s.logout);
  const uploads = useLibrary((s) => s.uploads);
  const downloads = useLibrary((s) => s.downloads);
  const favorites = useFavorites((s) => s.ids);
  const collections = useCollections((s) => s.collections);
  const notifSettings = {
    digest: true,
    activity: true,
    promotions: false,
    security: true,
  };

  const [tab, setTab] = useState<SettingsTab>('profile');
  const [name, setName] = useState<string>(user?.name ?? 'Ama Serwaa');
  const [role, setRole] = useState<string>(user?.role ?? 'Visual Designer');
  const [bio, setBio] = useState<string>(
    user?.bio ??
      'Multidisciplinary designer based in Accra, specializing in high-resolution digital assets inspired by West African geometry and urban landscapes.',
  );
  const [location, setLocation] = useState<string>(user?.location ?? 'Accra, Ghana');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl ?? '');
  const [dirty, setDirty] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setRole(user.role);
    setBio(user.bio ?? bio);
    setLocation(user.location ?? location);
    setAvatarUrl(user.avatarUrl ?? '');
  }, [user]);

  const markDirty = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setDirty(true);
  };

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarUrl.startsWith('blob:')) URL.revokeObjectURL(avatarUrl);
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    setDirty(true);
    toast.info('Photo updated', 'Hit Save changes to apply.');
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 550));
    updateProfile({ name, role, bio, location, avatarUrl });
    setSaving(false);
    setDirty(false);
    toast.success('Profile saved');
  };

  return (
    <div className="page settings-page">
      <aside className="settings-sidebar">
        <section className="settings-menu">
          <h2>Settings</h2>
          {items.map(({ id, label, icon }) => (
            <button
              key={id}
              className={tab === id ? 'active' : ''}
              type="button"
              onClick={() => setTab(id)}
            >
              <Icon name={icon} size={20} filled={tab === id} />
              {label}
            </button>
          ))}
        </section>
        <section className="hub-card">
          <h3>Ghana Creative Hub</h3>
          <p>Verified Contributor since 2022. You have {uploads.length} public assets.</p>
          <button
            className="text-button"
            type="button"
            onClick={() => toast.info('Portfolio preview coming soon')}
          >
            View Portfolio
          </button>
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
                      <Icon name="person" size={56} filled />
                    )}
                  </div>
                  <button
                    aria-label="Edit profile photo"
                    type="button"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Icon name="edit" size={20} />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handlePhoto}
                  />
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
                      <Icon name="location_on" size={20} />
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
                    <dd>•••••••••• <button type="button" className="text-button" onClick={() => toast.info('Password reset email sent')}>Change</button></dd>
                  </div>
                  <div>
                    <dt>Two-factor auth</dt>
                    <dd>
                      <span className="status-pill ok">
                        <Icon name="verified_user" size={16} /> Enabled
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>Member since</dt>
                    <dd>March 12, 2022</dd>
                  </div>
                </dl>
                <div className="settings-actions">
                  <button
                    type="button"
                    className="outline-button compact"
                    onClick={() => toast.info('Export prepared — check your email shortly')}
                  >
                    Export my data
                  </button>
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
                    <Icon name="cloud" size={24} />
                    Storage Overview
                  </h2>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => toast.info('Upgrade flow coming soon')}
                  >
                    Upgrade Plan
                  </button>
                </div>
                <div className="storage-layout">
                  <div className="donut">
                    <strong>34%</strong>
                    <span>Used</span>
                  </div>
                  <div className="storage-details">
                    <div className="usage-bar">
                      <span className="images" />
                      <span className="illustrations" />
                      <span className="other" />
                    </div>
                    <div className="legend">
                      <span>
                        <i className="images" />
                        Photos (2.6GB)
                      </span>
                      <span>
                        <i className="illustrations" />
                        Illustrations (0.5GB)
                      </span>
                      <span>
                        <i className="other" />
                        Other (0.1GB)
                      </span>
                    </div>
                    <h3>Activity summary</h3>
                    <article className="file-row">
                      <Icon name="cloud_upload" size={24} />
                      <div>
                        <strong>{uploads.length} uploads</strong>
                        <p>{downloads.length} downloads this period</p>
                      </div>
                      <span>{collections.length} collections</span>
                    </article>
                    <article className="file-row">
                      <Icon name="bookmark" size={24} />
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
                    <strong>Studio plan</strong>
                    <p>20 GB storage · Unlimited downloads · Team seat</p>
                  </div>
                  <span className="plan-price">GH₵ 99 / month</span>
                </div>
                <dl className="settings-dl">
                  <div>
                    <dt>Next renewal</dt>
                    <dd>July 12, 2026</dd>
                  </div>
                  <div>
                    <dt>Payment method</dt>
                    <dd>MTN Mobile Money · •••• 4421</dd>
                  </div>
                </dl>
                <div className="settings-actions">
                  <button
                    type="button"
                    className="primary-button compact"
                    onClick={() => toast.info('Plans coming soon')}
                  >
                    Change plan
                  </button>
                  <button
                    type="button"
                    className="outline-button compact"
                    onClick={() => toast.info('Invoice downloaded')}
                  >
                    Download last invoice
                  </button>
                </div>
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

function NotificationsPrefs({ initial }: { initial: NotifPrefs }) {
  const [prefs, setPrefs] = useState<NotifPrefs>(initial);
  const markAllRead = useNotifications((s) => s.markAllRead);

  const set = (key: keyof NotifPrefs) => (v: boolean): void => {
    setPrefs((p) => ({ ...p, [key]: v }));
    toast.info(`${key[0].toUpperCase()}${key.slice(1)} ${v ? 'on' : 'off'}`);
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
