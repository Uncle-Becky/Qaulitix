import { Observable } from '@nativescript/core';
import { BaseModel, DocumentType } from './types';

export interface Document extends BaseModel {
  title: string;
  type: DocumentType;
  content: string;
  version: number;
  status: 'draft' | 'active' | 'archived';
  metadata: {
    author: string;
    approvedBy?: string;
    approvalDate?: Date;
    expirationDate?: Date;
    tags: string[];
    relatedDocuments: string[];
    jobNumbers: string[];
  };
  revisionHistory: {
    version: number;
    date: Date;
    author: string;
    changes: string;
  }[];
}

export class DocumentModel extends Observable {
  private _documents: Document[] = [];
  private _documentIndex: Map<string, string[]> = new Map(); // tag -> documentIds

  constructor() {
    super();
    this.initializeDefaultDocuments();
  }

  get documents(): ReadonlyArray<Document> {
    return this._documents;
  }

  addDocument(data: Omit<Document, 'id' | 'version' | 'status' | 'revisionHistory' | 'createdAt' | 'updatedAt'>): Document {
    const document: Document = {
      id: Date.now().toString(),
      version: 1,
      status: 'draft',
      revisionHistory: [{
        version: 1,
        date: new Date(),
        author: data.metadata.author,
        changes: 'Initial creation'
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };

    this._documents.push(document);
    this.updateDocumentIndex(document);
    this.notifyPropertyChange('documents', this._documents);
    return document;
  }

  updateDocument(id: string, updates: Partial<Omit<Document, 'id' | 'version' | 'revisionHistory'>>): Document {
    const document = this._documents.find(doc => doc.id === id);
    if (!document) {
      throw new Error('Document not found');
    }

    const newVersion = document.version + 1;
    const updatedDoc = {
      ...document,
      ...updates,
      version: newVersion,
      updatedAt: new Date(),
      revisionHistory: [
        ...document.revisionHistory,
        {
          version: newVersion,
          date: new Date(),
          author: updates.metadata?.author || document.metadata.author,
          changes: `Updated document content and metadata`
        }
      ]
    };

    const index = this._documents.findIndex(doc => doc.id === id);
    this._documents[index] = updatedDoc;
    this.updateDocumentIndex(updatedDoc);
    this.notifyPropertyChange('documents', this._documents);
    return updatedDoc;
  }

  getDocumentsByType(type: DocumentType): Document[] {
    return this._documents.filter(doc => doc.type === type);
  }

  getDocumentById(id: string): Document | undefined {
    return this._documents.find(doc => doc.id === id);
  }

  getDocumentsByTag(tag: string): Document[] {
    const documentIds = this._documentIndex.get(tag) || [];
    return this._documents.filter(doc => documentIds.includes(doc.id));
  }

  getDocumentsByJob(jobNumber: string): Document[] {
    return this._documents.filter(doc => 
      doc.metadata.jobNumbers.includes(jobNumber)
    );
  }

  getActiveDocuments(): Document[] {
    return this._documents.filter(doc => doc.status === 'active');
  }

  archiveDocument(id: string, reason: string): void {
    const document = this._documents.find(doc => doc.id === id);
    if (document) {
      document.status = 'archived';
      document.revisionHistory.push({
        version: document.version,
        date: new Date(),
        author: 'system',
        changes: `Archived: ${reason}`
      });
      this.notifyPropertyChange('documents', this._documents);
    }
  }

  addRelatedDocument(sourceId: string, targetId: string): void {
    const source = this._documents.find(doc => doc.id === sourceId);
    const target = this._documents.find(doc => doc.id === targetId);

    if (source && target) {
      if (!source.metadata.relatedDocuments.includes(targetId)) {
        source.metadata.relatedDocuments.push(targetId);
        source.updatedAt = new Date();
      }
      if (!target.metadata.relatedDocuments.includes(sourceId)) {
        target.metadata.relatedDocuments.push(sourceId);
        target.updatedAt = new Date();
      }
      this.notifyPropertyChange('documents', this._documents);
    }
  }

  private updateDocumentIndex(document: Document): void {
    // Remove old index entries
    this._documentIndex.forEach((docs, tag) => {
      this._documentIndex.set(tag, docs.filter(id => id !== document.id));
    });

    // Add new index entries
    document.metadata.tags.forEach(tag => {
      const docs = this._documentIndex.get(tag) || [];
      if (!docs.includes(document.id)) {
        docs.push(document.id);
        this._documentIndex.set(tag, docs);
      }
    });
  }

  private initializeDefaultDocuments(): void {
    this.addDocument({
      title: 'Foundation Specifications',
      type: 'spec',
      content: 'Minimum concrete strength: 3000 PSI\nRebar spacing: 12 inches',
      metadata: {
        author: 'system',
        tags: ['foundation', 'concrete'],
        relatedDocuments: [],
        jobNumbers: ['DEFAULT']
      }
    });

    this.addDocument({
      title: 'Building Code 2024',
      type: 'code',
      content: 'Section 1.1: Foundation requirements...',
      metadata: {
        author: 'system',
        tags: ['code', 'requirements'],
        relatedDocuments: [],
        jobNumbers: ['DEFAULT']
      }
    });
  }
}