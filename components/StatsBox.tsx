import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatsBoxProps {
  weightLossRate: number;
  caloriesConsumed: number;
  calorieGoal: number;
  daysRemaining: number;
  weightUnit: 'lbs' | 'kg';
  userProfileImage: string | null;
}

// --- Smooth number animation hook
function useAnimatedNumber(target: number, duration = 800) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    let start: number | null = null;
    const initial = value;
    const change = target - initial;

    function step(timestamp: number) {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(initial + change * progress);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [target]);
  return Math.round(value);
}

export function StatsBox({
  weightLossRate,
  caloriesConsumed,
  calorieGoal,
  daysRemaining,
  weightUnit,
  userProfileImage,
}: StatsBoxProps) {
  const animatedDays = useAnimatedNumber(daysRemaining);

  const getCalorieColor = (consumed: number, goal: number) => {
    const diff = consumed - goal;
    if (goal <= 0) return 'text-gray-400';
    if (consumed <= goal) return 'text-green-500';
    if (diff <= 150) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <Card
      className="w-full mb-4 shadow-lg relative overflow-hidden border-2 border-gray-300 dark:border-gray-800"
      style={{ backgroundColor: 'hsl(var(--blue-form))' }}
    >
      <div className="absolute top-4 right-4 w-16 h-16 rounded-full overflow-hidden border-2 border-primary shadow-md">
        <img
          src={
            userProfileImage ||
            'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8303dcbac2c854bbcab1579fc6bfff50_t.jpg-zf8pmrbsetCJSe7MkjENVWNRBaRvYH.jpeg'
          }
          alt="User Profile"
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-foreground dark:text-white text-2xl font-bold">
          Weekly Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 items-center p-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground dark:text-white">
              {weightLossRate.toFixed(2)} {weightUnit}/week
            </p>
            <p className="text-sm text-muted-foreground">Weight Change</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 mb-2">
              <CircularProgressbar
                value={Math.min(365, animatedDays)}
                maxValue={365}
                text={`${animatedDays}`}
                styles={buildStyles({
                  textColor: 'hsl(var(--foreground))',
                  pathColor: 'hsl(var(--blue-bar))',
                  trailColor: 'hsl(var(--muted))',
                  textSize: '28px',
                })}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Days Remaining
            </p>
          </div>
          <div className="text-center flex flex-col items-center">
            <Flame
              className={`h-6 w-6 mb-1 ${getCalorieColor(
                caloriesConsumed,
                calorieGoal
              )}`}
            />
            <p
              className={`text-lg font-semibold ${getCalorieColor(
                caloriesConsumed,
                calorieGoal
              )}`}
            >
              {caloriesConsumed.toFixed(0)}
            </p>
            <p className="text-sm text-muted-foreground">Calories Today</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
