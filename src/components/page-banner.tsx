import { Editable } from './editable';

export function PageBanner({ k, children }: { k?: string; children: string }) {
  return (
    <header className="page-banner">
      {k ? <Editable k={k} as="h1">{children}</Editable> : <h1>{children}</h1>}
    </header>
  );
}
