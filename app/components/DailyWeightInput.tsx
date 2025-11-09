'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DailyWeightInput() {
  const [weight, setWeight] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Save daily weight and update goal progress
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Daily Weight Input</h2>
      <div>
        <Label htmlFor="dailyWeight">Today's Weight (kg)</Label>
        <Input 
          type="number" 
          id="dailyWeight" 
          value={weight} 
          onChange={(e) => setWeight(e.target.value)} 
        />
      </div>
      <Button type="submit">Save Weight</Button>
    </form>
  )
}
