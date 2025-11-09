'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'
import { format } from 'date-fns'

interface WorkoutEntry {
  id: string
  exercise: string
  repetitions: string
  sets: string
  weight: string
  duration: string
}

interface DailyLog {
  date: string
  entries: WorkoutEntry[]
}

interface ActivityLogFormProps {
  selectedDate: string
  dailyLogs: DailyLog[]
  setDailyLogs: React.Dispatch<React.SetStateAction<DailyLog[]>>
}

export default function ActivityLogForm({ selectedDate, dailyLogs, setDailyLogs }: ActivityLogFormProps) {
  const [workoutEntry, setWorkoutEntry] = useState<WorkoutEntry>({
    id: '',
    exercise: '',
    repetitions: '',
    sets: '',
    weight: '',
    duration: '',
  })
  const [currentEntries, setCurrentEntries] = useState<WorkoutEntry[]>([])
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      const { image } = JSON.parse(storedProfile);
      setUserProfileImage(image);
    }
  }, []);

  useEffect(() => {
    const currentLog = dailyLogs.find(log => log.date === selectedDate)
    setCurrentEntries(currentLog ? currentLog.entries : [])
  }, [selectedDate, dailyLogs])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setWorkoutEntry(prev => ({ ...prev, [name]: value }))
  }

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault()
    const newEntry = { ...workoutEntry, id: Date.now().toString() }
    setCurrentEntries(prev => [...prev, newEntry])
    setWorkoutEntry({
      id: '',
      exercise: '',
      repetitions: '',
      sets: '',
      weight: '',
      duration: '',
    })
  }

  const handleDeleteEntry = (entryId: string) => {
    setCurrentEntries(prev => prev.filter(entry => entry.id !== entryId))
  }

  const handleDeleteSavedEntry = (entryId: string) => {
    setDailyLogs(prev => prev.map(log => 
      log.date === selectedDate
        ? { ...log, entries: log.entries.filter(entry => entry.id !== entryId) }
        : log
    ));
  };

  const handleSaveLog = () => {
    setDailyLogs(prev => {
      const existingLogIndex = prev.findIndex(log => log.date === selectedDate)
      if (existingLogIndex > -1) {
        const updatedLogs = [...prev]
        // Append new entries to existing ones
        updatedLogs[existingLogIndex].entries = [
          ...updatedLogs[existingLogIndex].entries,
          ...currentEntries
        ]
        return updatedLogs
      } else {
        return [...prev, { date: selectedDate, entries: currentEntries }]
      }
    })

    // Clear current entries after saving
    setCurrentEntries([])

    // Update localStorage - This section is likely redundant given the setDailyLogs update above and should be reviewed for necessity.
    const updatedLogs = dailyLogs.map(log => 
      log.date === selectedDate 
        ? { ...log, entries: [...log.entries, ...currentEntries] }
        : log
    )
    if (!dailyLogs.some(log => log.date === selectedDate)) {
      updatedLogs.push({ date: selectedDate, entries: currentEntries })
    }
    localStorage.setItem('workoutLogs', JSON.stringify(updatedLogs))
  }

  return (
    <Card className="shadow-lg max-w-md mx-auto px-4 sm:px-6 md:px-8 border-2 border-gray-300 dark:border-gray-800" style={{backgroundColor: 'hsl(var(--blue-form))'}}>
      <CardHeader className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {format(new Date(selectedDate + 'T00:00:00'), 'MM/dd/yy')}
        </div>
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary shadow-md">
          <img 
            src={userProfileImage || "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8303dcbac2c854bbcab1579fc6bfff50_t.jpg-zf8pmrbsetCJSe7MkjENVWNRBaRvYH.jpeg"} 
            alt="User Profile" 
            className="w-full h-full object-cover"
          />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddExercise} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exercise" className="text-foreground dark:text-white">Exercise</Label>
            <Input
              id="exercise"
              name="exercise"
              value={workoutEntry.exercise}
              onChange={handleInputChange}
              className="bg-background text-foreground"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="repetitions" className="text-foreground dark:text-white">Repetitions</Label>
              <Input
                id="repetitions"
                name="repetitions"
                type="number"
                value={workoutEntry.repetitions}
                onChange={handleInputChange}
                className="bg-background text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sets" className="text-foreground dark:text-white">Sets</Label>
              <Input
                id="sets"
                name="sets"
                type="number"
                value={workoutEntry.sets}
                onChange={handleInputChange}
                className="bg-background text-foreground"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-foreground dark:text-white">Weight (lbs)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                value={workoutEntry.weight}
                onChange={handleInputChange}
                className="bg-background text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-foreground dark:text-white">Duration (mins)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={workoutEntry.duration}
                onChange={handleInputChange}
                className="bg-background text-foreground"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full text-black dark:text-white" 
            style={{backgroundColor: 'hsl(var(--blue-bar))'}}
          >
            Log Exercise
          </Button>
        </form>

        {currentEntries.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-foreground dark:text-white">Current Workout Entries</h3>
            <ul className="space-y-2">
              {currentEntries.map((entry) => (
                <li key={entry.id} className="bg-background/50 p-3 rounded-md text-sm text-foreground dark:text-white flex justify-between items-center">
                  <span>
                    <strong>{entry.exercise}</strong> - {entry.repetitions} reps, {entry.sets} sets, {entry.weight} lbs
                    {entry.duration && `, ${entry.duration} mins`}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="ml-2 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
            <Button onClick={handleSaveLog} className="w-full mt-4">Save Workout Log</Button>
          </div>
        )}

        {dailyLogs.find(log => log.date === selectedDate)?.entries.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-foreground dark:text-white">Previously Saved Entries</h3>
            <ul className="space-y-2">
              {dailyLogs.find(log => log.date === selectedDate)?.entries.map((entry) => (
                <li key={entry.id} className="bg-background/50 p-3 rounded-md text-sm text-foreground dark:text-white flex justify-between items-center">
                  <span>
                    <strong>{entry.exercise}</strong> - {entry.repetitions} reps, {entry.sets} sets, {entry.weight} lbs
                    {entry.duration && `, ${entry.duration} mins`}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSavedEntry(entry.id)}
                    className="ml-2 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
