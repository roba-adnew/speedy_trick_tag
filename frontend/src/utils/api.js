const domain =
    import.meta.env.VITE_API_DEV_URL || import.meta.env.VITE_API_PROD_URL;
const base_url = `${domain}/images`;

async function getImageSetMeta() {
    const download_url = `${base_url}/image-set`;

    const options = {
        method: "POST",
        credentials: "include",
        headers: { "Content-type": "application/json" },
    };
    try {
        const response = await fetch(download_url, options);
        const results = await response.json();

        return results.imageIds;
    } catch (err) {
        console.error("image set meta retrieval error:", err);
        throw err;
    }
}

async function getImageDetails(imageId) {
    const download_url = `${base_url}/download`;
    const details_url = `${base_url}/meta`;

    const options = {
        method: "POST",
        credentials: "include",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ imageId: imageId.id }),
    };
    try {
        const downloadResponse = await fetch(download_url, options);
        const blob = await downloadResponse.blob();
        const content = URL.createObjectURL(blob);

        const detailsResponse = await fetch(details_url, options);
        const detailsResults = await detailsResponse.json();

        const file = {
            content: content,
            details: detailsResults,
        };

        return file;
    } catch (err) {
        console.error("image retrieval error:", err);
        throw err;
    }
}

async function sendViewportDetails(viewportDetails) {
    const url = `${base_url}/viewport-meta-receiver`;

    const options = {
        method: "POST",
        credentials: "include",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ viewportDetails }),
    };
    try {
        const response = await fetch(url, options);
        return response;
    } catch (err) {
        console.error("error sending viewport details:", err);
        throw err;
    }
}

async function startTimer() {
    const url = `${base_url}/start-timer`;

    const options = {
        method: "POST",
        credentials: "include",
    };

    try {
        const response = await fetch(url, options);
        const results = await response.json();
        return results;
    } catch (err) {
        console.error("timer commencement error:", err);
        throw err;
    }
}

async function stopTimer() {
    const url = `${base_url}/stop-timer`;

    const options = {
        method: "POST",
        credentials: "include",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ signal: "stop" }),
    };

    try {
        const response = await fetch(url, options);
        const results = await response.json();
        return results;
    } catch (err) {
        console.error("timer commencement error:", err);
        throw err;
    }
}

async function getTime() {
    const url = `${base_url}/get-time`;

    const options = {
        method: "POST",
        credentials: "include",
    };

    try {
        const response = await fetch(url, options);
        const json = await response.json();
        return json.time;
    } catch (err) {
        console.error("timer retrieval error:", err);
        throw err;
    }
}

export {
    getImageSetMeta,
    getImageDetails,
    sendViewportDetails,
    startTimer,
    getTime,
    stopTimer,
};
