import { Observable } from '@nativescript/core';
import { NonConformanceReport } from './shift-supervisor';

export interface QualityMetrics {
    accuracy: number;
    completeness: number;
    timeliness: number;
    compliance: number;
}

export interface StaffInstruction {
    id: string;
    staffId: string;
    instructions: string;
    dateIssued: Date;
    acknowledgement: {
        date: Date;
        understood: boolean;
        questions: string[];
        verificationMethod: 'verbal' | 'demonstration' | 'written';
        verifiedBy: string;
    } | null;
    priority: 'normal' | 'urgent' | 'critical';
    category: 'safety' | 'quality' | 'procedure' | 'general';
    verifiedByManager: boolean;
    competencyRequirements: string[];
    referencedStandards: string[];
    effectiveDate: Date;
    reviewDate: Date;
}

export interface PackageAudit {
    id: string;
    packageId: string;
    auditorId: string;
    date: Date;
    findings: {
        category: string;
        description: string;
        severity: 'minor' | 'major' | 'critical';
        correctionRequired: boolean;
        standardReference: string;
        evidenceAttachments: string[];
    }[];
    thirdPartyInspectionStatus: 'pending' | 'approved' | 'rejected';
    correctiveActions: {
        finding: string;
        action: string;
        completedDate: Date;
        verifiedBy: string;
        effectiveness: number;
        preventiveMeasures: string[];
    }[];
    qualityMetrics: QualityMetrics;
}

export class QCManagerModel extends Observable {
    private _staffInstructions: StaffInstruction[] = [];
    private _packageAudits: PackageAudit[] = [];
    private _thirdPartyInspectionQueue: string[] = [];
    private _qualityMetricsHistory: Map<string, QualityMetrics[]> = new Map();

    issueStaffInstruction(instruction: Omit<StaffInstruction, 'id' | 'dateIssued' | 'acknowledgement' | 'verifiedByManager'>): void {
        const newInstruction: StaffInstruction = {
            id: Date.now().toString(),
            dateIssued: new Date(),
            acknowledgement: null,
            verifiedByManager: true,
            effectiveDate: new Date(),
            reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days review cycle
            ...instruction
        };
        
        this.validateInstruction(newInstruction);
        this._staffInstructions.push(newInstruction);
        this.notifyPropertyChange('staffInstructions', this._staffInstructions);
    }

    private validateInstruction(instruction: StaffInstruction): void {
        if (!instruction.competencyRequirements?.length) {
            throw new Error('Competency requirements must be specified');
        }
        if (!instruction.referencedStandards?.length) {
            throw new Error('Referenced standards must be specified');
        }
    }

    submitPackageForThirdPartyInspection(packageId: string, qualityMetrics: QualityMetrics): void {
        if (this.validateQualityMetrics(qualityMetrics)) {
            if (!this._thirdPartyInspectionQueue.includes(packageId)) {
                this._thirdPartyInspectionQueue.push(packageId);
                this.updateQualityMetricsHistory(packageId, qualityMetrics);
                this.notifyPropertyChange('thirdPartyInspectionQueue', this._thirdPartyInspectionQueue);
            }
        }
    }

    private validateQualityMetrics(metrics: QualityMetrics): boolean {
        const minimumThreshold = 0.85; // 85% minimum quality threshold
        return Object.values(metrics).every(value => value >= minimumThreshold);
    }

    private updateQualityMetricsHistory(packageId: string, metrics: QualityMetrics): void {
        const history = this._qualityMetricsHistory.get(packageId) || [];
        history.push(metrics);
        this._qualityMetricsHistory.set(packageId, history);
    }

    recordPackageAudit(audit: Omit<PackageAudit, 'id' | 'date'>): void {
        const newAudit: PackageAudit = {
            id: Date.now().toString(),
            date: new Date(),
            ...audit
        };
        
        this.validateAudit(newAudit);
        this._packageAudits.push(newAudit);
        this.notifyPropertyChange('packageAudits', this._packageAudits);
    }

    private validateAudit(audit: PackageAudit): void {
        if (!audit.findings.every(f => f.evidenceAttachments?.length > 0)) {
            throw new Error('All findings must include supporting evidence');
        }
        if (!audit.correctiveActions.every(ca => ca.preventiveMeasures?.length > 0)) {
            throw new Error('All corrective actions must include preventive measures');
        }
    }

    getQualityTrends(packageId: string): QualityMetrics[] {
        return this._qualityMetricsHistory.get(packageId) || [];
    }
}