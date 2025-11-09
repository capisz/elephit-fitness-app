import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/api'

export default async function Home() {
  const userProfile = await getUserProfile()

  if (!userProfile) {
    redirect('/user-profile')
  }

  redirect('/calorie-tracker')
}
