import { Observable } from '@nativescript/core';
import { WeldingConsumablesModel } from './welding-consumables';
import { NotificationModel } from './notification';

export interface WeldLog {
    id: string;
    date: Date;
    inspector: string;
    location: string;
    type: 'Inventory Check' | 'Weld Inspection' | 'NDE';
    ndeResults: string[];
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export class QCStaffModel extends Observable {
    private _weldingConsumables: WeldingConsumablesModel;
    private _notifications: NotificationModel;
    private _weldLogs: WeldLog[] = [];
    private _staff: { id: string; name: string; }[] = [];

    constructor() {
        super();
        this._weldingConsumables = new WeldingConsumablesModel();
        this._notifications = new NotificationModel();

        // Listen for low stock notifications
        this._weldingConsumables.on('lowStock', (data: any) => {
            this._notifications.addNotification({
                title: 'Low Welding Stock Alert',
                message: `Low stock for ${data.classification} ${data.size} (${data.quantity} lbs remaining)`,
                type: 'system',
                severity: 'warning',
                relatedId: null
            });
        });
    }

    performRodRoomInventory(jobNumber: string, staffId: string) {
        const inspector = this._staff.find(s => s.id === staffId);
        if (inspector) {
            this._weldingConsumables.setJobNumber(jobNumber);
            this.addWeldLog({
                id: Date.now().toString(),
                date: new Date(),
                inspector: inspector.name,
                location: 'Rod Room',
                type: 'Inventory Check',
                ndeResults: [],
                status: 'completed'
            });
        }
        return this._weldingConsumables;
    }

    getRodRoomInventory(jobNumber: string) {
        return this._weldingConsumables.getInventoryByJob(jobNumber);
    }

    addWeldLog(log: WeldLog) {
        this._weldLogs.push(log);
        this.notifyPropertyChange('weldLogs', this._weldLogs);
    }

    getWeldLogs(jobNumber: string) {
        return this._weldLogs.filter(log => 
            log.location.includes(jobNumber) || 
            log.type === 'Inventory Check'
        );
    }
}