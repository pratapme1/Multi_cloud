import {
  S3Client,
  ListObjectsV2Command,
  HeadBucketCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { formatSize, getFileType, formatAge } from '../utils.js';

export class AwsProvider {
  constructor() {
    this.bucket = process.env.AWS_BUCKET_NAME;
    this.client = new S3Client({
      region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      followRegionRedirects: true,
    });
  }

  // List all objects in the bucket, handles pagination automatically
  async listFiles() {
    const files = [];
    let token;
    do {
      const resp = await this.client.send(new ListObjectsV2Command({
        Bucket: this.bucket,
        ContinuationToken: token,
      }));
      for (const obj of resp.Contents ?? []) {
        if (obj.Key.endsWith('/')) continue; // skip folder markers
        files.push({
          name:       obj.Key,
          size:       formatSize(obj.Size ?? 0),
          sizeBytes:  obj.Size ?? 0,
          providers:  ['aws'],
          type:       getFileType(obj.Key),
          owner:      'admin',
          modified:   formatAge(obj.LastModified),
          modifiedTs: obj.LastModified ? new Date(obj.LastModified).getTime() : Date.now(),
        });
      }
      token = resp.NextContinuationToken;
    } while (token);

    return files.sort((a, b) => b.modifiedTs - a.modifiedTs);
  }

  async uploadFile(buffer, name, mimetype) {
    await this.client.send(new PutObjectCommand({
      Bucket:        this.bucket,
      Key:           name,
      Body:          buffer,
      ContentType:   mimetype ?? 'application/octet-stream',
      ContentLength: buffer.length,
    }));
  }

  // Download a file as a Buffer — used by the sync endpoint for cross-cloud copy
  async getFileContent(name) {
    const resp = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: name }));
    const chunks = [];
    for await (const chunk of resp.Body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return { buffer: Buffer.concat(chunks), contentType: resp.ContentType ?? 'application/octet-stream' };
  }

  async deleteFile(name) {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key:    name,
    }));
  }

  async health() {
    const t = Date.now();
    await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    return {
      name:      'AWS S3',
      key:       'aws',
      status:    'ok',
      latencyMs: Date.now() - t,
      note:      `Bucket "${this.bucket}" reachable`,
    };
  }
}
