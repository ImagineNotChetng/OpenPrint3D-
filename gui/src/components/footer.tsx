export function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted">
          OpenPrint3D — An open standard for 3D printing profiles
        </p>
        <div className="flex items-center gap-6">
          <a href="https://github.com/OpenPrint3D/OpenPrint3D" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-foreground transition-colors">
            GitHub
          </a>
          <a href="https://discord.gg/PDwzze2Bbw" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-foreground transition-colors">
            Discord
          </a>
          <a href="https://github.com/OpenPrint3D/OpenPrint3D/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-foreground transition-colors">
            License
          </a>
        </div>
      </div>
    </footer>
  );
}
