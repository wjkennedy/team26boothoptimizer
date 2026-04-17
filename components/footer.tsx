export function Footer() {
  return (
    <footer className="border-t border-border bg-background/50 backdrop-blur-sm py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>&copy; 2026</span>
          <a
            href="https://www.a9consulting.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            A9 Group, Inc.
          </a>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/booth-optimizer"
            className="hover:text-foreground transition-colors"
          >
            Booth Optimizer
          </a>
          <a
            href="https://events.atlassian.com/team"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Atlassian Team '26
          </a>
        </div>
      </div>
    </footer>
  )
}
