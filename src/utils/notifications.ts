// 通知工具类
export class NotificationManager {
  private static instance: NotificationManager;
  private notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    timestamp: number;
  }> = [];

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // 显示成功通知
  success(title: string, message: string): void {
    this.addNotification('success', title, message);
    console.log(`✅ ${title}: ${message}`);
  }

  // 显示错误通知
  error(title: string, message: string): void {
    this.addNotification('error', title, message);
    console.error(`❌ ${title}: ${message}`);
  }

  // 显示信息通知
  info(title: string, message: string): void {
    this.addNotification('info', title, message);
    console.info(`ℹ️ ${title}: ${message}`);
  }

  // 显示警告通知
  warning(title: string, message: string): void {
    this.addNotification('warning', title, message);
    console.warn(`⚠️ ${title}: ${message}`);
  }

  private addNotification(type: 'success' | 'error' | 'info' | 'warning', title: string, message: string): void {
    const id = Date.now().toString();
    this.notifications.push({
      id,
      type,
      title,
      message,
      timestamp: Date.now()
    });

    // 自动清理旧通知
    setTimeout(() => {
      this.removeNotification(id);
    }, 5000);
  }

  private removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  // 获取所有通知
  getNotifications() {
    return this.notifications;
  }

  // 清除所有通知
  clearAll(): void {
    this.notifications = [];
  }
}

// 导出单例实例
export const notify = NotificationManager.getInstance();