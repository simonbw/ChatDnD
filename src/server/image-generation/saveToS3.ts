import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getAwsBucketName, getAwsCredentials } from "../utils/envUtils";

export const s3Client = new S3Client({
  credentials: getAwsCredentials(),
  region: "us-east-1",
});

const baseUrl = `https://${getAwsBucketName()}.s3.amazonaws.com`;

export async function saveToS3(
  buffer: Buffer,
  imageName: string
): Promise<string> {
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: getAwsBucketName(),
        Key: imageName,
        Body: buffer,
      })
    );
    return `${baseUrl}/${imageName}`;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
