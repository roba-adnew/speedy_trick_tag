import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
    getImageDetails as apiGetImage,
    startTimer as apiStartTimer,
    sendViewportDetails as apiSendViewportDetails,
    checkTag as apiCheckTag,
} from "../utils/api";
import Timer from "./Timer";
import "../Styles/ImageViewer.css";

function ImageViewer() {
    const [imageIdsIndex, setImageIdIndex] = useState(0);

    const [playerCorrect, setPlayerCorrect] = useState(null);
    const [playerWon, setPlayerWon] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    const [selectedRiddle, setSelectedRiddle] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [image, setImage] = useState(null);
    const [riddles, setRiddles] = useState(null);
    const [isTagging, setIsTagging] = useState(false);
    const [tag, setTag] = useState({ x: 0, y: 0 });
    const [tagFlag, setTagFlag] = useState(false);
    const imageRef = useRef(null);
    const location = useLocation();
    const imageIds = location.state?.imageIds;

    useEffect(() => {});

    useEffect(() => {
        async function getFile() {
            const fileObject = await apiGetImage(imageIds[imageIdsIndex]);
            const imageFile = fileObject.content;
            setImage(imageFile);

            const imageRiddles = fileObject.details;
            setRiddles(imageRiddles);

            setIsLoading(false);
            await apiStartTimer();
            setIsRunning(true);
        }
        getFile();
    }, [imageIds, imageIdsIndex]);

    useEffect(() => {
        async function sendViewportDetails() {
            if (!imageRef?.current) return;
            const scalingFactor =
                imageRef.current.height / imageRef.current.naturalHeight;
            const xOffset = imageRef.current.x;
            const yOffset = imageRef.current.y;
            const viewportDetails = { scalingFactor, xOffset, yOffset };
            console.log("viewport details:", viewportDetails);
            await apiSendViewportDetails(viewportDetails);
        }
        sendViewportDetails();
    }, [image]);

    if (isLoading) {
        return <div>getting the game ready!</div>;
    }

    if (!isLoading && !image) {
        return <div>No file data available</div>;
    }

    function toggleTagging() {
        setIsTagging(!isTagging);
    }

    function tagTarget(e) {
        if (isTagging) return;
        const frame = e.target.getBoundingClientRect();
        const x = e.clientX - frame.left;
        const y = e.clientY - frame.top;
        setTag({ x, y });
        if (!selectedRiddle) {
            setTagFlag(true);
            setIsTagging(false);
            return;
        }
        toggleTagging();
    }

    async function handleTagSubmission(e) {
        e.preventDefault();
        console.log(riddles[selectedRiddle]);
        console.log("selected riddle at tag:", selectedRiddle),
            console.log("tag at validation", tag);
        const results = await apiCheckTag(selectedRiddle, tag);
        console.log("correctness:", results);
        if (results.correct) {
            const updatedRiddles = {
                ...riddles,
                [selectedRiddle]: {
                    ...riddles[selectedRiddle],
                    answered: true,
                    tag: tag,
                },
            };
            setRiddles(updatedRiddles);
            setSelectedRiddle(null);
            setPlayerCorrect(true);
            if (results.roundCompleted) {
                setIsRunning(false);
                setPlayerWon(true);
                setImageIdIndex((prevIndex) => prevIndex + 1);
            }
            toggleTagging();
            return;
        }
        setPlayerCorrect(false);
        toggleTagging();
        return;
    }

    function selectRiddle(e) {
        const selectedRiddle = e.target.id;
        if (tagFlag) setTagFlag(false);
        setSelectedRiddle(selectedRiddle);
    }

    return (
        <div style={{ position: "relative" }}>
            <img
                className="photo"
                src={image}
                alt="Intersection"
                onClick={tagTarget}
                ref={imageRef}
            />
            {tagFlag && (
                <div
                    style={{
                        border: "1px solid black",
                        backgroundColor: "pink",
                        position: "absolute",
                        left: `${tag.x}px`,
                        top: `${tag.y}px`,
                        transform: "translate(-10%, -10%)",
                        zIndex: 1000,
                    }}
                >
                    You have to select a riddle first
                </div>
            )}
            <Timer isRunning={isRunning} playerWon={playerWon} />

            {Object.keys(riddles).map((riddle, i) => {
                return (
                    <>
                        {riddles[riddle]?.answered && (
                            <div
                                className="correctMarker"
                                style={{
                                    border: "3px solid white",
                                    width: "10px",
                                    borderRadius: "10px",
                                    textAlign: "center",
                                    position: "absolute",
                                    left: `${riddles[riddle]?.tag.x}px`,
                                    top: `${riddles[riddle]?.tag.y}px`,
                                    transform: "translate(-10%, -10%)",
                                    zIndex: 1000,
                                }}
                            >
                                {i + 1}
                            </div>
                        )}
                        <p
                            key={riddle}
                            id={riddle}
                            style={{
                                border: riddles[riddle]?.answered
                                    ? "1px solid green"
                                    : selectedRiddle === riddle
                                    ? "1px solid blue"
                                    : "none",
                            }}
                            onClick={
                                riddles[riddle].answered ? null : selectRiddle
                            }
                        >
                            {`${i + 1}. ${riddles[riddle].question}`}
                        </p>
                    </>
                );
            })}

            {isRunning && playerCorrect && (
                <div>
                    NOICE! Got that one right!
                </div>
            )}

            {isRunning && !playerCorrect && (
                <div>
                    sorry, you got it wrong, but keep going, time is ticking!
                </div>
            )}

            {isTagging && !tagFlag && (
                <form
                    onSubmit={handleTagSubmission}
                    style={{
                        position: "absolute",
                        left: `${tag.x}px`,
                        top: `${tag.y}px`,
                        transform: "translate(-10%, -10%)",
                        zIndex: 1000,
                    }}
                >
                    <button type="submit">
                        that&apos;s it, tag it! TAG IT NOW!
                    </button>
                    <button onClick={toggleTagging} type="button">
                        ehh, nevermind
                    </button>
                </form>
            )}
        </div>
    );
}

export default ImageViewer;
