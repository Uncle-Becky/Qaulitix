import { Observable } from '@nativescript/core';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'deficiency' | 'inspection' | 'task' | 'system';
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  read: boolean;
  relatedId?: string;
}

export class NotificationModel extends Observable {
  private _notifications: Notification[] = [];

  get notifications(): Notification[] {
    return this._notifications;
  }

  get unreadCount(): number {
    return this._notifications.filter(n => !n.read).length;
  }

  addNotification(data: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const notification: Notification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      ...data
    };
    this._notifications.unshift(notification);
    this.notifyPropertyChange('notifications', this._notifications);
    this.notifyPropertyChange('unreadCount', this.unreadCount);
  }

  markAsRead(id: string) {
    const notification = this._notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyPropertyChange('notifications', this._notifications);
      this.notifyPropertyChange('unreadCount', this.unreadCount);
    }
  }

  markAllAsRead() {
    this._notifications.forEach(n => n.read = true);
    this.notifyPropertyChange('notifications', this._notifications);
    this.notifyPropertyChange('unreadCount', this.unreadCount);
  }
}