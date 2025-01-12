import { Observable } from '@nativescript/core';
import { MediaModel } from './media';
import { NotificationModel } from './notification';
import { InspectionModel } from './inspection';
import { CollaborationModel } from './collaboration';
import { BaseModel } from './types';

export interface Inspection extends BaseModel {
    title: string;
    date: Date;
    location: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
    assignedTo: string;
    checklist: string[];
    photos?: string[];
    priority: 'low' | 'medium' | 'high';
    estimatedDuration: number; // in minutes
    actualDuration?: number;
    prerequisites?: string[]; // IDs of inspections that must be completed first
    jobNumber: string;
    weldMapReferences?: string[];
    ndeRequirements?: {
        type: string;
        required: boolean;
        completed: boolean;
    }[];
}

export class ScheduleModel extends Observable {
    private _inspections: Inspection[] = [];
    private _mediaModel: MediaModel;
    private _notificationModel: NotificationModel;
    private _inspectionModel: InspectionModel;
    private _collaborationModel: CollaborationModel;

    setMediaModel(media: MediaModel) {
        this._mediaModel = media;
    }

    setNotificationModel(notifications: NotificationModel) {
        this._notificationModel = notifications;
    }

    setInspectionModel(inspection: InspectionModel) {
        this._inspectionModel = inspection;
    }

    setCollaborationModel(collaboration: CollaborationModel) {
        this._collaborationModel = collaboration;
    }

    get inspections(): ReadonlyArray<Inspection> {
        return this._inspections;
    }

    async addInspection(data: Omit<Inspection, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Inspection> {
        const inspection: Inspection = {
            id: Date.now().toString(),
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            photos: [],
            ...data
        };
        
        // Validate prerequisites
        if (inspection.prerequisites?.length) {
            const incomplete = inspection.prerequisites.filter(preId => 
                !this._inspections.find(i => i.id === preId && i.status === 'completed')
            );
            if (incomplete.length > 0) {
                throw new Error('Prerequisites must be completed before scheduling this inspection');
            }
        }

        this._inspections.push(inspection);
        this.notifyPropertyChange('inspections', this._inspections);

        // Create notification
        if (this._notificationModel) {
            const severity = this.getPriorityNotificationSeverity(inspection.priority);
            this._notificationModel.addNotification({
                title: 'New Inspection Scheduled',
                message: `${inspection.title} scheduled for ${inspection.date.toLocaleDateString()} (${inspection.location})`,
                type: 'inspection',
                severity,
                relatedId: inspection.id
            });
        }

        // Log activity
        if (this._collaborationModel) {
            await this._collaborationModel.logActivity({
                type: 'inspection',
                entityId: inspection.id,
                entityType: 'inspection',
                userId: 'system',
                data: { action: 'scheduled', location: inspection.location }
            });
        }

        return inspection;
    }

    async updateInspectionStatus(id: string, status: Inspection['status'], comment?: string): Promise<void> {
        const inspection = this._inspections.find(i => i.id === id);
        if (!inspection) return;

        const oldStatus = inspection.status;
        inspection.status = status;
        inspection.updatedAt = new Date();

        if (status === 'completed') {
            inspection.actualDuration = this.calculateActualDuration(inspection);
        }

        this.notifyPropertyChange('inspections', this._inspections);

        // Add comment if provided
        if (comment && this._collaborationModel) {
            await this._collaborationModel.addComment(id, comment, 'system');
        }

        // Notify status change
        if (this._notificationModel) {
            this._notificationModel.addNotification({
                title: 'Inspection Status Updated',
                message: `${inspection.title} status changed from ${oldStatus} to ${status}`,
                type: 'inspection',
                severity: status === 'failed' ? 'critical' : 'info',
                relatedId: id
            });
        }
    }

    getInspectionsByJob(jobNumber: string): Inspection[] {
        return this._inspections.filter(i => i.jobNumber === jobNumber);
    }

    getInspectionsByDateRange(start: Date, end: Date): Inspection[] {
        return this._inspections.filter(i => 
            i.date >= start && i.date <= end
        );
    }

    getDueInspections(withinHours: number = 24): Inspection[] {
        const cutoff = new Date(Date.now() + withinHours * 60 * 60 * 1000);
        return this._inspections.filter(i => 
            i.status === 'pending' && i.date <= cutoff
        );
    }

    getOverdueInspections(): Inspection[] {
        const now = new Date();
        return this._inspections.filter(i => 
            i.status === 'pending' && i.date < now
        );
    }

    private calculateActualDuration(inspection: Inspection): number {
        const startTime = inspection.createdAt.getTime();
        const endTime = new Date().getTime();
        return Math.round((endTime - startTime) / (60 * 1000)); // Convert to minutes
    }

    private getPriorityNotificationSeverity(priority: Inspection['priority']): 'info' | 'warning' | 'critical' {
        switch (priority) {
            case 'high': return 'critical';
            case 'medium': return 'warning';
            case 'low': return 'info';
        }
    }
}