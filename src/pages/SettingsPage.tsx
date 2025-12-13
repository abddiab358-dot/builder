import { useState } from 'react'
import { useSettings } from '../hooks/useSettings'
import { BackupManager } from '../components/backup/BackupManager'
import { BackButton } from '../components/ui/BackButton'
import { usePermissions } from '../hooks/usePermissions'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export function SettingsPage() {
  const { data: settings, update, isUpdating } = useSettings()
  const {
    data: permissionUsers,
    addUser,
    updateUserRole,
    deleteUser,
    isSaving: isSavingPermissions,
  } = usePermissions()

  const [newUserName, setNewUserName] = useState('')
  const [newUserRole, setNewUserRole] = useState<'manager' | 'staff' | 'viewer'>('manager')
  const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null)

  const handleAddUser = async () => {
    const name = newUserName.trim()
    if (!name) return
    await addUser(name, newUserRole)
    setNewUserName('')
  }

  return (
    <div className="space-y-4 text-right">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">الإعدادات</h2>
        <BackButton fallbackPath="/dashboard" />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">تفضيلات العرض والتنبيهات</h3>
        <div className="flex flex-col gap-3 text-sm">
          <label className="flex items-center justify-between gap-3">
            <span className="text-slate-700">تفعيل الإشعارات داخل النظام</span>
            <input
              type="checkbox"
              checked={settings?.notificationsEnabled ?? true}
              onChange={(e) => update({ notificationsEnabled: e.target.checked })}
            />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-slate-700">وضع اللون الداكن</span>
            <input
              type="checkbox"
              checked={settings?.theme === 'dark'}
              onChange={(e) => update({ theme: e.target.checked ? 'dark' : 'light' })}
            />
          </label>
          <div className="text-[11px] text-slate-500">
            تطبيق اللغة العربية واتجاه RTL مفعّل دائمًا في هذا الإصدار.
          </div>
          {isUpdating && <div className="text-[11px] text-slate-500">جاري حفظ الإعدادات...</div>}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">المستخدمون والصلاحيات</h3>
        <p className="text-[11px] text-slate-500">
          يمكنك تعريف مستخدمين محليًا وتحديد أدوارهم داخل النظام. هذه الصلاحيات تُخزَّن في ملفات النظام داخل مجلد
          <span className="mx-1 font-mono text-[10px] bg-slate-100 px-1 rounded">project_files</span>
          بدون أي اتصال خارجي.
        </p>

        <div className="flex flex-col md:flex-row gap-3 text-xs items-end md:items-center">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[11px] text-slate-600">اسم المستخدم</label>
            <input
              className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="مثال: مسؤول النظام أو اسم الموظف"
            />
          </div>
          <div className="flex flex-col gap-1 w-full md:w-40">
            <label className="text-[11px] text-slate-600">الدور</label>
            <select
              className="border rounded-md px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as 'manager' | 'staff' | 'viewer')}
            >
              <option value="manager">مدير (تحكم كامل)</option>
              <option value="staff">موظف (إدخال وتعديل)</option>
              <option value="viewer">مشاهدة فقط</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleAddUser}
            className="px-4 py-1.5 rounded-md text-xs font-medium bg-primary-600 text-white hover:bg-primary-700 whitespace-nowrap"
          >
            إضافة مستخدم
          </button>
        </div>

        {isSavingPermissions && (
          <div className="text-[11px] text-slate-500">جاري حفظ التغييرات على الصلاحيات...</div>
        )}

        <div className="border-t border-slate-100 pt-3 mt-2 text-xs space-y-2">
          {!permissionUsers || permissionUsers.length === 0 ? (
            <div className="text-[11px] text-slate-500">
              لم تتم إضافة أي مستخدم حتى الآن. يمكنك البدء بإضافة مستخدم "مدير" واحد على الأقل.
            </div>
          ) : (
            <div className="space-y-2">
              {permissionUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 py-1 border-b last:border-b-0 border-slate-100"
                >
                  <div className="flex-1">
                    <div className="text-xs font-medium text-slate-900">{u.name}</div>
                    <div className="text-[10px] text-slate-500">
                      تمت الإضافة في {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded-md px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={u.role}
                      onChange={(e) => updateUserRole(u.id, e.target.value as 'manager' | 'staff' | 'viewer')}
                    >
                      <option value="manager">مدير</option>
                      <option value="staff">موظف</option>
                      <option value="viewer">مشاهدة فقط</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setUserToDeleteId(u.id)}
                      className="px-2 py-1 rounded-md text-[11px] font-medium text-red-600 hover:bg-red-50"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!userToDeleteId}
        title="تأكيد حذف المستخدم"
        description="هل أنت متأكد من حذف هذا المستخدم من قائمة الصلاحيات؟ لن يتم حذفه من أي ملفات أو بيانات أخرى."
        confirmLabel="نعم، حذف المستخدم"
        cancelLabel="إلغاء"
        tone="danger"
        onCancel={() => setUserToDeleteId(null)}
        onConfirm={async () => {
          if (!userToDeleteId) return
          await deleteUser(userToDeleteId)
          setUserToDeleteId(null)
        }}
      />

      <BackupManager />
    </div>
  )
}
