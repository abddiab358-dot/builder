import { useState } from 'react'
import { useSettings } from '../hooks/useSettings'
import { useCloudSync } from '../hooks/useCloudSync'
import { BackupManager } from '../components/backup/BackupManager'
import { BackButton } from '../components/ui/BackButton'
import { usePermissions } from '../hooks/usePermissions'
import { useAuth } from '../context/AuthContext'
import { hashPassword } from '../utils/password'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export function SettingsPage() {
  const { data: settings, update, isUpdating } = useSettings()
  const { user } = useAuth()
  const {
    data: permissionUsers,
    addUser,
    updateUserRole,
    deleteUser,
    isSaving: isSavingPermissions,
  } = usePermissions()
  const { 
    syncSettings, 
    authenticateGoogle, 
    authenticateMicrosoft, 
    syncData, 
    disconnect, 
    isSyncing, 
    syncProgress,
    lastSyncResult 
  } = useCloudSync()

  const [newUserName, setNewUserName] = useState('')
  const [newUserRole, setNewUserRole] = useState<'manager' | 'staff' | 'viewer'>('manager')
  const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null)
  
  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handleAddUser = async () => {
    const name = newUserName.trim()
    if (!name) return
    await addUser(name, newUserRole)
    setNewUserName('')
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)

    // التحقق من الحقول
    if (!newPassword.trim()) {
      setPasswordError('الرجاء إدخال كلمة السر الجديدة')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('كلمة السر يجب أن تكون 6 أحرف على الأقل')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('كلمات السر غير متطابقة')
      return
    }

    try {
      // قراءة بيانات المستخدمين
      const stored = localStorage.getItem('file:permissions.json')
      const users = stored ? JSON.parse(stored) : []

      // تحديث كلمة السر للمستخدم الحالي
      const updatedUsers = users.map((u: any) => 
        u.id === user?.id 
          ? { ...u, passwordHash: hashPassword(newPassword) }
          : u
      )

      // حفظ البيانات المحدثة
      localStorage.setItem('file:permissions.json', JSON.stringify(updatedUsers))

      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)

      // إخفاء رسالة النجاح بعد 3 ثوان
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (error) {
      setPasswordError('فشل تغيير كلمة السر')
      console.error(error)
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      manager: 'مدير',
      staff: 'موظف',
      viewer: 'مشاهدة فقط',
    }
    return labels[role] || role
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager':
        return 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
      case 'staff':
        return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 'viewer':
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    }
  }

  return (
    <div className="space-y-6 text-right animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">الإعدادات والتحضيرات</h1>
        <BackButton fallbackPath="/dashboard" />
      </div>

      {/* Display and Notifications Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-dark-md">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          تفضيلات العرض والتنبيهات
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-50">تفعيل الإشعارات</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.notificationsEnabled ?? true}
                onChange={(e) => update({ notificationsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-50">الوضع المظلم</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.theme === 'dark'}
                onChange={(e) => update({ theme: e.target.checked ? 'dark' : 'light' })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              ✓ اللغة العربية واتجاه RTL مفعّل دائماً في هذا الإصدار
            </p>
          </div>

          {isUpdating && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              تم حفظ الإعدادات بنجاح
            </div>
          )}
        </div>
      </div>

      {/* Account Security Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-dark-md">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          الأمان والحساب
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          أدر كلمة السر وبيانات حسابك الشخصية
        </p>

        {/* Current User Info */}
        <div className="mb-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-3 text-sm">معلومات حسابك الحالي</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">اسم المستخدم:</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-50">{user?.username || 'غير متاح'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">الدور:</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(user?.role || '')}`}>
                {getRoleLabel(user?.role || '')}
              </span>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all"
            >
              تغيير كلمة السر
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  كلمة السر الجديدة
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل كلمة السر الجديدة"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  تأكيد كلمة السر
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أعد إدخال كلمة السر"
                />
              </div>

              {passwordError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  تم تغيير كلمة السر بنجاح
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleChangePassword}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all"
                >
                  حفظ كلمة السر
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false)
                    setNewPassword('')
                    setConfirmPassword('')
                    setPasswordError('')
                  }}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Users and Permissions */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-dark-md">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          المستخدمون والصلاحيات
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          أدر المستخدمين والصلاحيات المحلية. جميع البيانات تُخزّن محليّاً على جهازك بدون أي اتصال خارجي
        </p>

        {/* Add User Form */}
        <div className="mb-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4 text-sm">إضافة مستخدم جديد</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">اسم المستخدم</label>
              <input
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="مثال: أحمد محمد"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">الدور</label>
              <select
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as 'manager' | 'staff' | 'viewer')}
              >
                <option value="manager">مدير (تحكم كامل)</option>
                <option value="staff">موظف (إدخال وتعديل)</option>
                <option value="viewer">مشاهدة فقط</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddUser}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 active:scale-95 transition-all"
              >
                + إضافة مستخدم
              </button>
            </div>
          </div>
          {isSavingPermissions && (
            <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <div className="loading"></div>
              جاري الحفظ...
            </div>
          )}
        </div>

        {/* Users List */}
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-3 text-sm">قائمة المستخدمين</h3>
          {!permissionUsers || permissionUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h2v-2a11 11 0 10-22 0v2h2z" />
                </svg>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-semibold mb-1">لا يوجد مستخدمون</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">أضف مستخدمًا واحدًا على الأقل للبدء</p>
            </div>
          ) : (
            <div className="space-y-2">
              {permissionUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-50 text-sm">{u.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border-0 outline-none transition-colors cursor-pointer bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-primary-500"
                      value={u.role}
                      onChange={(e) => updateUserRole(u.id, e.target.value as 'manager' | 'staff' | 'viewer')}
                    >
                      <option value="manager">مدير</option>
                      <option value="staff">موظف</option>
                      <option value="viewer">مشاهدة</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setUserToDeleteId(u.id)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
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

      {/* Cloud Sync Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-dark-md">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          المزامنة السحابية
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          احفظ بياناتك تلقائياً على Google Drive أو OneDrive
        </p>

        {syncSettings.enabled && syncSettings.provider !== 'none' ? (
          <>
            {/* Connected Status */}
            <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-300">
                      متصل بـ {syncSettings.provider === 'google' ? 'Google Drive' : 'OneDrive'}
                    </p>
                    {syncSettings.lastSyncTime && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        آخر مزامنة: {new Date(syncSettings.lastSyncTime).toLocaleString('ar-EG')}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                >
                  قطع الاتصال
                </button>
              </div>
            </div>

            {/* Sync Controls */}
            <div className="space-y-3">
              <button
                onClick={syncData}
                disabled={isSyncing}
                className="w-full px-4 py-3 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    جاري المزامنة... {syncProgress}%
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    مزامنة الآن
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Cloud Services Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={authenticateGoogle}
                disabled={isSyncing}
                className="p-6 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="font-semibold text-slate-900 dark:text-slate-50">Google Drive</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                  احفظ بياناتك على Google Drive بأمان
                </p>
              </button>

              <button
                onClick={authenticateMicrosoft}
                disabled={isSyncing}
                className="p-6 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path fill="#0078D4" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                  </svg>
                  <span className="font-semibold text-slate-900 dark:text-slate-50">OneDrive</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                  احفظ بياناتك على OneDrive بأمان
                </p>
              </button>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                ℹ️ اختر خدمة سحابية لتفعيل المزامنة التلقائية للبيانات والملفات
              </p>
            </div>
          </>
        )}
      </div>

      {/* Backup Section */}
      <BackupManager />

      {/* Delete User Confirmation */}
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
    </div>
  )
}
