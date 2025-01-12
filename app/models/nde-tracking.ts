import { Observable } from '@nativescript/core';

export interface NDERequest {
    id: string;
    weldId: string;
    method: string;
    requestedBy: string;
    requestedDate: Date;
    priority: 'normal' | 'urgent';
    status: 'pending' | 'scheduled' | 'completed';
}

export interface NDEReport {
    id: string;
    requestId: string;
    inspector: string;
    date: Date;
    results: string;
    attachments: string[];
    verified: boolean;
}

export class NDETrackingModel extends Observable {
    private _requests: NDERequest[] = [];
    private _reports: NDEReport[] = [];

    requestNDE(data: Omit<NDERequest, 'id' | 'status'>) {
        const request: NDERequest = {
            id: Date.now().toString(),
            status: 'pending',
            ...data
        };
        this._requests.push(request);
        this.notifyPropertyChange('requests', this._requests);
    }

    submitReport(data: Omit<NDEReport, 'id' | 'verified'>) {
        const report: NDEReport = {
            id: Date.now().toString(),
            verified: false,
            ...data
        };
        this._reports.push(report);
        this.notifyPropertyChange('reports', this._reports);
    }

    verifyReport(reportId: string) {
        const report = this._reports.find(r => r.id === reportId);
        if (report) {
            report.verified = true;
            this.notifyPropertyChange('reports', this._reports);
        }
    }
}