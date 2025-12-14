import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { SmartFundTransaction } from '../types/domain'
import { createId } from '../utils/id'
import { useActivity } from './useActivity'

export function useSmartFund(projectId: string) {
    const { smartFund } = useFileSystem()
    const collection = useJsonCollection<SmartFundTransaction>('smart_fund', smartFund)
    const { log } = useActivity()

    // Filter transactions for this project
    const transactions = (collection.data ?? [])
        .filter((t) => t.projectId === projectId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const addTransaction = async (
        input: Omit<SmartFundTransaction, 'id' | 'projectId' | 'createdAt'>
    ) => {
        const id = createId()
        const now = new Date().toISOString()
        await collection.save((items) => [
            ...items,
            { ...input, id, projectId, createdAt: now },
        ])

        await log({
            action: input.type === 'deposit' ? 'إيداع في الصندوق' : 'سحب من الصندوق',
            entity: 'project', // using 'project' as generic entity for now, or create new type
            entityId: id,
            details: `${input.amount} ${input.currency} - ${input.label || ''}`,
        })
    }

    const deleteTransaction = async (id: string) => {
        await collection.save((items) => items.filter((t) => t.id !== id))
    }

    const getBalance = () => {
        let usd = 0
        let syp = 0

        transactions.forEach((t) => {
            if (t.currency === 'USD') {
                if (t.type === 'deposit') usd += t.amount
                else usd -= t.amount
            } else {
                if (t.type === 'deposit') syp += t.amount
                else syp -= t.amount
            }
        })

        return { usd, syp }
    }

    return {
        transactions,
        addTransaction,
        deleteTransaction,
        balance: getBalance(),
        isLoading: collection.isLoading,
    }
}
