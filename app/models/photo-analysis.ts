import { Observable } from '@nativescript/core';
import { MediaModel, PhotoAttachment } from './media';
import { BaseModel } from './types';

export interface DefectDetection extends BaseModel {
    type: string;
    confidence: number;
    boundingBox: { x: number; y: number; width: number; height: number };
    severity: 'low' | 'medium' | 'high';
    measurements?: {
        length?: number;
        width?: number;
        depth?: number;
        area?: number;
    };
    materialType?: string;
    suggestedActions?: string[];
}

export interface AnalysisResult {
    defects: DefectDetection[];
    materialAnalysis: {
        type: string;
        condition: string;
        confidence: number;
    };
    environmentalFactors: {
        lighting: 'poor' | 'adequate' | 'good';
        weather?: string;
        temperature?: number;
        humidity?: number;
    };
    qualityScore: number;
    recommendations: string[];
}

export class PhotoAnalysisModel extends Observable {
    private _analysisHistory: Map<string, AnalysisResult> = new Map();
    private _defectPatterns: Map<string, DefectDetection[]> = new Map();
    private _processingQueue: Set<string> = new Set();

    constructor(private mediaModel: MediaModel) {
        super();
        this.initializeDefectPatterns();
    }

    async analyzePhoto(photo: PhotoAttachment): Promise<DefectDetection[]> {
        if (this._processingQueue.has(photo.id)) {
            return this.waitForProcessing(photo.id);
        }

        this._processingQueue.add(photo.id);

        try {
            const result = await this.performAnalysis(photo);
            this._analysisHistory.set(photo.id, result);
            return result.defects;
        } finally {
            this._processingQueue.delete(photo.id);
        }
    }

    async generateRecommendations(defects: DefectDetection[]): Promise<string[]> {
        const recommendations = new Set<string>();

        for (const defect of defects) {
            const baseRecommendations = this.getBaseRecommendations(defect.type, defect.severity);
            baseRecommendations.forEach(rec => recommendations.add(rec));

            if (defect.measurements) {
                const sizeBasedRecs = this.getSizeBasedRecommendations(defect);
                sizeBasedRecs.forEach(rec => recommendations.add(rec));
            }
        }

        return Array.from(recommendations);
    }

    async getAnalysisHistory(photoId: string): Promise<AnalysisResult | undefined> {
        return this._analysisHistory.get(photoId);
    }

    async compareWithPrevious(photoId: string, previousPhotoId: string): Promise<{
        changes: string[];
        severity: 'improved' | 'unchanged' | 'degraded';
    }> {
        const current = this._analysisHistory.get(photoId);
        const previous = this._analysisHistory.get(previousPhotoId);

        if (!current || !previous) {
            throw new Error('Analysis not found for one or both photos');
        }

        const changes: string[] = [];
        let severityScore = 0;

        // Compare defect counts
        const currentDefectCount = current.defects.length;
        const previousDefectCount = previous.defects.length;
        
        if (currentDefectCount !== previousDefectCount) {
            changes.push(`Defect count changed from ${previousDefectCount} to ${currentDefectCount}`);
            severityScore += Math.sign(currentDefectCount - previousDefectCount);
        }

        // Compare quality scores
        const qualityDiff = current.qualityScore - previous.qualityScore;
        if (Math.abs(qualityDiff) > 0.1) {
            changes.push(`Quality score ${qualityDiff > 0 ? 'improved' : 'decreased'} by ${Math.abs(qualityDiff).toFixed(2)}`);
            severityScore -= Math.sign(qualityDiff);
        }

        return {
            changes,
            severity: severityScore > 0 ? 'degraded' : severityScore < 0 ? 'improved' : 'unchanged'
        };
    }

    private async performAnalysis(photo: PhotoAttachment): Promise<AnalysisResult> {
        // Simulate AI analysis with mock data for demonstration
        const defects = this.detectDefects(photo);
        const materialAnalysis = this.analyzeMaterial(photo);
        const environmentalFactors = this.assessEnvironmentalConditions(photo);
        
        const qualityScore = this.calculateQualityScore(defects, materialAnalysis, environmentalFactors);
        
        return {
            defects,
            materialAnalysis,
            environmentalFactors,
            qualityScore,
            recommendations: await this.generateRecommendations(defects)
        };
    }

    private detectDefects(photo: PhotoAttachment): DefectDetection[] {
        // Simulate defect detection based on patterns
        const defects: DefectDetection[] = [];
        const patterns = this._defectPatterns.get(photo.jobNumber) || [];

        // Add some randomization for demonstration
        patterns.forEach(pattern => {
            if (Math.random() > 0.5) {
                defects.push({
                    id: Date.now().toString(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    ...pattern,
                    confidence: 0.7 + Math.random() * 0.3
                });
            }
        });

        return defects;
    }

    private analyzeMaterial(photo: PhotoAttachment): {
        type: string;
        condition: string;
        confidence: number;
    } {
        // Mock material analysis
        return {
            type: 'concrete',
            condition: 'acceptable',
            confidence: 0.85
        };
    }

    private assessEnvironmentalConditions(photo: PhotoAttachment): {
        lighting: 'poor' | 'adequate' | 'good';
        weather?: string;
        temperature?: number;
        humidity?: number;
    } {
        // Mock environmental assessment
        return {
            lighting: 'adequate',
            weather: 'clear',
            temperature: 72,
            humidity: 45
        };
    }

    private calculateQualityScore(
        defects: DefectDetection[],
        materialAnalysis: { condition: string; confidence: number },
        environmental: { lighting: string }
    ): number {
        let score = 1.0;

        // Reduce score based on defects
        score -= (defects.length * 0.1);
        
        // Adjust for material condition
        if (materialAnalysis.condition !== 'acceptable') {
            score -= 0.2;
        }

        // Environmental factors
        if (environmental.lighting === 'poor') {
            score -= 0.1;
        }

        return Math.max(0, Math.min(1, score));
    }

    private getBaseRecommendations(defectType: string, severity: string): string[] {
        const recommendations = new Set<string>();

        switch (defectType) {
            case 'crack':
                recommendations.add('Document crack width and length');
                recommendations.add('Monitor for progression');
                if (severity === 'high') {
                    recommendations.add('Immediate structural assessment required');
                }
                break;
            case 'spalling':
                recommendations.add('Remove loose material');
                recommendations.add('Assess underlying reinforcement');
                break;
            case 'corrosion':
                recommendations.add('Clean affected area');
                recommendations.add('Apply rust inhibitor');
                break;
        }

        return Array.from(recommendations);
    }

    private getSizeBasedRecommendations(defect: DefectDetection): string[] {
        const recommendations = new Set<string>();

        if (defect.measurements?.area && defect.measurements.area > 100) {
            recommendations.add('Large affected area - consider full section repair');
        }

        if (defect.measurements?.depth && defect.measurements.depth > 50) {
            recommendations.add('Deep defect detected - structural review required');
        }

        return Array.from(recommendations);
    }

    private async waitForProcessing(photoId: string): Promise<DefectDetection[]> {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (!this._processingQueue.has(photoId)) {
                    clearInterval(checkInterval);
                    const result = this._analysisHistory.get(photoId);
                    resolve(result?.defects || []);
                }
            }, 100);
        });
    }

    private initializeDefectPatterns(): void {
        // Initialize common defect patterns for different job types
        this._defectPatterns.set('concrete', [
            {
                id: 'crack-pattern',
                type: 'crack',
                confidence: 0.9,
                severity: 'medium',
                boundingBox: { x: 100, y: 150, width: 50, height: 10 },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'spalling-pattern',
                type: 'spalling',
                confidence: 0.85,
                severity: 'high',
                boundingBox: { x: 200, y: 300, width: 100, height: 100 },
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        this._defectPatterns.set('steel', [
            {
                id: 'corrosion-pattern',
                type: 'corrosion',
                confidence: 0.88,
                severity: 'medium',
                boundingBox: { x: 150, y: 200, width: 75, height: 75 },
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    }
}