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
// HELPER FUNCTIONS 
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
// MAIN APP COMPONENT
// -----------------------------------------------------------

const ConversationalFormContainer = () => {
    // 🚀 Redux Hooks
    const dispatch = useDispatch();
    const allAnswers = useSelector(state => state.conversation.allAnswers);
    const step = useSelector(state => state.conversation.currentStep);
    const history = useSelector(state => state.conversation.history);

    // 🌟 REFS for Scrolling
    // Ref for the main scrollable container
    const conversationContainerRef = useRef(null);
    const lastAnswerRef = useRef(null); // Retained for history item reference

    // --- AUTO SCROLL TO BOTTOM LOGIC ---
    // This effect runs whenever a new answer is submitted (history changes) or the step changes.
    useEffect(() => {
        const scrollToBottom = () => {
            const element = conversationContainerRef.current;
            if (element) {
                // Forces the scroll position to the very bottom of the content
                element.scrollTop = element.scrollHeight;
            }
        };

        // Use a short delay to ensure the DOM has rendered the new step/content
        const timer = setTimeout(scrollToBottom, 50);
        return () => clearTimeout(timer);
    }, [history.length, step]); // Run on step change (new question) AND history change (new answer)


    // --- History Navigation (URL/Redux Sync) ---
    useEffect(() => {
        const handlePopState = () => {
            const newStep = getStepFromPath(window.location.pathname);
            dispatch(setStep(newStep));
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [dispatch]);

    useEffect(() => {
        // Initialize step based on URL, defaulting to EMAIL_STEP
        const initialStep = getStepFromPath(window.location.pathname);
        dispatch(setStep(initialStep));
        // Correct URL if we start at the root (should be /email)
        if (window.location.pathname === '/') {
            window.history.replaceState({ step: initialStep }, '', '/email');
        }
    }, [dispatch]);


    // --- Questions and Handlers ---
    const emailQuestion = "I need a few details to set up your account so we can save your info in case you want to get back to your quote later";
    const phoneQuestion = "Excellent, and What was your phone number?";
    const movedQuestion = "Have you moved in the last 2 months?";

    // --- EDIT HANDLERS (Only Email and Phone) ---
    const handleEditEmail = useCallback(() => {
        window.history.pushState({ step: EMAIL_STEP }, '', '/email');
        dispatch(editStep(EMAIL_STEP));
    }, [dispatch]);

    const handleEditPhone = useCallback(() => {
        window.history.pushState({ step: PHONE_STEP }, '', '/phone');
        dispatch(editStep(PHONE_STEP));
    }, [dispatch]);
    // ---------------------------------

    // NOTE: handleScrollUpToAnswer has been removed as it's replaced by the new auto-scroll useEffect

    // --- SUBMIT HANDLERS (Removed handleScrollUpToAnswer calls) ---

    const handleEmailSubmit = useCallback(() => {
        const nextStep = PHONE_STEP;
        const answerSummary = allAnswers.email;

        dispatch(submitStepAnswer({
            question: emailQuestion,
            answerSummary: answerSummary,
            currentStepId: EMAIL_STEP,
            rawData: { email: allAnswers.email }
        }));

        window.history.pushState({ step: nextStep }, '', '/phone');
        // Auto-scroll is handled by useEffect after dispatch
    }, [dispatch, allAnswers.email]);

    const handlePhoneSubmit = useCallback(() => {
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
        // Auto-scroll is handled by useEffect after dispatch
    }, [dispatch, allAnswers.phoneNumber]);

    const handleMovedSubmit = useCallback(() => {
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


    const renderConversationHistory = () => (
        <>
            {history.map((entry, index) => {
                const isEmailStep = entry.step === EMAIL_STEP;
                const isPhoneStep = entry.step === PHONE_STEP;
                const isEditable = isEmailStep || isPhoneStep;

                const editHandler = isEmailStep ? handleEditEmail :
                    isPhoneStep ? handleEditPhone : null;

                const isLastEntry = index === history.length - 1;

                return (
                    <div
                        key={entry.step}
                        className="w-full flex justify-start p-1"
                        ref={isLastEntry ? lastAnswerRef : null}
                    >
                        <div className="w-full flex flex-col items-start">

                            {/* 1. BOT QUESTION */}
                            <div className="w-full mb-4 flex items-start">
                                {/* <BotAvatar className="w-10 h-10" /> */}
                                <div className="ml-3 bg-gray-100 p-3 rounded-xl rounded-tl-sm shadow-sm max-w-[70%]">
                                    <p className="text-gray-800 leading-relaxed">{entry.question}</p>
                                </div>
                            </div>

                            {/* 2. USER ANSWER (Remains right-justified) */}
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
                                    <div className="py-3 px-6 rounded-full border border-gray-300 bg-white shadow-md text-gray-800 font-semibold">
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


    // --- Sidebar and Main Render ---
    const renderSidebar = () => (
        // Sidebar retains 20% width
        <aside className="w-full md:w-1/5 md:block bg-white border-r border-gray-200 flex-shrink-0 pt-8">
            {/* Sidebar content */}
        </aside>
    );

    return (
        // 1. Added 'flex flex-col' to container
        <div className="min-h-screen bg-white font-sans flex flex-col">
            <header className="w-full p-6 flex justify-between items-center z-20 bg-transparent border-b border-gray-200 flex-shrink-0">
                <h1 className="text-3xl italic font-light text-gray-900 tracking-tight font-serif">A&W</h1>
                <div className="text-2xl text-gray-500 cursor-pointer hover:text-gray-700 transition"></div>
            </header>

            {/* 2. Added 'flex-1' and 'overflow-hidden' to ensure main content takes available height */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {renderSidebar()}

                {/* 3. ATTACHED conversationContainerRef and added 'overflow-y-auto' for scrolling */}
                <main
                    ref={conversationContainerRef}
                    className="flex-1 w-full md:w-4/5 p-10 overflow-y-auto" // Key scroll container
                >

                    {/* 1. RENDER ALL CONVERSATION HISTORY */}
                    {renderConversationHistory()}

                    {/* 2. RENDER THE CURRENT ACTIVE STEP (Active step ref is now unused) */}
                    <div className="w-full p-1">

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