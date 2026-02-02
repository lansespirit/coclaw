import { Tabs, Tab, Card, CardBody, Code } from '@heroui/react';
import { IconApple, IconDocker, IconLinux, IconWindows } from './icons';

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
              <IconApple className="w-5 h-5" aria-hidden="true" />
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
              <IconLinux className="w-5 h-5" aria-hidden="true" />
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
              <IconWindows className="w-5 h-5" aria-hidden="true" />
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
                <Code className="w-full p-4 bg-content2">
                  openclaw onboard --install-daemon
                  <br /># Native Windows (experimental): openclaw onboard
                </Code>
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
              <IconDocker className="w-5 h-5" aria-hidden="true" />
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
            <a href="/openclaw-config-generator" className="text-primary hover:underline">
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
