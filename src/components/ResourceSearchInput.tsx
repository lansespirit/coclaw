import { Input } from '@heroui/react';

export const ResourceSearchInput = () => {
  return (
    <Input
      placeholder="Search for guides, videos, or help..."
      radius="full"
      size="lg"
      variant="bordered"
      className="shadow-2xl shadow-primary/5"
      startContent={
        <svg
          className="w-5 h-5 text-default-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
    />
  );
};
