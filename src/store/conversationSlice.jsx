import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // Stores all raw answers for easy access/pre-filling inputs
    allAnswers: {
        firstName: 'Hasya',
        lastName: 'Ram',
        address: '45 E 42nd St, New York, NY 10017, USA',
        aptUnit: '4',
        houseNumber: '25',
        streetName: 'Staten Island Ferry',
        city: 'Staten Island',
        state: 'New York',
        postalCode: '10301',
        email: '',
        // --- NEW FIELDS ADDED ---
        phoneNumber: '',
        moved: '', // 'YES' or 'NO'
        // -------------------------
    },
    // Stores the sequential Q&A history for display purposes
    history: [],
    // Tracks the current active step ID
    currentStep: 1,
};

const conversationSlice = createSlice({
    name: 'conversation',
    initialState,
    reducers: {
        // Reducer to update individual fields while typing
        setAnswerField: (state, action) => {
            const { field, value } = action.payload;
            state.allAnswers[field] = value;
        },

        // Reducer to save the response and advance the step
        submitStepAnswer: (state, action) => {
            const { question, answerSummary, currentStepId, rawData } = action.payload;

            // 1. Update overall answers with the submitted raw data
            state.allAnswers = { ...state.allAnswers, ...rawData };

            // 2. Prepare history entry and manage sequence
            const newEntry = { step: currentStepId, question, answer: answerSummary };
            const existingIndex = state.history.findIndex(item => item.step === currentStepId);

            if (existingIndex !== -1) {
                // If editing, update history and truncate subsequent steps
                state.history[existingIndex] = newEntry;
                // Important: truncate the history to remove steps that came after the edited step
                state.history.length = existingIndex + 1;
            } else {
                // If submitting a new step, push to history
                state.history.push(newEntry);
            }

            // 3. Advance to the next step (The component handles history push/URL)
            state.currentStep = currentStepId + 1;
        },

        // Reducer used when editing history (e.g., clicking the 'Edit' button)
        editStep: (state, action) => {
            const targetStep = action.payload;
            state.currentStep = targetStep;

            // Truncate history when jumping back to an earlier step
            // Find the entry that corresponds to the step BEFORE the one we are editing
            const targetIndex = state.history.findIndex(item => item.step === targetStep);
            if (targetIndex !== -1) {
                // Truncate history so that the 'targetStep' is the one the user is now completing
                state.history.length = targetIndex;
            }
        },

        // Reducer used by URL/Popstate to reset step safely
        setStep: (state, action) => {
            state.currentStep = action.payload;
        },
    },
});

export const { setAnswerField, submitStepAnswer, editStep, setStep } = conversationSlice.actions;
export default conversationSlice.reducer;