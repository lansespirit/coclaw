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
    { name: 'Getting Started', href: '/getting-started' },
    { name: 'Documentation', href: '/docs' },
    { name: 'Troubleshooting', href: '/troubleshooting' },
    { name: 'Community', href: '/community' },
  ];

  return (
    <HeroUIProvider>
      <HeroNavbar
        maxWidth="full"
        position="static"
        onMenuOpenChange={setIsMenuOpen}
        classNames={{
          base: 'bg-background/30 backdrop-blur-xl backdrop-saturate-150 shadow-[0_10px_30px_-25px_rgba(0,0,0,0.8)]',
          wrapper: 'site-container',
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
              <span className="text-2xl">🦀</span>
              <span className="text-xl tracking-tight">CoClaw</span>
              <span className="hidden sm:inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-default-400">
                v0.0.1
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
                className="text-sm font-medium hover:text-white transition-colors"
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
              href="/tools/config-generator"
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
              <Link color="foreground" className="w-full" href={item.href} size="lg">
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem>
            <Button
              as={Link}
              color="primary"
              href="/tools/config-generator"
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
