'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import FoodInput from './FoodInput';
import { StatsBox } from './StatsBox';

type Unit = 'lbs' | 'kg';

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface UserProfileLS {
  name: string;
  sex: 'male' | 'female';
  age: number | string;
  weight: number | string;
  weightUnit: Unit;
  heightUnit: 'imperial' | 'metric';
  heightFeet?: number | string;
  heightInches?: number | string;
  heightCm?: number | string;
  goal: 'lose' | 'maintain' | 'gain';
  image?: string | null;
}

const wrapper = 'w-full sm:w-5/6 md:w-4/5 lg:w-3/4 mx-auto';
const cardStyle = { backgroundColor: 'hsl(var(--blue-form))' };

const LBS_PER_KG = 2.20462;
const KG_PER_LB = 0.45359237;
const POUNDS_PER_WEEK = 1;
const KG_PER_WEEK = POUNDS_PER_WEEK * KG_PER_LB;

function lbsToKg(lbs: number) { return lbs * KG_PER_LB; }
function kgToLbs(kg: number) { return kg * LBS_PER_KG; }

function computeBMR(profile: UserProfileLS): number {
  const weightKg =
    (profile.weightUnit === 'lbs'
      ? lbsToKg(Number(profile.weight))
      : Number(profile.weight)) || 0;

  const heightCm =
    profile.heightUnit === 'imperial'
      ? (((Number(profile.heightFeet) || 0) * 12 +
          (Number(profile.heightInches) || 0)) *
        2.54)
      : Number(profile.heightCm) || 0;

  const age = Number(profile.age) || 0;
  const s = profile.sex === 'male' ? 5 : -161;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + s;
  return Math.max(0, Math.round(bmr));
}

function dailyGoalFromProfile(profile: UserProfileLS): number {
  const base = computeBMR(profile);
  const adj =
    profile.goal === 'lose' ? -500 :
    profile.goal === 'gain' ?  500 : 0;
  return Math.max(0, base + adj);
}

export default function CalorieTracker() {
  const [profile, setProfile] = useState<UserProfileLS | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [consumed, setConsumed] = useState({ total: 0, protein: 0, carbs: 0, fat: 0 });
  const [displayedCalories, setDisplayedCalories] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0.6); // adaptive glow strength

  const [weightHistory, setWeightHistory] = useState<{ date: string; weight: number }[]>([]);
  const [currentWeightInput, setCurrentWeightInput] = useState('');
  const [goalWeightInput, setGoalWeightInput] = useState('');
  const [editingCurrent, setEditingCurrent] = useState(true);
  const [editingGoal, setEditingGoal] = useState(true);

  const animationRef = useRef<number | null>(null);
  const unit: Unit = profile?.weightUnit || 'lbs';

  // ---- Load Data
  useEffect(() => {
    const p = localStorage.getItem('userProfile');
    if (p) try { setProfile(JSON.parse(p)); } catch {}

    const wh = JSON.parse(localStorage.getItem('weightHistory') || '[]');
    if (Array.isArray(wh) && wh.length) {
      setWeightHistory(wh);
      setEditingCurrent(false);
      const last = wh[wh.length - 1].weight;
      const display = unit === 'lbs' ? kgToLbs(last).toFixed(1) : last.toFixed(1);
      setCurrentWeightInput(display);
    }

    const gwRaw = localStorage.getItem('goalWeight');
    if (gwRaw) {
      const display = parseFloat(gwRaw);
      if (!isNaN(display)) {
        setGoalWeightInput(display.toString());
        setEditingGoal(false);
      }
    }

    const savedFoods = JSON.parse(localStorage.getItem('foods') || '[]');
    if (Array.isArray(savedFoods)) setFoods(savedFoods);
  }, []);

  // ---- Animate Macros
  useEffect(() => {
    const total = foods.reduce((s, f) => s + (f.calories || 0), 0);
    const protein = foods.reduce((s, f) => s + (f.protein || 0), 0);
    const carbs = foods.reduce((s, f) => s + (f.carbs || 0), 0);
    const fat = foods.reduce((s, f) => s + (f.fat || 0), 0);

    const id = setTimeout(() => {
      setConsumed({ total, protein, carbs, fat });
    }, 200);
    return () => clearTimeout(id);
  }, [foods]);

  // ---- Adaptive Glow + Count Animation
  useEffect(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    const start = displayedCalories;
    const end = consumed.total;
    const delta = Math.abs(end - start);
    const duration = 500;
    const startTime = performance.now();

    // Adjust glow intensity based on change size (small = soft, large = bright)
    const intensity = Math.min(1, 0.4 + delta / 5000);
    setPulseIntensity(intensity);

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = start + (end - start) * progress;
      setDisplayedCalories(value);
      if (progress < 1) animationRef.current = requestAnimationFrame(step);
    };
    animationRef.current = requestAnimationFrame(step);

    if (start !== end) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 700);
      return () => clearTimeout(t);
    }
  }, [consumed.total]);

  // ---- Derived Data
  const dailyGoal = profile ? dailyGoalFromProfile(profile) : 0;

  const weightChangePerWeek = useMemo(() => {
    if (weightHistory.length < 2) return 0;
    const latestKg = weightHistory[weightHistory.length - 1].weight;
    const prevKg = weightHistory[weightHistory.length - 2].weight;
    const deltaPerWeekKg = (latestKg - prevKg) * 7;
    return unit === 'lbs' ? kgToLbs(deltaPerWeekKg) : deltaPerWeekKg;
  }, [weightHistory, unit]);

  const daysRemaining = useMemo(() => {
    if (!profile) return 0;
    const gw = parseFloat(goalWeightInput);
    if (isNaN(gw)) return 0;
    if (editingGoal) return 0;
    if (!weightHistory.length) return 0;

    const latestKg = weightHistory[weightHistory.length - 1].weight;
    const latestDisplay = unit === 'lbs' ? kgToLbs(latestKg) : latestKg;

    const weekly = profile.goal === 'lose' ? -(unit === 'lbs' ? POUNDS_PER_WEEK : KG_PER_WEEK)
                  : profile.goal === 'gain' ?  (unit === 'lbs' ? POUNDS_PER_WEEK : KG_PER_WEEK)
                  : 0;
    if (weekly === 0) return 0;

    const weeks = Math.max(0, Math.abs(gw - latestDisplay) / Math.abs(weekly));
    return Math.round(weeks * 7);
  }, [profile, goalWeightInput, editingGoal, weightHistory, unit]);

  // ---- Handlers
  function saveCurrentWeight() {
    if (!profile) return;
    const n = parseFloat(currentWeightInput);
    if (isNaN(n)) return;
    const today = new Date().toISOString().split('T')[0];
    const kg = unit === 'lbs' ? lbsToKg(n) : n;
    const next = [...weightHistory, { date: today, weight: kg }];
    setWeightHistory(next);
    localStorage.setItem('weightHistory', JSON.stringify(next));
    setEditingCurrent(false);
  }

  function clearCurrentWeight() { setEditingCurrent(true); }

  function saveGoalWeight() {
    const n = parseFloat(goalWeightInput);
    if (isNaN(n)) return;
    localStorage.setItem('goalWeight', n.toString());
    setEditingGoal(false);
  }

  function clearGoalWeight() {
    localStorage.removeItem('goalWeight');
    setGoalWeightInput('');
    setEditingGoal(true);
  }

  function onAddFood(food: Food) {
    const next = [...foods, food];
    setFoods(next);
    localStorage.setItem('foods', JSON.stringify(next));
  }

  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Weekly Stats */}
        <div className={wrapper}>
          <StatsBox
            weightLossRate={weightChangePerWeek}
            caloriesConsumed={consumed.total}
            calorieGoal={dailyGoal}
            daysRemaining={daysRemaining}
            weightUnit={unit}
            userProfileImage={profile?.image || null}
          />
        </div>

        {/* Weight Inputs */}
        <div className={wrapper}>
          <Card className="border-2 border-gray-300 dark:border-gray-800" style={cardStyle}>
            <CardContent className="space-y-6">
              {/* Current Weight */}
              <div>
                <Label className="block mb-2 text-foreground dark:text-white">Current Weight</Label>
                {editingCurrent ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={currentWeightInput}
                      onChange={(e) => setCurrentWeightInput(e.target.value)}
                      placeholder={`Enter weight in ${unit}`}
                      className="h-11 text-center font-medium"
                      inputMode="decimal"
                    />
                    <Button onClick={saveCurrentWeight} className="h-11 px-4" style={{ backgroundColor: 'hsl(var(--blue-bar))' }}>Save</Button>
                    <div className="flex items-center gap-2 ml-2">
                      <Switch
                        checked={unit === 'kg'}
                        onCheckedChange={(checked) => {
                          const val = parseFloat(currentWeightInput);
                          const converted = isNaN(val)
                            ? ''
                            : checked ? lbsToKg(val).toFixed(1) : kgToLbs(val).toFixed(1);
                          setCurrentWeightInput(converted);
                          if (profile) {
                            const next = { ...profile, weightUnit: checked ? 'kg' : 'lbs' };
                            setProfile(next);
                            localStorage.setItem('userProfile', JSON.stringify(next));
                          }
                        }}
                        className="data-[state=checked]:bg-[hsl(var(--blue-bar))] data-[state=unchecked]:bg-[hsl(var(--blue-bar))] opacity-90"
                      />
                      <span className="text-sm text-primary">{unit}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium text-foreground dark:text-white">
                      {(() => {
                        if (!weightHistory.length) return `— ${unit}`;
                        const lastKg = weightHistory[weightHistory.length - 1].weight;
                        const val = unit === 'lbs' ? kgToLbs(lastKg) : lastKg;
                        return `${val.toFixed(1)} ${unit}`;
                      })()}
                    </p>
                    <Button variant="outline" onClick={clearCurrentWeight}>✕ Edit</Button>
                  </div>
                )}
              </div>

              {/* Goal Weight */}
              <div>
                <Label className="block mb-2 text-foreground dark:text-white">Goal Weight</Label>
                {editingGoal ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={goalWeightInput}
                      onChange={(e) => setGoalWeightInput(e.target.value)}
                      placeholder={`Enter goal in ${unit}`}
                      className="h-11 text-center font-medium"
                      inputMode="decimal"
                    />
                    <Button onClick={saveGoalWeight} className="h-11 px-4" style={{ backgroundColor: 'hsl(var(--blue-bar))' }}>Save</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium text-foreground dark:text-white">
                      {parseFloat(goalWeightInput).toFixed(1)} {unit}
                    </p>
                    <Button variant="outline" onClick={clearGoalWeight}>✕ Edit</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calorie Tracker */}
        <div className={wrapper}>
          <Card className="border-2 border-gray-300 dark:border-gray-800" style={cardStyle}>
            <CardHeader>
              <CardTitle className="text-foreground dark:text-white">Calorie Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full flex rounded-full overflow-hidden transition-all duration-700 ease-in-out">
                  <div className="h-full bg-[#F1455C] transition-all duration-700 ease-in-out rounded-l-full"
                    style={{ width: `${dailyGoal > 0 ? Math.min((consumed.protein * 4 / dailyGoal) * 100, 100) : 0}%` }} />
                  <div className="h-full bg-[#3DCCC3] transition-all duration-700 ease-in-out"
                    style={{ width: `${dailyGoal > 0 ? Math.min((consumed.carbs * 4 / dailyGoal) * 100, 100) : 0}%` }} />
                  <div className="h-full bg-[#F7C285] transition-all duration-700 ease-in-out rounded-r-full"
                    style={{ width: `${dailyGoal > 0 ? Math.min((consumed.fat * 9 / dailyGoal) * 100, 100) : 0}%` }} />
                </div>
              </div>

              {/* ✨ Adaptive white glow */}
              <p
                className={`mt-2 text-sm transition-all duration-500 ease-out ${
                  pulse
                    ? `text-white drop-shadow-[0_0_${Math.round(pulseIntensity * 10)}px_rgba(255,255,255,${pulseIntensity})]`
                    : 'text-foreground dark:text-white'
                }`}
              >
                {displayedCalories.toFixed(0)} / {dailyGoal} calories consumed
              </p>

              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                {[
                  { label: 'Protein', color: '#F1455C', grams: consumed.protein, factor: 4 },
                  { label: 'Carbs', color: '#3DCCC3', grams: consumed.carbs, factor: 4 },
                  { label: 'Fat', color: '#F7C285', grams: consumed.fat, factor: 9 },
                ].map((m) => (
                  <div key={m.label} className="flex flex-col items-center">
                    <p className="font-semibold text-foreground dark:text-white">{m.grams.toFixed(1)}g</p>
                    <p className="text-xs text-foreground dark:text-white mb-1">{m.label}</p>
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: m.color }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {consumed.total > 0
                        ? ((m.grams * m.factor / consumed.total) * 100).toFixed(0)
                        : '0'}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Food Input */}
        <div className={wrapper}>
          <FoodInput storedFoods={foods} setStoredFoods={setFoods} onAddFood={onAddFood} />
        </div>
      </div>
    </div>
  );
}
