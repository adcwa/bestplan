import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Props {
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<Props> = ({ onOpenCommandPalette }) => {
  return (
    <header className="flex justify-between items-center py-4 px-6 bg-white border-b border-neutral-200">
      <div className="flex-1">
        <button
          onClick={onOpenCommandPalette}
          className="p-2 text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
          title="搜索 (⌘K)"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
      </div>

      <button
        onClick={onOpenCommandPalette}
        className="flex items-center group focus:outline-none"
      >
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
          The Best Year of My Life
        </h1>
      </button>

      <div className="flex-1"></div>
    </header>
  );
}; 