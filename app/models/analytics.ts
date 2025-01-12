import { Observable } from '@nativescript/core';
import { InspectionModel } from './inspection';
import { ScheduleModel } from './schedule';

export interface AnalyticsSummary {
  totalInspections: number;
  completedInspections: number;
  openDeficiencies: number;
  resolvedDeficiencies: number;
  averageResolutionTime: number;
  deficienciesBySeverity: {
    low: number;
    medium: number;
    high: number;
  };
  locationHeatmap: { [key: string]: number };
}

export class AnalyticsModel extends Observable {
  private _inspection: InspectionModel;
  private _schedule: ScheduleModel;

  constructor(inspection: InspectionModel, schedule: ScheduleModel) {
    super();
    this._inspection = inspection;
    this._schedule = schedule;
  }

  getSummary(): AnalyticsSummary {
    const deficiencies = this._inspection.deficiencies;
    const inspections = this._schedule.inspections;
    
    const openDeficiencies = deficiencies.filter(d => d.status !== 'resolved').length;
    const resolvedDeficiencies = deficiencies.filter(d => d.status === 'resolved').length;
    
    // Calculate average resolution time
    const resolutionTimes = deficiencies
      .filter(d => d.status === 'resolved')
      .map(d => d.updatedAt.getTime() - d.createdAt.getTime());
    
    const avgResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;

    // Count deficiencies by severity
    const severityCounts = deficiencies.reduce((acc, d) => {
      acc[d.severity]++;
      return acc;
    }, { low: 0, medium: 0, high: 0 });

    // Create location heatmap
    const locationCounts = deficiencies.reduce((acc, d) => {
      acc[d.location] = (acc[d.location] || 0) + 1;
      return acc;
    }, {});

    return {
      totalInspections: inspections.length,
      completedInspections: inspections.filter(i => i.status === 'completed').length,
      openDeficiencies,
      resolvedDeficiencies,
      averageResolutionTime: avgResolutionTime / (1000 * 60 * 60), // Convert to hours
      deficienciesBySeverity: severityCounts,
      locationHeatmap: locationCounts
    };
  }
}