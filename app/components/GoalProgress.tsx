'use client'

import { useState, useEffect } from 'react'

export default function GoalProgress() {
  const [daysUntilGoal, setDaysUntilGoal] = useState(0)

  useEffect(() => {
    // TODO: Calculate days until goal based on current weight and goal weight
  }, [])

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Goal Progress</h2>
      <p>{daysUntilGoal} days until goal weight</p>
    </div>
  )
}
