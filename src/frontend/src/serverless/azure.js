import { BlobServiceClient } from '@azure/storage-blob';
import { formatSize, getFileType, formatAge } from '../utils.js';

export class AzureProvider {
  get isConfigured() {
    return !!(process.env.AZURE_CONNECTION_STRING && process.env.AZURE_CONTAINER_NAME);
  }

  #getContainerClient() {
    const conn      = process.env.AZURE_CONNECTION_STRING;
    const container = process.env.AZURE_CONTAINER_NAME;
    const svc       = BlobServiceClient.fromConnectionString(conn);
    return svc.getContainerClient(container);
  }

  async listFiles() {
    if (!this.isConfigured) return [];
    const cc = this.#getContainerClient();
    const files = [];
    for await (const blob of cc.listBlobsFlat()) {
      files.push({
        name:       blob.name,
        size:       formatSize(blob.properties.contentLength ?? 0),
        sizeBytes:  blob.properties.contentLength ?? 0,
        providers:  ['azure'],
        type:       getFileType(blob.name),
        owner:      'admin',
        modified:   formatAge(blob.properties.lastModified),
        modifiedTs: blob.properties.lastModified ? new Date(blob.properties.lastModified).getTime() : Date.now(),
      });
    }
    return files.sort((a, b) => b.modifiedTs - a.modifiedTs);
  }

  async uploadFile(buffer, name, mimetype) {
    if (!this.isConfigured) throw new Error('Azure not configured');
    const cc         = this.#getContainerClient();
    const blockBlob  = cc.getBlockBlobClient(name);
    await blockBlob.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: mimetype ?? 'application/octet-stream' },
    });
  }

  async getFileContent(name) {
    if (!this.isConfigured) throw new Error('Azure not configured');
    const cc       = this.#getContainerClient();
    const download = await cc.getBlobClient(name).download();
    const chunks   = [];
    for await (const chunk of download.readableStreamBody) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return { buffer: Buffer.concat(chunks), contentType: download.contentType ?? 'application/octet-stream' };
  }

  async deleteFile(name) {
    if (!this.isConfigured) throw new Error('Azure not configured');
    const cc = this.#getContainerClient();
    await cc.deleteBlob(name);
  }

  async health() {
    if (!this.isConfigured) {
      return { name: 'Azure Blob', key: 'azure', status: 'pending', note: 'AZURE_CONNECTION_STRING not set', latencyMs: null };
    }
    const t = Date.now();
    try {
      const cc = this.#getContainerClient();
      await cc.getProperties();
      return {
        name:      'Azure Blob',
        key:       'azure',
        status:    'ok',
        latencyMs: Date.now() - t,
        note:      `Container "${process.env.AZURE_CONTAINER_NAME}" reachable`,
      };
    } catch (err) {
      return {
        name:      'Azure Blob',
        key:       'azure',
        status:    'error',
        latencyMs: Date.now() - t,
        note:      err.message,
      };
    }
  }
}
