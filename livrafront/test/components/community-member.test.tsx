import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import CommunityMember from "@/components/community-member";
import { User } from "@/types/auth";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock Framer Motion components to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className }: any) => (
    <img 
      src={src} 
      alt={alt} 
      width={width} 
      height={height} 
      className={className}
      data-testid="user-avatar"
    />
  ),
}));

// Mock custom components
jest.mock("@/components/button", () => ({
  __esModule: true,
  default: ({ text, icon, onClick, path, fullwidth }: any) => (
    <button 
      onClick={onClick ? onClick : () => { (window as any).__mockPush && (window as any).__mockPush(path); }}
      data-testid="custom-button"
      data-text={text}
      data-path={path}
      data-fullwidth={fullwidth}
    >
      {icon && <span data-testid="button-icon">{icon}</span>}
      {text}
    </button>
  ),
}));

// Mock icons
jest.mock("@/components/icons/SingleUserIcon", () => () => <svg data-testid="single-user-icon" />);
jest.mock("@/components/icons/RemoveIcon", () => () => <svg data-testid="remove-icon" />);
jest.mock("@/components/icons/ToolIcon", () => () => <svg data-testid="tool-icon" />);
jest.mock("@/components/icons/StarIcon", () => () => <svg data-testid="star-icon" />);

// Define test user
const mockUser: User = {
  userId: "123",
  username: "testuser",
  avatarUrl: "https://example.com/avatar.jpg",
  email: "test@example.com",
  pronouns: "they/them",
};

describe("CommunityMember", () => {
  const mockPush = jest.fn();
  const mockHandleRemoveMember = jest.fn();
  const mockHandleMakeModerator = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    mockPush.mockClear();
    mockHandleRemoveMember.mockClear();
    mockHandleMakeModerator.mockClear();
    // expose mockPush to component/button mock via window for navigation simulation
    (window as any).__mockPush = mockPush;
    
    // Mock window dimensions
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  describe("Basic rendering", () => {
    it("renders user information correctly", () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={false}
          isTargetUserModerator={false}
        />
      );

      expect(screen.getByText("@testuser")).toBeInTheDocument();
      expect(screen.getByTestId("user-avatar")).toHaveAttribute("src", mockUser.avatarUrl);
    });

    it("renders star icon when user is moderator", () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={false}
          isTargetUserModerator={true}
        />
      );

      expect(screen.getByTestId("star-icon")).toBeInTheDocument();
    });

    it("does not render star icon when user is not moderator", () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={false}
          isTargetUserModerator={false}
        />
      );

      expect(screen.queryByTestId("star-icon")).not.toBeInTheDocument();
    });

    it("uses default avatar when avatarUrl is not provided", () => {
      const userWithoutAvatar = { ...mockUser, avatarUrl: "" };
      render(
        <CommunityMember 
          user={userWithoutAvatar}
          isCurrentUserModerator={false}
          isTargetUserModerator={false}
        />
      );

      expect(screen.getByTestId("user-avatar")).toHaveAttribute("src", "/AbstractUser.png");
    });
  });

  describe("Click behavior for non-moderator users", () => {
    it("navigates to user profile when clicked and current user is not moderator", () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={false}
          isTargetUserModerator={false}
        />
      );

      const memberElement = screen.getByText("@testuser").closest("div");
      fireEvent.click(memberElement!);

      expect(mockPush).toHaveBeenCalledWith("/testuser");
    });

    it("navigates to user profile when clicked and target user is moderator", () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={true}
          isTargetUserModerator={true}
        />
      );

      const memberElement = screen.getByText("@testuser").closest("div");
      fireEvent.click(memberElement!);

      expect(mockPush).toHaveBeenCalledWith("/testuser");
    });
  });

  describe("Moderator options menu", () => {
    it("shows options menu when moderator clicks on non-moderator user", () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={true}
          isTargetUserModerator={false}
          handleRemoveMember={mockHandleRemoveMember}
          handleMakeModerator={mockHandleMakeModerator}
        />
      );

      const memberElement = screen.getByText("@testuser").closest("div");
      fireEvent.click(memberElement!);

      const buttons = screen.getAllByTestId("custom-button");
      expect(buttons).toHaveLength(3);
    });

    it("does not show options menu when current user is not moderator", () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={false}
          isTargetUserModerator={false}
        />
      );

      const memberElement = screen.getByText("@testuser").closest("div");
      fireEvent.click(memberElement!);

      expect(screen.queryByTestId("custom-button")).not.toBeInTheDocument();
    });

    it("does not show options menu when target user is moderator", () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={true}
          isTargetUserModerator={true}
        />
      );

      const memberElement = screen.getByText("@testuser").closest("div");
      fireEvent.click(memberElement!);

      expect(screen.queryByTestId("custom-button")).not.toBeInTheDocument();
    });

    it("menu buttons have correct labels and icons", () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={true}
          isTargetUserModerator={false}
          handleRemoveMember={mockHandleRemoveMember}
          handleMakeModerator={mockHandleMakeModerator}
        />
      );

      const memberElement = screen.getByText("@testuser").closest("div");
      fireEvent.click(memberElement!);

      const buttons = screen.getAllByTestId("custom-button");
      expect(buttons[0]).toHaveAttribute("data-text", "Visitar perfil de @testuser");
      expect(buttons[1]).toHaveAttribute("data-text", "Remover @testuser da comunidade");
      expect(buttons[2]).toHaveAttribute("data-text", "Tornar @testuser moderador");
    });

    it("hides menu when mouse leaves menu area", async () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={true}
          isTargetUserModerator={false}
        />
      );

      const memberElement = screen.getByText("@testuser").closest("div");
      fireEvent.click(memberElement!);

      const buttons = screen.getAllByTestId("custom-button");
      expect(buttons.length).toBeGreaterThan(0);

      const menu = buttons[0].closest("div");
      fireEvent.mouseLeave(menu!);

      // Menu should be hidden
      await waitFor(() => {
        expect(screen.queryByTestId("custom-button")).not.toBeInTheDocument();
      });
    });

    it("hides menu when hovering ends on main component", () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={true}
          isTargetUserModerator={false}
        />
      );

      const mainComponent = screen.getByText("@testuser").closest("div")?.parentElement;
      fireEvent.mouseLeave(mainComponent!);

      expect(screen.queryByTestId("custom-button")).not.toBeInTheDocument();
    });
  });

  describe("Menu positioning", () => {
    it("adjusts menu position when near right edge of screen", () => {
      Object.defineProperty(window, "innerWidth", { value: 500 });
      
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={true}
          isTargetUserModerator={false}
        />
      );

      const memberElement = screen.getByText("@testuser").closest("div");
      fireEvent.click(memberElement!, { clientX: 400, clientY: 100 });

      // Menu should be positioned to avoid overflow
      const buttons = screen.getAllByTestId("custom-button");
      const menu = buttons[0].closest("div");
      expect(menu).toHaveStyle("left: 240px"); // 500 - 250 (menu width) - 10 (padding)
    });

    it("adjusts menu position when near bottom edge of screen", () => {
      Object.defineProperty(window, "innerHeight", { value: 400 });
      
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={true}
          isTargetUserModerator={false}
        />
      );

      const memberElement = screen.getByText("@testuser").closest("div");
      fireEvent.click(memberElement!, { clientX: 100, clientY: 300 });

      // Menu should be positioned to avoid overflow
      const buttons = screen.getAllByTestId("custom-button");
      const menu = buttons[0].closest("div");
      expect(menu).toHaveStyle("top: 190px"); // 400 - 200 (menu height) - 10 (padding)
    });

    it("positions menu at click location when not near edges", () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={true}
          isTargetUserModerator={false}
        />
      );

      const clickX = 200;
      const clickY = 300;
      
      const memberElement = screen.getByText("@testuser").closest("div");
      fireEvent.click(memberElement!, { clientX: clickX, clientY: clickY });

      const buttons = screen.getAllByTestId("custom-button");
      const menu = buttons[0].closest("div");
      expect(menu).toHaveStyle(`left: ${clickX}px`);
      expect(menu).toHaveStyle(`top: ${clickY}px`);
    });
  });

  describe("Menu button actions", () => {
    it("visit profile button navigates to user profile", () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={true}
          isTargetUserModerator={false}
        />
      );

      const memberElement = screen.getByText("@testuser").closest("div");
      fireEvent.click(memberElement!);

      const buttons = screen.getAllByTestId("custom-button");
      fireEvent.click(buttons[0]);

      expect(mockPush).toHaveBeenCalledWith("/testuser");
    });

    it("remove member button calls handleRemoveMember with userId", () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={true}
          isTargetUserModerator={false}
          handleRemoveMember={mockHandleRemoveMember}
        />
      );

      const memberElement = screen.getByText("@testuser").closest("div");
      fireEvent.click(memberElement!);

      const buttons = screen.getAllByTestId("custom-button");
      fireEvent.click(buttons[1]);

      expect(mockHandleRemoveMember).toHaveBeenCalledWith("123");
    });

    it("make moderator button calls handleMakeModerator with userId", () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={true}
          isTargetUserModerator={false}
          handleMakeModerator={mockHandleMakeModerator}
        />
      );

      const memberElement = screen.getByText("@testuser").closest("div");
      fireEvent.click(memberElement!);

      const buttons = screen.getAllByTestId("custom-button");
      fireEvent.click(buttons[2]);

      expect(mockHandleMakeModerator).toHaveBeenCalledWith("123");
    });

    it("handles missing optional handlers gracefully", () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={true}
          isTargetUserModerator={false}
          // No handlers provided
        />
      );

      const memberElement = screen.getByText("@testuser").closest("div");
      fireEvent.click(memberElement!);

      const buttons = screen.getAllByTestId("custom-button");
      
      // Should not throw error when clicking buttons without handlers
      fireEvent.click(buttons[1]); // Remove button
      fireEvent.click(buttons[2]); // Make moderator button
      
      // Should still navigate for profile button
      fireEvent.click(buttons[0]);
      expect(mockPush).toHaveBeenCalledWith("/testuser");
    });
  });

  describe("Edge cases", () => {
    it("handles user without username", () => {
      const userWithoutUsername = { ...mockUser, username: "" };
      render(
        <CommunityMember 
          user={userWithoutUsername}
          isCurrentUserModerator={true}
          isTargetUserModerator={false}
        />
      );

      expect(screen.getByText("@")).toBeInTheDocument();
    });

    it("uses fallback text when username is missing in menu buttons", () => {
      const userWithoutUsername = { ...mockUser, username: "" };
      render(
        <CommunityMember 
          user={userWithoutUsername}
          isCurrentUserModerator={true}
          isTargetUserModerator={false}
        />
      );

      const memberElement = screen.getByText("@").closest("div");
      fireEvent.click(memberElement!);

      const buttons = screen.getAllByTestId("custom-button");
      expect(buttons[0]).toHaveAttribute("data-text", "Visitar Perfil");
      expect(buttons[1]).toHaveAttribute("data-text", "Remover da Comunidade");
      expect(buttons[2]).toHaveAttribute("data-text", "Tornar Moderador");
    });

    it("toggles menu on subsequent clicks", async () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={true}
          isTargetUserModerator={false}
        />
      );

      const memberElement = screen.getByText("@testuser").closest("div");
      
      // First click shows menu
      fireEvent.click(memberElement!);
      const buttons = screen.getAllByTestId("custom-button");
      expect(buttons.length).toBeGreaterThan(0);

      // Second click hides menu
      fireEvent.click(memberElement!);
      await waitFor(() => {
        expect(screen.queryByTestId("custom-button")).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility and interactions", () => {
    it("has proper ARIA attributes and keyboard support", () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={false}
          isTargetUserModerator={false}
        />
      );

      const memberElement = screen.getByText("@testuser").closest("div");
      const mainElement = memberElement?.parentElement;

      // Should have focus visible styles
      expect(mainElement).toHaveClass("focus-visible:outline-none");
      expect(mainElement).toHaveClass("focus-visible:ring-1");
      expect(mainElement).toHaveClass("focus-visible:ring-black");

      // Should have hover styles
      expect(mainElement).toHaveClass("hover:opacity-90");
      expect(mainElement).toHaveClass("hover:cursor-pointer");

      // Should have active styles
      expect(mainElement).toHaveClass("active:opacity-95");
    });

    it("handles disabled state styling", () => {
      render(
        <CommunityMember 
          user={mockUser}
          isCurrentUserModerator={false}
          isTargetUserModerator={false}
        />
      );

      const memberElement = screen.getByText("@testuser").closest("div");
      const mainElement = memberElement?.parentElement;

      // Check for disabled state classes
      expect(mainElement).toHaveClass("disabled:opacity-70");
      expect(mainElement).toHaveClass("disabled:cursor-not-allowed");
    });
  });
});