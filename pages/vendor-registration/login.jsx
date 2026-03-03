import { useState } from "react";
import Image from "next/image";
import { FaPhone, FaKey } from "react-icons/fa";
import { toast } from "sonner";
import { onSendOtp, onVerifyOtp } from "../../services/vendor-services/loginService";

const Login = () => {
    const [step, setStep] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const sendOTP = async () => {
        if (!phoneNumber) {
            setError("Please enter your phone number!");
            return;
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setError("Please enter a valid 10-digit phone number!");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await onSendOtp({ contact_no: phoneNumber });

            if (res.success) {
                toast.success("OTP sent successfully");
                setStep(2);
            } else {
                setError(res.message);
                toast.error(res.message);
            }
        } catch {
            setError("Network error. Please check your connection.");
            toast.error("Network error occurred");
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async () => {
        if (!otp) {
            setError("Please enter the OTP!");
            return;
        }

        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP!");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await onVerifyOtp({ contact_no: phoneNumber, otp: otp });
        } catch (err) {
            setError("Network error. Please check your connection.");
            toast.error("Network error occurred");
        } finally {
            setLoading(false);
        }
    };

    const resendOTP = async () => {
        setOtp("");
        setError("");
        await sendOTP();
    };

    const goBack = () => {
        setStep(1);
        setOtp("");
        setError("");
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 10) {
            setPhoneNumber(value);
            setError("");
        }
    };

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 6) {
            setOtp(value);
            setError("");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (step === 1) {
            sendOTP();
        } else {
            verifyOTP();
        }
    };

    return (
        <div className="container flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
            <div className="vendor-box w-full max-w-md mx-auto p-6 sm:p-8 md:p-10">
                {/* Logo */}
                <div className="flex justify-center">
                    <Image
                        src="/Ornate-Solar-Logo.png"
                        width={200}
                        height={50}
                        alt="Ornate Solar Logo"
                        className=" sm:w-[400] md:w-52 h-auto"
                    />
                </div>

                {/* Step 1: Phone Number */}
                {step === 1 && (
                    <>
                        <div className="content text-2xl md:text-xl text-center">
                            Vendor Registration
                        </div>
                        <form onSubmit={handleSubmit} className="input_area w-full">
                            <div className="relative flex justify-center w-full mb-4">
                                <div className="relative w-full sm:w-[85%] md:w-[80%]">
                                    <input
                                        className="login_fields w-full px-4 py-3 sm:py-3.5 pr-12 text-base sm:text-lg"
                                        type="tel"
                                        value={phoneNumber}
                                        name="phoneNumber"
                                        placeholder="Phone Number"
                                        onChange={handlePhoneChange}
                                        maxLength={10}
                                        disabled={loading}
                                    />
                                    <div className="login_icon absolute right-4 top-1/2 transform -translate-y-1/2">
                                        <FaPhone size={13} className="sm:w-4 sm:h-4" />
                                    </div>
                                </div>
                            </div>
                        </form>
                        <div className="mt-6 flex w-full flex-col items-center justify-center gap-4">
                            <button
                                className="login_button common w-full sm:w-[85%] md:w-[80%] py-3 sm:py-3.5 text-base sm:text-lg"
                                onClick={sendOTP}
                                type="button"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send OTP"}
                            </button>
                            {error && (
                                <p className="text-red-600 text-xs sm:text-sm text-center px-4">
                                    {error}
                                </p>
                            )}
                        </div>
                    </>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                    <>
                        <div className="content text-center text-sm sm:text-base md:text-lg px-4">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                                <span className="text-xl md:text-lg">Enter OTP sent to {phoneNumber}</span>
                                <button
                                    onClick={goBack}
                                    className="text-blue-600 text-xs sm:text-sm underline hover:text-blue-700"
                                    type="button"
                                >
                                    Change
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="input_area w-full">
                            <div className="relative flex justify-center w-full mb-4">
                                <div className="relative w-full sm:w-[85%] md:w-[80%]">
                                    <input
                                        className="login_fields w-full px-4 py-3 sm:py-3.5 pr-12 text-center tracking-widest text-base sm:text-lg"
                                        type="tel"
                                        value={otp}
                                        name="otp"
                                        placeholder="Enter 6-digit OTP"
                                        onChange={handleOtpChange}
                                        maxLength={6}
                                        disabled={loading}
                                        autoFocus
                                    />
                                    <div className="login_icon absolute right-4 top-1/2 transform -translate-y-1/2">
                                        <FaKey size={13} className="sm:w-4 sm:h-4" />
                                    </div>
                                </div>
                            </div>
                        </form>
                        <div className="mt-6 flex w-full flex-col items-center justify-center gap-4">
                            <button
                                className="login_button common w-full sm:w-[85%] md:w-[80%] py-3 sm:py-3.5 text-base sm:text-lg"
                                onClick={verifyOTP}
                                type="button"
                                disabled={loading}
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </button>

                            <button
                                onClick={resendOTP}
                                className="text-xs sm:text-sm text-blue-600 underline hover:text-blue-700"
                                disabled={loading}
                                type="button"
                            >
                                Resend OTP
                            </button>

                            {error && (
                                <p className="text-red-600 text-xs sm:text-sm text-center px-4">
                                    {error}
                                </p>
                            )}
                        </div>
                    </>
                )}

                <div className="footer mt-8">
                    {/* Additional footer content */}
                </div>
            </div>
        </div>
    );
};

export default Login;