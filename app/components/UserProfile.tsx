'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function UserProfile() {
  const [profile, setProfile] = useState({
    gender: '',
    weight: '',
    weightUnit: 'kg',
    age: '',
    heightFeet: '5',
    heightInches: '0',
    goal: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submittedProfile = {...profile}
    if (profile.weightUnit === 'lbs') {
      submittedProfile.weight = (parseFloat(profile.weight) * 0.453592).toFixed(2)
    }
    // Convert height to total inches
    submittedProfile.height = (parseInt(profile.heightFeet) * 12 + parseInt(profile.heightInches)).toString()
    // TODO: Save profile data and calculate initial calorie goal
    console.log('Submitted profile:', submittedProfile)
  }

  const feetOptions = Array.from({length: 5}, (_, i) => (i + 3).toString())
  const inchesOptions = Array.from({length: 12}, (_, i) => i.toString())

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
      
      <div>
        <Label htmlFor="gender">Gender</Label>
        <RadioGroup id="gender" className="flex space-x-4" onValueChange={(value) => setProfile({...profile, gender: value})}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female">Female</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weight">Weight</Label>
        <div className="flex items-center space-x-2">
          <Input 
            type="number" 
            id="weight" 
            value={profile.weight} 
            onChange={(e) => setProfile({...profile, weight: e.target.value})} 
          />
          <div className="flex items-center space-x-2">
            <Switch
              id="weight-unit"
              checked={profile.weightUnit === 'kg'}
              onCheckedChange={(checked) => setProfile({...profile, weightUnit: checked ? 'kg' : 'lbs'})}
            />
            <Label htmlFor="weight-unit">{profile.weightUnit}</Label>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="age">Age</Label>
        <Input 
          type="number" 
          id="age" 
          value={profile.age} 
          onChange={(e) => setProfile({...profile, age: e.target.value})} 
        />
      </div>

      <div className="space-y-2">
        <Label>Height</Label>
        <div className="flex space-x-2">
          <Select value={profile.heightFeet} onValueChange={(value) => setProfile({...profile, heightFeet: value})}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Feet" />
            </SelectTrigger>
            <SelectContent>
              {feetOptions.map((feet) => (
                <SelectItem key={feet} value={feet}>{feet} ft</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={profile.heightInches} onValueChange={(value) => setProfile({...profile, heightInches: value})}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Inches" />
            </SelectTrigger>
            <SelectContent>
              {inchesOptions.map((inch) => (
                <SelectItem key={inch} value={inch}>{inch} in</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="goal">Goal</Label>
        <Select onValueChange={(value) => setProfile({...profile, goal: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select a goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lose">Lose Weight</SelectItem>
            <SelectItem value="maintain">Maintain Weight</SelectItem>
            <SelectItem value="gain">Gain Weight</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit">Save Profile</Button>
    </form>
  )
}
