import {
  createDeadlineAction,
  deleteDeadlineAction,
  toggleDeadlineProgressAction,
} from '@/actions/deadline-actions';
import { getServerAuthSession } from '@/lib/auth';
import {
  getDeadlineById,
  getSubjectById,
  createDeadline,
  deleteDeadline,
  toggleDeadlineProgress,
} from '@/lib/data-repository';

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

// Mock auth module
jest.mock('@/lib/auth', () => ({
  getServerAuthSession: jest.fn(),
}));

// Mock repository functions
jest.mock('@/lib/data-repository', () => ({
  getDeadlineById: jest.fn(),
  getSubjectById: jest.fn(),
  createDeadline: jest.fn(),
  deleteDeadline: jest.fn(),
  toggleDeadlineProgress: jest.fn(),
}));

const mockGetSession = getServerAuthSession as jest.Mock;
const mockGetDeadlineById = getDeadlineById as jest.Mock;
const mockGetSubjectById = getSubjectById as jest.Mock;
const mockCreateDeadline = createDeadline as jest.Mock;
const mockDeleteDeadline = deleteDeadline as jest.Mock;
const mockToggleProgress = toggleDeadlineProgress as jest.Mock;

describe('Server Actions & Authorization Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Unauthenticated requests', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue(null);
    });

    it('should reject createDeadlineAction for unauthenticated user', async () => {
      const res = await createDeadlineAction({
        subjectId: 'sub_01',
        title: 'Unauthorized Test',
        description: 'Should fail without session',
        dueDate: '2026-11-01T00:00:00Z',
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/yêu cầu đăng nhập/i);
    });

    it('should reject deleteDeadlineAction for unauthenticated user', async () => {
      const res = await deleteDeadlineAction({ id: 'dl_01' });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/yêu cầu đăng nhập/i);
    });

    it('should reject toggleDeadlineProgressAction for unauthenticated user', async () => {
      const res = await toggleDeadlineProgressAction({ deadlineId: 'dl_01' });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/phải đăng nhập/i);
    });
  });

  describe('Student role (user) calling restricted admin actions', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        user: {
          id: 'usr_sv_01',
          name: 'Nguyễn Văn Sinh Viên',
          email: 'sv@ptit.edu.vn',
          role: 'user',
        },
        expires: '2026-12-31',
      });
    });

    it('should FORBID student from creating a deadline', async () => {
      const res = await createDeadlineAction({
        subjectId: 'sub_01',
        title: 'Hacked Deadline by Student',
        description: 'Attempting unauthorized creation',
        dueDate: '2026-11-01T00:00:00Z',
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/không có quyền/i);
    });

    it('should FORBID student from deleting a deadline', async () => {
      const res = await deleteDeadlineAction({ id: 'dl_01' });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/quản trị viên/i);
    });

    it('should ALLOW student to toggle their own progress for an existing deadline', async () => {
      mockGetDeadlineById.mockResolvedValue({
        id: 'dl_01',
        subjectId: 'sub_01',
        title: 'Thực hành',
        description: 'Nội dung',
        dueDate: '2026-11-01T00:00:00Z',
        createdAt: '2026-10-01T00:00:00Z',
      });
      mockToggleProgress.mockResolvedValue(true);

      const res = await toggleDeadlineProgressAction({ deadlineId: 'dl_01' });
      expect(res.success).toBe(true);
      expect(res.data?.isCompleted).toBe(true);
      // Ensure it used the session user's ID
      expect(mockToggleProgress).toHaveBeenCalledWith('usr_sv_01', 'dl_01');
    });

    it('should return error when student toggles a non-existent deadline', async () => {
      mockGetDeadlineById.mockResolvedValue(null);

      const res = await toggleDeadlineProgressAction({ deadlineId: 'non_existent_id' });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/không tồn tại/i);
    });
  });

  describe('Admin role (admin) executing management actions', () => {
    beforeEach(() => {
      mockGetSession.mockResolvedValue({
        user: {
          id: 'usr_admin_01',
          name: 'Lớp Trưởng',
          email: 'admin@ptit.edu.vn',
          role: 'admin',
        },
        expires: '2026-12-31',
      });
    });

    it('should successfully create deadline when data is valid', async () => {
      mockGetSubjectById.mockResolvedValue({
        id: 'sub_01',
        slug: 'lap-trinh-web',
        name: 'Web',
        code: 'INT1416',
        description: 'Web dev',
      });
      mockCreateDeadline.mockResolvedValue({
        id: 'dl_new_123',
        subjectId: 'sub_01',
        title: 'Bài tập lớn mới tạo',
        description: 'Mô tả chi tiết bài tập lớn',
        dueDate: '2026-11-10T23:59:59+07:00',
        createdAt: '2026-10-27T00:00:00Z',
      });

      const res = await createDeadlineAction({
        subjectId: 'sub_01',
        title: 'Bài tập lớn mới tạo',
        description: 'Mô tả chi tiết bài tập lớn',
        dueDate: '2026-11-10T23:59:59+07:00',
        priority: 'high',
      });

      expect(res.success).toBe(true);
      expect(res.data?.id).toBe('dl_new_123');
      expect(res.data?.title).toBe('Bài tập lớn mới tạo');
    });

    it('should reject create when input fails Zod schema validation (e.g. title too short)', async () => {
      const res = await createDeadlineAction({
        subjectId: 'sub_01',
        title: 'ab', // < 3 characters
        description: 'Valid description here',
        dueDate: '2026-11-10T00:00:00Z',
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/tối thiểu 3 ký tự/i);
    });

    it('should reject create when subjectId does not exist in repository', async () => {
      mockGetSubjectById.mockResolvedValue(null);

      const res = await createDeadlineAction({
        subjectId: 'sub_fake_99',
        title: 'Valid Deadline Title',
        description: 'Valid description here',
        dueDate: '2026-11-10T00:00:00Z',
      });

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/môn học.*không tồn tại/i);
    });

    it('should reject delete when deadline does not exist', async () => {
      mockGetDeadlineById.mockResolvedValue(null);

      const res = await deleteDeadlineAction({ id: 'dl_missing' });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/không tồn tại/i);
    });

    it('should successfully delete an existing deadline', async () => {
      mockGetDeadlineById.mockResolvedValue({
        id: 'dl_to_delete',
        subjectId: 'sub_01',
        title: 'To Delete',
        description: 'Desc',
        dueDate: '2026-11-01T00:00:00Z',
        createdAt: '2026-10-01T00:00:00Z',
      });
      mockGetSubjectById.mockResolvedValue({
        id: 'sub_01',
        slug: 'web',
        name: 'Web',
        code: 'INT1416',
        description: 'Desc',
      });
      mockDeleteDeadline.mockResolvedValue(true);

      const res = await deleteDeadlineAction({ id: 'dl_to_delete' });
      expect(res.success).toBe(true);
      expect(mockDeleteDeadline).toHaveBeenCalledWith('dl_to_delete');
    });
  });
});

