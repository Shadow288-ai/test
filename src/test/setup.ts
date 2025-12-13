import "@testing-library/jest-dom/vitest";

// Some components/hooks may rely on matchMedia (common in responsive UI code)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {}, // legacy
    removeListener: () => {}, // legacy
    dispatchEvent: () => false,
  }),
});

// Some UI libs use ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});
