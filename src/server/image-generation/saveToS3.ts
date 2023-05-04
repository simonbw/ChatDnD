import S3Client from "aws-sdk/clients/s3";
import { Sharp } from "sharp";
import { getAwsBucketName, getAwsCredentials } from "../utils/envUtils";

export const s3Client = new S3Client({
  credentials: getAwsCredentials(),
  region: "us-east-1",
});

export async function saveToS3(
  sharp: Sharp,
  imageName: string
): Promise<string> {
  console.log("Saving to S3...");

  try {
    const buffer = await sharp.png({ force: true }).toBuffer();
    const response = await s3Client
      .upload({
        Bucket: getAwsBucketName(),
        Key: imageName,
        Body: buffer,
      })
      .promise();
    return response.Location;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
