import { Input } from '@heroui/react';
import { IconSearch } from './icons';

export const ResourceSearchInput = () => {
  return (
    <Input
      placeholder="Search for guides, videos, or help..."
      radius="full"
      size="lg"
      variant="bordered"
      className="shadow-2xl shadow-primary/5"
      startContent={<IconSearch className="w-5 h-5 text-default-400" aria-hidden="true" />}
    />
  );
};
