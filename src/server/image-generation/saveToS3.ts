import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Sharp } from "sharp";
import { timed } from "../../client/utils/timeLogger";
import { getAwsBucketName, getAwsCredentials } from "../utils/envUtils";

export const s3Client = new S3Client({
  credentials: getAwsCredentials(),
  region: "us-east-1",
});

const baseUrl = `https://${getAwsBucketName()}.s3.amazonaws.com`;

export const saveToS3 = timed(
  "saveToS3",
  async (sharp: Sharp, imageName: string): Promise<string> => {
    try {
      const buffer = await sharp.png({ force: true }).toBuffer();
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
);
