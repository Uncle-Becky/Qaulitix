import { Observable } from '@nativescript/core';
import { InspectionModel, Deficiency } from './models/inspection';
import { DocumentModel } from './models/document';
import { ScheduleModel } from './models/schedule';
import { MediaModel } from './models/media';
import { AnalyticsModel } from './models/analytics';
import { NotificationModel } from './models/notification';
import { theme } from './theme';
import { Status, Severity } from './models/types';
import { alert, prompt } from '@nativescript/core/ui/dialogs';

export class MainViewModel extends Observable {
    private _inspection: InspectionModel;
    private _documents: DocumentModel;
    private _schedule: ScheduleModel;
    private _media: MediaModel;
    private _analytics: AnalyticsModel;
    private _notifications: NotificationModel;
    private _selectedTabIndex: number;
    readonly theme = theme;

    constructor() {
        super();
        this._inspection = new InspectionModel();
        this._documents = new DocumentModel();
        this._schedule = new ScheduleModel();
        this._media = new MediaModel();
        this._analytics = new AnalyticsModel(this._inspection, this._schedule);
        this._notifications = new NotificationModel();
        this._selectedTabIndex = 0;

        // Subscribe to model events with type safety
        this._inspection.on('deficiencyAdded', (deficiency: Deficiency) => {
            this._notifications.addNotification({
                title: 'New Deficiency',
                message: `New ${deficiency.severity} deficiency reported at ${deficiency.location}`,
                type: 'deficiency',
                severity: this.getSeverityLevel(deficiency.severity),
                relatedId: deficiency.id
            });
        });
    }

    private getSeverityLevel(severity: Severity): 'info' | 'warning' | 'critical' {
        switch (severity) {
            case 'high': return 'critical';
            case 'medium': return 'warning';
            case 'low': return 'info';
        }
    }

    // Type-safe getters
    get inspections() {
        return this._schedule.inspections;
    }

    get deficiencies() {
        return this._inspection.deficiencies;
    }

    get documents() {
        return this._documents.documents;
    }

    get analytics() {
        return this._analytics.getSummary();
    }

    get selectedTabIndex(): number {
        return this._selectedTabIndex;
    }

    set selectedTabIndex(value: number) {
        if (this._selectedTabIndex !== value) {
            this._selectedTabIndex = value;
            this.notifyPropertyChange('selectedTabIndex', value);
        }
    }

    // Type-safe methods
    async startNewInspection(): Promise<void> {
        const result = await prompt({
            title: "New Inspection",
            message: "Enter inspection title:",
            okButtonText: "Create",
            cancelButtonText: "Cancel",
            defaultText: ""
        });

        if (result.result) {
            this._schedule.addInspection({
                title: result.text,
                date: new Date(),
                location: "Main Site",
                assignedTo: "Current User",
                checklist: this._inspection.checklist
            });
        }
    }

    async reportDeficiency(): Promise<void> {
        const result = await prompt({
            title: "Report Deficiency",
            message: "Describe the deficiency:",
            okButtonText: "Report",
            cancelButtonText: "Cancel",
            defaultText: ""
        });

        if (result.result) {
            this._inspection.addDeficiency(result.text, 'medium');
            await alert({
                title: "Deficiency Reported",
                message: "The deficiency has been recorded and assigned for review.",
                okButtonText: "OK"
            });
        }
    }
}