/**
 * Font Awesome bootstrap for the Next.js App Router.
 *
 * `@fortawesome/fontawesome-svg-core` auto-injects its CSS at runtime by
 * default. Next.js compiles its own CSS at build time, so we disable the
 * auto-injection and import the stylesheet ourselves (once, in
 * `app/layout.tsx`) to prevent a FOUC where icons are huge before the CSS
 * loads. See https://docs.fontawesome.com/web/use-with/react/use-with#next-js.
 */
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

config.autoAddCss = false;
