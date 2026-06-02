import { Storage } from '@google-cloud/storage';
import { formatSize, getFileType, formatAge } from '../utils.js';

export class GcsProvider {
  get isConfigured() {
    return !!(
      (process.env.GCS_SERVICE_ACCOUNT_JSON || process.env.GCS_SERVICE_ACCOUNT_JSON_PATH) &&
      process.env.GCS_BUCKET_NAME
    );
  }

  #getStorage() {
    // Vercel: credentials supplied as JSON string in env var
    // Local dev: credentials read from file path
    if (process.env.GCS_SERVICE_ACCOUNT_JSON) {
      return new Storage({
        credentials: JSON.parse(process.env.GCS_SERVICE_ACCOUNT_JSON),
        projectId:   process.env.GCS_PROJECT_ID,
      });
    }
    return new Storage({
      keyFilename: process.env.GCS_SERVICE_ACCOUNT_JSON_PATH,
      projectId:   process.env.GCS_PROJECT_ID,
    });
  }

  async listFiles() {
    if (!this.isConfigured) return [];
    const [files] = await this.#getStorage().bucket(process.env.GCS_BUCKET_NAME).getFiles();
    return files
      .filter(f => !f.name.endsWith('/'))
      .map(f => {
        const meta       = f.metadata;
        const custom     = meta.metadata ?? {};
        const uploadedBy = custom.uploadedBy ?? custom.uploadedby ?? 'Unknown';
        const sizeBytes  = parseInt(meta.size ?? '0', 10);
        return {
          name:       meta.name,
          size:       formatSize(sizeBytes),
          sizeBytes,
          providers:  ['gcs'],
          type:       getFileType(meta.name),
          owner:      uploadedBy,
          uploadedBy,
          modified:   formatAge(meta.updated),
          modifiedTs: meta.updated ? new Date(meta.updated).getTime() : Date.now(),
        };
      })
      .sort((a, b) => b.modifiedTs - a.modifiedTs);
  }

  async uploadFile(buffer, name, mimetype, options = {}) {
    if (!this.isConfigured) throw new Error('GCS not configured — set GCS_SERVICE_ACCOUNT_JSON_PATH and GCS_BUCKET_NAME');
    const file = this.#getStorage().bucket(process.env.GCS_BUCKET_NAME).file(name);
    await file.save(buffer, {
      contentType: mimetype ?? 'application/octet-stream',
      metadata:    { uploadedBy: options.uploadedBy ?? 'Unknown' },
    });
  }

  async getFileContent(name) {
    if (!this.isConfigured) throw new Error('GCS not configured');
    const file = this.#getStorage().bucket(process.env.GCS_BUCKET_NAME).file(name);
    const [[buffer], [meta]] = await Promise.all([file.download(), file.getMetadata()]);
    return { buffer, contentType: meta.contentType ?? 'application/octet-stream' };
  }

  async deleteFile(name) {
    if (!this.isConfigured) throw new Error('GCS not configured');
    await this.#getStorage().bucket(process.env.GCS_BUCKET_NAME).file(name).delete();
  }

  async health() {
    if (!this.isConfigured) {
      return { name: 'GCS', key: 'gcs', status: 'pending', note: 'GCS_SERVICE_ACCOUNT_JSON_PATH not set', latencyMs: null };
    }
    const t = Date.now();
    try {
      const [exists] = await this.#getStorage().bucket(process.env.GCS_BUCKET_NAME).exists();
      if (!exists) throw new Error(`Bucket "${process.env.GCS_BUCKET_NAME}" not found`);
      return {
        name:      'GCS',
        key:       'gcs',
        status:    'ok',
        latencyMs: Date.now() - t,
        note:      `Bucket "${process.env.GCS_BUCKET_NAME}" reachable`,
      };
    } catch (err) {
      return {
        name:      'GCS',
        key:       'gcs',
        status:    'error',
        latencyMs: Date.now() - t,
        note:      err.message,
      };
    }
  }
}
