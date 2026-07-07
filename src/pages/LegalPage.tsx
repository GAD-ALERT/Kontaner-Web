import { ArrowLeft, FileText, LifeBuoy, Lock, Scale } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface LegalCopy {
  icon: typeof FileText;
  title: string;
  intro: string;
  sections: { title: string; body: string }[];
}

const pages: Record<string, LegalCopy> = {
  licensing: {
    icon: Scale,
    title: 'Licensing',
    intro:
      'Every asset on Kontaner is governed by one of three license tiers. Use this page as a quick reference when planning a campaign.',
    sections: [
      {
        title: 'Free · Editorial',
        body:
          'Available at no cost for editorial use — articles, blog posts, news features, academic work. Attribution is required: "Photo via Kontaner / <Author>".',
      },
      {
        title: 'Premium · Commercial',
        body:
          'Unlocks commercial reuse — advertising, branded social, print campaigns. Includes unlimited project use and signed model releases where applicable.',
      },
      {
        title: 'Custom · Enterprise',
        body:
          'For broadcast, packaging, OOH, and any usage tier above standard commercial. Reach out to licensing@kontaner.studio for a tailored agreement.',
      },
    ],
  },
  privacy: {
    icon: Lock,
    title: 'Privacy',
    intro:
      'A short, plain-English summary of how Kontaner handles your information.',
    sections: [
      {
        title: 'What we store',
        body:
          'Your account profile, your uploaded assets, your saved favorites and collections. That\'s it. Local Storage holds your session and preferences in this browser.',
      },
      {
        title: 'What we never do',
        body:
          'We do not sell your data, train commercial models on your private uploads, or share your library with third parties without explicit consent.',
      },
      {
        title: 'Deleting your data',
        body:
          'Hit Settings → Account → "Delete account" to remove everything irreversibly. Local Storage can be cleared anytime from your browser.',
      },
    ],
  },
  support: {
    icon: LifeBuoy,
    title: 'Support',
    intro:
      'Need help? Most questions have an answer here. For anything else, reach a human in under 12 hours.',
    sections: [
      {
        title: 'Get in touch',
        body:
          'Email support@kontaner.studio — include your account email and a brief description. Average response time: 8 hours on weekdays.',
      },
      {
        title: 'Status & uptime',
        body:
          'Real-time uptime is published at status.kontaner.studio. Subscribe via email or RSS to be notified of incidents.',
      },
      {
        title: 'Community',
        body:
          'Join the Ghana Creative Hub Slack for tips, critiques, and tutorials from other Kontaner creators.',
      },
    ],
  },
};

export function LegalPage() {
  const { slug = 'licensing' } = useParams<{ slug: string }>();
  const data = pages[slug] ?? pages.licensing;
  const Icon = data.icon;

  return (
    <div className="page legal-page">
      <Link to="/" className="legal-back">
        <ArrowLeft size={16} /> Back to Discover
      </Link>
      <header className="legal-hero">
        <span className="legal-icon">
          <Icon size={26} />
        </span>
        <div>
          <h1>{data.title}</h1>
          <p>{data.intro}</p>
        </div>
      </header>
      <div className="legal-sections">
        {data.sections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
