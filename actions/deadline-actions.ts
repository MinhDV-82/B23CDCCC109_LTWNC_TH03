'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getServerAuthSession } from '@/lib/auth';
import { can } from '@/lib/permissions';
import {
  getDeadlineById,
  getSubjectById,
  createDeadline,
  deleteDeadline,
  toggleDeadlineProgress,
  getDeadlineProgress,
} from '@/lib/data-repository';

// Input Schemas
const toggleProgressSchema = z.object({
  deadlineId: z.string().min(1, 'Mã deadline không được để trống'),
});

const createDeadlineSchema = z.object({
  subjectId: z.string().min(1, 'Vui lòng chọn môn học hợp lệ'),
  title: z.string().min(3, 'Tiêu đề deadline phải có tối thiểu 3 ký tự').max(200, 'Tiêu đề quá dài'),
  description: z.string().min(5, 'Mô tả bài tập phải có tối thiểu 5 ký tự'),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Thời hạn phải theo định dạng ngày giờ hợp lệ',
  }),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
});

const deleteDeadlineSchema = z.object({
  id: z.string().min(1, 'Mã deadline cần xóa không hợp lệ'),
});

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Server Action: Toggle deadline completion for current authenticated student
 */
export async function toggleDeadlineProgressAction(
  rawInput: unknown
): Promise<ActionResponse<{ isCompleted: boolean }>> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return { success: false, error: 'Bạn phải đăng nhập để thực hiện thao tác này.' };
    }

    if (!can(session.user.role, 'complete_deadline')) {
      return { success: false, error: 'Tài khoản của bạn không có quyền cập nhật tiến độ.' };
    }

    const validation = toggleProgressSchema.safeParse(rawInput);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0]?.message || 'Dữ liệu không hợp lệ.' };
    }

    const { deadlineId } = validation.data;
    const deadline = await getDeadlineById(deadlineId);
    if (!deadline) {
      return { success: false, error: 'Deadline không tồn tại trong hệ thống.' };
    }

    // Toggle progress only for the current user ID from session
    const isNowCompleted = await toggleDeadlineProgress(session.user.id, deadlineId);

    // Invalidate affected paths
    revalidatePath(`/deadlines/${deadlineId}`);
    revalidatePath('/dashboard');

    return { success: true, data: { isCompleted: isNowCompleted } };
  } catch (error: unknown) {
    console.error('[toggleDeadlineProgressAction] Error:', error);
    return { success: false, error: 'Có lỗi xảy ra khi cập nhật trạng thái tiến độ.' };
  }
}

/**
 * Server Action: Check completion status for the current user
 */
export async function checkMyProgressAction(deadlineId: string): Promise<boolean> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) return false;
    const prog = await getDeadlineProgress(session.user.id, deadlineId);
    return Boolean(prog?.isCompleted);
  } catch {
    return false;
  }
}

/**
 * Server Action: Admin creates a new deadline
 */
export async function createDeadlineAction(
  rawInput: unknown
): Promise<ActionResponse<{ id: string; title: string }>> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return { success: false, error: 'Yêu cầu đăng nhập trước khi tạo deadline.' };
    }

    // Server-side RBAC validation
    if (!can(session.user.role, 'create_deadline')) {
      return { success: false, error: 'Bạn không có quyền quản trị viên để tạo deadline mới.' };
    }

    const validation = createDeadlineSchema.safeParse(rawInput);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map((e) => e.message).join(', '),
      };
    }

    const { subjectId, title, description, dueDate, priority } = validation.data;

    const subject = await getSubjectById(subjectId);
    if (!subject) {
      return { success: false, error: 'Môn học được chọn không tồn tại.' };
    }

    const newDeadline = await createDeadline({
      subjectId,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
    });

    // Invalidate caches
    revalidatePath('/');
    revalidatePath('/deadlines');
    revalidatePath('/admin');
    revalidatePath(`/subjects/${subject.slug}`);
    revalidatePath('/sitemap.xml');

    return {
      success: true,
      data: { id: newDeadline.id, title: newDeadline.title },
    };
  } catch (error: unknown) {
    console.error('[createDeadlineAction] Error:', error);
    return { success: false, error: 'Lỗi máy chủ khi lưu deadline mới.' };
  }
}

/**
 * Server Action: Admin deletes a deadline
 */
export async function deleteDeadlineAction(
  rawInput: unknown
): Promise<ActionResponse<void>> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return { success: false, error: 'Yêu cầu đăng nhập quản trị.' };
    }

    // Server-side RBAC validation
    if (!can(session.user.role, 'delete_deadline')) {
      return { success: false, error: 'Chỉ Quản trị viên mới được xóa deadline.' };
    }

    const validation = deleteDeadlineSchema.safeParse(rawInput);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0]?.message || 'ID không hợp lệ.' };
    }

    const { id } = validation.data;
    const existing = await getDeadlineById(id);
    if (!existing) {
      return { success: false, error: 'Deadline cần xóa không tồn tại.' };
    }

    const subject = await getSubjectById(existing.subjectId);

    const deleted = await deleteDeadline(id);
    if (!deleted) {
      return { success: false, error: 'Không thể xóa deadline từ bộ nhớ lưu trữ.' };
    }

    // Comprehensive cache invalidation
    revalidatePath('/');
    revalidatePath('/deadlines');
    revalidatePath(`/deadlines/${id}`);
    revalidatePath('/admin');
    if (subject) {
      revalidatePath(`/subjects/${subject.slug}`);
    }
    revalidatePath('/sitemap.xml');

    return { success: true };
  } catch (error: unknown) {
    console.error('[deleteDeadlineAction] Error:', error);
    return { success: false, error: 'Lỗi hệ thống khi xóa deadline.' };
  }
}

