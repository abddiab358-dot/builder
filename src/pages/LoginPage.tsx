import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePermissions } from '../hooks/usePermissions'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, loginWithPassword } = useAuth()
  const { data: permissionUsers = [] } = usePermissions()

  const [loginMode, setLoginMode] = useState<'select' | 'password'>('select')
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSelectLogin = async () => {
    if (!selectedUserId.trim()) {
      setError('الرجاء اختيار مستخدم')
      return
    }

    const user = permissionUsers.find((u) => u.id === selectedUserId)
    if (!user) {
      setError('المستخدم غير موجود')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await login(user.id, user.name, user.role, user.username)
      navigate('/dashboard')
    } catch (err) {
      setError('حدث خطأ في تسجيل الدخول')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('الرجاء إدخال اسم المستخدم وكلمة السر')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const success = await loginWithPassword(username, password)
      if (success) {
        navigate('/dashboard')
      } else {
        setError('اسم المستخدم أو كلمة السر غير صحيحة')
      }
    } catch (err) {
      setError('حدث خطأ في تسجيل الدخول')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (loginMode === 'select' && selectedUserId) {
        handleSelectLogin()
      } else if (loginMode === 'password' && username && password) {
        handlePasswordLogin()
      }
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">نظام المقاولات</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">تسجيل الدخول الآمن</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300 text-right">{error}</p>
            </div>
          )}

          {/* Login Mode Tabs */}
          <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => {
                setLoginMode('select')
                setError('')
              }}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                loginMode === 'select'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              اختيار
            </button>
            <button
              onClick={() => {
                setLoginMode('password')
                setError('')
              }}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                loginMode === 'password'
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              كلمة سر
            </button>
          </div>

          {/* Login Content */}
          {loginMode === 'select' ? (
            <>
              <div className="space-y-4 mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-right">
                  اختر حسابك
                </label>

                {permissionUsers.length === 0 ? (
                  <div className="p-6 rounded-lg bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">لا توجد حسابات معرفة</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">الرجاء إنشاء حساب أول</p>
                    <button
                      onClick={() => navigate('/initial-setup')}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      إنشاء حساب جديد
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {permissionUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        onKeyPress={handleKeyPress}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-right ${
                          selectedUserId === user.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-300 dark:hover:border-primary-600'
                        }`}
                      >
                        <div className="flex items-center justify-end gap-3">
                          <div className="text-right">
                            <p className="font-medium text-slate-900 dark:text-slate-50">{user.name}</p>
                            <p className={`text-xs font-medium ${user.role === 'manager' ? 'text-primary-700 dark:text-primary-300' : user.role === 'staff' ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                              {user.role === 'manager' ? '👨‍💼 مدير' : user.role === 'staff' ? '👤 موظف' : '👁️ مشاهدة فقط'}
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedUserId === user.id ? 'border-primary-500 bg-primary-500' : 'border-slate-300 dark:border-slate-600'}`}>
                            {selectedUserId === user.id && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleSelectLogin}
                onKeyPress={handleKeyPress}
                disabled={isLoading || !selectedUserId || permissionUsers.length === 0}
                className="w-full py-3 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    دخول الآن
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-right mb-2">
                    اسم المستخدم
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="admin"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-right focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 text-right mb-2">
                    كلمة السر
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="••••••"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-right focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                onClick={handlePasswordLogin}
                onKeyPress={handleKeyPress}
                disabled={isLoading || !username.trim() || !password.trim()}
                className="w-full py-3 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    دخول الآن
                  </>
                )}
              </button>
            </>
          )}

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
              🔐 بيانات آمنة 100% - لا توجد سيرفرات خارجية
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
