import S3Client from "aws-sdk/clients/s3";
import { Sharp } from "sharp";
import { WebError } from "../WebError";
import { getAwsCredentials } from "../utils/envUtils";

export const s3Client = new S3Client({
  credentials: getAwsCredentials(),
});

export async function saveToS3(
  sharp: Sharp,
  imageName: string
): Promise<string> {
  console.log("Saving to S3...");
  const buffer = await sharp.png({ force: true }).toBuffer();

  try {
    const bucket = process.env.AWS_BUCKET_NAME;
    if (!bucket) {
      throw new WebError("S3 Bucket Not Configured", 500);
    }
    const response = await s3Client
      .upload({
        Bucket: bucket,
        Key: imageName,
        Body: buffer,
      })
      .promise();
    console.log("S3 Response:", response);
    return response.Location;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
