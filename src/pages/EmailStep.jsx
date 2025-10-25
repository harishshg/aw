// src/components/EmailStep.jsx

import React, { useEffect, useState } from 'react';
import { useTypingEffect, RenderChatStep, BotAvatar } from "./utils.jsx";


const EmailStep = ({ email, setAnswerField, handleEmailSubmit, question }) => {

    const mainQuestionText = question;

    // Use typing effect on the currently relevant question
    const { displayedText, isTypingComplete } = useTypingEffect(mainQuestionText, 10);

    // New state to control the smooth transition trigger
    const [shouldAnimateIn, setShouldAnimateIn] = useState(false);

    // Use useEffect to set the final state after a short delay once typing is complete
    useEffect(() => {
        if (isTypingComplete) {
            // A short delay (e.g., 100ms) ensures the browser applies the initial hidden state
            const timer = setTimeout(() => {
                setShouldAnimateIn(true);
            }, 100);

            return () => clearTimeout(timer); // Cleanup the timer
        }
    }, [isTypingComplete]);

    // Transition classes for bottom-to-top motion (translate-y-8 to translate-y-0)
    const transitionClasses = shouldAnimateIn
        ? "translate-y-0 opacity-100"
        : "translate-y-8 opacity-0";

    // Basic email validation check (can be expanded)
    const isEmailComplete = email.trim() !== '' && email.includes('@');

    const emailInputContent = (
        // Changed "flex justify-center" to "text-left" for content container alignment
        <div className="w-full text-left flex justify-center">
            {/* ADDED: Transition classes for smooth bottom-to-top and fade-in effect */}
            <div className={`w-full max-w-lg space-y-6 transition-all duration-1000 ease-out ${transitionClasses}`}>

                {/* Email Field */}
                <div className="relative">
                    <input
                        type="email"
                        placeholder="EMAIL"
                        value={email}
                        // 🎯 Redux update
                        onChange={(e) => setAnswerField('email')(e.target.value)}
                        className="w-full pl-4 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 transition duration-150 placeholder-gray-400 font-normal uppercase"
                    />
                </div>

                {/* Date of Birth Field (DOB data not fully stored in Redux example, but controlled by component) */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="DATE OF BIRTH"
                        // 🎯 Redux update for DOB (assuming 'dob' is a field in Redux)
                        onChange={(e) => setAnswerField('dob')(e.target.value)}
                        onFocus={(e) => { e.target.type = 'date'; e.target.placeholder = ''; }}
                        onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; e.target.placeholder = 'DATE OF BIRTH'; }}
                        className="w-full pl-4 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 transition duration-150 placeholder-gray-400 font-normal uppercase"
                    />
                </div>

                {/* Checkboxes (Mimics Figma style) */}
                <div className="space-y-3 text-sm font-light text-gray-600 pt-2">
                    <label className="flex items-center">
                        <input type="checkbox" className={`form-checkbox h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500`} />
                        {/* Modified to text-xs font-semibold for requested style */}
                        <span className="ml-2 text-xs font-semibold">I agree to receive policy documents by email (optional)</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" className={`form-checkbox h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500`} />
                        {/* Modified to text-xs font-semibold for requested style */}
                        <span className="ml-2 text-xs font-semibold">I agree to the terms of service</span>
                    </label>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full flex justify-start ">
            {/* MODIFIED: Changed px-4 padding to ml-10 (40px) to push the entire content block from the left edge. */}
            <div className="max-w-xl w-full flex flex-col items-center ">

                {/* Left-Aligned Avatar and Text Container (for the email step) */}
                <div className="w-full max-w-3xl flex items-start mb-8">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 mt-1 flex-shrink-0">
                        <BotAvatar />
                    </div>

                    {/* Main Question Text Block */}
                    <div className="flex flex-col flex-1">
                        <h1 className="text-bold sm:text-sm  font-bold text-gray-800 tracking-tight">
                            {displayedText}
                            {(!isTypingComplete) && (
                                <span className="inline-block w-1.5 h-6 bg-pink-600 ml-1 align-middle animate-pulse"></span>
                            )}
                        </h1>
                    </div>
                </div>

                {/* Render the Input Fields and Button with conditional visibility */}
                <RenderChatStep
                    isTypingComplete={isTypingComplete}
                    // Only pass the content if typing is complete
                    inputContent={isTypingComplete ? emailInputContent : null}
                    isComplete={isEmailComplete}
                    submitHandler={handleEmailSubmit}
                    submitButtonText="Next"
                />
            </div>
        </div>
    );
};

export default EmailStep;