import { supabase } from "@/lib/supabase";
import { NotificationType } from "@/types/notification";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a new notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const { data, error } = await supabase.from("notifications").insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      metadata: params.metadata,
      read: false,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error creating notification:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createNotification:", error);
    throw error;
  }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: string[],
  params: Omit<CreateNotificationParams, "userId">
) {
  try {
    const notifications = userIds.map((userId) => ({
      user_id: userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      metadata: params.metadata,
      read: false,
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("notifications")
      .insert(notifications);

    if (error) {
      console.error("Error creating bulk notifications:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createBulkNotifications:", error);
    throw error;
  }
}

/**
 * Create a notification for all users with a specific role
 */
export async function createNotificationForRole(
  role: string,
  params: Omit<CreateNotificationParams, "userId">
) {
  try {
    // First, get all users with the specified role
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", role);

    if (usersError) {
      console.error("Error fetching users by role:", usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log(`No users found with role: ${role}`);
      return [];
    }

    const userIds = users.map((user) => user.id);
    return await createBulkNotifications(userIds, params);
  } catch (error) {
    console.error("Error in createNotificationForRole:", error);
    throw error;
  }
}

/**
 * Create a notification for all users
 */
export async function createAnnouncementForAll(
  params: Omit<CreateNotificationParams, "userId">
) {
  try {
    // Get all user IDs
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id");

    if (usersError) {
      console.error("Error fetching all users:", usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log("No users found");
      return [];
    }

    const userIds = users.map((user) => user.id);
    return await createBulkNotifications(userIds, params);
  } catch (error) {
    console.error("Error in createAnnouncementForAll:", error);
    throw error;
  }
}
