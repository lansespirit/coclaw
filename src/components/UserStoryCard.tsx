import { Link } from '@heroui/react';

interface UserStoryCardProps {
  name: string;
  role: string;
  quote: string;
  avatar?: string;
  href: string;
}

export const UserStoryCard = ({ name, role, quote, avatar, href }: UserStoryCardProps) => {
  return (
    <article className="group relative overflow-hidden m-card-surface m-card-hover-border m-card-hover-lift p-6 transition-all duration-300">
      <div className="flex items-start gap-4 mb-4 relative z-10">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-divider flex items-center justify-center text-primary font-bold text-lg">
            {name.charAt(0)}
          </div>
        )}
        <div>
          <h4 className="font-bold text-foreground">{name}</h4>
          <p className="text-sm text-default-600 dark:text-default-500">{role}</p>
        </div>
      </div>

      <div className="relative mb-6">
        <svg
          className="absolute -top-2 -left-3 w-8 h-8 text-primary/10 -z-10"
          fill="currentColor"
          viewBox="0 0 32 32"
        >
          <path d="M10 8h2v8h-6v-2c0-3.314 2.686-6 6-6zM22 8h2v8h-6v-2c0-3.314 2.686-6 6-6z" />
        </svg>
        <blockquote className="text-default-800 dark:text-default-600 line-clamp-4 font-medium leading-relaxed italic">
          "{quote}"
        </blockquote>
      </div>

      <Link
        href={href}
        className="text-sm font-bold text-primary hover:text-primary transition-colors inline-flex items-center gap-1 group-hover:gap-2 transition-all"
      >
        Read full story
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </article>
  );
};
