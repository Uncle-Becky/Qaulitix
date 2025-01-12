import { Observable } from '@nativescript/core';

export interface AuditItem {
    id: string;
    date: Date;
    auditor: string;
    type: 'internal' | 'client';
    findings: AuditFinding[];
    status: 'open' | 'closed';
}

export interface AuditFinding {
    description: string;
    severity: 'minor' | 'major' | 'critical';
    responsibleParty: string;
    correctiveAction: string;
    dueDate: Date;
    status: 'open' | 'in-progress' | 'closed';
}

export class AuditModel extends Observable {
    private _audits: AuditItem[] = [];

    createAudit(data: Omit<AuditItem, 'id'>) {
        const audit: AuditItem = {
            id: Date.now().toString(),
            ...data
        };
        this._audits.push(audit);
        this.notifyPropertyChange('audits', this._audits);
    }

    addFinding(auditId: string, finding: AuditFinding) {
        const audit = this._audits.find(a => a.id === auditId);
        if (audit) {
            audit.findings.push(finding);
            this.notifyPropertyChange('audits', this._audits);
        }
    }

    getOpenFindings(): AuditFinding[] {
        return this._audits
            .flatMap(a => a.findings)
            .filter(f => f.status !== 'closed');
    }
}