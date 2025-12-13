import { useState, useEffect } from 'react'
import { hashPassword } from '../utils/password'
import { BackButton } from '../components/ui/BackButton'

export function DebugPage() {
  const [users, setUsers] = useState<any[]>([])
  const [password, setPassword] = useState('admin@123')
  const [hash, setHash] = useState('')

  useEffect(() => {
    // Load users from localStorage
    const stored = localStorage.getItem('file:permissions.json')
    if (stored) {
      try {
        setUsers(JSON.parse(stored))
      } catch {
        console.error('Failed to parse users')
      }
    }
  }, [])

  const handleCalculateHash = () => {
    const h = hashPassword(password)
    setHash(h)
    console.log('Password:', password)
    console.log('Hash:', h)
  }

  const handleResetData = () => {
    const defaultPermissions = [
      {
        id: 'osamah-admin-001',
        name: 'Osamah',
        username: 'osamah',
        passwordHash: hashPassword('admin@123'),
        role: 'manager',
        createdAt: new Date().toISOString()
      }
    ]
    localStorage.setItem('file:permissions.json', JSON.stringify(defaultPermissions))
    setUsers(defaultPermissions)
    alert('تم إعادة تعيين البيانات!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <BackButton />
      
      <div className="max-w-2xl mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">صفحة الدعم الفني</h1>

        {/* Users Data */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">بيانات المستخدمين</h2>
          <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(users, null, 2)}
          </pre>
        </div>

        {/* Password Hash Calculator */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">حاسبة الـ Hash</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                كلمة السر
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <button
              onClick={handleCalculateHash}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium"
            >
              حساب الـ Hash
            </button>
            {hash && (
              <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900 rounded">
                <p className="text-sm text-slate-600 dark:text-slate-400">الـ Hash:</p>
                <p className="font-mono text-lg text-slate-900 dark:text-white">{hash}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reset Button */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
          <button
            onClick={handleResetData}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-medium"
          >
            ⚠️ إعادة تعيين البيانات الافتراضية
          </button>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
            سيتم إنشاء حساب جديد مع كلمة السر: admin@123
          </p>
        </div>
      </div>
    </div>
  )
}
