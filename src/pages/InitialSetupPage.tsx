import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePermissions } from '../hooks/usePermissions'
import { BackButton } from '../components/ui/BackButton'
import { hashPassword } from '../utils/password'

export function InitialSetupPage() {
  const navigate = useNavigate()
  const { data: permissionUsers = [], addUser, isSaving } = usePermissions()

  const [step, setStep] = useState<'admin' | 'additional'>('admin')
  const [adminName, setAdminName] = useState('')
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // إذا كان هناك مستخدمون بالفعل، انتقل مباشرة
  useEffect(() => {
    if (permissionUsers.length > 0) {
      navigate('/login')
    }
  }, [permissionUsers, navigate])

  const handleCreateAdmin = async () => {
    // التحقق من البيانات
    if (!adminName.trim() || !adminUsername.trim() || !adminPassword.trim()) {
      setError('الرجاء ملء جميع الحقول')
      return
    }

    if (adminPassword.length < 6) {
      setError('كلمة السر يجب أن تكون 6 أحرف على الأقل')
      return
    }

    if (adminPassword !== adminPasswordConfirm) {
      setError('كلمات السر غير متطابقة')
      return
    }

    setError('')
    setSuccess('')

    try {
      // إنشاء حساب admin مع كلمة سر
      const passwordHash = hashPassword(adminPassword)
      
      // إضافة المستخدم مع بيانات كلمة السر
      await addUser(adminName, 'manager', adminUsername, passwordHash)
      
      setSuccess('تم إنشاء حساب Admin بنجاح! جاري إعادة التوجيه...')

      // الانتظار ثم الانتقال
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      setError('فشل إنشاء حساب Admin')
      console.error(err)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && adminName.trim() && adminUsername.trim() && adminPassword.trim()) {
      handleCreateAdmin()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl dark:shadow-2xl border border-slate-200 dark:border-slate-800">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
              <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">إعداد Admin</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">قم بإنشاء حساب مدير بكلمة سر آمنة</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300 text-right">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300 text-right flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4 mb-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-right mb-2">
                الاسم الكامل
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="مثال: أحمد محمد"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-right focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                disabled={isSaving || !!success}
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-right mb-2">
                اسم المستخدم (Username)
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value.replace(/\s/g, ''))}
                onKeyPress={handleKeyPress}
                placeholder="admin"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-right focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                disabled={isSaving || !!success}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-right mb-2">
                كلمة السر
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-right focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                disabled={isSaving || !!success}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">
                يجب أن تكون 6 أحرف على الأقل
              </p>
            </div>

            {/* Password Confirm */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-right mb-2">
                تأكيد كلمة السر
              </label>
              <input
                type="password"
                value={adminPasswordConfirm}
                onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-right focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                disabled={isSaving || !!success}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300 text-right">
              🔐 سيكون لهذا الحساب صلاحيات كاملة على التطبيق
            </p>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateAdmin}
            disabled={isSaving || !adminName.trim() || !adminUsername.trim() || !adminPassword.trim() || !!success}
            className="w-full py-3 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                جاري الإنشاء...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                إنشاء حساب Admin
              </>
            )}
          </button>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
              🔐 البيانات تُخزّن محليّاً بدون أي اتصال خارجي
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
