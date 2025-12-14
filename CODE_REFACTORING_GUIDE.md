# Code Refactoring Guide - تقليل التكرار

**دليل لتقليل التكرار في الأكواد المستقبلية بناءً على تجربة برنامج المقاولات**

---

## 🔴 المشاكل التي واجهناها

### 1. **19 Custom Hooks متطابقة**
تطبيق المقاولات يحتوي على 19 hook منفصلة:
- `useProjects`, `useWorkers`, `useClients`, `useExpenses`, `useInvoices`, etc.

كل واحدة تحتوي على نفس الكود:
```typescript
const createItem = async (input) => {
  const id = createId()
  const now = new Date().toISOString()
  await collection.save((items) => [...items, { ...input, id, createdAt: now }])
  await log({ action: '...', entity: '...', ... })
}

const updateItem = async (id, patch) => {
  await collection.save((items) => {
    const idx = items.findIndex(i => i.id === id)
    if (idx === -1) return items
    const next = [...items]
    next[idx] = { ...next[idx], ...patch }
    return next
  })
}

const deleteItem = async (id) => {
  await collection.save((items) => items.filter(i => i.id !== id))
}
```

---

## ✅ الحل الموصى به: Generic Hook Factory

### قبل (❌ 19 ملف متطابق):
```
src/hooks/
├── useProjects.ts     (63 lines)
├── useWorkers.ts      (47 lines)
├── useClients.ts      (42 lines)
├── useExpenses.ts     (40 lines)
├── ... 15 hooks أخرى
```

**الإجمالي:** ~800 سطر كود متكرر

### بعد (✅ hook واحد generic):
```
src/hooks/
├── useJsonCollection.ts (موجود بالفعل)
├── useEntityCollection.ts (NEW - generic factory)
└── useEntity.ts           (NEW - wrapper helpers)
```

---

## 📝 مثال الحل العملي

### Step 1: إنشاء Generic Entity Hook

```typescript
// src/hooks/useEntityCollection.ts
import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { useActivity } from './useActivity'
import { createId } from '../utils/id'

export interface EntityConfig {
  collectionKey: string
  entityName: string
  arabicAction: string
}

export function useEntityCollection<T extends { id: string; createdAt: string }>(
  config: EntityConfig,
  dataGetter: () => T[]
) {
  const collection = useJsonCollection<T>(config.collectionKey, dataGetter)
  const { log } = useActivity()

  const create = async (input: Omit<T, 'id' | 'createdAt'>, details?: string) => {
    const id = createId()
    const now = new Date().toISOString()
    const item = { ...input, id, createdAt: now } as T
    
    await collection.save((items) => [...items, item])
    await log({
      action: config.arabicAction,
      entity: config.collectionKey,
      entityId: id,
      details: details || '',
    })
    
    return item
  }

  const update = async (id: string, patch: Partial<Omit<T, 'id' | 'createdAt'>>) => {
    await collection.save((items) => {
      const idx = items.findIndex((i) => i.id === id)
      if (idx === -1) return items
      const next = [...items]
      next[idx] = { ...next[idx], ...patch } as T
      return next
    })
    
    await log({
      action: `تحديث ${config.entityName}`,
      entity: config.collectionKey,
      entityId: id,
    })
  }

  const delete_ = async (id: string) => {
    await collection.save((items) => items.filter((i) => i.id !== id))
    await log({
      action: `حذف ${config.entityName}`,
      entity: config.collectionKey,
      entityId: id,
    })
  }

  return {
    data: collection.data,
    isLoading: collection.isLoading,
    error: collection.error,
    create,
    update,
    delete: delete_,
  }
}
```

### Step 2: إنشاء Convenience Wrappers

```typescript
// src/hooks/useEntity.ts
import { useFileSystem } from '../context/FileSystemContext'
import { useEntityCollection } from './useEntityCollection'
import { Project, Worker, Client, Expense } from '../types/domain'

// مثال: useProjects بسيط جداً الآن
export function useProjects() {
  const { projects } = useFileSystem()
  return useEntityCollection<Project>(
    {
      collectionKey: 'projects',
      entityName: 'مشروع',
      arabicAction: 'إنشاء مشروع',
    },
    () => projects
  )
}

// مثال: useWorkers
export function useWorkers(projectId?: string) {
  const { workers } = useFileSystem()
  const collection = useEntityCollection<Worker>(
    {
      collectionKey: 'workers',
      entityName: 'عامل',
      arabicAction: 'إضافة عامل',
    },
    () => workers
  )

  // يمكن إضافة filter منفصل إذا لزم
  return {
    ...collection,
    data: (collection.data ?? []).filter((w) => (projectId ? w.projectId === projectId : true)),
  }
}

// مثال: useClients
export function useClients() {
  const { clients } = useFileSystem()
  return useEntityCollection<Client>(
    {
      collectionKey: 'clients',
      entityName: 'عميل',
      arabicAction: 'إضافة عميل',
    },
    () => clients
  )
}

// ... باقي entities (Expense, Invoice, Task, Payment, etc.)
```

### النتيجة:
- ❌ حذف 18 ملف hook مكرر
- ✅ بقاء ملف واحد generic
- ✅ توفير ~600 سطر كود
- ✅ صيانة أسهل (تغيير واحد يؤثر على الكل)

---

## 🎯 نمط آخر: Form Components المتكررة

### المشكلة:
```
src/components/
├── projects/ProjectForm.tsx   (200+ lines)
├── workers/WorkerForm.tsx     (150+ lines)
├── clients/ClientForm.tsx     (140+ lines)
├── expenses/ExpenseForm.tsx   (130+ lines)
└── ... 10 forms أخرى
```

كل form تحتوي على نفس الـ state management:
```typescript
const [name, setName] = useState('')
const [phone, setPhone] = useState('')
const [email, setEmail] = useState('')
const [submitting, setSubmitting] = useState(false)
```

### الحل:
```typescript
// src/components/ui/GenericForm.tsx
interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'date' | 'number' | 'textarea'
  required?: boolean
  pattern?: string
}

interface GenericFormProps<T> {
  fields: FormField[]
  initial?: T
  onSubmit: (data: T) => Promise<void>
  submitLabel?: string
}

export function GenericForm<T extends Record<string, any>>({
  fields,
  initial,
  onSubmit,
  submitLabel = 'حفظ',
}: GenericFormProps<T>) {
  const [formData, setFormData] = useState<Partial<T>>(initial || {})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit(formData as T)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <input
          key={field.name}
          type={field.type}
          placeholder={field.label}
          required={field.required}
          value={formData[field.name] || ''}
          onChange={(e) =>
            setFormData((p) => ({ ...p, [field.name]: e.target.value }))
          }
          className="w-full px-3 py-2 border rounded"
        />
      ))}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {submitting ? 'جاري...' : submitLabel}
      </button>
    </form>
  )
}
```

### الاستخدام:
```typescript
// Before: 200 lines
// export function ClientForm() { ... }

// After: 20 lines
export function ClientForm({ onSubmit }: { onSubmit: (data: Client) => Promise<void> }) {
  return (
    <GenericForm
      fields={[
        { name: 'name', label: 'الاسم', type: 'text', required: true },
        { name: 'phone', label: 'الهاتف', type: 'text' },
        { name: 'email', label: 'البريد', type: 'email' },
        { name: 'address', label: 'العنوان', type: 'text' },
      ]}
      onSubmit={onSubmit}
      submitLabel="إضافة عميل"
    />
  )
}
```

---

## 📊 النتيجة النهائية

| Metric | Before | After | Improvement |
|--------|--------|-------|------------|
| Custom Hooks | 19 files | 2 files | -89% |
| Hook Lines of Code | ~800 | ~200 | -75% |
| Form Components | 10+ files | 1 generic | -90% |
| Duplicated Code | ~40% | ~5% | -87.5% |
| Maintenance Effort | High | Low | 5x easier |

---

## 🎯 Checklist للمشاريع الجديدة

- [ ] استخدم Generic Hooks بدلاً من custom hooks منفصلة
- [ ] استخدم Generic Form Components للـ CRUD operations
- [ ] استخدم Factory Pattern للـ Hooks المتشابهة
- [ ] تجنب copy-paste، استخدم composition
- [ ] اختبر Generic components بـ Multiple entity types قبل الإطلاق

---

**تم توثيقه:** December 14, 2025  
**المشروع:** برنامج المقاولات  
**الإصدار:** Code Refactoring v1.0
