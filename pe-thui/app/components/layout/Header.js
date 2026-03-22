import Link from 'next/link';

export default function Header({ profile }) {
  return (
    <header className="fixed top-0 w-full max-w-lg left-1/2 -translate-x-1/2 flex justify-between items-center px-6 py-4 bg-background/80 backdrop-blur-xl z-50 rounded-b-2xl shadow-sm border-b border-surface-container">

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-surface-container-lowest overflow-hidden shadow-sm">
          {profile.avatar ? (
            <img alt="Baby profile" className="w-full h-full object-cover" src={profile.avatar} />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">👶</div>
          )}
        </div>
        <span className="text-2xl font-extrabold tracking-tight text-primary font-headline uppercase">{profile.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 flex items-center justify-center text-primary rounded-full hover:bg-surface-container transition-all">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="w-10 h-10 flex items-center justify-center text-primary rounded-full hover:bg-surface-container transition-all">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  );
}
