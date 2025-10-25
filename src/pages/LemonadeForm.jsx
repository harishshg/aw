import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// Redux Imports
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { Provider, useSelector, useDispatch } from 'react-redux';

// Local Imports
import EmailStep from './EmailStep';
import PhoneStep from './PhoneStep';
import MovedStep from './MovedStep';
import {
    BotAvatar, EMAIL_STEP, PHONE_STEP, MOVED_STEP
} from './utils.jsx';
import conversationReducer, { submitStepAnswer, editStep, setStep, setAnswerField } from '../store/conversationSlice';


// -----------------------------------------------------------
// REDUX STORE SETUP
// -----------------------------------------------------------

const rootReducer = combineReducers({
    conversation: conversationReducer,
});

const store = configureStore({
    reducer: rootReducer,
});

// -----------------------------------------------------------
// CONSTANTS FOR SIDEBAR
// -----------------------------------------------------------

const HIGH_LEVEL_STEPS = [
    { id: 'ABOUT_YOU', label: 'About You', subSteps: [EMAIL_STEP, PHONE_STEP, MOVED_STEP] },
    { id: 'CARS', label: 'Cars', subSteps: [] },
    { id: 'DRIVERS', label: 'Drivers', subSteps: [] },
    { id: 'HOW_DO_YOU_DRIVE', label: 'How do you drive', subSteps: [] },
    { id: 'QUOTE', label: 'Quote', subSteps: [] },
];


// -----------------------------------------------------------
// SIDEBAR COMPONENT (UNCHANGED)
// -----------------------------------------------------------

const ProgressSidebar = ({ currentStep }) => {

    // Function to determine the active high-level step
    const getActiveHighLevelStepId = (step) => {
        const activeStep = HIGH_LEVEL_STEPS.find(
            (highLevel) => highLevel.subSteps.includes(step)
        );
        return activeStep ? activeStep.id : null;
    };

    const activeHighLevelStepId = getActiveHighLevelStepId(currentStep);

    return (
        <div className="flex flex-col space-y-0.5 pt-4 pl-8">
            {HIGH_LEVEL_STEPS.map((mainStep, index) => {
                // Determine if this step is the current one (highlighted with dark blue)
                const isActive = mainStep.id === activeHighLevelStepId;
                const isCompleted = HIGH_LEVEL_STEPS.findIndex(s => s.id === mainStep.id) < HIGH_LEVEL_STEPS.findIndex(s => s.id === activeHighLevelStepId);

                // Determine the classes for the circle
                let circleClass = 'border-2';
                if (isActive) {
                    circleClass += ' border-indigo-700 bg-white';
                } else if (isCompleted) {
                    circleClass += ' border-indigo-700 bg-indigo-700'; // Completed steps could be fully filled
                } else {
                    circleClass += ' border-gray-400 bg-white';
                }

                // Determine the classes for the text
                const textClass = isActive
                    ? 'text-indigo-700 font-semibold'
                    : isCompleted
                        ? 'text-gray-700'
                        : 'text-gray-500';

                return (
                    <div key={mainStep.id} className="flex items-start">
                        {/* Vertical Line and Circle Container */}
                        <div className="flex flex-col items-center">
                            {/* Line ABOVE the circle - uses indigo for completed or active steps */}
                            <div className={`w-0.5 h-6 ${index === 0 ? 'bg-transparent' : (isCompleted || isActive) ? 'bg-indigo-300' : 'bg-gray-300'}`}></div>

                            {/* Circle Indicator */}
                            <div className={`w-4 h-4 rounded-full ${circleClass} flex items-center justify-center`}>
                                {/* Inner circle for active or checkmark for completed */}
                                {isActive && (
                                    <div className="w-2 h-2 rounded-full bg-indigo-700"></div>
                                )}
                                {isCompleted && (
                                    // Checkmark for completed steps (optional, but good visual feedback)
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>

                            {/* Line BELOW the circle - uses indigo for active steps (for visual continuity) */}
                            <div className={`w-0.5 h-6 ${index === HIGH_LEVEL_STEPS.length - 1 ? 'bg-transparent' : isActive ? 'bg-indigo-300' : 'bg-gray-300'}`}></div>
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

// -----------------------------------------------------------
// HELPER FUNCTIONS (UNCHANGED)
// -----------------------------------------------------------

const getStepFromPath = (pathname) => {
    // New flow: Email (4) -> Phone (5) -> Moved (6)
    if (pathname.includes('/moved')) return MOVED_STEP;
    if (pathname.includes('/phone')) return PHONE_STEP;
    if (pathname.includes('/email')) return EMAIL_STEP;

    // Default to the first step in the new flow (Email)
    return EMAIL_STEP;
};

// -----------------------------------------------------------
// MAIN APP COMPONENT (UPDATED FOR SEQUENTIAL ANIMATION)
// -----------------------------------------------------------

const ConversationalFormContainer = () => {
    // 🚀 Redux Hooks
    const dispatch = useDispatch();
    const allAnswers = useSelector(state => state.conversation.allAnswers);
    const step = useSelector(state => state.conversation.currentStep);
    const history = useSelector(state => state.conversation.history);

    // 🌟 REFS for Scrolling
    const conversationContainerRef = useRef(null);
    const activeStepRef = useRef(null);
    const isInitialMount = useRef(true);

    // 🆕 STATE FOR SEQUENTIAL ANIMATION
    // Tracks the ID of the step that was *just* completed.
    const [lastAnsweredStepId, setLastAnsweredStepId] = useState(null);
    // Tracks which parts of the history entry are ready to show
    const [historyAnimationState, setHistoryAnimationState] = useState({
        isQuestionVisible: false,
        isAnswerVisible: false,
    });
    // Tracks the visibility of the next input component.
    const [isInputVisible, setIsInputVisible] = useState(false);


    // --- AUTO SCROLL LOGIC & SEQUENTIAL ANIMATION TRIGGER ---
    useEffect(() => {
        const currentHistoryLength = history.length;
        let timers = [];

        const scrollToNewContent = () => {
            const newStepElement = activeStepRef.current;
            if (newStepElement) {
                newStepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };

        if (currentHistoryLength > 0 && !isInitialMount.current) {
            const currentLastStepId = history[currentHistoryLength - 1].step;

            // 0. RESET: Hide the input component instantly before new history is rendered
            setIsInputVisible(false);

            // Only proceed if this is a *new* history entry
            if (currentLastStepId !== lastAnsweredStepId) {

                // Reset history animation state for the new entry
                setHistoryAnimationState({ isQuestionVisible: false, isAnswerVisible: false });
                setLastAnsweredStepId(currentLastStepId);

                // 1. QUESTION ENTERS: Trigger question visibility immediately (0ms)
                // This state change happens during the render cycle after history update.
                timers.push(setTimeout(() => {
                    setHistoryAnimationState(s => ({ ...s, isQuestionVisible: true }));
                }, 0));

                // 2. ANSWER ENTERS: Trigger answer visibility (Delay 300ms)
                timers.push(setTimeout(() => {
                    setHistoryAnimationState(s => ({ ...s, isAnswerVisible: true }));
                }, 300));

                // 3. INPUT COMPONENT ENTERS: Trigger the visibility of the next form (Delay 600ms)
                timers.push(setTimeout(() => {
                    setIsInputVisible(true);
                }, 600));

                // 4. SCROLL: Scroll to the new input component (Delay 700ms)
                timers.push(setTimeout(scrollToNewContent, 700));
            }

        } else if (currentHistoryLength === 0 && isInitialMount.current) {
            // Initial load: show the first input component immediately
            setIsInputVisible(true);
            timers.push(setTimeout(scrollToNewContent, 50));
        }

        // Handle initial mount flag
        if (isInitialMount.current) {
            isInitialMount.current = false;
        }

        // Cleanup timers on unmount or re-run
        return () => timers.forEach(timer => clearTimeout(timer));
    }, [history.length, step]);


    // --- History Navigation (URL/Redux Sync) (UPDATED FOR BACK BUTTON UX) ---
    useEffect(() => {
        const handlePopState = () => {
            const newStep = getStepFromPath(window.location.pathname);
            dispatch(setStep(newStep));

            // 🎯 FIX: When navigating via back/forward buttons, 
            // we immediately show the input to bypass the sequential animation delay.
            setIsInputVisible(true);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [dispatch]);

    useEffect(() => {
        const initialStep = getStepFromPath(window.location.pathname);
        dispatch(setStep(initialStep));
        if (window.location.pathname === '/') {
            window.history.replaceState({ step: initialStep }, '', '/email');
        }
    }, [dispatch]);


    // --- Questions and Handlers (UNCHANGED) ---
    const emailQuestion = "I need a few details to set up your account so we can save your info in case you want to get back to your quote later";
    const phoneQuestion = "Excellent, and What was your phone number?";
    const movedQuestion = "Have you moved in the last 2 months?";

    // --- EDIT HANDLERS (UPDATED: Clear animation state) ---
    const handleEditEmail = useCallback(() => {
        setLastAnsweredStepId(null);
        setIsInputVisible(true);
        window.history.pushState({ step: EMAIL_STEP }, '', '/email');
        dispatch(editStep(EMAIL_STEP));
    }, [dispatch]);

    const handleEditPhone = useCallback(() => {
        setLastAnsweredStepId(null);
        setIsInputVisible(true);
        window.history.pushState({ step: PHONE_STEP }, '', '/phone');
        dispatch(editStep(PHONE_STEP));
    }, [dispatch]);

    // --- SUBMIT HANDLERS (UPDATED: Reset history animation state on submit) ---
    const handleEmailSubmit = useCallback(() => {
        // Resetting the state to prepare for the next step's animation
        setHistoryAnimationState({ isQuestionVisible: false, isAnswerVisible: false });

        const nextStep = PHONE_STEP;
        const answerSummary = allAnswers.email;

        dispatch(submitStepAnswer({
            question: emailQuestion,
            answerSummary: answerSummary,
            currentStepId: EMAIL_STEP,
            rawData: { email: allAnswers.email }
        }));

        window.history.pushState({ step: nextStep }, '', '/phone');
    }, [dispatch, allAnswers.email]);

    const handlePhoneSubmit = useCallback(() => {
        setHistoryAnimationState({ isQuestionVisible: false, isAnswerVisible: false });

        const nextStep = MOVED_STEP;
        const rawNum = allAnswers.phoneNumber.replace(/\D/g, '');
        const answerSummary = `(${rawNum.substring(0, 3)}) ${rawNum.substring(3, 6)}-${rawNum.substring(6, 10)}`;

        dispatch(submitStepAnswer({
            question: phoneQuestion,
            answerSummary: answerSummary,
            currentStepId: PHONE_STEP,
            rawData: { phoneNumber: rawNum }
        }));

        window.history.pushState({ step: nextStep }, '', '/moved');
    }, [dispatch, allAnswers.phoneNumber]);

    const handleMovedSubmit = useCallback(() => {
        setHistoryAnimationState({ isQuestionVisible: false, isAnswerVisible: false });

        // Final Step
        const answerSummary = allAnswers.moved;

        dispatch(submitStepAnswer({
            question: movedQuestion,
            answerSummary: answerSummary,
            currentStepId: MOVED_STEP,
            rawData: { moved: allAnswers.moved }
        }));

        alert(`Thanks, ${allAnswers.firstName || 'User'}! Your flow is complete. Moved in last 2 months: ${allAnswers.moved}.`);
    }, [dispatch, allAnswers.firstName, allAnswers.moved]);


    // --- RENDER HISTORY (UPDATED WITH SEQUENTIAL ANIMATION) ---
    const renderConversationHistory = () => (
        <>
            {history.map((entry, index) => {
                const isEmailStep = entry.step === EMAIL_STEP;
                const isPhoneStep = entry.step === PHONE_STEP;
                const isEditable = isEmailStep || isPhoneStep;

                const editHandler = isEmailStep ? handleEditEmail :
                    isPhoneStep ? handleEditPhone : null;

                // Identify the newest entry
                const isLatestHistoryEntry = index === history.length - 1;

                // Animation classes for the Question (Visible after 0ms)
                const questionTransitionClass =
                    isLatestHistoryEntry && !historyAnimationState.isQuestionVisible
                        ? 'opacity-0 translate-y-full' // Start state
                        : 'opacity-100 translate-y-0'; // Final state

                // Animation classes for the Answer (Visible after 300ms)
                const answerTransitionClass =
                    isLatestHistoryEntry && !historyAnimationState.isAnswerVisible
                        ? 'opacity-0 translate-y-full' // Start state
                        : 'opacity-100 translate-y-0'; // Final state

                return (
                    <div
                        key={entry.step}
                        className="w-full flex justify-start p-1"
                    >
                        <div className="w-full flex flex-col items-start">

                            {/* 1. BOT QUESTION: Animates based on isQuestionVisible state (0ms delay) */}
                            <div
                                className={`w-full mb-4 flex items-start transition-all duration-300 ease-out transform ${questionTransitionClass}`}
                            >
                                <div className="ml-3 bg-gray-100 p-3 rounded-xl rounded-tl-sm shadow-sm max-w-[70%]">
                                    <p className="text-gray-800 leading-relaxed">{entry.question}</p>
                                </div>
                            </div>

                            {/* 2. USER ANSWER: Animates based on isAnswerVisible state (300ms delay) */}
                            <div className="w-full mb-8 flex justify-end">
                                <div className="flex items-center group">
                                    {isEditable && (
                                        <button
                                            onClick={editHandler}
                                            className="p-3 mr-2 rounded-full border border-gray-300 bg-white shadow-md text-gray-600 
                                                opacity-0 transition duration-300 group-hover:opacity-100 
                                                hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500"
                                            aria-label={`Edit answer for ${entry.question}`}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                    )}
                                    <div
                                        // Answer transition logic
                                        className={`py-3 px-6 rounded-full border border-gray-300 bg-white shadow-md text-gray-800 font-semibold transition-all duration-300 ease-out transform ${answerTransitionClass}`}
                                    >
                                        {entry.answer}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );


    // --- Sidebar and Main Render (UNCHANGED) ---
    const renderSidebar = () => (
        <aside className="w-full md:w-1/5 md:block bg-white border-r border-gray-200 flex-shrink-0 pt-8">
            <ProgressSidebar currentStep={step} />
        </aside>
    );

    // 3. Input Component Animation: Based on isInputVisible state (600ms delay)
    const inputTransitionClass = isInputVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-full';


    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            <header className="w-full p-6 flex justify-between items-center z-20 bg-transparent border-b border-gray-200 flex-shrink-0">
                <h1 className="text-3xl italic font-light text-gray-900 tracking-tight font-serif">A&W</h1>
                <div className="text-2xl text-gray-500 cursor-pointer hover:text-gray-700 transition"></div>
            </header>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {renderSidebar()}

                <main
                    ref={conversationContainerRef}
                    className="flex-1 w-full md:w-4/5 p-10 overflow-y-auto"
                >

                    {/* 1. RENDER ALL CONVERSATION HISTORY (Sequentially Animated) */}
                    {renderConversationHistory()}

                    {/* 2. RENDER THE CURRENT ACTIVE STEP (Animates after history) */}
                    <div
                        ref={activeStepRef}
                        className={`w-full p-1 transition-all duration-300 ease-out transform ${inputTransitionClass}`}
                    >

                        {step === EMAIL_STEP && (
                            <EmailStep
                                question={emailQuestion}
                                email={allAnswers.email}
                                setAnswerField={field => value => dispatch(setAnswerField({ field, value }))}
                                handleEmailSubmit={handleEmailSubmit}
                            />
                        )}

                        {step === PHONE_STEP && (
                            <PhoneStep
                                phoneNumber={allAnswers.phoneNumber}
                                setAnswerField={field => value => dispatch(setAnswerField({ field, value }))}
                                handlePhoneSubmit={handlePhoneSubmit}
                            />
                        )}

                        {step === MOVED_STEP && (
                            <MovedStep
                                moved={allAnswers.moved}
                                setAnswerField={field => value => dispatch(setAnswerField({ field, value }))}
                                handleMovedSubmit={handleMovedSubmit}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

// Wrapper to expose Redux Store
const AppWrapper = () => (
    <Provider store={store}>
        <ConversationalFormContainer />
    </Provider>
);

export default AppWrapper;