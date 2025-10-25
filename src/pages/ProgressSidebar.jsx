import React from 'react';
import { useSelector } from 'react-redux';

// Define the main high-level steps for the sidebar
const MAIN_STEPS = [
    { id: 'ABOUT_YOU', label: 'About You', firstStepId: 'EMAIL_STEP' },
    { id: 'CARS', label: 'Cars', firstStepId: 'CARS_STEP_PLACEHOLDER' },
    { id: 'DRIVERS', label: 'Drivers', firstStepId: 'DRIVERS_STEP_PLACEHOLDER' },
    { id: 'HOW_DO_YOU_DRIVE', label: 'How do you drive', firstStepId: 'DRIVE_STEP_PLACEHOLDER' },
    { id: 'QUOTE', label: 'Quote', firstStepId: 'QUOTE_STEP_PLACEHOLDER' },
];

const ProgressSidebar = ({ currentActiveStep }) => {
    // Determine the high-level step based on the sub-steps:
    // Email (4), Phone (5), Moved (6) are all part of 'About You'
    const getHighLevelStep = (step) => {
        if (['EMAIL_STEP', 'PHONE_STEP', 'MOVED_STEP'].includes(step)) {
            return 'ABOUT_YOU';
        }
        // In a real application, you would map other steps to Cars, Drivers, etc.
        return null;
    };

    const currentHighLevelStep = getHighLevelStep(currentActiveStep);

    return (
        <div className="flex flex-col space-y-2 p-6 md:p-8">
            {MAIN_STEPS.map((mainStep, index) => {
                // Determine if this step is the current one (highlighted with dark blue)
                const isActive = mainStep.id === currentHighLevelStep;
                
                // Determine the color of the circle and text
                const circleClass = isActive
                    ? 'border-2 border-indigo-700 bg-white' // Active: Blue border, white fill
                    : 'border-2 border-gray-300 bg-gray-100'; // Inactive: Gray border/fill

                const textClass = isActive
                    ? 'text-indigo-700 font-semibold'
                    : 'text-gray-500';

                return (
                    <div key={mainStep.id} className="flex items-start">
                        {/* Vertical Line and Circle */}
                        <div className="flex flex-col items-center">
                            {/* Line ABOVE the circle - hidden for the first step */}
                            <div className={`w-0.5 h-6 ${index === 0 ? 'bg-transparent' : 'bg-gray-300'}`}></div>
                            
                            {/* Circle Indicator */}
                            <div className={`w-4 h-4 rounded-full ${circleClass} flex items-center justify-center`}>
                                {/* Optional inner fill for the active state */}
                                {isActive && (
                                    <div className="w-2 h-2 rounded-full bg-indigo-700 opacity-100"></div>
                                )}
                            </div>
                            
                            {/* Line BELOW the circle - hidden for the last step */}
                            <div className={`w-0.5 h-6 ${index === MAIN_STEPS.length - 1 ? 'bg-transparent' : 'bg-gray-300'}`}></div>
                        </div>

                        {/* Step Label */}
                        <p className={`ml-4 mt-0.5 whitespace-nowrap ${textClass}`}>
                            {mainStep.label}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default ProgressSidebar;