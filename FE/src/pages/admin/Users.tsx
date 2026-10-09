import React, { useState } from 'react';
import { CheckIcon, EditIcon, LockIcon, LockOpenIcon, MinusIcon, UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Role, User } from '../../types/procurement';
import { useCurrentUser } from '../../contexts/AuthContext';
import { useProcurement } from '../../contexts/ProcurementContext';
import { useAction } from '../../hooks/useAction';
import { ALL_PERMISSIONS, PERMISSION_LABEL, ROLE_LABEL, ROLE_PERMISSIONS } from '../../utils/permissions';
import { updateUser } from '../../utils/procurementActions';
import { inputClass } from '../../utils/styles';
import { PageHeader } from '../../components/ui/PageHeader';
import { Tag } from '../../components/ui/Tag';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FormField } from '../../components/ui/FormField';

const ROLES: Role[] = ['employee', 'manager', 'procurement', 'finance', 'admin'];

export function AdminUsersPage() {
  const me = useCurrentUser();
  const { state } = useProcurement();
  const act = useAction();

  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Modal form fields state
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<Role>('employee');
  const [formCanReceive, setFormCanReceive] = useState(false);
  const [formLocked, setFormLocked] = useState(false);
  const [formReason, setFormReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormUsername(u.username || u.id);
    setFormEmail(u.email);
    setFormDept(u.department);
    setFormTitle(u.title || '');
    setFormPassword('');
    setFormRole(u.role);
    setFormCanReceive(u.canReceive);
    setFormLocked(u.locked);
    setFormReason('');
    setFormError(null);
  };

  const handleSave = () => {
    if (!editingUser) return;
    if (!formName.trim()) {
      setFormError('Vui lòng nhập họ và tên.');
      return;
    }
    if (!formEmail.trim()) {
      setFormError('Vui lòng nhập email.');
      return;
    }

    const reason = formReason.trim() || 'Cập nhật thông tin tài khoản bởi Admin';

    const patch: Partial<User> = {
      name: formName.trim(),
      username: formUsername.trim() || editingUser.username || editingUser.id,
      email: formEmail.trim(),
      department: formDept.trim(),
      title: formTitle.trim(),
      role: formRole,
      canReceive: formCanReceive,
      locked: formLocked,
    };

    if (formPassword.trim()) {
      patch.password = formPassword.trim();
    }

    const res = act(updateUser, editingUser.id, patch, reason);
    if (res.ok) {
      toast.success(`Đã cập nhật thông tin tài khoản ${formName}`);
      setEditingUser(null);
    } else {
      setFormError(res.error || 'Cập nhật thất bại.');
    }
  };


  return (
    <div>
      <PageHeader
        title="Người dùng & RBAC"
        description="Quản lý tài khoản, vai trò và phân quyền hệ thống. Bấm vào tài khoản bất kỳ để chỉnh sửa thông tin chi tiết."
      />

      <section aria-labelledby="users-title">
        <h2 id="users-title" className="sr-only">
          Danh sách tài khoản
        </h2>
        <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-card">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas text-xs text-ink-500">
                <th className="py-3.5 pl-6 pr-4 font-medium">Người dùng</th>
                <th className="px-4 py-3.5 font-medium">Phòng ban & Chức danh</th>
                <th className="px-4 py-3.5 font-medium">Vai trò</th>
                <th className="px-4 py-3.5 font-medium">Receiving</th>
                <th className="px-4 py-3.5 font-medium">Trạng thái</th>
                <th className="py-3.5 pr-6 text-right font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {state.users.map((u) => {
                const isMe = u.id === me.id;
                return (
                  <tr
                    key={u.id}
                    onClick={() => openEditModal(u)}
                    className="group cursor-pointer transition-colors duration-150 hover:bg-canvas">
                    <td className="py-3.5 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary-50 text-primary-700">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-ink-900 group-hover:text-primary-600 transition-colors">
                            {u.name} {isMe && <span className="text-xs font-normal text-ink-500">(Tài khoản của bạn)</span>}
                          </p>
                          <p className="text-xs text-ink-500">
                            Tên đăng nhập: <span className="font-semibold text-primary-700">{u.username || u.id}</span> · {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-ink-800">{u.department}</p>
                      <p className="text-xs text-ink-500">{u.title || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-md bg-raised px-2.5 py-1 text-xs font-semibold text-ink-800">
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {u.canReceive ? (
                        <Tag tone="success">Được nhận hàng</Tag>
                      ) : (
                        <span className="text-xs text-ink-400">Không</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {u.locked ? (
                        <Tag tone="danger" icon={<LockIcon className="h-3 w-3" aria-hidden />}>
                          Bị khóa
                        </Tag>
                      ) : (
                        <Tag tone="success">Hoạt động</Tag>
                      )}
                    </td>
                    <td className="py-3.5 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<EditIcon className="h-4 w-4" />}
                        onClick={() => openEditModal(u)}>
                        Chỉnh sửa
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Ma trận phân quyền RBAC */}
      <section className="mt-12" aria-labelledby="matrix-title">
        <h2 id="matrix-title" className="text-xl font-semibold text-ink-900">
          Ma trận phân quyền (RBAC Matrix)
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Quyền hệ thống được thiết lập theo vai trò. Người tạo PR không thể tự phê duyệt PR của chính mình.
        </p>
        <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas text-xs text-ink-500">
                <th className="py-3 pl-6 pr-4 font-medium">Chức năng</th>
                {ROLES.map((r) => (
                  <th key={r} className="px-3 py-3 text-center font-medium">
                    {ROLE_LABEL[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {ALL_PERMISSIONS.map((p) => (
                <tr key={p}>
                  <td className="py-2.5 pl-6 pr-4 text-ink-700 font-medium">{PERMISSION_LABEL[p]}</td>
                  {ROLES.map((r) => {
                    const has = ROLE_PERMISSIONS[r].includes(p);
                    return (
                      <td key={r} className="px-3 py-2.5 text-center">
                        {p === 'receiving.record' && has ? (
                          <span className="text-xs text-primary-700 font-medium">Theo tài khoản Procurement</span>
                        ) : has ? (
                          <CheckIcon className="mx-auto h-4 w-4 text-success-600" aria-label="Có" />
                        ) : (
                          <MinusIcon className="mx-auto h-4 w-4 text-ink-300" aria-label="Không" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL CHỈNH SỬA THÔNG TIN & TÀI KHOẢN */}
      {editingUser && (
        <Modal
          open={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          title={`Chỉnh sửa tài khoản: ${editingUser.name}`}
          description={`ID: ${editingUser.id} · Email: ${editingUser.email}`}
          size="lg"
          footer={
            <div className="flex gap-2">
              <Button variant="tertiary" onClick={() => setEditingUser(null)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Lưu thay đổi
              </Button>
            </div>
          }>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
            {formError && (
              <div className="rounded-md bg-danger-50 p-3 text-sm text-danger-700 border border-danger-200">
                {formError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Tên đăng nhập (Username)" htmlFor="edit-username">
                <input
                  id="edit-username"
                  name="edit-username"
                  type="text"
                  autoComplete="username"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className={inputClass()}
                  placeholder="Ví dụ: employee1, manager1..."
                />
              </FormField>

              <FormField label="Họ và tên" htmlFor="edit-name">
                <input
                  id="edit-name"
                  name="edit-name"
                  type="text"
                  autoComplete="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={inputClass()}
                  placeholder="Nhập họ và tên"
                />
              </FormField>
            </div>

            <FormField label="Email liên hệ" htmlFor="edit-email">
              <input
                id="edit-email"
                name="edit-email"
                type="email"
                autoComplete="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className={inputClass()}
                placeholder="ten@procure.vn"
              />
            </FormField>

            <FormField label="Mật khẩu mới (Để trống nếu không muốn thay đổi)" htmlFor="edit-password">
              <input
                id="edit-password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className={inputClass()}
                placeholder="Nhập mật khẩu mới cho tài khoản..."
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Phòng ban" htmlFor="edit-dept">
                <input
                  id="edit-dept"
                  name="edit-dept"
                  type="text"
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className={inputClass()}
                  placeholder="Ví dụ: Công nghệ thông tin"
                />
              </FormField>

              <FormField label="Chức danh" htmlFor="edit-title">
                <input
                  id="edit-title"
                  name="edit-title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={inputClass()}
                  placeholder="Ví dụ: Kỹ sư phần mềm"
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Vai trò hệ thống (Role)" htmlFor="edit-role">
                <select
                  id="edit-role"
                  name="edit-role"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as Role)}
                  className={inputClass()}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Quyền ghi nhận Receiving" htmlFor="edit-can-receive">
                <div className="flex h-10 items-center">
                  <label className="inline-flex items-center gap-2.5 text-sm text-ink-900 cursor-pointer">
                    <input
                      id="edit-can-receive"
                      name="edit-can-receive"
                      type="checkbox"
                      checked={formCanReceive}
                      onChange={(e) => setFormCanReceive(e.target.checked)}
                      className="h-4 w-4 rounded border-line text-primary-600 focus:ring-primary-600"
                    />
                    <span>Cho phép tạo phiếu nhận hàng (Receiving Note)</span>
                  </label>
                </div>
              </FormField>
            </div>

            <FormField label="Trạng thái tài khoản" htmlFor="edit-locked">
              <div className="flex items-center gap-4 rounded-lg border border-line p-3.5 bg-canvas">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-900">
                    {formLocked ? 'Tài khoản đang bị K khóa' : 'Tài khoản đang Hoạt động'}
                  </p>
                  <p className="text-xs text-ink-500">
                    {formLocked
                      ? 'Người dùng không thể đăng nhập vào hệ thống.'
                      : 'Người dùng có thể đăng nhập và sử dụng hệ thống bình thường.'}
                  </p>
                </div>
                <Button
                  id="edit-locked"
                  type="button"
                  variant={formLocked ? 'secondary' : 'danger'}
                  size="sm"
                  icon={formLocked ? <LockOpenIcon className="h-4 w-4" /> : <LockIcon className="h-4 w-4" />}
                  onClick={() => setFormLocked(!formLocked)}>
                  {formLocked ? 'Mở khóa' : 'Khóa tài khoản'}
                </Button>
              </div>
            </FormField>

            <FormField label="Lý do điều chỉnh (bắt buộc cho Audit Trail)" htmlFor="edit-reason">
              <textarea
                id="edit-reason"
                name="edit-reason"
                rows={3}
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                placeholder="Nhập lý do điều chỉnh thông tin hoặc thay đổi phân quyền..."
                className={inputClass()}
              />
            </FormField>
          </form>
        </Modal>
      )}
    </div>
  );
}