import React, { useState } from 'react';
import { MdOutlineAddTask } from "react-icons/md";
import emailverifyimg from "../assets/emailverifyimg.png";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EmailVerification = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    console.log("email : ",email)

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!email) {
            alert("Please enter your email.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/forgotPasswordController', { email });
            console.log("Email sent response:", response.data);

            // Redirect to the forgotPassword route with email in params
        } catch (error) {
            console.error("Error sending email:", error.response?.data || error.message);
            alert("Failed to send reset password email. Please try again.");
        }
    };

    return (
        <div className="bg-white flex justify-center min-h-screen w-3/5 mx-auto">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-center">
                {/* Form Section */}
                <div className="w-full md:w-1/2 mt-10">
                    <div className="flex mb-8 md:mt-0">
                        <h1 className="flex gap-1 items-center">
                            <p className="bg-red-500 p-2 rounded-full">
                                <MdOutlineAddTask className="text-white text-2xl font-black" />
                            </p>
                            <span className="text-2xl font-bold text-black">TaskUp</span>
                        </h1>
                    </div>

                    <h1 className="text-3xl font-bold mb-4 mt-40">
                        Forgot your password?
                    </h1>
                    <p className="mb-6">
                        To reset your password, please enter the email address of your Todoist account.
                    </p>

                    <form onSubmit={handleResetPassword}>
                        <div className="mb-4">
                            <label
                                className="block text-sm font-medium text-gray-700"
                                htmlFor="email"
                            >
                                Email
                            </label>
                            <input
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                id="email"
                                name="email"
                                placeholder="Enter your email..."
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button
                            className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            type="submit"
                        >
                            Reset my password
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a
                            className="text-sm text-gray-500 hover:text-gray-700"
                            href="#"
                            onClick={() => navigate('/')}
                        >
                            Go to login
                        </a>
                    </div>
                </div>

                {/* Image Section */}
                <div className="hidden md:block md:w-3/5 flex justify-center items-center pt-[15rem] ms-10">
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

export default EmailVerification;
