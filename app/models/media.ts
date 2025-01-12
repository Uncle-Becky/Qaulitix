import { Observable } from '@nativescript/core';
import { ImageSource } from '@nativescript/core';
import { NotificationModel } from './notification';
import { PhotoAnalysisModel } from './photo-analysis';
import { BaseModel } from './types';

export interface PhotoAttachment extends BaseModel {
    imageSource: ImageSource;
    description: string;
    location: string;
    deficiencyId?: string;
    inspectionId?: string;
    jobNumber: string;
    tags: string[];
    metadata: {
        deviceInfo: string;
        gpsCoordinates?: { lat: number; lng: number };
        compass?: number; // Direction in degrees
        dimensions?: { width: number; height: number };
    };
    analysis?: {
        defects: Array<{
            type: string;
            confidence: number;
            location: { x: number; y: number; width: number; height: number };
        }>;
        recommendations?: string[];
    };
}

export class MediaModel extends Observable {
    private _photos: PhotoAttachment[] = [];
    private _notificationModel: NotificationModel;
    private _photoAnalysisModel: PhotoAnalysisModel;
    private _pendingAnalysis: Set<string> = new Set();

    setNotificationModel(notifications: NotificationModel) {
        this._notificationModel = notifications;
    }

    setPhotoAnalysisModel(photoAnalysis: PhotoAnalysisModel) {
        this._photoAnalysisModel = photoAnalysis;
    }

    get photos(): ReadonlyArray<PhotoAttachment> {
        return this._photos;
    }

    async addPhoto(data: Omit<PhotoAttachment, 'id' | 'createdAt' | 'updatedAt' | 'analysis'>): Promise<PhotoAttachment> {
        const photo: PhotoAttachment = {
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
            tags: [],
            ...data
        };
        
        this._photos.push(photo);
        this.notifyPropertyChange('photos', this._photos);

        // Trigger photo analysis
        if (this._photoAnalysisModel) {
            this._pendingAnalysis.add(photo.id);
            try {
                const analysis = await this._photoAnalysisModel.analyzePhoto(photo);
                photo.analysis = {
                    defects: analysis.map(defect => ({
                        type: defect.type,
                        confidence: defect.confidence,
                        location: defect.boundingBox
                    })),
                    recommendations: await this._photoAnalysisModel.generateRecommendations(analysis)
                };
                photo.updatedAt = new Date();
                
                // Notify if defects were found
                if (analysis.length > 0 && this._notificationModel) {
                    this._notificationModel.addNotification({
                        title: 'Defects Detected',
                        message: `AI analysis found ${analysis.length} potential defects in recent photo`,
                        type: 'inspection',
                        severity: this.getDefectSeverity(analysis),
                        relatedId: photo.id
                    });
                }
            } catch (error) {
                console.error('Photo analysis failed:', error);
            } finally {
                this._pendingAnalysis.delete(photo.id);
            }
        }

        // Basic notification
        if (this._notificationModel) {
            this._notificationModel.addNotification({
                title: 'New Photo Added',
                message: `Photo added for ${data.description}`,
                type: 'inspection',
                severity: 'info',
                relatedId: photo.id
            });
        }

        return photo;
    }

    async getPhoto(id: string): Promise<PhotoAttachment | undefined> {
        const photo = this._photos.find(p => p.id === id);
        if (photo && this._pendingAnalysis.has(id)) {
            // Wait for analysis to complete
            await this.waitForAnalysis(id);
        }
        return photo;
    }

    getPhotosByDeficiency(deficiencyId: string): PhotoAttachment[] {
        return this._photos.filter(photo => photo.deficiencyId === deficiencyId);
    }

    getPhotosByInspection(inspectionId: string): PhotoAttachment[] {
        return this._photos.filter(photo => photo.inspectionId === inspectionId);
    }

    getPhotosByJob(jobNumber: string): PhotoAttachment[] {
        return this._photos.filter(photo => photo.jobNumber === jobNumber);
    }

    getPhotosByLocation(location: string): PhotoAttachment[] {
        return this._photos.filter(photo => photo.location.includes(location));
    }

    getPhotosByTag(tag: string): PhotoAttachment[] {
        return this._photos.filter(photo => photo.tags.includes(tag));
    }

    addTagToPhoto(photoId: string, tag: string): void {
        const photo = this._photos.find(p => p.id === photoId);
        if (photo && !photo.tags.includes(tag)) {
            photo.tags.push(tag);
            photo.updatedAt = new Date();
            this.notifyPropertyChange('photos', this._photos);
        }
    }

    updatePhotoDescription(photoId: string, description: string): void {
        const photo = this._photos.find(p => p.id === photoId);
        if (photo) {
            photo.description = description;
            photo.updatedAt = new Date();
            this.notifyPropertyChange('photos', this._photos);
        }
    }

    private getDefectSeverity(analysis: Array<{ type: string; confidence: number }>): 'info' | 'warning' | 'critical' {
        const maxConfidence = Math.max(...analysis.map(a => a.confidence));
        if (maxConfidence > 0.9) return 'critical';
        if (maxConfidence > 0.7) return 'warning';
        return 'info';
    }

    private async waitForAnalysis(photoId: string): Promise<void> {
        if (!this._pendingAnalysis.has(photoId)) return;
        
        return new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (!this._pendingAnalysis.has(photoId)) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }
}