import axios from 'axios';
import { config } from '../config/env.js';

const bucketApiClient = axios.create({
    baseURL: config.bucketApi,
});

export const bucketService = {
    /**
     * Upload an object/file to a specific bucket with a specific bucket token
     * @param {string} bucketToken - e.g., 'userBucketToken' or 'applicationBucketToken'
     * @param {string} bucketId - The ID of the target bucket
     * @param {File} file - The file binary to upload
     * @returns {Promise<Object>} Success response with download URL
     * @example
     * // Success response:
     * // {
     * //     "success": true,
     * //     "data": [
     * //         {
     * //             "fileId": "9da03f6d-0409-41ad-bb06-225a244ae408",
     * //             "originalName": "test (10).png",
     * //             "mimeType": "image/png",
     * //             "size": 604063,
     * //             "status": "uploaded",
     * //             "bucketName": "f7103b85-fcda-4dec-92c6-c336f71fd3a2-public-user-bucket",
     * //             "isPublic": true,
     * //             "downloadUrl": "https://babilcom.mindbricks.co/bucket/download/9da03f6d-0409-41ad-bb06-225a244ae408"
     * //         }
     * //     ]
     * // }
     */
    uploadFile: async (bucketToken, bucketId, file) => {
        const formData = new FormData();
        formData.append('bucketId', bucketId);
        formData.append('files', file);

        const response = await bucketApiClient.post('/upload', formData, {
            headers: {
                // Must not be application/json, browser will set multipart/form-data boundary automatically
                'Authorization': `Bearer ${bucketToken}`
            }
        });

        return response.data;
    }
};
