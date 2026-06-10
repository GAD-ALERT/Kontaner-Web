import {
  Bell,
  Camera,
  Cloud,
  CreditCard,
  Edit3,
  MapPin,
  UserRound,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';

interface SettingsItem {
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

const settingsItems: readonly SettingsItem[] = [
  { label: 'Profile', icon: UserRound, active: true },
  { label: 'Account', icon: WalletCards },
  { label: 'Notifications', icon: Bell },
  { label: 'Storage', icon: Cloud },
  { label: 'Billing', icon: CreditCard },
] as const;

export function AccountSettings() {
  return (
    <div className="page settings-page">
      <aside className="settings-sidebar">
        <section className="settings-menu">
          <h2>Settings</h2>
          {settingsItems.map(({ label, icon: Icon, active }) => (
            <button className={active ? 'active' : ''} type="button" key={label}>
              <Icon size={22} />
              {label}
            </button>
          ))}
        </section>
        <section className="hub-card">
          <h3>Ghana Creative Hub</h3>
          <p>Verified Contributor since 2022. You have 48 public assets.</p>
          <button className="text-button" type="button">
            View Portfolio
          </button>
        </section>
      </aside>

      <section className="settings-content">
        <section className="profile-card">
          <div className="profile-photo">
            <div className="portrait-art" />
            <button aria-label="Edit profile photo" type="button">
              <Edit3 size={20} />
            </button>
          </div>
          <form className="profile-form">
            <div className="form-grid">
              <label>
                Full Name
                <input defaultValue="Ama Serwaa" />
              </label>
              <label>
                Role
                <select defaultValue="Visual Designer">
                  <option>Visual Designer</option>
                  <option>Photographer</option>
                  <option>Illustrator</option>
                  <option>Creative Director</option>
                </select>
              </label>
            </div>
            <label>
              Bio
              <textarea defaultValue="Multidisciplinary designer based in Accra, specializing in high-resolution digital assets inspired by West African geometry and urban landscapes." />
            </label>
            <label className="location-field">
              Location
              <span>
                <MapPin size={18} />
                <input defaultValue="Accra, Ghana" />
              </span>
            </label>
            <button className="primary-button save-button" type="button">
              Save Changes
            </button>
          </form>
        </section>

        <section className="storage-card">
          <div className="section-heading">
            <h2>
              <Cloud size={24} />
              Storage Overview
            </h2>
            <button className="text-button" type="button">
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
                <span className="videos" />
                <span className="docs" />
                <span className="other" />
              </div>
              <div className="legend">
                <span>
                  <i className="images" />
                  Images (2.1GB)
                </span>
                <span>
                  <i className="videos" />
                  Videos (0.8GB)
                </span>
                <span>
                  <i className="docs" />
                  Documents (0.3GB)
                </span>
              </div>
              <h3>Largest Files</h3>
              <article className="file-row">
                <Camera size={22} />
                <div>
                  <strong>Accra_Drone_Sequence_01.mp4</strong>
                  <p>Edited 2 days ago</p>
                </div>
                <span>450 MB</span>
              </article>
              <article className="file-row">
                <Camera size={22} />
                <div>
                  <strong>Kente_Pattern_HighRes_Pack.zip</strong>
                  <p>Edited 1 week ago</p>
                </div>
                <span>312 MB</span>
              </article>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
