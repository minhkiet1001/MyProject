import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/auth/RegisterForm";
import authService from "../services/authService";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(undefined);

  useEffect(() => {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
      const { path } = authService.getUserRoleAndPath();
      navigate(path);
    }
  }, [navigate]);

  const handleRegister = async (userData) => {
    // Reset error state
    setError(undefined);
    setIsLoading(true);

    try {
      const response = await authService.register(userData);

      console.log("Đăng ký thành công!", response);

      // Redirect to login page with success message
      navigate("/login", {
        replace: true,
        state: {
          registered: true,
          email: userData.email,
        },
      });
    } catch (err) {
      setError(
        err.message ||
          "Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại."
      );
      console.error("Lỗi đăng ký", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <RegisterForm
        onSubmit={handleRegister}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default RegisterPage;
