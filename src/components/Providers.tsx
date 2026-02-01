import { HeroUIProvider } from '@heroui/react';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <HeroUIProvider>{children}</HeroUIProvider>;
};
