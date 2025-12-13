import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// We mock useAuth so tests don't touch Supabase/auth for real.
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/hooks/useAuth";

type AuthReturn = {
  user: any;
  userRole: string | null;
  loading: boolean;
};

function setAuth(value: AuthReturn) {
  (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue(value);
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a spinner while loading", () => {
    setAuth({ user: null, userRole: null, loading: true });

    const { container } = render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <div>SECRET</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // ProtectedRoute uses Loader2 with animate-spin while loading :contentReference[oaicite:1]{index=1}
    expect(container.querySelector(".animate-spin")).toBeTruthy();
    expect(screen.queryByText("SECRET")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated users to /auth", () => {
    setAuth({ user: null, userRole: null, loading: false });

    render(
      <MemoryRouter initialEntries={["/client"]}>
        <Routes>
          <Route
            path="/client"
            element={
              <ProtectedRoute>
                <div>CLIENT</div>
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<div>AUTH PAGE</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Unauthed => <Navigate to="/auth" /> :contentReference[oaicite:2]{index=2}
    expect(screen.getByText("AUTH PAGE")).toBeInTheDocument();
  });

  it("redirects non-admin users away from admin routes", () => {
    setAuth({ user: { id: "u1" }, userRole: "client", loading: false });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <div>ADMIN</div>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<div>HOME</div>} />
        </Routes>
      </MemoryRouter>
    );

    // requireAdmin && userRole !== 'admin' => Navigate "/" :contentReference[oaicite:3]{index=3}
    expect(screen.getByText("HOME")).toBeInTheDocument();
    expect(screen.queryByText("ADMIN")).not.toBeInTheDocument();
  });

  it("allows admin users into admin routes", () => {
    setAuth({ user: { id: "u2" }, userRole: "admin", loading: false });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <div>ADMIN OK</div>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<div>HOME</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("ADMIN OK")).toBeInTheDocument();
  });
});
