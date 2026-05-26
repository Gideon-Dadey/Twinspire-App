import * as React from 'react';

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }): React.JSX.Element {
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be raw JSON in a script tag — escape closing tags defensively.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
