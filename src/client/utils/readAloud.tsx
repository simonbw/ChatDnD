export async function readAloud(text: string) {
  const mediaSource = new MediaSource();

  mediaSource.addEventListener("sourceopen", async () => {
    const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
    const chunkQueue: Uint8Array[] = [];

    // Put
    function tryProcessChunk() {
      if (chunkQueue.length > 0 && !sourceBuffer.updating) {
        sourceBuffer.appendBuffer(chunkQueue.shift()!);
      }
    }

    getStreamChunks(text, (chunk) => {
      chunkQueue.push(chunk);
      tryProcessChunk();
    });

    sourceBuffer.addEventListener("updateend", () => {
      tryProcessChunk();
    });
  });

  const audioURL = URL.createObjectURL(mediaSource);
  const audio = new Audio(audioURL);
  audio.play();
}

async function getStreamChunks(
  text: string,
  onChunk: (chunk: Uint8Array) => void
) {
  try {
    // Request the audio stream from the server
    const response = await fetch("/read", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: text,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Read and append audio data chunks to the source buffer
    const reader = response.body!.getReader();
    let readerResult;
    do {
      readerResult = await reader.read();
      if (!readerResult.done) {
        onChunk(readerResult.value);
      }
    } while (!readerResult.done);
  } catch (error) {}
}

// const audioElement = new Audio();
//     const mediaSource = new MediaSource();

//       // Set up the audio element to use the MediaSource object
//       audioElement.src = URL.createObjectURL(mediaSource);
//       mediaSource.addEventListener("sourceopen", onMediaSourceOpen);
//       audioElement.play();

//     async function onMediaSourceOpen() {
//       const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");

//       try {
//         // Request the audio stream from the server
//         const response = await fetch("http://localhost:3000/audio-stream", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ text: "Your text here" }),
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         // Read and append audio data chunks to the source buffer
//         const reader = response.body.getReader();
//         let result;
//         do {
//           result = await reader.read();
//           if (!result.done) {
//             sourceBuffer.appendBuffer(result.value);
//           }
//         } while (!result.done);

//         // End the MediaSource stream when all data is appended
//         mediaSource.endOfStream();
//       } catch (error) {
//           console.error("Error while fetching and playing audio stream:", error);
//         }
