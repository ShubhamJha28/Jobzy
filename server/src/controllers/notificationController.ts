import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export class NotificationController {
  public static async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      const unreadCount = notifications.filter((n) => !n.readAt).length;

      res.status(200).json({ success: true, unreadCount, notifications });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
    }
  }

  public static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (id === 'all') {
        if (!req.user) {
          res.status(401).json({ success: false, message: 'Unauthorized' });
          return;
        }
        await prisma.notification.updateMany({
          where: { userId: req.user.id, readAt: null },
          data: { readAt: new Date() },
        });
        res.status(200).json({ success: true, message: 'All notifications marked as read.' });
        return;
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { readAt: new Date() },
      });

      res.status(200).json({ success: true, notification: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update notification.' });
    }
  }
}
