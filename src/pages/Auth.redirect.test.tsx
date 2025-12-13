import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/hooks/useAuth";
import Auth from "@/pages/Auth";

function setAuth(value: any) {
  (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue(value);
}

describe("Auth page redirects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects admin to /admin", async () => {
    setAuth({
      signIn: vi.fn(),
      signUp: vi.fn(),
      user: { id: "u-admin" },
      userRole: "admin",
    });

    render(<Auth />);

    // Auth.tsx: if (user && userRole==='admin') navigate('/admin') :contentReference[oaicite:5]{index=5}
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/admin"));
  });

  it("redirects client to /client", async () => {
    setAuth({
      signIn: vi.fn(),
      signUp: vi.fn(),
      user: { id: "u-client" },
      userRole: "client",
    });

    render(<Auth />);

    // Auth.tsx: else if userRole==='client' navigate('/client') :contentReference[oaicite:6]{index=6}
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/client"));
  });
});
