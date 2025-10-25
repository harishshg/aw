import React, { useState, useEffect } from 'react';

// --- Global Constants ---
export const EMAIL_STEP = 1;      // Now the first step
export const PHONE_STEP = 2;      // Now the second step
export const MOVED_STEP = 3;
// ---------------------------
export const HOT_PINK = '#ec4899'; // Keeping pink for the cursor/accent
export const ACCENT_BLUE = '#1c7ed6'; // Using a blue accent for the fields/links
export const buttonBaseClasses = 'w-full max-w-sm sm:w-64 py-4 text-xl font-bold uppercase rounded-xl transition duration-200 tracking-wider transform hover:scale-[1.01]';

// --- Custom Hook for Typing Animation (Unchanged) ---
export const useTypingEffect = (textToType, speed = 30) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTypingComplete, setIsTypingComplete] = useState(false);

    useEffect(() => {
        if (!textToType) {
            setDisplayedText('');
            setIsTypingComplete(false);
            return;
        }
        let i = 0;
        setIsTypingComplete(false);
        setDisplayedText('');
        const timer = setInterval(() => {
            setDisplayedText((prev) => prev + textToType.charAt(i));
            i++;
            if (i >= textToType.length) {
                clearInterval(timer);
                setIsTypingComplete(true);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [textToType, speed]);
    return { displayedText, isTypingComplete };
};

// --- Bot Avatar Component (Unchanged) ---
export const BotAvatar = ({ className = "" }) => (
    <div className={`w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg border-4 border-white ${className}`}>
        <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="Bot Avatar"
            // object-cover ensures the image fills and is covered by the container.
            className="object-cover w-full h-full"
        />
    </div>
);

// --- Reusable History Bubble (Unchanged) ---
export const UserMessageBubble = ({ message, landed, editable, onEdit }) => (
    <div className="flex justify-end mb-8">
        <div className="flex items-center group relative">
            {editable && landed && (
                <button
                    onClick={onEdit}
                    className="
                        w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center mr-2 bg-white shadow-md
                        hover:bg-gray-100 transition duration-150 flex-shrink-0
                        opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
                        transform translate-x-3 group-hover:translate-x-0 group-focus-within:translate-x-0
                    "
                    aria-label="Edit answer"
                    title="Edit answer"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
            )}
            <div
                className={`
                    bg-gray-100 px-4 py-2 rounded-xl max-w-xs text-gray-800 text-lg shadow-sm
                    transition-all duration-300 ease-out transform
                    ${landed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                `}
            >
                {message}
            </div>
        </div>
    </div>
);

// --- Generic Chat Step Renderer (Unchanged) ---
export const RenderChatStep = ({
    isTypingComplete,
    inputContent,
    isComplete,
    submitHandler,
    submitButtonText = "Next",
    showMapConfirmation = false
}) => {
    const inputShouldShow = isTypingComplete || showMapConfirmation;

    // Tailwind classes for button styling
    const buttonEnabledClasses = 'bg-gray-300 text-gray-700 hover:bg-gray-400';
    const buttonDisabledClasses = 'bg-gray-100 text-gray-400 cursor-not-allowed';

    return (
        <div className="w-full flex flex-col items-center">
            {/* 1. Input Fields Content (Conditionally rendered) */}
            {inputShouldShow && (
                <>
                    {inputContent}

                    {/* 2. Submit Button */}
                    <div className="mt-4 w-full max-w-lg">
                        <button
                            onClick={submitHandler}
                            disabled={!isComplete}
                            className={`
                                w-full py-3 text-lg font-normal rounded-lg transition duration-200 tracking-wider 
                                shadow-md
                                ${isComplete
                                    ? buttonEnabledClasses
                                    : buttonDisabledClasses
                                }
                            `}
                        >
                            {submitButtonText}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};