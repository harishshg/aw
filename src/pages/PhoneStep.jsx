// src/components/PhoneStep.jsx

import React, { useEffect, useState } from 'react';
// Assuming useTypingEffect and BotAvatar are defined in utils.jsx
import { useTypingEffect, BotAvatar } from "./utils.jsx";


const PhoneStep = ({ phoneNumber, setAnswerField, handlePhoneSubmit }) => {

    const mainQuestionText = "Excellent, and What was your phone number ?";

    // Use typing effect
    const { displayedText, isTypingComplete } = useTypingEffect(mainQuestionText, 10);

    // State for input/button animation
    const [shouldAnimateIn, setShouldAnimateIn] = useState(false);

    useEffect(() => {
        if (isTypingComplete) {
            const timer = setTimeout(() => {
                setShouldAnimateIn(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isTypingComplete]);

    // Transition classes for bottom-to-top motion
    const transitionClasses = shouldAnimateIn
        ? "translate-y-0 opacity-100"
        : "translate-y-8 opacity-0";

    // Simple validation: 10 digits required
    const isPhoneComplete = phoneNumber.replace(/\D/g, '').length === 10;
    // The button in the image is always visible but disabled if input is incomplete
    const isDisabled = !isPhoneComplete;

    // Custom width approximation for the wider input field
    const inputWidthClass = 'w-full md:w-[400px]';

    return (
        <div className="w-full flex justify-start">
            <div className="max-w-xl w-full flex flex-col items-start">

                {/* Left-Aligned Avatar and Text Container */}
                <div className="w-full max-w-lg flex items-start mb-4">
                    {/* Bot Avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
                        <BotAvatar />
                    </div>

                    {/* Main Question Text Block */}
                    <div className="flex flex-col flex-1 max-w-md">
                        {/* Question Text */}
                        <h1 className="text-lg font-normal text-gray-800 tracking-normal">
                            {displayedText}
                            {(!isTypingComplete) && (
                                <span className="inline-block w-1.5 h-6 bg-pink-600 ml-1 align-middle animate-pulse"></span>
                            )}
                        </h1>
                    </div>
                </div>

                {/* FORM INPUT AND BUTTON SECTION */}
                {isTypingComplete && (
                    <div className={`flex flex-col space-y-4 transition-all duration-1000 ease-out ${transitionClasses}`}>

                        {/* 1. Phone Field Container (Wider) */}
                        <div className={`relative ${inputWidthClass}`}>
                            <input
                                type="tel"
                                placeholder="PHONE NUMBER"
                                value={phoneNumber}
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(/[^0-9\(\)\-\s]/g, '');
                                    setAnswerField('phoneNumber')(rawValue)
                                }}
                                className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 transition duration-150 placeholder-gray-400 font-normal uppercase"
                            />
                            {/* Phone Icon */}
                            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 17.72V20a2 2 0 01-2 2h-3.28a1 1 0 01-.948-.684l-1.498-4.493a1 1 0 01.502-1.21l2.257-1.13a11.042 11.042 0 00-5.516-5.516l-1.13 2.257a1 1 0 01-1.21.502L5.684 8.72A1 1 0 015 7.72V4z"></path></svg>
                        </div>

                        {/* 2. Next Button (Smaller and Light Gray) */}
                        <button
                            onClick={handlePhoneSubmit}
                            disabled={isDisabled}
                            // Applied max-w-xs to constrain width, and used p-3 px-8 for padding
                            className={`py-2 px-8 text-lg rounded-lg font-semibold transition duration-200 shadow-sm max-w-xs
                                ${isDisabled
                                    ? 'bg-gray-300 text-gray-700 cursor-not-allowed' // Matches the image's style
                                    : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md'
                                }
                            `}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhoneStep;