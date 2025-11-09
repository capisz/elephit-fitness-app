'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns'

interface CalendarProps {
  dailyLogs: { date: string; entries: any[] }[]
  onSelectDate: (date: string) => void
  selectedDate: string
  progressPictures?: { date: Date }[]
}

export function Calendar({ dailyLogs, onSelectDate, selectedDate, progressPictures = [] }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isCalendarVisible, setIsCalendarVisible] = useState(false)

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })

  return (
    <div className="w-full max-w-xs mx-auto mt-8">
      <Button 
        onClick={() => setIsCalendarVisible(!isCalendarVisible)}
        className="w-full mb-4"
      >
        {isCalendarVisible ? 'Hide Calendar' : 'Show Calendar'}
      </Button>
      {isCalendarVisible && (
        <>
          <div className="flex items-center justify-between mb-4">
            <Button onClick={prevMonth} variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
            <Button onClick={nextMonth} variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-medium text-sm py-1">
                {day}
              </div>
            ))}
            {calendarDays.map((day, dayIdx) => {
              const formattedDate = format(day, 'yyyy-MM-dd')
              const isSelected = selectedDate === formattedDate
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const hasEntries = dailyLogs.some(log => log.date === formattedDate && log.entries.length > 0)
              const hasProgressPicture = progressPictures.some(pic => isSameDay(pic.date, day))

              return (
                <Button
                  key={day.toString()}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectDate(formattedDate);
                  }}
                  variant={isSelected ? "default" : "ghost"}
                  className={`h-8 w-8 p-0 text-center flex items-center justify-center ${
                    !isCurrentMonth ? 'text-gray-400' : ''
                  } ${
                    hasEntries || hasProgressPicture ? 'bg-green-200 dark:bg-green-800' : ''
                  }`}
                >
                  <time dateTime={formattedDate} className="pointer-events-none">
                    {format(day, 'd')}
                  </time>
                </Button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
