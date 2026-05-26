import '@testing-library/jest-dom';

if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

if (typeof window !== 'undefined' && !window.ResizeObserver) {
  class ResizeObserverMock {
    observe(): void {
      /* noop */
    }
    unobserve(): void {
      /* noop */
    }
    disconnect(): void {
      /* noop */
    }
  }
  Object.defineProperty(window, 'ResizeObserver', { writable: true, value: ResizeObserverMock });
}
