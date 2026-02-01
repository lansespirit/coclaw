import { Link, Chip } from '@heroui/react';
import { IconClock } from './icons';

interface GuideCardProps {
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  platforms: string[];
  time?: string;
  href: string;
}

const difficultyColors = {
  Beginner: 'from-green-500 to-emerald-600',
  Intermediate: 'from-yellow-400 to-orange-500',
  Advanced: 'from-red-500 to-rose-600',
};

const chipColors = {
  Beginner: 'success',
  Intermediate: 'warning',
  Advanced: 'danger',
} as const;

export const GuideCard = ({
  title,
  description,
  difficulty,
  platforms,
  time = '15 min',
  href,
}: GuideCardProps) => {
  return (
    <article className="group relative flex flex-col h-full overflow-hidden m-card-surface m-card-hover-border m-card-hover-lift p-0 transition-all duration-300">
      {/* Difficulty Visual Accent */}
      <div className={`h-2 w-full bg-gradient-to-r ${difficultyColors[difficulty]} opacity-80`} />

      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <Chip
            size="sm"
            variant="flat"
            color={chipColors[difficulty]}
            className="font-semibold uppercase tracking-wider text-[10px]"
          >
            {difficulty}
          </Chip>
          <div className="flex items-center gap-1.5 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
            <IconClock className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="text-[11px] font-medium">{time}</span>
          </div>
        </div>

        <h3 className="mb-3">
          <Link
            href={href}
            className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight tracking-tight"
          >
            {title}
          </Link>
        </h3>

        <p className="text-sm leading-relaxed text-default-800 dark:text-default-600 mb-6 line-clamp-2">
          {description}
        </p>

        <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t border-divider">
          {platforms.map((platform) => (
            <span
              key={platform}
              className="text-[10px] px-2 py-0.5 rounded-full bg-default-100 dark:bg-default-50 text-default-700 dark:text-default-800 font-medium border border-divider/50"
            >
              {platform}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};
