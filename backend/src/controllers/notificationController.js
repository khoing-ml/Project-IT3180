const { supabaseAdmin } = require("../config/supabase");

class NotificationController {
  constructor() {}

  /**
   * Create a notification for a specific user
   */
  async createNotification(req, res) {
    try {
      const { userId, type, title, message, link, metadata } = req.body;

      if (!userId || !type || !title || !message) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: userId, type, title, message",
        });
      }

      const { data, error } = await supabaseAdmin
        .from("notifications")
        .insert({
          user_id: userId,
          type,
          title,
          message,
          link: link || null,
          metadata: metadata || null,
          read: false,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error("Error creating notification:", error);
        return res
          .status(500)
          .json({ success: false, message: error.message });
      }

      return res.status(201).json({
        success: true,
        message: "Notification created successfully",
        data: data[0],
      });
    } catch (error) {
      console.error("Error in createNotification:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Create notifications for multiple users
   */
  async createBulkNotifications(req, res) {
    try {
      const { userIds, type, title, message, link, metadata } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "userIds must be a non-empty array",
        });
      }

      if (!type || !title || !message) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: type, title, message",
        });
      }

      const notifications = userIds.map((userId) => ({
        user_id: userId,
        type,
        title,
        message,
        link: link || null,
        metadata: metadata || null,
        read: false,
        created_at: new Date().toISOString(),
      }));

      const { data, error } = await supabaseAdmin
        .from("notifications")
        .insert(notifications)
        .select();

      if (error) {
        console.error("Error creating bulk notifications:", error);
        return res
          .status(500)
          .json({ success: false, message: error.message });
      }

      return res.status(201).json({
        success: true,
        message: `${data.length} notifications created successfully`,
        data,
      });
    } catch (error) {
      console.error("Error in createBulkNotifications:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Create notification for all users with a specific role
   */
  async createNotificationForRole(req, res) {
    try {
      const { role, type, title, message, link, metadata } = req.body;

      if (!role || !type || !title || !message) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: role, type, title, message",
        });
      }

      // Get all users with the specified role
      const { data: users, error: usersError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("role", role);

      if (usersError) {
        console.error("Error fetching users by role:", usersError);
        return res
          .status(500)
          .json({ success: false, message: usersError.message });
      }

      if (!users || users.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No users found with role: ${role}`,
        });
      }

      const userIds = users.map((user) => user.id);
      const notifications = userIds.map((userId) => ({
        user_id: userId,
        type,
        title,
        message,
        link: link || null,
        metadata: metadata || null,
        read: false,
        created_at: new Date().toISOString(),
      }));

      const { data, error } = await supabaseAdmin
        .from("notifications")
        .insert(notifications)
        .select();

      if (error) {
        console.error("Error creating notifications for role:", error);
        return res
          .status(500)
          .json({ success: false, message: error.message });
      }

      return res.status(201).json({
        success: true,
        message: `Notifications sent to ${data.length} ${role}s`,
        data,
      });
    } catch (error) {
      console.error("Error in createNotificationForRole:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Create notification for all users
   */
  async createAnnouncementForAll(req, res) {
    try {
      const { type, title, message, link, metadata } = req.body;

      if (!type || !title || !message) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: type, title, message",
        });
      }

      // Get all users
      const { data: users, error: usersError } = await supabaseAdmin
        .from("profiles")
        .select("id");

      if (usersError) {
        console.error("Error fetching all users:", usersError);
        return res
          .status(500)
          .json({ success: false, message: usersError.message });
      }

      if (!users || users.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No users found" });
      }

      const userIds = users.map((user) => user.id);
      const notifications = userIds.map((userId) => ({
        user_id: userId,
        type,
        title,
        message,
        link: link || null,
        metadata: metadata || null,
        read: false,
        created_at: new Date().toISOString(),
      }));

      const { data, error } = await supabaseAdmin
        .from("notifications")
        .insert(notifications)
        .select();

      if (error) {
        console.error("Error creating announcement:", error);
        return res
          .status(500)
          .json({ success: false, message: error.message });
      }

      return res.status(201).json({
        success: true,
        message: `Announcement sent to ${data.length} users`,
        data,
      });
    } catch (error) {
      console.error("Error in createAnnouncementForAll:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required",
        });
      }

      const { data, error, count } = await supabaseAdmin
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching notifications:", error);
        return res
          .status(500)
          .json({ success: false, message: error.message });
      }

      return res.status(200).json({
        success: true,
        message: "Notifications fetched successfully",
        data,
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      console.error("Error in getUserNotifications:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;

      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "notificationId is required",
        });
      }

      const { data, error } = await supabaseAdmin
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .select();

      if (error) {
        console.error("Error marking notification as read:", error);
        return res
          .status(500)
          .json({ success: false, message: error.message });
      }

      return res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: data[0],
      });
    } catch (error) {
      console.error("Error in markAsRead:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;

      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "notificationId is required",
        });
      }

      const { error } = await supabaseAdmin
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) {
        console.error("Error deleting notification:", error);
        return res
          .status(500)
          .json({ success: false, message: error.message });
      }

      return res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteNotification:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = { NotificationController };
