import { Link, Chip } from '@heroui/react';

interface BlogCardProps {
  title: string;
  excerpt?: string;
  author?: string;
  keywords?: string[];
  category?: string;
  href: string;
}

export const BlogCard = ({
  title,
  excerpt = '',
  author = '',
  keywords = [],
  category = 'Blog',
  href,
}: BlogCardProps) => {
  const authorInitial = author.trim().charAt(0) || '?';
  const visibleKeywords = Array.isArray(keywords) ? keywords.slice(0, 2) : [];

  return (
    <article className="group relative flex flex-col h-full overflow-hidden m-card-surface m-card-hover-border m-card-hover-lift p-0 transition-all duration-300">
      {/* Visual Accent */}
      <div className="h-2 w-full bg-gradient-to-r from-accent-500 via-secondary-500 to-primary-700 opacity-80" />

      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <Chip
            size="sm"
            variant="flat"
            color="secondary"
            className="font-semibold uppercase tracking-wider text-[10px]"
          >
            {category}
          </Chip>
          <span className="text-[11px] text-default-600 dark:text-default-500 font-medium">
            5 min read
          </span>
        </div>

        <h3 className="mb-3">
          <Link
            href={href}
            className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight tracking-tight"
          >
            {title}
          </Link>
        </h3>

        <p className="text-sm leading-relaxed text-default-800 dark:text-default-600 mb-6 line-clamp-3">
          {excerpt}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-divider">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-default-200 to-default-300 flex items-center justify-center text-[10px] font-bold">
              {authorInitial}
            </div>
            <span className="text-xs font-semibold text-default-700 dark:text-default-400">
              {author}
            </span>
          </div>

          {visibleKeywords.length > 0 ? (
            <div className="flex gap-1.5">
              {visibleKeywords.map((keyword, idx) => (
                <span
                  key={`${keyword}-${idx}`}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-default-100 dark:bg-default-50 text-default-700 dark:text-default-800 font-medium border border-divider/50"
                >
                  {keyword}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
};
