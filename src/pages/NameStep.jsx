import React, { useState, useEffect } from "react";
import { useTypingEffect, RenderChatStep, BotAvatar } from "./utils.jsx";


const NameStep = ({ firstName, lastName, setAnswerField, handleNameSubmit, isNameStepComplete, question, subtext }) => {

    const { displayedText, isTypingComplete } = useTypingEffect(question, 20);
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

    // Transition classes now depend on shouldAnimateIn
    const transitionClasses = shouldAnimateIn
        ? "translate-y-0 opacity-100"
        : "translate-y-8 opacity-0";

    // We'll also increase the duration to 1000ms (1 second) to make it slower
    const nameInputContent = (
        // Changed duration from duration-700 to duration-1000 for a slower, smoother effect
        <div className={`flex flex-col items-center w-full transition-all duration-1000 ease-out ${transitionClasses}`}>

            <p className="text-base font-light text-gray-500 mb-8 w-full max-w-lg text-center">
                {subtext}
            </p>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-lg">
                <input
                    type="text"
                    placeholder="FIRST NAME"
                    value={firstName}
                    onChange={(e) => setAnswerField('firstName')(e.target.value)}
                    className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 transition duration-150 min-w-0 placeholder-gray-400 font-normal uppercase"
                />

                <input
                    type="text"
                    placeholder="LAST NAME"
                    value={lastName}
                    onChange={(e) => setAnswerField('lastName')(e.target.value)}
                    className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 transition duration-150 min-w-0 placeholder-gray-400 font-normal uppercase"
                />
            </div>
        </div>
    );

    return (
        // Reduced pt-12 to pt-8
        <div className="w-full flex justify-center pt-8">
            <div className="max-w-3xl w-full flex flex-col items-center px-4">

                {/* Reduced mb-16 to mb-8, removed redundant h-12 div */}
                <div className="relative w-full mb-8" style={{ maxWidth: '400px' }}>
                    <div className="absolute inset-0 border-t-2 border-blue-400"></div>
                    <BotAvatar
                        className="w-24 h-24 rounded-full object-cover shadow-lg absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        style={{ top: '0' }}
                    />
                </div>

                {/* Removed redundant <div className="h-12 w-full"></div> */}

                <div className="text-center max-w-lg mb-4">
                    <h1 className="text-2xl sm:text-3xl font-normal text-gray-800 tracking-tight">
                        {displayedText}
                        {(!isTypingComplete) && (
                            <span className="inline-block w-1.5 h-6 bg-pink-600 ml-1 align-middle animate-pulse"></span>
                        )}
                    </h1>
                </div>

                {/* Render the Input Fields and Button */}
                <RenderChatStep
                    isTypingComplete={isTypingComplete}
                    inputContent={isTypingComplete ? nameInputContent : null}
                    isComplete={isNameStepComplete}
                    submitHandler={handleNameSubmit}
                />
            </div>
        </div>
    );
};

export default NameStep;