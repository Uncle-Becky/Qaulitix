import { Observable } from '@nativescript/core';
import { NDEReport } from './nde-tracking';

export interface TurnoverLog {
    id: string;
    date: Date;
    shift: 'day' | 'night';
    supervisor: string;
    notes: string;
    attendees: string[];
}

export interface NonConformanceReport {
    id: string;
    date: Date;
    reportedBy: string;
    description: string;
    witnessStatements: string[];
    rootCause: string;
    correctiveAction: string;
    thirdPartyInvolved: boolean;
    status: 'open' | 'investigating' | 'closed';
}

export interface WeldMap {
    id: string;
    packageId: string;
    lastUpdated: Date;
    ndeResults: NDEReport[];
    verifiedBy: string;
}

export class ShiftSupervisorModel extends Observable {
    private _turnoverLogs: TurnoverLog[] = [];
    private _ncReports: NonConformanceReport[] = [];
    private _weldMaps: WeldMap[] = [];
    private _codeWorkReviews: Map<string, Date> = new Map();

    recordTurnover(data: Omit<TurnoverLog, 'id'>) {
        const log: TurnoverLog = {
            id: Date.now().toString(),
            ...data
        };
        this._turnoverLogs.push(log);
        this.notifyPropertyChange('turnoverLogs', this._turnoverLogs);
    }

    createNCR(data: Omit<NonConformanceReport, 'id' | 'status'>) {
        const ncr: NonConformanceReport = {
            id: Date.now().toString(),
            status: 'open',
            ...data
        };
        this._ncReports.push(ncr);
        this.notifyPropertyChange('ncReports', this._ncReports);
    }

    updateWeldMap(packageId: string, ndeResult: NDEReport, verifiedBy: string) {
        let weldMap = this._weldMaps.find(w => w.packageId === packageId);
        if (!weldMap) {
            weldMap = {
                id: Date.now().toString(),
                packageId,
                lastUpdated: new Date(),
                ndeResults: [],
                verifiedBy
            };
            this._weldMaps.push(weldMap);
        }
        weldMap.ndeResults.push(ndeResult);
        weldMap.lastUpdated = new Date();
        this.notifyPropertyChange('weldMaps', this._weldMaps);
    }

    reviewCodeWorkPackage(packageId: string) {
        this._codeWorkReviews.set(packageId, new Date());
        this.notifyPropertyChange('codeWorkReviews', this._codeWorkReviews);
    }

    getLastCodeWorkReview(packageId: string): Date | undefined {
        return this._codeWorkReviews.get(packageId);
    }
}