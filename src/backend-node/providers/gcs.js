// TODO: implement when GCS_SERVICE_ACCOUNT_JSON_PATH, GCS_PROJECT_ID, GCS_BUCKET_NAME are set in .env
// Install when ready: npm install @google-cloud/storage
//
// import { Storage } from '@google-cloud/storage';

export class GcsProvider {
  get isConfigured() {
    return !!(process.env.GCS_SERVICE_ACCOUNT_JSON_PATH && process.env.GCS_BUCKET_NAME);
  }

  async listFiles() {
    if (!this.isConfigured) return [];
    // TODO:
    // const storage = new Storage({ keyFilename: process.env.GCS_SERVICE_ACCOUNT_JSON_PATH, projectId: process.env.GCS_PROJECT_ID });
    // const [files] = await storage.bucket(process.env.GCS_BUCKET_NAME).getFiles();
    return [];
  }

  async uploadFile(_buffer, _name, _mimetype) {
    if (!this.isConfigured) throw new Error('GCS not configured — set GCS_SERVICE_ACCOUNT_JSON_PATH and GCS_BUCKET_NAME');
    // TODO: bucket.file(name).save(buffer, { contentType: mimetype })
    throw new Error('GCS upload not yet implemented');
  }

  async getFileContent(_name) {
    if (!this.isConfigured) throw new Error('GCS not configured');
    // TODO: bucket.file(name).download() → returns [Buffer]
    throw new Error('GCS getFileContent not yet implemented');
  }

  async deleteFile(_name) {
    if (!this.isConfigured) throw new Error('GCS not configured');
    // TODO: bucket.file(name).delete()
    throw new Error('GCS delete not yet implemented');
  }

  async health() {
    if (!this.isConfigured) {
      return { name: 'GCS', key: 'gcs', status: 'pending', note: 'GCS_SERVICE_ACCOUNT_JSON_PATH not set', latencyMs: null };
    }
    return { name: 'GCS', key: 'gcs', status: 'pending', note: 'Credentials present — implementation coming', latencyMs: null };
  }
}
