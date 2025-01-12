import { Observable } from '@nativescript/core';
import { BaseModel, Severity, Status } from './types';
import { MediaModel } from './media';
import { NotificationModel } from './notification';
import { ScheduleModel } from './schedule';
import { DocumentModel } from './document';
import { CollaborationModel } from './collaboration';
import { PhotoAnalysisModel } from './photo-analysis';

export interface Deficiency extends BaseModel {
    description: string;
    severity: Severity;
    location: string;
    status: Status;
    photos?: string[];
    relatedDocuments?: string[];
    assignedTo?: string;
    dueDate?: Date;
    comments?: string[];
    ndeReports?: string[];
    weldMapReference?: string;
}

export interface InspectionChecklist {
    id: string;
    items: ChecklistItem[];
    completedItems: string[];
    lastUpdated: Date;
}

export interface ChecklistItem {
    id: string;
    description: string;
    required: boolean;
    reference?: string;
    photos?: string[];
}

export class InspectionModel extends Observable {
    private _checklist: InspectionChecklist;
    private _deficiencies: Deficiency[];
    private _currentLocation: string;
    private _mediaModel: MediaModel;
    private _notificationModel: NotificationModel;
    private _scheduleModel: ScheduleModel;
    private _documentModel: DocumentModel;
    private _collaborationModel: CollaborationModel;
    private _photoAnalysisModel: PhotoAnalysisModel;

    constructor() {
        super();
        this._checklist = {
            id: Date.now().toString(),
            items: [],
            completedItems: [],
            lastUpdated: new Date()
        };
        this._deficiencies = [];
        this._currentLocation = '';
    }

    // Model setters with type safety
    setMediaModel(media: MediaModel): void {
        this._mediaModel = media;
    }

    setNotificationModel(notifications: NotificationModel): void {
        this._notificationModel = notifications;
    }

    setScheduleModel(schedule: ScheduleModel): void {
        this._scheduleModel = schedule;
    }

    setDocumentModel(documents: DocumentModel): void {
        this._documentModel = documents;
    }

    setCollaborationModel(collaboration: CollaborationModel): void {
        this._collaborationModel = collaboration;
    }

    setPhotoAnalysisModel(photoAnalysis: PhotoAnalysisModel): void {
        this._photoAnalysisModel = photoAnalysis;
    }

    // Getters with proper return types
    get deficiencies(): ReadonlyArray<Deficiency> {
        return this._deficiencies;
    }

    get checklist(): InspectionChecklist {
        return this._checklist;
    }

    get currentLocation(): string {
        return this._currentLocation;
    }

    // Methods with improved type safety and integration
    async addDeficiency(description: string, severity: Severity, location: string, photos?: string[]): Promise<Deficiency> {
        const deficiency: Deficiency = {
            id: Date.now().toString(),
            description,
            severity,
            location: location || this._currentLocation,
            status: 'open',
            createdAt: new Date(),
            updatedAt: new Date(),
            photos: photos || [],
            relatedDocuments: []
        };
        
        this._deficiencies.push(deficiency);
        this.notifyPropertyChange('deficiencies', this._deficiencies);

        // Photo analysis integration
        if (photos && photos.length > 0 && this._photoAnalysisModel) {
            try {
                for (const photoId of photos) {
                    const photo = await this._mediaModel.getPhoto(photoId);
                    if (photo) {
                        const analysis = await this._photoAnalysisModel.analyzePhoto(photo);
                        if (analysis.length > 0) {
                            deficiency.description += '\nAI Analysis: ' + analysis.map(d => 
                                `${d.type} detected (${(d.confidence * 100).toFixed(1)}% confidence)`
                            ).join(', ');
                        }
                    }
                }
            } catch (error) {
                console.error('Photo analysis failed:', error);
            }
        }

        // Notification integration
        if (this._notificationModel) {
            this._notificationModel.addNotification({
                title: 'New Deficiency',
                message: `New ${severity} deficiency reported at ${location}`,
                type: 'deficiency',
                severity: this.mapSeverityToNotification(severity),
                relatedId: deficiency.id
            });
        }

        // Collaboration integration
        if (this._collaborationModel) {
            this._collaborationModel.logActivity({
                type: 'deficiency',
                entityId: deficiency.id,
                entityType: 'deficiency',
                userId: 'system',
                data: { action: 'created', severity }
            });
        }

        return deficiency;
    }

    async updateDeficiencyStatus(id: string, status: Status, comment?: string): Promise<void> {
        const deficiency = this._deficiencies.find(d => d.id === id);
        if (deficiency) {
            deficiency.status = status;
            deficiency.updatedAt = new Date();
            
            if (comment && this._collaborationModel) {
                await this._collaborationModel.addComment(id, comment, 'system');
            }

            this.notifyPropertyChange('deficiencies', this._deficiencies);
        }
    }

    addChecklistItem(item: Omit<ChecklistItem, 'id'>): void {
        const newItem: ChecklistItem = {
            id: Date.now().toString(),
            ...item
        };
        this._checklist.items.push(newItem);
        this._checklist.lastUpdated = new Date();
        this.notifyPropertyChange('checklist', this._checklist);
    }

    completeChecklistItem(itemId: string): void {
        if (!this._checklist.completedItems.includes(itemId)) {
            this._checklist.completedItems.push(itemId);
            this._checklist.lastUpdated = new Date();
            this.notifyPropertyChange('checklist', this._checklist);
        }
    }

    setLocation(location: string): void {
        this._currentLocation = location;
        this.notifyPropertyChange('currentLocation', location);
    }

    private mapSeverityToNotification(severity: Severity): 'info' | 'warning' | 'critical' {
        switch (severity) {
            case 'high': return 'critical';
            case 'medium': return 'warning';
            case 'low': return 'info';
        }
    }
}