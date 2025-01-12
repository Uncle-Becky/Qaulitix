import { Observable } from '@nativescript/core';
import { BaseModel } from './types';
import { NotificationModel } from './notification';

export interface Comment extends BaseModel {
    text: string;
    userId: string;
    attachments?: string[];
    mentions?: string[];
    edited?: boolean;
    parentId?: string; // For threaded comments
    reactions?: { [key: string]: string[] }; // emoji: userIds[]
}

export interface Activity extends BaseModel {
    type: 'comment' | 'status_change' | 'assignment' | 'photo' | 'inspection' | 'deficiency';
    entityId: string;
    entityType: 'inspection' | 'deficiency' | 'weld_map' | 'nde_report';
    userId: string;
    data: {
        action?: string;
        oldValue?: string;
        newValue?: string;
        severity?: string;
        location?: string;
        [key: string]: any;
    };
}

export interface Mention {
    userId: string;
    context: string;
    timestamp: Date;
    entityId: string;
    entityType: string;
}

export class CollaborationModel extends Observable {
    private _activities: Activity[] = [];
    private _comments: { [key: string]: Comment[] } = {};
    private _mentions: Mention[] = [];
    private _notificationModel: NotificationModel;
    private _activeUsers: Set<string> = new Set();

    constructor() {
        super();
        // Start cleanup job for old activities
        setInterval(() => this.cleanupOldActivities(), 24 * 60 * 60 * 1000); // Daily cleanup
    }

    setNotificationModel(notifications: NotificationModel): void {
        this._notificationModel = notifications;
    }

    // Comment Management
    async addComment(entityId: string, text: string, userId: string, attachments: string[] = []): Promise<Comment> {
        const comment: Comment = {
            id: Date.now().toString(),
            text,
            userId,
            attachments,
            mentions: this.extractMentions(text),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        if (!this._comments[entityId]) {
            this._comments[entityId] = [];
        }
        this._comments[entityId].push(comment);
        
        // Process mentions
        if (comment.mentions?.length) {
            await this.processMentions(comment, entityId);
        }
        
        // Log activity
        await this.logActivity({
            type: 'comment',
            entityId,
            entityType: 'inspection', // Default to inspection, can be overridden
            userId,
            data: { commentId: comment.id }
        });
        
        this.notifyPropertyChange('comments', this._comments);
        return comment;
    }

    async editComment(entityId: string, commentId: string, newText: string, userId: string): Promise<void> {
        const comment = this._comments[entityId]?.find(c => c.id === commentId);
        if (comment && comment.userId === userId) {
            const oldMentions = new Set(comment.mentions);
            const newMentions = new Set(this.extractMentions(newText));
            
            comment.text = newText;
            comment.mentions = Array.from(newMentions);
            comment.edited = true;
            comment.updatedAt = new Date();

            // Process new mentions
            const addedMentions = Array.from(newMentions).filter(m => !oldMentions.has(m));
            if (addedMentions.length) {
                await this.processMentions(comment, entityId);
            }

            this.notifyPropertyChange('comments', this._comments);
        }
    }

    addReaction(entityId: string, commentId: string, userId: string, reaction: string): void {
        const comment = this._comments[entityId]?.find(c => c.id === commentId);
        if (comment) {
            if (!comment.reactions) {
                comment.reactions = {};
            }
            if (!comment.reactions[reaction]) {
                comment.reactions[reaction] = [];
            }
            if (!comment.reactions[reaction].includes(userId)) {
                comment.reactions[reaction].push(userId);
                this.notifyPropertyChange('comments', this._comments);
            }
        }
    }

    // Activity Tracking
    async logActivity(activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity> {
        const fullActivity: Activity = {
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
            ...activity
        };
        
        this._activities.unshift(fullActivity);
        this.notifyPropertyChange('activities', this._activities);

        // Notify relevant users
        await this.notifyActivityParticipants(fullActivity);

        return fullActivity;
    }

    getActivitiesByEntity(entityId: string, limit: number = 50): Activity[] {
        return this._activities
            .filter(a => a.entityId === entityId)
            .slice(0, limit);
    }

    getActivitiesByUser(userId: string, limit: number = 50): Activity[] {
        return this._activities
            .filter(a => a.userId === userId)
            .slice(0, limit);
    }

    // User Presence
    markUserActive(userId: string): void {
        this._activeUsers.add(userId);
        this.notifyPropertyChange('activeUsers', Array.from(this._activeUsers));
    }

    markUserInactive(userId: string): void {
        this._activeUsers.delete(userId);
        this.notifyPropertyChange('activeUsers', Array.from(this._activeUsers));
    }

    getActiveUsers(): string[] {
        return Array.from(this._activeUsers);
    }

    // Helper Methods
    private extractMentions(text: string): string[] {
        const mentions = text.match(/@[\w-]+/g) || [];
        return mentions.map(m => m.substring(1));
    }

    private async processMentions(comment: Comment, entityId: string): Promise<void> {
        if (!comment.mentions?.length) return;

        const mention: Mention = {
            userId: comment.userId,
            context: comment.text,
            timestamp: new Date(),
            entityId,
            entityType: 'comment'
        };

        this._mentions.push(mention);

        // Notify mentioned users
        if (this._notificationModel) {
            comment.mentions.forEach(userId => {
                this._notificationModel.addNotification({
                    title: 'You were mentioned',
                    message: `${comment.userId} mentioned you in a comment`,
                    type: 'system',
                    severity: 'info',
                    relatedId: comment.id
                });
            });
        }
    }

    private async notifyActivityParticipants(activity: Activity): Promise<void> {
        if (!this._notificationModel) return;

        // Determine notification severity based on activity type
        let severity: 'info' | 'warning' | 'critical' = 'info';
        if (activity.data.severity === 'high') severity = 'critical';
        else if (activity.data.severity === 'medium') severity = 'warning';

        // Create notification
        this._notificationModel.addNotification({
            title: this.getActivityTitle(activity),
            message: this.getActivityMessage(activity),
            type: activity.type === 'comment' ? 'system' : activity.type,
            severity,
            relatedId: activity.entityId
        });
    }

    private getActivityTitle(activity: Activity): string {
        switch (activity.type) {
            case 'status_change': return 'Status Updated';
            case 'assignment': return 'New Assignment';
            case 'photo': return 'Photo Added';
            case 'inspection': return 'Inspection Update';
            case 'deficiency': return 'Deficiency Update';
            default: return 'New Activity';
        }
    }

    private getActivityMessage(activity: Activity): string {
        switch (activity.type) {
            case 'status_change':
                return `Status changed from ${activity.data.oldValue} to ${activity.data.newValue}`;
            case 'assignment':
                return `Assigned to ${activity.data.assignee}`;
            case 'photo':
                return `New photo added to ${activity.entityType}`;
            case 'inspection':
                return `Inspection ${activity.data.action} at ${activity.data.location}`;
            case 'deficiency':
                return `Deficiency ${activity.data.action} with ${activity.data.severity} severity`;
            default:
                return `New activity on ${activity.entityType}`;
        }
    }

    private cleanupOldActivities(): void {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        this._activities = this._activities.filter(a => a.createdAt >= thirtyDaysAgo);
        this.notifyPropertyChange('activities', this._activities);
    }
}