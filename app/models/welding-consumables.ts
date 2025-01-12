import { Observable } from '@nativescript/core';

export interface WeldingRod {
    type: 'SMAW' | 'GTAW' | 'Carbon Arc';
    classification: string;  // e.g., 'E7018 H4R', 'E7018-B2L', 'ER70S-2'
    size: string;           // e.g., '1/8"', '3/32"', '5/32"'
    quantity: number;       // in pounds
    jobNumber: string;
    location: string;       // rod room location
    lastInventoryDate: Date;
    minimumStock: number;   // threshold for low stock alerts
}

export interface FCWire {
    size: string;          // e.g., '0.045'
    spools: number;
    jobNumber: string;
    location: string;
}

export class WeldingConsumablesModel extends Observable {
    private _weldingRods: WeldingRod[] = [];
    private _fcWire: FCWire[] = [];
    private _currentJobNumber: string = '';

    setJobNumber(jobNumber: string) {
        this._currentJobNumber = jobNumber;
        this.notifyPropertyChange('currentJobNumber', jobNumber);
    }

    updateInventory(rod: Omit<WeldingRod, 'lastInventoryDate'>) {
        const existingRod = this._weldingRods.find(
            r => r.type === rod.type && 
                 r.classification === rod.classification && 
                 r.size === rod.size &&
                 r.jobNumber === rod.jobNumber
        );

        if (existingRod) {
            existingRod.quantity = rod.quantity;
            existingRod.lastInventoryDate = new Date();
        } else {
            this._weldingRods.push({
                ...rod,
                lastInventoryDate: new Date()
            });
        }

        this.notifyPropertyChange('weldingRods', this._weldingRods);
        this.checkLowStock();
    }

    updateFCWireInventory(wire: FCWire) {
        const existingWire = this._fcWire.find(
            w => w.size === wire.size && w.jobNumber === wire.jobNumber
        );

        if (existingWire) {
            existingWire.spools = wire.spools;
        } else {
            this._fcWire.push(wire);
        }

        this.notifyPropertyChange('fcWire', this._fcWire);
    }

    private checkLowStock() {
        const lowStockItems = this._weldingRods.filter(
            rod => rod.quantity <= rod.minimumStock
        );

        if (lowStockItems.length > 0) {
            // Trigger notifications for low stock items
            lowStockItems.forEach(rod => {
                this.notify({
                    eventName: 'lowStock',
                    object: this,
                    data: {
                        type: rod.type,
                        classification: rod.classification,
                        size: rod.size,
                        quantity: rod.quantity,
                        minimum: rod.minimumStock
                    }
                });
            });
        }
    }

    getInventoryByJob(jobNumber: string) {
        return {
            weldingRods: this._weldingRods.filter(r => r.jobNumber === jobNumber),
            fcWire: this._fcWire.filter(w => w.jobNumber === jobNumber)
        };
    }

    getCurrentInventory() {
        return this.getInventoryByJob(this._currentJobNumber);
    }
}