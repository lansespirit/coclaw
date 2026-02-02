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
import { useState } from 'react';
import { ThemeSwitch } from './ThemeSwitch';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Getting Started', href: '/getting-started', external: false },
    { name: 'Resources', href: '/resources', external: false },
    { name: 'Troubleshooting', href: '/troubleshooting', external: false },
    { name: 'Community', href: 'https://forum.coclaw.com', external: true },
  ];

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
          {menuItems.map((item) => (
            <NavbarItem key={item.name}>
              <Link
                color="foreground"
                href={item.href}
                className="text-sm font-medium text-foreground/90 hover:text-foreground transition-colors"
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
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.name}-${index}`}>
              <Link
                color="foreground"
                className="w-full"
                href={item.href}
                size="lg"
                isExternal={item.external}
                showAnchorIcon={item.external}
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
            >
              Config Generator
            </Button>
          </NavbarMenuItem>
        </NavbarMenu>
      </HeroNavbar>
    </HeroUIProvider>
  );
};
