export function Figure({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <figure className="my-8 space-y-3">
      {children}
      <figcaption className="text-sm text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}
