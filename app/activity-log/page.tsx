'use client'

import { useState, useEffect } from 'react'
import ActivityLogForm from '@/components/ActivityLogForm'
import { Calendar } from '@/components/Calendar'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

export default function ActivityLogPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [dailyLogs, setDailyLogs] = useState<{ date: string; entries: any[] }[]>([])
  // const [showCalendar, setShowCalendar] = useState(false)

  useEffect(() => {
    const storedLogs = localStorage.getItem('workoutLogs')
    if (storedLogs) {
      setDailyLogs(JSON.parse(storedLogs))
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">Go back</span>
        </Button>
        <h1 className="text-2xl font-bold text-center flex-grow -ml-10">Activity Log</h1>
        {/* <Button
          variant="outline"
          size="icon"
          onClick={() => setShowCalendar(!showCalendar)}
          className="ml-4"
        >
          <CalendarIcon className="h-6 w-6" />
          <span className="sr-only">Toggle Calendar</span>
        </Button> */}
      </div>
      <ActivityLogForm 
        selectedDate={selectedDate}
        dailyLogs={dailyLogs}
        setDailyLogs={setDailyLogs}
      />
      <div className="mt-8">
        <Calendar 
          dailyLogs={dailyLogs}
          onSelectDate={setSelectedDate}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  )
}
