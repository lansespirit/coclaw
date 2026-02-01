import { Tabs, Tab, Card, CardBody, Code } from '@heroui/react';

export default function QuickInstallTabs() {
  return (
    <div className="w-full">
      <Tabs
        aria-label="Installation options"
        variant="underlined"
        classNames={{
          tabList: 'gap-6 w-full relative rounded-none p-0 border-b border-divider',
          cursor: 'w-full bg-primary',
          tab: 'max-w-fit px-0 h-12',
          tabContent: 'group-data-[selected=true]:text-primary',
        }}
      >
        <Tab
          key="macos"
          title={
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <span className="font-semibold">macOS</span>
            </div>
          }
        >
          <Card className="mt-6">
            <CardBody className="gap-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-2 text-default-700 dark:text-default-500">
                  <li>macOS (Intel & Apple Silicon supported)</li>
                  <li>Node.js 22+ (Node 22 LTS recommended)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">1. Install Node.js</h3>
                <p className="text-default-700 dark:text-default-500 mb-3">
                  Using Homebrew (recommended):
                </p>
                <Code className="w-full p-4 bg-content2">brew install node@22</Code>
                <p className="text-default-700 dark:text-default-500 mt-3">
                  Or download from{' '}
                  <a
                    href="https://nodejs.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    nodejs.org
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">2. Install OpenClaw</h3>
                <Code className="w-full p-4 bg-content2">npm install -g openclaw@latest</Code>
                <p className="text-default-700 dark:text-default-500 mt-3">
                  Or using pnpm (recommended):
                </p>
                <Code className="w-full p-4 bg-content2 mt-2">pnpm add -g openclaw@latest</Code>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">3. Run the Setup Wizard</h3>
                <Code className="w-full p-4 bg-content2">openclaw onboard --install-daemon</Code>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">4. Open the Dashboard</h3>
                <Code className="w-full p-4 bg-content2">openclaw dashboard</Code>
              </div>

              <div className="pt-4 border-t border-divider">
                <p className="text-default-700 dark:text-default-500">
                  ✅ That's it! OpenClaw is now running on your Mac.
                </p>
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="linux"
          title={
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.84-.41 1.719-.41 2.623 0 .955.164 1.898.493 2.8.615 1.681 1.901 3.052 3.57 3.799 1.885.843 4.17.843 6.055 0 1.669-.747 2.955-2.118 3.57-3.799.329-.902.493-1.845.493-2.8 0-.904-.132-1.783-.41-2.623-.589-1.771-1.831-3.47-2.716-4.521-.75-1.067-.974-1.928-1.05-3.02-.065-1.491 1.056-5.965-3.17-6.298-.165-.013-.325-.021-.48-.021zm-.005 5.326c.885 0 1.602.717 1.602 1.602 0 .885-.717 1.602-1.602 1.602-.885 0-1.602-.717-1.602-1.602 0-.885.717-1.602 1.602-1.602z" />
              </svg>
              <span className="font-semibold">Linux</span>
            </div>
          }
        >
          <Card className="mt-6">
            <CardBody className="gap-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-2 text-default-700 dark:text-default-500">
                  <li>Any modern Linux distro (Ubuntu/Debian/Fedora/Arch, etc.)</li>
                  <li>Node.js 22+ (Node 22 LTS recommended)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">1. Install Node.js</h3>
                <p className="text-default-700 dark:text-default-500 mb-3">Ubuntu/Debian:</p>
                <Code className="w-full p-4 bg-content2">
                  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
                  <br />
                  sudo apt-get install -y nodejs
                </Code>
                <p className="text-default-700 dark:text-default-500 mt-4">
                  For other distros, install Node.js 22+ using your distro’s preferred method.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">2. Install OpenClaw</h3>
                <Code className="w-full p-4 bg-content2">npm install -g openclaw@latest</Code>
                <p className="text-default-700 dark:text-default-500 mt-3">
                  Or using pnpm (recommended):
                </p>
                <Code className="w-full p-4 bg-content2 mt-2">pnpm add -g openclaw@latest</Code>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">3. Run the Setup Wizard</h3>
                <Code className="w-full p-4 bg-content2">openclaw onboard --install-daemon</Code>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">4. Open the Dashboard</h3>
                <Code className="w-full p-4 bg-content2">openclaw dashboard</Code>
              </div>

              <div className="pt-4 border-t border-divider">
                <p className="text-default-700 dark:text-default-500">
                  ✅ That's it! OpenClaw is now running on your Linux system.
                </p>
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="windows"
          title={
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
              </svg>
              <span className="font-semibold">Windows</span>
            </div>
          }
        >
          <Card className="mt-6">
            <CardBody className="gap-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-2 text-default-700 dark:text-default-500">
                  <li>Windows 10 or Windows 11</li>
                  <li>WSL2 (Windows Subsystem for Linux) recommended for best experience</li>
                  <li>Node.js 22+ (recommended inside WSL2)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">Option A: Using WSL2 (Recommended)</h3>
                <p className="text-default-700 dark:text-default-500 mb-3">1. Install WSL2:</p>
                <Code className="w-full p-4 bg-content2">wsl --install</Code>
                <p className="text-default-700 dark:text-default-500 mt-3 mb-3">
                  2. Restart your computer, then enable systemd in WSL and follow the Linux steps
                  above.
                </p>
                <Code className="w-full p-4 bg-content2">
                  sudo tee /etc/wsl.conf &gt;/dev/null &lt;&lt;'EOF'
                  <br />
                  [boot]
                  <br />
                  systemd=true
                  <br />
                  EOF
                  <br />
                  <br />
                  wsl --shutdown
                </Code>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">Option B: Native Windows (Experimental)</h3>
                <p className="text-default-700 dark:text-default-500 mb-3">
                  1. Download and install Node.js from{' '}
                  <a
                    href="https://nodejs.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    nodejs.org
                  </a>
                </p>
                <p className="text-default-700 dark:text-default-500 mb-3">
                  2. Open PowerShell or Command Prompt and install OpenClaw:
                </p>
                <Code className="w-full p-4 bg-content2">npm install -g openclaw@latest</Code>
                <p className="text-default-700 dark:text-default-500 mt-3">
                  Or using pnpm (recommended):
                </p>
                <Code className="w-full p-4 bg-content2 mt-2">pnpm add -g openclaw@latest</Code>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">3. Run the Setup Wizard</h3>
                <Code className="w-full p-4 bg-content2">openclaw onboard</Code>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">4. Open the Dashboard</h3>
                <Code className="w-full p-4 bg-content2">openclaw dashboard</Code>
              </div>

              <div className="pt-4 border-t border-divider">
                <p className="text-default-700 dark:text-default-500">
                  ✅ That's it! OpenClaw is now running on your Windows system.
                </p>
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="docker"
          title={
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338 0-.676.03-1.01.09-.808-2.602-3.044-3.962-3.114-4.01a.185.185 0 00-.25.065c-.824 1.33-1.019 2.894-.57 4.164.23.66.664 1.25 1.228 1.662-.066.02-.132.04-.2.06-.736.184-1.544.23-2.21.23-8.649 0-7.96 7.98-7.96 7.98.193 2.586 1.608 4.815 3.771 5.944 1.76.922 3.704 1.39 5.68 1.39 6.56 0 10.787-3.058 12.694-9.175.908.068 2.84-.16 3.486-2.018a.19.19 0 00-.034-.214" />
              </svg>
              <span className="font-semibold">Docker</span>
            </div>
          }
        >
          <Card className="mt-6">
            <CardBody className="gap-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-2 text-default-700 dark:text-default-500">
                  <li>Docker installed on your system</li>
                  <li>Docker Compose (optional, for easier management)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">1. Clone the OpenClaw Repo</h3>
                <Code className="w-full p-4 bg-content2">
                  git clone https://github.com/openclaw/openclaw.git
                  <br />
                  cd openclaw
                </Code>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">2. Run the Docker Setup Script</h3>
                <p className="text-default-700 dark:text-default-500 mb-3">
                  This builds the image, runs the onboarding wizard, and starts the gateway via
                  Docker Compose:
                </p>
                <Code className="w-full p-4 bg-content2">./docker-setup.sh</Code>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">3. Open the Dashboard</h3>
                <Code className="w-full p-4 bg-content2">http://127.0.0.1:18789/</Code>
                <p className="text-default-700 dark:text-default-500 mt-3">
                  Paste the gateway token shown by the setup script.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">Manual Docker Compose (Alternative)</h3>
                <p className="text-default-700 dark:text-default-500 mb-3">From the repo root:</p>
                <Code className="w-full p-4 bg-content2 text-sm">
                  docker build -t openclaw:local -f Dockerfile .
                  <br />
                  docker compose run --rm openclaw-cli onboard
                  <br />
                  docker compose up -d openclaw-gateway
                </Code>
              </div>

              <div className="pt-4 border-t border-divider">
                <p className="text-default-700 dark:text-default-500">
                  ✅ That's it! OpenClaw is now running in a Docker container.
                </p>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      <div className="mt-8 p-6 rounded-xl bg-content1 border border-divider">
        <h3 className="text-xl font-bold mb-3">Next Steps</h3>
        <div className="space-y-2 text-default-700 dark:text-default-500">
          <p>
            📝{' '}
            <a href="/tools/config-generator" className="text-primary hover:underline">
              Use the Configuration Generator
            </a>{' '}
            to set up your channels
          </p>
          <p>
            📚{' '}
            <a href="/resources" className="text-primary hover:underline">
              Browse Guides
            </a>{' '}
            for detailed tutorials
          </p>
          <p>
            🔧{' '}
            <a href="/troubleshooting" className="text-primary hover:underline">
              Check Troubleshooting
            </a>{' '}
            if you encounter issues
          </p>
        </div>
      </div>
    </div>
  );
}
