"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight } from "lucide-react"

interface Subject {
  id: string
  name: string
  day: string
  startTime: string
  endTime: string
  room: string
  instructor: string
  color: string
}

interface Assignment {
  id: string
  title: string
  subject: string
  dueDate: string
  description: string
  completed: boolean
  priority: "low" | "medium" | "high"
}

interface ScheduleViewsProps {
  subjects: Subject[]
  assignments: Assignment[]
  viewMode: "daily" | "weekly"
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 8 // Start from 8 AM
  return `${hour.toString().padStart(2, "0")}:00`
})

export function ScheduleViews({ subjects, assignments, viewMode }: ScheduleViewsProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getCurrentWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    startOfWeek.setDate(diff)

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date
    })
  }

  const getSubjectsForDay = (dayName: string) => {
    return subjects.filter((subject) => subject.day === dayName).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const getAssignmentsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return assignments.filter((assignment) => assignment.dueDate === dateStr && !assignment.completed)
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
    setCurrentDate(newDate)
  }

  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1))
    setCurrentDate(newDate)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getTimeSlotPosition = (startTime: string, endTime: string) => {
    const startHour = Number.parseInt(startTime.split(":")[0])
    const endHour = Number.parseInt(endTime.split(":")[0])
    const startMinutes = Number.parseInt(startTime.split(":")[1])
    const endMinutes = Number.parseInt(endTime.split(":")[1])

    const startPosition = ((startHour - 8) * 60 + startMinutes) / 60
    const duration = ((endHour - startHour) * 60 + (endMinutes - startMinutes)) / 60

    return {
      top: `${startPosition * 4}rem`,
      height: `${duration * 4}rem`,
    }
  }

  if (viewMode === "daily") {
    const currentDayName = currentDate.toLocaleDateString("en-US", { weekday: "long" })
    const daySubjects = getSubjectsForDay(currentDayName)
    const dayAssignments = getAssignmentsForDay(currentDate)

    return (
      <div className="space-y-6">
        {/* Daily Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDay("prev")}
              className="hover:scale-105 transition-transform"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDay("next")}
              className="hover:scale-105 transition-transform"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Daily Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time Schedule */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 shadow-xl">
              <CardContent className="p-6">
                <div className="relative">
                  {/* Time Grid */}
                  <div className="space-y-4">
                    {TIME_SLOTS.map((time) => (
                      <div
                        key={time}
                        className="flex items-center border-b border-slate-200 dark:border-slate-700 pb-4"
                      >
                        <div className="w-20 text-sm font-medium text-muted-foreground">{formatTime(time)}</div>
                        <div className="flex-1 h-16 relative">
                          {daySubjects
                            .filter((subject) => {
                              const subjectHour = Number.parseInt(subject.startTime.split(":")[0])
                              const timeHour = Number.parseInt(time.split(":")[0])
                              return subjectHour === timeHour
                            })
                            .map((subject) => (
                              <div
                                key={subject.id}
                                className={`absolute left-4 right-4 ${subject.color} rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20`}
                                style={getTimeSlotPosition(subject.startTime, subject.endTime)}
                              >
                                <div className="text-white">
                                  <h4 className="font-semibold text-sm">{subject.name}</h4>
                                  <div className="flex items-center gap-2 text-xs opacity-90 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{subject.room}</span>
                                    <User className="w-3 h-3 ml-2" />
                                    <span>{subject.instructor}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs opacity-90 mt-1">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                      {formatTime(subject.startTime)} - {formatTime(subject.endTime)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assignments Sidebar */}
          <div className="space-y-4">
            <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 shadow-xl">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Today's Assignments
                </h3>
                {dayAssignments.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No assignments due today</p>
                ) : (
                  <div className="space-y-3">
                    {dayAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-white/20"
                      >
                        <h4 className="font-medium text-sm">{assignment.title}</h4>
                        <p className="text-xs text-muted-foreground">{assignment.subject}</p>
                        <Badge
                          className={`mt-2 ${assignment.priority === "high" ? "bg-red-500" : assignment.priority === "medium" ? "bg-yellow-500" : "bg-green-500"}`}
                        >
                          {assignment.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Weekly View
  const weekDays = getCurrentWeekDays()

  return (
    <div className="space-y-6">
      {/* Weekly Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateWeek("prev")}
            className="hover:scale-105 transition-transform"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Week of {weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </h2>
            <p className="text-sm text-muted-foreground">
              {weekDays[0].toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateWeek("next")}
            className="hover:scale-105 transition-transform"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Weekly Grid */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 shadow-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((date, index) => {
              const dayName = DAYS[index]
              const daySubjects = getSubjectsForDay(dayName)
              const dayAssignments = getAssignmentsForDay(date)
              const isToday = date.toDateString() === new Date().toDateString()

              return (
                <div key={date.toISOString()} className="space-y-3">
                  {/* Day Header */}
                  <div
                    className={`text-center p-3 rounded-xl ${isToday ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" : "bg-white/50 dark:bg-black/20"}`}
                  >
                    <div className="font-semibold text-sm">{dayName.slice(0, 3)}</div>
                    <div className="text-lg font-bold">{date.getDate()}</div>
                  </div>

                  {/* Day Content */}
                  <div className="space-y-2 min-h-[300px]">
                    {/* Subjects */}
                    {daySubjects.map((subject) => (
                      <div
                        key={subject.id}
                        className={`${subject.color} rounded-lg p-2 text-white text-xs shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-white/20`}
                      >
                        <div className="font-medium truncate">{subject.name}</div>
                        <div className="opacity-90 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{subject.startTime}</span>
                        </div>
                        <div className="opacity-90 truncate">{subject.room}</div>
                      </div>
                    ))}

                    {/* Assignments */}
                    {dayAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="bg-gradient-to-r from-orange-400 to-red-400 rounded-lg p-2 text-white text-xs shadow-md"
                      >
                        <div className="font-medium truncate">📝 {assignment.title}</div>
                        <div className="opacity-90 truncate">{assignment.subject}</div>
                        <Badge
                          className={`mt-1 text-xs ${assignment.priority === "high" ? "bg-red-600" : assignment.priority === "medium" ? "bg-yellow-600" : "bg-green-600"}`}
                        >
                          {assignment.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
