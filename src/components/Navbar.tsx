import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
  HeroUIProvider,
} from '@heroui/react';
import { useEffect, useRef, useState } from 'react';
import { ThemeSwitch } from './ThemeSwitch';

interface NavbarProps {
  currentPath: string;
}

const normalizePath = (path: string) => {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }

  return path;
};

const resourcesItems = [
  { name: 'Channels', href: '/channels' },
  { name: 'Guides', href: '/guides' },
  { name: 'Special Reports', href: '/special-reports' },
  { name: 'Solutions', href: '/troubleshooting/solutions' },
  { name: 'Stories', href: '/stories' },
  { name: 'Blog', href: '/blog' },
];

export const Navbar = ({ currentPath }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResourcesMenuOpen, setIsResourcesMenuOpen] = useState(false);
  const [isDesktopResourcesOpen, setIsDesktopResourcesOpen] = useState(false);
  const desktopResourcesRef = useRef<HTMLDivElement | null>(null);
  const normalizedCurrentPath = normalizePath(currentPath);

  const isActivePath = (href: string) => {
    const normalizedHref = normalizePath(href);

    if (normalizedHref === '/') {
      return normalizedCurrentPath === '/';
    }

    return (
      normalizedCurrentPath === normalizedHref ||
      normalizedCurrentPath.startsWith(`${normalizedHref}/`)
    );
  };

  const isResourcesActive =
    isActivePath('/resources') || resourcesItems.some((item) => isActivePath(item.href));

  const menuItemsBeforeResources = [
    { name: 'Getting Started', href: '/getting-started', external: false },
  ];

  const menuItemsAfterResources = [
    { name: 'Troubleshooting', href: '/troubleshooting', external: false },
    { name: 'Community', href: 'https://forum.coclaw.com', external: true },
  ];

  useEffect(() => {
    if (!isMenuOpen) {
      setIsResourcesMenuOpen(false);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!desktopResourcesRef.current?.contains(event.target as Node)) {
        setIsDesktopResourcesOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return (
    <HeroUIProvider>
      <HeroNavbar
        maxWidth="2xl"
        position="static"
        onMenuOpenChange={setIsMenuOpen}
        classNames={{
          base: 'shadow-[0_10px_30px_-25px_rgb(0_0_0/0.25)] dark:shadow-[0_10px_30px_-25px_rgb(0_0_0/0.8)]',
          item: 'data-[active=true]:text-primary',
        }}
      >
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="sm:hidden"
          />
          <NavbarBrand>
            <a href="/" className="flex items-center gap-3 font-bold text-inherit">
              <img src="/logo.svg" alt="CoClaw Logo" className="w-8 h-8 dark:hidden" />
              <img src="/logo-dark.svg" alt="CoClaw Logo" className="w-8 h-8 hidden dark:block" />
              <span className="text-xl tracking-tight">CoClaw</span>
              <span className="hidden sm:inline-flex items-center rounded-full border border-divider bg-content2/60 px-2 py-0.5 text-xs font-medium text-default-900 dark:text-default-700">
                🦞
              </span>
            </a>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-8" justify="center">
          {menuItemsBeforeResources.map((item) => (
            <NavbarItem key={item.name}>
              <Link
                color="foreground"
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  !item.external && isActivePath(item.href)
                    ? 'text-primary'
                    : 'text-foreground/90 hover:text-foreground'
                }`}
                isExternal={item.external}
                showAnchorIcon={item.external}
              >
                {item.name}
              </Link>
            </NavbarItem>
          ))}

          <NavbarItem isActive={isResourcesActive}>
            <div className="relative" ref={desktopResourcesRef}>
              <button
                type="button"
                onClick={() => setIsDesktopResourcesOpen((open) => !open)}
                className={`inline-flex items-center gap-1 text-sm font-medium transition-colors outline-none ${
                  isResourcesActive || isDesktopResourcesOpen
                    ? 'text-primary'
                    : 'text-foreground/90 hover:text-foreground'
                }`}
                aria-haspopup="menu"
                aria-expanded={isDesktopResourcesOpen}
                aria-controls="desktop-resources-menu"
              >
                <span>Resources</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-4 w-4 transition-transform ${
                    isDesktopResourcesOpen ? 'rotate-180' : ''
                  }`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isDesktopResourcesOpen && (
                <div
                  id="desktop-resources-menu"
                  role="menu"
                  className="absolute left-1/2 top-full z-[60] mt-3 w-56 -translate-x-1/2 rounded-2xl border border-divider bg-background/95 p-2 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                >
                  {resourcesItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      className={`block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                        isActivePath(item.href)
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground/90 hover:bg-content2 hover:text-foreground'
                      }`}
                    >
                      {item.name}
                    </a>
                  ))}
                  <a
                    href="/resources"
                    role="menuitem"
                    className={`mt-2 block rounded-xl border-t border-divider px-3 pt-3 pb-2 text-sm font-medium transition-colors ${
                      isActivePath('/resources')
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground/90 hover:bg-content2 hover:text-foreground'
                    }`}
                  >
                    All Resources
                  </a>
                </div>
              )}
            </div>
          </NavbarItem>

          {menuItemsAfterResources.map((item) => (
            <NavbarItem key={item.name}>
              <Link
                color="foreground"
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  !item.external && isActivePath(item.href)
                    ? 'text-primary'
                    : 'text-foreground/90 hover:text-foreground'
                }`}
                isExternal={item.external}
                showAnchorIcon={item.external}
              >
                {item.name}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem className="flex items-center gap-2">
            <Button
              as={Link}
              color="primary"
              href="/openclaw-config-generator"
              variant="solid"
              radius="full"
              className="hidden sm:inline-flex font-semibold px-6"
            >
              Config Generator
            </Button>
            <ThemeSwitch />
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu>
          {menuItemsBeforeResources.map((item, index) => (
            <NavbarMenuItem key={`${item.name}-${index}`}>
              <Link
                color="foreground"
                className={`w-full ${
                  !item.external && isActivePath(item.href) ? 'text-primary' : ''
                }`}
                href={item.href}
                size="lg"
                isExternal={item.external}
                showAnchorIcon={item.external}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem>
            <div className="w-full">
              <button
                type="button"
                onClick={() => setIsResourcesMenuOpen((open) => !open)}
                className={`flex w-full items-center justify-between text-left text-lg transition-colors ${
                  isResourcesActive ? 'text-primary' : 'text-foreground'
                }`}
                aria-expanded={isResourcesMenuOpen}
                aria-controls="mobile-resources-menu"
              >
                <span>Resources</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-5 w-5 transition-transform ${
                    isResourcesMenuOpen ? 'rotate-180' : ''
                  }`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isResourcesMenuOpen && (
                <div
                  id="mobile-resources-menu"
                  className="mt-3 space-y-3 border-l border-divider pl-4"
                >
                  {resourcesItems.map((item) => (
                    <Link
                      key={item.href}
                      color="foreground"
                      className={`block w-full ${isActivePath(item.href) ? 'text-primary' : ''}`}
                      href={item.href}
                      size="md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link
                    color="foreground"
                    className={`block w-full border-t border-divider pt-3 ${
                      isActivePath('/resources') ? 'text-primary' : ''
                    }`}
                    href="/resources"
                    size="md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    All Resources
                  </Link>
                </div>
              )}
            </div>
          </NavbarMenuItem>
          {menuItemsAfterResources.map((item, index) => (
            <NavbarMenuItem key={`${item.name}-after-${index}`}>
              <Link
                color="foreground"
                className={`w-full ${
                  !item.external && isActivePath(item.href) ? 'text-primary' : ''
                }`}
                href={item.href}
                size="lg"
                isExternal={item.external}
                showAnchorIcon={item.external}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem>
            <Button
              as={Link}
              color="primary"
              href="/openclaw-config-generator"
              variant="solid"
              className="w-full mt-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Config Generator
            </Button>
          </NavbarMenuItem>
        </NavbarMenu>
      </HeroNavbar>
    </HeroUIProvider>
  );
};
