import { Link, HeroUIProvider } from '@heroui/react';

export const Footer = () => {
  return (
    <HeroUIProvider>
      <footer className="w-full border-t border-divider bg-background/60 py-12 backdrop-blur-lg">
        <div className="site-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-inherit">
                <span className="text-2xl">🦀</span>
                <span className="text-xl tracking-tight">CoClaw</span>
              </div>
              <p className="text-sm text-default-500">
                The open-source community platform for OpenClaw (clawdbot) users.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-default-900 dark:text-default-100 uppercase tracking-wider mb-4">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/getting-started" color="foreground" size="sm">
                    Getting Started
                  </Link>
                </li>
                <li>
                  <Link href="/docs" color="foreground" size="sm">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/troubleshooting" color="foreground" size="sm">
                    Troubleshooting
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-default-900 dark:text-default-100 uppercase tracking-wider mb-4">
                Community
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/community" color="foreground" size="sm">
                    Forum
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/openclaw/openclaw"
                    isExternal
                    color="foreground"
                    size="sm"
                  >
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href="/discord" color="foreground" size="sm">
                    Discord
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-default-900 dark:text-default-100 uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" color="foreground" size="sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" color="foreground" size="sm">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-divider">
            <p className="text-center text-sm text-default-400">
              &copy; {new Date().getFullYear()} CoClaw. Not affiliated with the official OpenClaw
              project.
            </p>
          </div>
        </div>
      </footer>
    </HeroUIProvider>
  );
};
