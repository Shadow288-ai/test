import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import NotFound from "@/pages/NotFound";

describe("NotFound", () => {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    errorSpy.mockClear();
  });

  afterEach(() => {
    // keep spy active
  });

  it("logs a 404 error with the attempted path", () => {
    render(
      <MemoryRouter initialEntries={["/does-not-exist"]}>
        <Routes>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    );

    // NotFound logs the pathname via console.error :contentReference[oaicite:7]{index=7}
    expect(errorSpy).toHaveBeenCalled();
    const args = errorSpy.mock.calls[0];
    expect(args[0]).toContain("404 Error: User attempted to access non-existent route:");
    expect(args[1]).toBe("/does-not-exist");
  });
});

