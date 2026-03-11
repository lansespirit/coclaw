import { Link, HeroUIProvider } from '@heroui/react';
import { IconChat, IconDiscord, IconGithub } from './icons';

type FooterLinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterLinkGroup = {
  title: string;
  links: FooterLinkItem[];
};

const companyLinks: FooterLinkItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Careers', href: '/careers' },
  { label: 'Security', href: '/security' },
  { label: 'Code of Conduct', href: '/code-of-conduct' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

const groups: FooterLinkGroup[] = [
  {
    title: 'Support',
    links: [
      { label: 'Getting Started', href: '/getting-started' },
      { label: 'Resources', href: '/resources' },
      { label: 'Config Generator', href: '/openclaw-config-generator' },
      { label: 'Troubleshooting Hub', href: '/troubleshooting' },
      { label: 'Solutions', href: '/troubleshooting/solutions' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Guides', href: '/guides' },
      { label: 'Channels', href: '/channels' },
      { label: 'Special Reports', href: '/special-reports' },
      { label: 'Stories', href: '/stories' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Forum', href: 'https://forum.coclaw.com', external: true },
      { label: 'Discord', href: 'https://discord.gg/clawd', external: true },
      { label: 'OpenClaw GitHub', href: 'https://github.com/openclaw/openclaw', external: true },
      {
        label: 'CoClaw GitHub',
        href: 'https://github.com/lansespirit/coclaw',
        external: true,
      },
      { label: 'Contributing', href: '/contributing' },
      {
        label: 'Report an Issue',
        href: 'https://github.com/lansespirit/coclaw/issues',
        external: true,
      },
    ],
  },
  {
    title: 'CoClaw',
    links: companyLinks,
  },
];

export const Footer = () => {
  return (
    <HeroUIProvider>
      <footer className="w-full border-t border-divider bg-background/60 py-12 backdrop-blur-lg">
        <div className="site-container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(360px,420px)_minmax(0,1fr)] gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-2 font-bold text-inherit">
                <span className="text-2xl" aria-hidden="true">
                  🦞
                </span>
                <span className="text-xl tracking-tight">CoClaw</span>
              </div>
              <p className="text-sm text-default-800 dark:text-default-600 text-balance">
                Guides, troubleshooting, and tools for the OpenClaw community.
              </p>
              <p className="text-xs text-default-700 dark:text-default-600">
                OpenClaw was formerly known as ClawDBot.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="https://forum.coclaw.com"
                  isExternal
                  color="foreground"
                  size="sm"
                  aria-label="CoClaw Forum"
                  className="inline-flex items-center gap-2"
                >
                  <IconChat className="w-4 h-4" aria-hidden="true" />
                  Forum
                </Link>
                <Link
                  href="https://discord.gg/clawd"
                  isExternal
                  color="foreground"
                  size="sm"
                  aria-label="OpenClaw Discord"
                  className="inline-flex items-center gap-2"
                >
                  <IconDiscord className="w-4 h-4" aria-hidden="true" />
                  Discord
                </Link>
                <Link
                  href="https://github.com/lansespirit/coclaw"
                  isExternal
                  color="foreground"
                  size="sm"
                  aria-label="CoClaw on GitHub"
                  className="inline-flex items-center gap-2"
                >
                  <IconGithub className="w-4 h-4" aria-hidden="true" />
                  GitHub
                </Link>
              </div>
              <p className="text-sm text-default-800 dark:text-default-600">
                Contact:{' '}
                <a href="mailto:contact@coclaw.com" className="underline underline-offset-4">
                  contact@coclaw.com
                </a>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-10">
              {groups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-bold text-default-900 dark:text-default-100 uppercase tracking-wider mb-4">
                    {group.title}
                  </h3>
                  <ul className="space-y-2">
                    {group.links.map((item) => (
                      <li key={`${group.title}-${item.href}`}>
                        <Link
                          href={item.href}
                          isExternal={item.external}
                          color="foreground"
                          size="sm"
                          showAnchorIcon={item.external}
                          className="inline-flex items-center gap-1 lg:whitespace-nowrap"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-divider">
            <p className="text-center text-sm text-default-900 dark:text-default-700">
              &copy; {new Date().getFullYear()} CoClaw Team. OpenClaw ecosystem supporters
              (community-run, not official).
            </p>
          </div>
        </div>
      </footer>
    </HeroUIProvider>
  );
};
