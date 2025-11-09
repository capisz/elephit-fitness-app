'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

type HeightUnit = 'imperial' | 'metric'
type WeightUnit = 'lbs' | 'kg'

export default function UserProfileForm() {
  const router = useRouter()

  const [profile, setProfile] = useState({
    name: '',
    sex: '',
    age: '',
    weight: '',
    weightUnit: 'lbs' as WeightUnit,
    heightFeet: '5',
    heightInches: '0',
    heightCm: '170',
    heightUnit: 'imperial' as HeightUnit,
    goal: '',
    image: ''
  })

  const [heightUnit, setHeightUnit] = useState<HeightUnit>('imperial')
  const [errors, setErrors] = useState<{ [k: string]: string }>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // Restore saved profile
  useEffect(() => {
    const saved = localStorage.getItem('userProfile')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setProfile(parsed)
        setHeightUnit((parsed.heightUnit as HeightUnit) || 'imperial')
      } catch {}
    }
  }, [])

  // One-time hint bubble (appears once after 1s, fades out)
  useEffect(() => {
    const t1 = setTimeout(() => setShowHint(true), 1000)
    const t2 = setTimeout(() => setShowHint(false), 3500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const validateForm = () => {
    const next: { [k: string]: string } = {}
    if (!profile.name) next.name = 'Name is required'
    if (!profile.sex) next.sex = 'Sex is required'
    if (!profile.age) next.age = 'Age is required'
    if (!profile.weight) next.weight = 'Weight is required'
    if (heightUnit === 'imperial') {
      if (!profile.heightFeet || !profile.heightInches) next.height = 'Height is required'
    } else {
      if (!profile.heightCm) next.height = 'Height is required'
    }
    if (!profile.goal) next.goal = 'Goal is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const persist = (next: typeof profile) => {
    setProfile(next)
    localStorage.setItem('userProfile', JSON.stringify(next))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    if (!validateForm()) return
    // Persist a normalized copy before routing
    persist({ ...profile, heightUnit })
    router.push('/calorie-tracker')
  }

  const handleImageUpload = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      persist({ ...profile, image: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const setHeightFromImperialValue = (value: string) => {
    const [feet, inches] = value.split('-')
    persist({ ...profile, heightFeet: feet, heightInches: inches })
  }

  return (
    <Card
      className={`w-full max-w-md mx-auto ${inter.className} shadow-xl border border-border`}
      style={{ backgroundColor: 'hsl(var(--blue-form))' }}
    >
      <CardHeader className="flex flex-col items-center text-center space-y-3 pt-6">
        <div className="relative w-24 h-24">
          {/* Image (click to upload) */}
          <label
            htmlFor="profileImage"
            className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden ring-4 ring-offset-2 ring-offset-background ring-primary cursor-pointer"
            title="Click to upload"
          >
            <img
              src={profile.image || "/images/design-mode/8303dcbac2c854bbcab1579fc6bfff50_t.jpg.jpeg"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <input id="profileImage" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          {/* One-time rectangular hint, outlined, next to the image */}
          <AnimatePresence>
            {showHint && !profile.image && (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute left-[108%] top-1/2 -translate-y-1/2 bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] shadow-md rounded-md px-3 py-2 text-xs whitespace-nowrap"
              >
                Click the picture to upload your own
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Name under image, dynamic; default shows nothing to keep your layout */}
        {profile.name ? (
          <p className="text-lg font-medium italic">{profile.name}</p>
        ) : null}
      </CardHeader>

      <CardContent className="pb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="text-center">
            <Label htmlFor="name" className="block text-center mb-2">Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => persist({ ...profile, name: e.target.value })}
              className={`w-full rounded-md px-3 py-2 text-center h-11 shadow-sm transition-colors border ${
                isSubmitted && errors.name ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'
              }`}
              style={{ backgroundColor: 'hsl(var(--input))', color: 'hsl(var(--foreground))' }}
            />
          </div>

          {/* Sex & Age */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <Label className="block text-center mb-2">Sex</Label>
              <Select
                value={profile.sex}
                onValueChange={(v) => persist({ ...profile, sex: v })}
              >
                <SelectTrigger
                  className={`w-full rounded-md px-3 py-2 text-center h-11 shadow-sm transition-colors border ${
                    isSubmitted && errors.sex ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'
                  }`}
                  style={{ backgroundColor: 'hsl(var(--input))', color: 'hsl(var(--foreground))' }}
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="max-h-56 overflow-y-auto bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-center">
              <Label htmlFor="age" className="block text-center mb-2">Age</Label>
              <Input
                id="age"
                inputMode="numeric"
                pattern="[0-9]*"
                value={profile.age}
                onChange={(e) => persist({ ...profile, age: e.target.value })}
                className={`w-full rounded-md px-3 py-2 text-center h-11 shadow-sm transition-colors border ${
                  isSubmitted && errors.age ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'
                }`}
                style={{ backgroundColor: 'hsl(var(--input))', color: 'hsl(var(--foreground))' }}
              />
            </div>
          </div>

          {/* Weight & Height */}
          <div className="grid grid-cols-2 gap-4">
            {/* Weight */}
            <div className="text-center">
              <Label htmlFor="weight" className="block text-center mb-2">Weight</Label>
              <Input
                id="weight"
                inputMode="decimal"
                value={profile.weight}
                onChange={(e) => persist({ ...profile, weight: e.target.value.replace(/[^0-9.]/g, '') })}
                className={`w-full rounded-md px-3 py-2 text-center h-11 shadow-sm transition-colors border ${
                  isSubmitted && errors.weight ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'
                }`}
                style={{ backgroundColor: 'hsl(var(--input))', color: 'hsl(var(--foreground))' }}
              />
              <div className="flex items-center justify-center mt-2 space-x-2">
                <Switch
                  checked={profile.weightUnit === 'kg'}
                  onCheckedChange={(c) => persist({ ...profile, weightUnit: c ? 'kg' : 'lbs' })}
                  className="data-[state=checked]:bg-[hsl(var(--blue-bar))] data-[state=unchecked]:bg-[hsl(var(--blue-bar))] opacity-90"
                />
                <Label className="select-none">{profile.weightUnit}</Label>
              </div>
            </div>

            {/* Height */}
            <div className="text-center">
              <Label className="block text-center mb-2">Height</Label>

              {heightUnit === 'imperial' ? (
                <Select
                  value={`${profile.heightFeet}-${profile.heightInches}`}
                  onValueChange={setHeightFromImperialValue}
                >
                  <SelectTrigger
                    className={`w-full rounded-md px-3 py-2 text-center h-11 shadow-sm transition-colors border ${
                      isSubmitted && errors.height ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'
                    }`}
                    style={{ backgroundColor: 'hsl(var(--input))', color: 'hsl(var(--foreground))' }}
                  >
                    <SelectValue placeholder="Select height" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56 overflow-y-auto bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
                    {Array.from({ length: 84 }, (_, i) => {
                      const feet = Math.floor(i / 12)
                      const inches = i % 12
                      return (
                        <SelectItem key={i} value={`${feet}-${inches}`}>
                          {feet} ft {inches} in
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={profile.heightCm}
                  onValueChange={(v) => persist({ ...profile, heightCm: v })}
                >
                  <SelectTrigger
                    className={`w-full rounded-md px-3 py-2 text-center h-11 shadow-sm transition-colors border ${
                      isSubmitted && errors.height ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'
                    }`}
                    style={{ backgroundColor: 'hsl(var(--input))', color: 'hsl(var(--foreground))' }}
                  >
                    <SelectValue placeholder="Centimeters" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56 overflow-y-auto bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
                    {Array.from({ length: 121 }, (_, i) => {
                      const cm = (i + 130).toString()
                      return <SelectItem key={cm} value={cm}>{cm} cm</SelectItem>
                    })}
                  </SelectContent>
                </Select>
              )}

              <div className="flex items-center justify-center mt-2 space-x-2">
                <Switch
                  checked={heightUnit === 'metric'}
                  onCheckedChange={(c) => {
                    const nextUnit: HeightUnit = c ? 'metric' : 'imperial'
                    setHeightUnit(nextUnit)
                    persist({ ...profile, heightUnit: nextUnit })
                  }}
                  className="data-[state=checked]:bg-[hsl(var(--blue-bar))] data-[state=unchecked]:bg-[hsl(var(--blue-bar))] opacity-90"
                />
                <Label className="select-none">{heightUnit === 'imperial' ? 'ft/in' : 'cm'}</Label>
              </div>
            </div>
          </div>

          {/* Goal */}
          <div className="text-center">
            <Label className="block text-center mb-2">Goal</Label>
            <Select value={profile.goal} onValueChange={(v) => persist({ ...profile, goal: v })}>
              <SelectTrigger
                className={`w-full rounded-md px-3 py-2 text-center h-11 shadow-sm transition-colors border ${
                  isSubmitted && errors.goal ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'
                }`}
                style={{ backgroundColor: 'hsl(var(--input))', color: 'hsl(var(--foreground))' }}
              >
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
                <SelectItem value="lose">Lose Weight</SelectItem>
                <SelectItem value="maintain">Maintain Weight</SelectItem>
                <SelectItem value="gain">Gain Weight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Save */}
          <Button
            type="submit"
            className="w-full text-foreground font-semibold transition-colors h-11"
            style={{ backgroundColor: 'hsl(var(--blue-bar))' }}
          >
            Save Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
