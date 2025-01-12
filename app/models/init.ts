import { InspectionModel } from './inspection';
import { DocumentModel } from './document';
import { ScheduleModel } from './schedule';
import { MediaModel } from './media';
import { AnalyticsModel } from './analytics';
import { NotificationModel } from './notification';
import { CollaborationModel } from './collaboration';
import { PhotoAnalysisModel } from './photo-analysis';
import { ChecklistGeneratorModel } from './checklist-generator';

export class InitializationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InitializationError';
    }
}

export function initializeModels() {
    try {
        const inspection = new InspectionModel();
        const documents = new DocumentModel();
        const schedule = new ScheduleModel();
        const media = new MediaModel();
        const analytics = new AnalyticsModel(inspection, schedule);
        const notifications = new NotificationModel();
        const collaboration = new CollaborationModel();
        const photoAnalysis = new PhotoAnalysisModel(media);
        const checklistGenerator = new ChecklistGeneratorModel();

        // Set up model relationships with validation
        try {
            inspection.setMediaModel(media);
            inspection.setNotificationModel(notifications);
            inspection.setScheduleModel(schedule);
            inspection.setDocumentModel(documents);
            inspection.setCollaborationModel(collaboration);

            schedule.setMediaModel(media);
            schedule.setNotificationModel(notifications);
            schedule.setInspectionModel(inspection);

            media.setNotificationModel(notifications);
            media.setPhotoAnalysisModel(photoAnalysis);
        } catch (e) {
            throw new InitializationError(`Failed to set up model relationships: ${e.message}`);
        }

        return {
            inspection,
            documents,
            schedule,
            media,
            analytics,
            notifications,
            collaboration,
            photoAnalysis,
            checklistGenerator
        };
    } catch (e) {
        throw new InitializationError(`Failed to initialize models: ${e.message}`);
    }
}