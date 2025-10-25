// src/components/MovedStep.jsx

import React, { useEffect, useState } from 'react';
import { useTypingEffect, RenderChatStep, BotAvatar } from "./utils.jsx";


const MovedStep = ({ moved, setAnswerField, handleMovedSubmit }) => {

    const mainQuestionText = "Have you moved in the last 2 months?";

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

    // Validation: Answer must be explicitly 'YES' or 'NO'
    const isMovedComplete = moved === 'YES' || moved === 'NO';

    const movedInputContent = (
        <div className="w-full text-left flex justify-start">
            <div className={`w-full max-w-sm space-y-4 transition-all duration-1000 ease-out ${transitionClasses}`}>

                {/* YES Option */}
                <div 
                    onClick={() => setAnswerField('moved')('YES')}
                    className={`
                        w-full p-3 border-2 rounded-lg cursor-pointer transition-colors duration-200 
                        ${moved === 'YES' 
                            ? 'bg-white border-blue-700 shadow-lg' 
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }
                    `}
                >
                    <label className="flex items-center text-lg font-medium text-gray-700">
                        <input
                            type="radio"
                            name="moved_radio"
                            value="YES"
                            checked={moved === 'YES'}
                            readOnly
                            className="hidden" // Hide the default radio button
                        />
                        <span className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${moved === 'YES' ? 'border-blue-700' : 'border-gray-400'}`}>
                            {moved === 'YES' && <span className="w-2 h-2 rounded-full bg-blue-700"></span>}
                        </span>
                        YES
                    </label>
                </div>

                {/* NO Option (Selected by default in the image) */}
                <div 
                    onClick={() => setAnswerField('moved')('NO')}
                    className={`
                        w-full p-3 border-2 rounded-lg cursor-pointer transition-colors duration-200 
                        ${moved === 'NO' 
                            ? 'bg-white border-blue-700 shadow-lg' 
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }
                    `}
                >
                    <label className="flex flex-center text-lg font-medium text-gray-700">
                        <input
                            type="radio"
                            name="moved_radio"
                            value="NO"
                            checked={moved === 'NO'}
                            readOnly
                            className="hidden"
                        />
                         <span className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${moved === 'NO' ? 'border-blue-700' : 'border-gray-400'}`}>
                            {moved === 'NO' && <span className="w-2 h-2 rounded-full bg-blue-700"></span>}
                        </span>
                        NO
                    </label>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full flex justify-start">
            <div className="max-w-xl w-full flex flex-col items-start ml-10">

                {/* Left-Aligned Avatar and Text Container */}
                <div className="w-full max-w-lg flex items-start mb-8">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 mt-1 flex-shrink-0">
                        <BotAvatar />
                    </div>

                    {/* Main Question Text Block */}
                    <div className="flex flex-col flex-1">
                        <h1 className="text-xl sm:text-sm font-bold text-gray-800 tracking-tight">
                            {displayedText}
                            {(!isTypingComplete) && (
                                <span className="inline-block w-1.5 h-6 bg-pink-600 ml-1 align-middle animate-pulse"></span>
                            )}
                        </h1>
                    </div>
                </div>

                {/* Render the Input Fields and Button */}
                <RenderChatStep
                    isTypingComplete={isTypingComplete}
                    inputContent={isTypingComplete ? movedInputContent : null}
                    isComplete={isMovedComplete}
                    submitHandler={handleMovedSubmit}
                    submitButtonText="Next"
                />
            </div>
        </div>
    );
};

export default MovedStep;