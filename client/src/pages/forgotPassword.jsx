import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import emailverifyimg from "../assets/emailverifyimg.png";
import { MdOutlineAddTask } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ForgotPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    const body = {
      newpassword: newPassword,
      confirmpassword: confirmPassword,
    };

    try {
      const response = await axios.patch(`http://localhost:3000/reset-password`, body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage(response.data.message);
      setTimeout(() => navigate("/"), 3000); // Redirect after success
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="bg-white flex justify-center min-h-screen w-3/5 mx-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-center">
        {/* Form Section */}
        <div className="bg-white p-8 rounded-lg w-full max-w-md">
          <div className="flex mb-8 md:mt-0">
            <h1 className="flex gap-1 items-center">
              <p className="bg-red-500 p-2 rounded-full">
                <MdOutlineAddTask className="text-white text-2xl font-black" />
              </p>
              <span className="text-2xl font-bold text-black">TaskUp</span>
            </h1>
          </div>
          <h1 className="text-2xl font-bold mb-2 mt-20">Password reset</h1>
          <p className="mb-4">
            Please enter a new password for your Todoist account.
          </p>
          <p className="mb-6">
            This will end all active sessions for your account and issue a new API token.
          </p>
          {errorMessage && (
            <p className="text-sm text-red-500 mb-4">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-sm text-green-500 mb-4">{successMessage}</p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="new-password"
              >
                Enter a new password
              </label>
              <div className="relative">
                <input
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <span
                  className="absolute right-3 top-3 cursor-pointer text-gray-500"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="confirm-password"
              >
                Confirm your new password
              </label>
              <div className="relative">
                <input
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <span
                  className="absolute right-3 top-3 cursor-pointer text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Your password must be at least 8 characters long. Avoid common words or patterns.
            </p>
            <button
              className="w-full bg-red-600 text-white py-2 rounded-md text-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              type="submit"
            >
              Reset my password
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need additional help?{" "}
              <a className="text-blue-600" href="/contact">
                Contact us
              </a>
            </p>
          </div>
        </div>

        {/* Image Section */}
        <div className="hidden md:block md:w-3/5 flex justify-center items-center pt-[15rem] ms-15">
          <img
            src={emailverifyimg}
            alt="Email Verification"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
