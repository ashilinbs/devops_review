import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom"; // Import MemoryRouter
import Signup from "../components/Signup";

const renderSignup = () => {
  return render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );
};

describe("Signup Component", () => {
  test("renders Signup component with heading", () => {
    renderSignup();
    const heading = screen.getByText(/create account/i);
    expect(heading).toBeInTheDocument();
  });

  test("renders all input fields", () => {
    renderSignup();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });


  test("does not display password validation error for valid password", () => {
    renderSignup();
    const passwordInput = screen.getByLabelText("Password");
    fireEvent.change(passwordInput, { target: { value: "Valid@123" } });
    const errorMessage = screen.queryByText(
      /password must be at least 8 characters, include an uppercase, lowercase, number, and special character/i
    );
    expect(errorMessage).not.toBeInTheDocument();
  });


  test("displays success message on successful signup", async () => {
    global.alert = jest.fn(); // Mock alert
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    renderSignup();
    const usernameInput = screen.getByLabelText("Username");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "Valid@123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "Valid@123" } });
    fireEvent.click(submitButton);
    
    await screen.findByText(/create account/i); // Ensure the component re-renders
   
    expect(global.alert).toHaveBeenCalledWith("Sign Up Successful!");

    global.fetch.mockRestore();
  });
});