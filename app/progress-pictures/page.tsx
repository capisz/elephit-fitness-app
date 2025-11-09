'use client'

import { useState, useEffect } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import PhotoViewer from '@/components/PhotoViewer'

interface ProgressPicture {
  date: Date
  photos: {
    front: string
    back: string
  }[]
}

export default function ProgressPictures() {
  const [date, setDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [frontPicture, setFrontPicture] = useState<string | null>(null)
  const [backPicture, setBackPicture] = useState<string | null>(null)
  const [progressPictures, setProgressPictures] = useState<ProgressPicture[]>([])
  const [isCalendarVisible, setIsCalendarVisible] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedPicture, setSelectedPicture] = useState<string | null>(null)
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false); // Added state for success message

  const router = useRouter()

  useEffect(() => {
    const storedPictures = localStorage.getItem('progressPictures')
    const storedProfile = localStorage.getItem('userProfile');
    if (storedPictures) {
      setProgressPictures(JSON.parse(storedPictures).map((pic: ProgressPicture) => ({
        ...pic,
        date: new Date(pic.date)
      })))
    }
    if (storedProfile) {
      const { image } = JSON.parse(storedProfile);
      setUserProfileImage(image);
    }
  }, [])

  const handlePictureUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (type === 'front') {
            setFrontPicture(reader.result)
          } else {
            setBackPicture(reader.result)
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (frontPicture && backPicture) {
      const newPhoto = {
        front: frontPicture,
        back: backPicture
      }
      
      setProgressPictures(prevPictures => {
        const updatedPictures = [...prevPictures]
        const existingDateIndex = updatedPictures.findIndex(pic => isSameDay(pic.date, selectedDate))
        if (existingDateIndex !== -1) {
          updatedPictures[existingDateIndex].photos.push(newPhoto)
        } else {
          updatedPictures.push({
            date: selectedDate,
            photos: [newPhoto]
          })
        }
        return updatedPictures
      })

      setFrontPicture(null)
      setBackPicture(null)

      // Update localStorage
      localStorage.setItem('progressPictures', JSON.stringify(progressPictures))
      setSubmitSuccess(true) // Added success message
      setTimeout(() => setSubmitSuccess(false), 3000) // Added timeout for success message
    }
  }

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

  const selectedDatePictures = progressPictures.find(pic => isSameDay(pic.date, selectedDate))

  const handleDeleteImage = (type: 'front' | 'back') => {
    if (type === 'front') {
      setFrontPicture(null)
    } else {
      setBackPicture(null)
    }
  }

  const handleDeleteSavedImage = (photoIndex: number, type: 'front' | 'back') => {
    setProgressPictures(prevPictures => {
      const updatedPictures = [...prevPictures]
      const dateIndex = updatedPictures.findIndex(pic => isSameDay(pic.date, selectedDate))
      if (dateIndex !== -1) {
        if (type === 'front') {
          updatedPictures[dateIndex].photos[photoIndex].front = ''
        } else {
          updatedPictures[dateIndex].photos[photoIndex].back = ''
        }
        // Remove the photo entry if both front and back are empty
        if (updatedPictures[dateIndex].photos[photoIndex].front === '' && updatedPictures[dateIndex].photos[photoIndex].back === '') {
          updatedPictures[dateIndex].photos.splice(photoIndex, 1)
        }
        // Remove the date entry if no photos left
        if (updatedPictures[dateIndex].photos.length === 0) {
          updatedPictures.splice(dateIndex, 1)
        }
      }
      localStorage.setItem('progressPictures', JSON.stringify(updatedPictures))
      return updatedPictures
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">Go back</span>
        </Button>
        <h1 className="text-2xl font-bold text-center flex-grow -ml-10">Progress Pictures</h1>
      </div>
      <div className="space-y-2">
        <Card className="w-full max-w-md mx-auto shadow-lg px-4 sm:px-6 md:px-8 pb-8 mt-8 border-2 border-gray-300 dark:border-gray-800" style={{backgroundColor: 'hsl(var(--blue-form))'}}>
          <CardHeader className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {format(selectedDate, 'MM/dd/yy')}
            </div>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary shadow-md">
              <img 
                src={userProfileImage || "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8303dcbac2c854bbcab1579fc6bfff50_t.jpg-zf8pmrbsetCJSe7MkjENVWNRBaRvYH.jpeg"} 
                alt="User Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pb-8">
            <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full space-y-4">
              <div className="space-y-4 mb-8">
                <div className="space-y-2">
                  <Label
                    htmlFor="frontPicture"
                    className="block w-full text-center py-2 px-4 rounded-md cursor-pointer bg-[hsl(var(--blue-bar))] hover:bg-[hsl(var(--blue-bar))] hover:opacity-90 text-foreground transition-colors duration-300"
                  >
                    Upload Front Pictures
                    <input
                      id="frontPicture"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePictureUpload(e, 'front')}
                      className="hidden"
                    />
                  </Label>
                  {frontPicture && (
                    <div className="relative">
                      <img 
                        src={frontPicture} 
                        alt="Front Progress" 
                        className="mt-2 max-w-full h-auto rounded-md border-2 border-black dark:border-white" 
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-1"
                        onClick={() => handleDeleteImage('front')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="backPicture"
                    className="block w-full text-center py-2 px-4 rounded-md cursor-pointer bg-[hsl(var(--blue-bar))] hover:bg-[hsl(var(--blue-bar))] hover:opacity-90 text-foreground transition-colors duration-300"
                  >
                    Upload Back Pictures
                    <input
                      id="backPicture"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePictureUpload(e, 'back')}
                      className="hidden"
                    />
                  </Label>
                  {backPicture && (
                    <div className="relative">
                      <img 
                        src={backPicture} 
                        alt="Back Progress" 
                        className="mt-2 max-w-full h-auto rounded-md border-2 border-black dark:border-white" 
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-1"
                        onClick={() => handleDeleteImage('back')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full mt-8">Save Progress Pictures</Button>
            </form>
            {submitSuccess && ( // Added success message
              <div className="mt-4 p-2 bg-green-100 text-green-800 rounded-md text-center">
                Photos uploaded successfully!
              </div>
            )}
          </CardContent>
        </Card>
        <div className="h-8"></div>
        <Button 
          onClick={() => setIsCalendarVisible(!isCalendarVisible)}
          className="w-full max-w-sm mx-auto block mt-8 bg-black text-white dark:bg-white dark:text-black" 
        >
          {isCalendarVisible ? 'Hide Calendar' : 'Show Calendar'}
        </Button>
        {isCalendarVisible && (
          <Card className="w-full max-w-sm mx-auto mt-4 border-2 border-gray-300 dark:border-gray-600" style={{backgroundColor: 'hsl(var(--blue-form))'}}>
            <CardContent>
              <div className="w-full max-w-xs mx-auto mt-8">
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
                    const isSelected = isSameDay(selectedDate, day)
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const hasProgressPicture = progressPictures.some(pic => isSameDay(pic.date, day))

                    return (
                      <Button
                        key={day.toString()}
                        onClick={() => {
                          setDate(day)
                          setSelectedDate(day)
                        }}
                        variant={isSelected ? "default" : "ghost"}
                        className={`h-8 w-8 p-0 text-center flex items-center justify-center border border-gray-300 dark:border-gray-600 ${
                          !isCurrentMonth ? 'text-gray-400' : ''
                        } ${
                          hasProgressPicture ? 'bg-green-200 dark:bg-green-800' : ''
                        }`}
                      >
                        <time dateTime={formattedDate} className="pointer-events-none">
                          {format(day, 'd')}
                        </time>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {selectedDatePictures && (
          <Card className="w-full max-w-sm mx-auto mt-4 shadow-lg border-2 border-gray-300 dark:border-gray-600" style={{backgroundColor: 'hsl(var(--blue-form))'}}>
            <CardHeader>
              <h3 className="text-lg font-semibold">Photos for {format(selectedDate, 'MMMM d, yyyy')}</h3>
            </CardHeader>
            <CardContent>
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedDatePictures.photos.map((photo, index) => (
                    <div key={index} className="space-y-4">
                      {photo.front && (
                        <div className="relative cursor-pointer border-2 border-black dark:border-white rounded-md overflow-hidden aspect-square">
                          <div className="w-full h-full relative" onClick={() => setSelectedPicture(photo.front)}>
                            <Image 
                              src={photo.front} 
                              alt={`Front Progress ${index + 1}`} 
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSavedImage(index, 'front');
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {photo.back && (
                        <div className="relative cursor-pointer border-2 border-black dark:border-white rounded-md overflow-hidden aspect-square">
                          <div className="w-full h-full relative" onClick={() => setSelectedPicture(photo.back)}>
                            <Image 
                              src={photo.back} 
                              alt={`Back Progress ${index + 1}`} 
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSavedImage(index, 'back');
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {selectedPicture && (
        <PhotoViewer src={selectedPicture} onClose={() => setSelectedPicture(null)} />
      )}
    </div>
  )
}
