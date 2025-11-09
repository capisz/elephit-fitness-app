'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Unit = 'lbs' | 'kg';

const wrapper = 'w-full sm:w-5/6 md:w-4/5 lg:w-3/4 mx-auto';
const cardStyle = { backgroundColor: 'hsl(var(--blue-form))' };

export default function DailyWeightForm() {
  const router = useRouter();

  const [unit, setUnit] = useState<Unit>('lbs');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [editingCurrent, setEditingCurrent] = useState(true);
  const [editingGoal, setEditingGoal] = useState(true);

  useEffect(() => {
    const p = localStorage.getItem('userProfile');
    if (p) {
      try {
        const parsed = JSON.parse(p);
        if (parsed?.weightUnit === 'kg' || parsed?.weightUnit === 'lbs') {
          setUnit(parsed.weightUnit);
        }
      } catch {}
    }

    const wh = JSON.parse(localStorage.getItem('weightHistory') || '[]');
    if (Array.isArray(wh) && wh.length) {
      const lastKg = wh[wh.length - 1].weight;
      const val = unit === 'lbs' ? (lastKg * 2.20462).toFixed(1) : lastKg.toFixed(1);
      setCurrentWeight(val);
      setEditingCurrent(false);
    }

    const gw = localStorage.getItem('goalWeight');
    if (gw) {
      setGoalWeight(gw);
      setEditingGoal(false);
    }
  }, [unit]);

  function saveCurrent() {
    const n = parseFloat(currentWeight);
    if (isNaN(n)) return;
    const kg = unit === 'lbs' ? n * 0.45359237 : n;
    const today = new Date().toISOString().split('T')[0];
    const existing = JSON.parse(localStorage.getItem('weightHistory') || '[]');
    const next = [...existing, { date: today, weight: kg }];
    localStorage.setItem('weightHistory', JSON.stringify(next));
    setEditingCurrent(false);
  }

  function saveGoal() {
    const n = parseFloat(goalWeight);
    if (isNaN(n)) return;
    localStorage.setItem('goalWeight', n.toString()); // store in user's unit
    setEditingGoal(false);
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className={wrapper}>
        <Card className="border-2 border-gray-300 dark:border-gray-800" style={cardStyle}>
          <CardHeader />
          <CardContent className="space-y-6">

            {/* Current */}
            <div>
              <Label className="block mb-2 text-foreground dark:text-white">Current Weight ({unit})</Label>
              {editingCurrent ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    placeholder={`Enter weight in ${unit}`}
                    className="h-11 text-center font-medium"
                    inputMode="decimal"
                  />
                  <Button onClick={saveCurrent} className="h-11 px-4" style={{ backgroundColor: 'hsl(var(--blue-bar))' }}>
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 px-3"
                    onClick={() => {
                      const next = unit === 'lbs' ? 'kg' : 'lbs';
                      // convert visible number if possible
                      const n = parseFloat(currentWeight);
                      const converted = isNaN(n)
                        ? ''
                        : next === 'kg' ? (n * 0.45359237).toFixed(1) : (n * 2.20462).toFixed(1);
                      setCurrentWeight(converted);
                      setUnit(next as Unit);
                      const p = JSON.parse(localStorage.getItem('userProfile') || '{}');
                      localStorage.setItem('userProfile', JSON.stringify({ ...p, weightUnit: next }));
                    }}
                  >
                    Switch to {unit === 'lbs' ? 'kg' : 'lbs'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium text-foreground dark:text-white">{currentWeight} {unit}</p>
                  <Button variant="outline" onClick={() => setEditingCurrent(true)}>✕ Edit</Button>
                </div>
              )}
            </div>

            {/* Goal */}
            <div>
              <Label className="block mb-2 text-foreground dark:text-white">Goal Weight ({unit})</Label>
              {editingGoal ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={goalWeight}
                    onChange={(e) => setGoalWeight(e.target.value)}
                    placeholder={`Enter goal in ${unit}`}
                    className="h-11 text-center font-medium"
                    inputMode="decimal"
                  />
                  <Button onClick={saveGoal} className="h-11 px-4" style={{ backgroundColor: 'hsl(var(--blue-bar))' }}>
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium text-foreground dark:text-white">{parseFloat(goalWeight).toFixed(1)} {unit}</p>
                  <Button variant="outline" onClick={() => { localStorage.removeItem('goalWeight'); setEditingGoal(true); }}>
                    ✕ Edit
                  </Button>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button onClick={() => router.push('/calorie-tracker')} className="w-full" style={{ backgroundColor: 'hsl(var(--blue-bar))' }}>
                Go to Tracker
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
