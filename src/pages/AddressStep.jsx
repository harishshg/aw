import React from 'react';
import { useTypingEffect, RenderChatStep, BotAvatar, ADDRESS_STEP } from "./utils.jsx";
import image from "../assets/download (5).jpeg"


const AddressStep = ({
    step, question, subtext, manualAcknowledge,
    // Data and handlers from Redux store via props:
    address, aptUnit, setAnswerField,
    houseNumber, streetName, city, state, postalCode,
    // Flow handlers
    handleManualAddressClick, handleAddressSubmit, isSearchAddressComplete,
    isManualAddressStepComplete, showMap, selectedPlaceAddress,
}) => {

    const mainQuestionText = question;
    const acknowledgeText = manualAcknowledge;
    const currentQuestion = step === ADDRESS_STEP ? mainQuestionText : acknowledgeText;

    // Use typing effect on the currently relevant question
    const { displayedText, isTypingComplete } = useTypingEffect(currentQuestion, 30);

    // Conditional button text
    let submitButtonText = 'Next';
    if (step === ADDRESS_STEP && showMap) {
        submitButtonText = 'CONFIRM LOCATION';
    }

    let content;
    let isStepComplete;

    // A. Address Search/Map Input Content
    const searchInputContent = (
        <div className="flex flex-col items-center w-full">

            <p className="text-base font-light text-gray-500 mb-8 w-full max-w-lg text-center">
                {subtext}
            </p>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-lg">
                <div className="flex-1 relative">
                    <input
                        type="text" placeholder="STREET ADDRESS, CITY, STATE" value={address}
                        disabled={showMap}
                        // 🎯 Redux update
                        onChange={(e) => { setAnswerField('address')(e.target.value); }}
                        className={`w-full pl-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 transition duration-150 placeholder-gray-400 font-normal uppercase`}
                    />
                </div>

                <input type="text" placeholder="APT/UNIT #" value={aptUnit}
                    // 🎯 Redux update
                    onChange={(e) => setAnswerField('aptUnit')(e.target.value)}
                    disabled={!showMap}
                    className={`w-32 flex-shrink-0 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 transition duration-150 placeholder-gray-400 font-normal uppercase`}
                />
            </div>

            {/* Manual Entry Button (Only shown if currently on the search step) */}
            {step === ADDRESS_STEP && !showMap && isTypingComplete && (
                <button
                    onClick={handleManualAddressClick}
                    className="mt-4 text-sm text-blue-500 hover:text-blue-700 transition duration-150 underline"
                >
                    Enter address manually
                </button>
            )}

            {/* Placeholder for Map UI when shown */}
            {showMap && selectedPlaceAddress && (
                <div className="map-container mt-6 w-full max-w-lg rounded-lg overflow-hidden border border-gray-200 shadow-md">
                    <img src={image} alt="Map of selected address" className="w-full h-40 object-cover" />
                </div>
            )}
        </div>
    );

    // B. Manual Address Input Content
    const manualInputContent = (
        <div className="flex flex-col items-center w-full">
            <p className="text-base font-light text-gray-500 mb-8 w-full max-w-lg text-center">
                Please enter your full address.
            </p>

            <div className="w-full max-w-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="House number" value={houseNumber}
                        onChange={(e) => setAnswerField('houseNumber')(e.target.value)}
                        className="col-span-1 px-4 py-3 text-lg border border-gray-300 rounded-lg" />
                    <input type="text" placeholder="Street name" value={streetName}
                        onChange={(e) => setAnswerField('streetName')(e.target.value)}
                        className="col-span-1 px-4 py-3 text-lg border border-gray-300 rounded-lg" />
                </div>
                <input type="text" placeholder="Apt/Unit #" value={aptUnit}
                    onChange={(e) => setAnswerField('aptUnit')(e.target.value)}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg" />
                <input type="text" placeholder="City" value={city}
                    onChange={(e) => setAnswerField('city')(e.target.value)}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg" />
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="State" value={state}
                        onChange={(e) => setAnswerField('state')(e.target.value)}
                        className="col-span-1 px-4 py-3 text-lg border border-gray-300 rounded-lg" />
                    <input type="text" placeholder="Postal Code" value={postalCode}
                        onChange={(e) => setAnswerField('postalCode')(e.target.value)}
                        className="col-span-1 px-4 py-3 text-lg border border-gray-300 rounded-lg" />
                </div>
            </div>
        </div>
    );

    // Determine which content to display based on the step ID
    if (step === ADDRESS_STEP) {
        content = searchInputContent;
        isStepComplete = isSearchAddressComplete || (showMap && selectedPlaceAddress);
    }
    else {
        content = manualInputContent;
        isStepComplete = isManualAddressStepComplete;
    }


    return (
        // Reduced pt-12 to pt-8
        <div className="w-full flex justify-center pt-8">
            <div className="max-w-3xl w-full flex flex-col items-center px-4">

                {/* Avatar and Navigation UI (Reduced mb-8) */}
                <div className="relative w-full mb-4" style={{ maxWidth: '400px' }}>
                    <div className="absolute inset-0 border-t-2 border-blue-400"></div>
                    <BotAvatar
                        className="w-24 h-24 rounded-full object-cover shadow-lg absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        style={{ top: '0' }}
                    />
                </div>
                {/* Removed redundant h-12 div */}

                {/* Main Question Text (Typing effect) */}
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
                    inputContent={isTypingComplete ? content : null}
                    isComplete={isStepComplete}
                    submitHandler={handleAddressSubmit}
                    submitButtonText={submitButtonText}
                    showMapConfirmation={step === ADDRESS_STEP && showMap}
                />
            </div>
        </div>
    );
};

export default AddressStep;