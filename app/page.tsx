'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Code2,
  Copy,
  FileText,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Play,
  Rocket,
  Search,
  Settings,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';

type Site = {
  id: string;
  name: string;
  prompt: string;
  theme: 'dark' | 'light';
  headline: string;
  description: string;
  services: string[];
  createdAt: string;
  html?: string;
};

const starterSites: Site[] = [
  {
    id: '1',
    name: 'Modern Cafe Website',
    prompt: 'Create a modern cafe website',
    theme: 'dark',
    headline: 'Good food. Better mood.',
    description: 'A warm, modern cafe for coffee, brunch and memorable moments.',
    services: ['Coffee & Drinks', 'Breakfast', 'Custom Cakes'],
    createdAt: '2 hours ago',
  },
  {
    id: '2',
    name: 'Startup Landing Page',
    prompt: 'Create a SaaS startup landing page',
    theme: 'dark',
    headline: 'Build your dream business today.',
    description: 'Launch a polished digital product without starting from scratch.',
    services: ['AI Builder', 'Analytics', 'Deployments'],
    createdAt: '4 hours ago',
  },
  {
    id: '3',
    name: 'Fitness App',
    prompt: 'Create a fitness coaching website',
    theme: 'light',
    headline: 'Your fitness journey starts here.',
    description: 'Simple plans, expert coaching and measurable progress.',
    services: ['Training', 'Nutrition', 'Progress'],
    createdAt: '1 day ago',
  },
];

const quickActions = [
  ['AI Website Generator', 'Build a complete website with a prompt.', Globe],
  ['AI Content Generator', 'Create pages, product copy and blogs.', FileText],
  ['AI Image Generator', 'Generate visuals from text.', ImageIcon],
  ['AI Video Generator', 'Turn ideas into marketing videos.', Play],
  ['AI Voice Generator', 'Create realistic voiceovers.', MessageSquare],
  ['AI Marketing Suite', 'Create posts, ads and campaigns.', Megaphone],
  ['AI SEO Assistant', 'Optimize your content for search.', Search],
  ['AI App Builder', 'Build app concepts with AI assistance.', Code2],
] as const;

function makeSite(prompt: string, html: string): Site {
  const lower = prompt.toLowerCase();

  const type =
    lower.includes('gym') || lower.includes('fitness')
      ? 'Fitness'
      : lower.includes('restaurant') ||
          lower.includes('cafe') ||
          lower.includes('bakery')
        ? 'Food'
        : lower.includes('portfolio')
          ? 'Portfolio'
          : 'Business';

  const headline =
    type === 'Fitness'
      ? 'Stronger every day.'
      : type === 'Food'
        ? 'Good food. Better mood.'
        : type === 'Portfolio'
          ? 'Ideas worth showing.'
          : 'Build something people remember.';

  const services =
    type === 'Fitness'
      ? ['Personal Training', 'Workout Plans', 'Nutrition Coaching']
      : type === 'Food'
        ? ['Signature Menu', 'Online Ordering', 'Private Events']
        : ['Strategy', 'Design', 'Growth'];

  return {
    id: crypto.randomUUID(),
    name: `${type} AI Website`,
    prompt,
    theme: 'dark',
    headline,
    description: prompt,
    services,
    createdAt: 'Just now',
    html,
  };
}

export default function Home() {
  const [sites, setSites] = useState<Site[]>(starterSites);
  const [prompt, setPrompt] = useState('');
  const [selected, setSelected] = useState<Site | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [active, setActive] = useState('Home');
  const [toast, setToast] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('createx-sites');

      if (saved) {
        setSites(JSON.parse(saved) as Site[]);
      }
    } catch {
      console.warn('Could not load saved CreateX projects.');
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('createx-sites', JSON.stringify(sites));
    } catch {
      console.warn('Could not save CreateX projects.');
    }
  }, [sites]);

  const total = useMemo(() => sites.length, [sites]);

  async function create() {
    const cleanPrompt = prompt.trim();

    if (!cleanPrompt) {
      setError('Please describe the website you want to create.');
      return;
    }

    if (generating) return;

    setGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: cleanPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || typeof data.html !== 'string') {
        throw new Error(
          data.error || 'Website generation failed. Please try again.',
        );
      }

      const site = makeSite(cleanPrompt, data.html);

      site.name = String(data.title || site.name).slice(0, 80);
      site.headline = site.name;
      site.description = cleanPrompt;

      setSites((previous) => [site, ...previous]);
      setSelected(site);
      setPrompt('');

      setToast('Website created successfully!');
      window.setTimeout(() => setToast(''), 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setGenerating(false);
    }
  }

  function applyEdit() {
    if (!selected || !editPrompt.trim()) return;

    const instruction = editPrompt.toLowerCase();
    const updated = { ...selected };

    if (instruction.includes('dark')) {
      updated.theme = 'dark';
    }

    if (instruction.includes('light')) {
      updated.theme = 'light';
    }

    if (instruction.includes('fitness')) {
      updated.services = [
        'Personal Training',
        'Workout Plans',
        'Nutrition Coaching',
      ];
    }

    if (instruction.includes('food') || instruction.includes('restaurant')) {
      updated.services = [
        'Signature Menu',
        'Online Ordering',
        'Private Events',
      ];
    }

    if (instruction.includes('headline')) {
      const headline = editPrompt.replace(/.*headline[: ]*/i, '').trim();

      if (headline) {
        updated.headline = headline;
      }
    }

    setSelected(updated);

    setSites((previous) =>
      previous.map((site) =>
        site.id === updated.id ? updated : site,
      ),
    );

    setEditPrompt('');
    setToast(
      'Preview card updated. Regenerate for changes to the HTML website.',
    );

    window.setTimeout(() => setToast(''), 2500);
  }

  function downloadHtml(site: Site) {
    if (!site.html) {
      setToast('Create a new website to download its HTML.');
      window.setTimeout(() => setToast(''), 2200);
      return;
    }

    const blob = new Blob([site.html], {
      type: 'text/html;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const filename =
      site.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'createx-website';

    link.href = url;
    link.download = `${filename}.html`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    setToast('HTML file downloaded!');
    window.setTimeout(() => setToast(''), 2000);
  }

  async function copyProject() {
    if (!selected) return;

    try {
      await navigator.clipboard.writeText(
        selected.html || JSON.stringify(selected, null, 2),
      );

      setToast(selected.html ? 'HTML copied!' : 'Project copied!');
    } catch {
      setToast('Copy failed. Try again over HTTPS.');
    }

    window.setTimeout(() => setToast(''), 2000);
  }

  function publish() {
    setToast('Publishing is not connected yet. Download your HTML for now.');
    window.setTimeout(() => setToast(''), 2500);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">✕</div>
          <div>
            <strong>
              CreateX <span>AI</span>
            </strong>
            <small>One Prompt. Endless Possibilities.</small>
          </div>
        </div>

        <nav>
          <NavItem
            icon={<LayoutDashboard size={18} />}
            label="Home"
            active={active === 'Home'}
            onClick={() => setActive('Home')}
          />

          <NavItem
            icon={<Sparkles size={18} />}
            label="Create with AI"
            active={active === 'Create with AI'}
            onClick={() => setActive('Create with AI')}
          />

          {[
            'Websites',
            'Apps',
            'Images',
            'Videos',
            'Voice',
            'Content',
            'Marketing',
            'SEO',
          ].map((item) => (
            <NavItem
              key={item}
              icon={<Sparkles size={17} />}
              label={item}
              active={active === item}
              onClick={() => setActive(item)}
            />
          ))}

          <div className="nav-sep" />
          <div className="nav-label">My Projects</div>

          {[
            'All Projects',
            'Saved Templates',
            'Deployments',
            'Analytics',
          ].map((item) => (
            <NavItem
              key={item}
              icon={<Rocket size={17} />}
              label={item}
              active={active === item}
              onClick={() => setActive(item)}
            />
          ))}

          <div className="nav-sep" />

          <NavItem
            icon={<BarChart3 size={17} />}
            label="Billing"
            active={active === 'Billing'}
            onClick={() => setActive('Billing')}
          />

          <NavItem
            icon={<Settings size={17} />}
            label="Settings"
            active={active === 'Settings'}
            onClick={() => setActive('Settings')}
          />
        </nav>

        <div className="upgrade">
          <div className="crown">♛</div>
          <strong>Upgrade to Pro</strong>
          <p>Get more credits, advanced features and priority support.</p>
          <button onClick={() => setToast('Paid plans are not connected yet.')}>
            Upgrade Now
          </button>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div className="search">
            <Search size={18} />
            <span>Search anything... (e.g. “Create a website for my cafe”)</span>
          </div>

          <div className="profile">
            <div className="avatar">JS</div>
            <div>
              <strong>Jayesh</strong>
              <small>Free Plan</small>
            </div>
            <ChevronDown size={16} />
          </div>
        </header>

        <div className="workspace">
          <section className="hero">
            <div className="hero-copy">
              <p className="eyebrow">CREATE WITH AI</p>

              <h1>
                Build Something <span>Amazing</span> with AI
              </h1>

              <p>
                Turn your ideas into websites, apps, content, images and more —
                all from one prompt.
              </p>

              <div className="prompt-box">
                <Sparkles size={20} />

                <input
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void create();
                  }}
                  placeholder="What do you want to create today?"
                />

                <button
                  onClick={() => void create()}
                  disabled={generating}
                  aria-label="Generate website"
                >
                  {generating ? '...' : <ArrowRight size={20} />}
                </button>
              </div>

              {generating && (
                <p role="status">Creating your demo website...</p>
              )}

              {error && (
                <p role="alert" style={{ color: '#e05252' }}>
                  {error}
                </p>
              )}

              <div className="chips">
                <button
                  onClick={() =>
                    setPrompt('Create a modern restaurant website')
                  }
                >
                  Create a restaurant website
                </button>

                <button
                  onClick={() =>
                    setPrompt('Build a SaaS startup landing page')
                  }
                >
                  Build a startup landing page
                </button>

                <button
                  onClick={() =>
                    setPrompt('Create a fitness coaching website')
                  }
                >
                  Create a fitness website
                </button>
              </div>
            </div>

            <div className="hero-art">
              <div className="orb">✦</div>
              <div className="float-card">
                AI <b>READY</b>
              </div>
              <div className="robot">🤖</div>
            </div>
          </section>

          <div className="section-head">
            <div>
              <h2>Quick Actions</h2>
              <p>Choose a feature and start creating instantly.</p>
            </div>
          </div>

          <section className="action-grid">
            {quickActions.map(([title, desc, Icon]) => (
              <button
                className="action-card"
                key={title}
                onClick={() =>
                  title === 'AI Website Generator'
                    ? setActive('Create with AI')
                    : setToast(`${title} is planned for a future version.`)
                }
              >
                <div className="action-icon">
                  <Icon size={21} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </button>
            ))}
          </section>

          <div className="section-head">
            <div>
              <h2>Recent Projects</h2>
              <p>{total} projects in this browser.</p>
            </div>

            <button
              className="link-btn"
              onClick={() => setActive('All Projects')}
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          <section className="project-grid">
            {sites.slice(0, 4).map((site) => (
              <button
                className="project-card"
                key={site.id}
                onClick={() => setSelected(site)}
              >
                <div className={`preview ${site.theme}`}>
                  <div className="mini-nav">
                    CREATEX <span>Home&nbsp;&nbsp; Services&nbsp;&nbsp; Contact</span>
                  </div>

                  <div className="mini-content">
                    <small>AI GENERATED</small>
                    <h3>{site.headline}</h3>
                    <p>{site.description}</p>
                    <span className="mini-btn">Explore →</span>
                  </div>
                </div>

                <div className="project-meta">
                  <div>
                    <strong>{site.name}</strong>
                    <small>{site.createdAt}</small>
                  </div>

                  <span className="badge">Website</span>
                </div>
              </button>
            ))}
          </section>

          <div className="section-head">
            <div>
              <h2>Latest Deployments</h2>
              <p>Your published websites.</p>
            </div>
          </div>

          <section className="deploy-list">
            <div>
              <div className="deploy-icon">
                <Globe size={16} />
              </div>

              <div>
                <strong>CreateX demo</strong>
                <small>Publishing is not connected</small>
              </div>

              <span className="live">Demo</span>
              <button onClick={publish}>View ↗</button>
            </div>
          </section>
        </div>
      </section>

      <aside className="rightbar">
        <div className="panel">
          <div className="panel-head">
            <h3>Your Plan</h3>
            <button onClick={() => setToast('Paid plans are not connected yet.')}>
              Upgrade
            </button>
          </div>

          <strong>Free Plan</strong>

          <ul>
            <li><Check size={14} /> Demo generation</li>
            <li><Check size={14} /> HTML download</li>
            <li><Check size={14} /> Basic templates</li>
            <li><Check size={14} /> Browser project storage</li>
          </ul>

          <button
            className="primary"
            onClick={() => setToast('Paid plans are not connected yet.')}
          >
            Upgrade to Pro
          </button>
        </div>

        <div className="panel">
          <h3>Quick Stats</h3>

          <div className="stats">
            <Stat n={String(total)} label="Projects Created" />
            <Stat n="Demo" label="AI Credits Left" />
            <Stat n="0" label="Deployments" />
            <Stat n="—" label="Total Visits" />
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Popular Templates</h3>
            <button
              onClick={() => setToast('Select a template to fill your prompt.')}
            >
              View all →
            </button>
          </div>

          {[
            'Restaurant',
            'Portfolio',
            'Gym',
            'E-commerce',
            'Business',
            'Education',
          ].map((item) => (
            <button
              className="template"
              key={item}
              onClick={() => setPrompt(`Create a ${item.toLowerCase()} website`)}
            >
              <div className="template-thumb" />

              <div>
                <strong>{item}</strong>
                <small>AI template</small>
              </div>

              <ArrowRight size={15} />
            </button>
          ))}
        </div>

        <div className="launch">
          <Rocket size={28} />
          <h3>Ready to launch your idea?</h3>
          <p>Let CreateX AI handle the hard work.</p>

          <button
            onClick={() => {
              setPrompt('Create my business website');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Create Now <ArrowRight size={16} />
          </button>
        </div>
      </aside>

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() => setSelected(null)}
        >
          <div
            className="editor-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">LIVE PREVIEW</span>
                <h2>{selected.name}</h2>
              </div>

              <button
                className="icon-btn"
                onClick={() => setSelected(null)}
                aria-label="Close preview"
              >
                <X size={20} />
              </button>
            </div>

            {selected.html ? (
              <iframe
                title={`${selected.name} website preview`}
                sandbox="allow-same-origin"
                srcDoc={selected.html}
                style={{
                  width: '100%',
                  height: 'min(58vh, 560px)',
                  border: 0,
                  borderRadius: 12,
                  background: '#fff',
                }}
              />
            ) : (
              <div className={`site-preview ${selected.theme}`}>
                <div className="site-nav">
                  <strong>CREATE<span>X</span></strong>
                  <div>Home&nbsp;&nbsp; Services&nbsp;&nbsp; About&nbsp;&nbsp; Contact</div>
                  <button>Get Started</button>
                </div>

                <div className="site-hero">
                  <small>STARTER PROJECT PREVIEW</small>
                  <h1>{selected.headline}</h1>
                  <p>{selected.description}</p>

                  <div>
                    <button>Explore Services</button>
                    <button className="secondary">Contact Us</button>
                  </div>
                </div>

                <div className="site-services">
                  {selected.services.map((service) => (
                    <div key={service}>
                      <Sparkles size={18} />
                      <strong>{service}</strong>
                      <p>
                        Designed to help your business grow with a simple,
                        modern experience.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="editor-bar">
              <div className="edit-input">
                <Wand2 size={17} />

                <input
                  value={editPrompt}
                  onChange={(event) => setEditPrompt(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') applyEdit();
                  }}
                  placeholder="Try: change theme to light..."
                />

                <button onClick={applyEdit}>
                  <ArrowRight size={18} />
                </button>
              </div>

              <button
                className="publish"
                onClick={() =>
                  selected.html ? downloadHtml(selected) : publish()
                }
              >
                <Rocket size={16} />
                {selected.html ? 'Download HTML' : 'Publish'}
              </button>

              <button
                className="icon-btn"
                onClick={() => void copyProject()}
                aria-label="Copy project"
              >
                <Copy size={17} />
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="stat">
      <strong>{n}</strong>
      <span>{label}</span>
    </div>
  );
}
