import { LocalNotifications } from '@capacitor/local-notifications'
import { useEffect, useState } from 'react'
import { isNative } from '../utils/platform'

const REMINDER_ID = 1001

export function useDailyReminders() {
  const [enabled, setEnabled] = useState(false)
  const [time, setTime] = useState('16:00') // Default 4 PM

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const storedEnabled = localStorage.getItem('reminder_enabled') === 'true'
    const storedTime = localStorage.getItem('reminder_time') || '16:00'
    setEnabled(storedEnabled)
    setTime(storedTime)
  }

  const scheduleReminder = async (newTime: string) => {
    if (!isNative) {
      console.log('Notifications only work on native devices')
      return
    }

    // Request permissions first
    const perm = await LocalNotifications.checkPermissions()
    if (perm.display !== 'granted') {
      const newPerm = await LocalNotifications.requestPermissions()
      if (newPerm.display !== 'granted') return
    }

    const [hours, minutes] = newTime.split(':').map(Number)

    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] })

    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'تذكير تسجيل الحضور 👷‍♂️',
          body: 'هل قمت بتسجيل حضور العمال اليوم؟ اضغط هنا للتسجيل.',
          id: REMINDER_ID,
          schedule: {
            on: { hour: hours, minute: minutes },
            allowWhileIdle: true,
            repeats: true // Daily
          },
          actionTypeId: '',
          extra: null
        }
      ]
    })
  }

  const toggleReminder = async (shouldEnable: boolean) => {
    setEnabled(shouldEnable)
    localStorage.setItem('reminder_enabled', String(shouldEnable))

    if (shouldEnable) {
      await scheduleReminder(time)
    } else {
      if (isNative) {
        await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] })
      }
    }
  }

  const updateTime = async (newTime: string) => {
    setTime(newTime)
    localStorage.setItem('reminder_time', newTime)
    if (enabled) {
      await scheduleReminder(newTime)
    }
  }

  return {
    enabled,
    time,
    toggleReminder,
    updateTime,
    isSupported: isNative
  }
}
