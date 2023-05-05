import axios from "axios";

export async function fetchImageBuffer(url: string): Promise<ArrayBuffer> {
  console.log(`[generateImage] fetching image from ${url}`);
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });

  return Buffer.from(response.data);
}
