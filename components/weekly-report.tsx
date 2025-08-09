"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, User, Edit, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react"

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

interface WeeklyReportProps {
  subjects: Subject[]
  assignments: Assignment[]
  onEditSubject: (subject: Subject) => void
  onDeleteSubject: (id: string) => void
  onEditAssignment: (assignment: Assignment) => void
  onDeleteAssignment: (id: string) => void
  onAddSubject: () => void
  onAddAssignment: () => void
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function WeeklyReport({
  subjects,
  assignments,
  onEditSubject,
  onDeleteSubject,
  onEditAssignment,
  onDeleteAssignment,
  onAddSubject,
  onAddAssignment,
}: WeeklyReportProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedItem, setSelectedItem] = useState<{
    type: "subject" | "assignment"
    item: Subject | Assignment
  } | null>(null)

  const getCurrentWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
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
    return assignments.filter((assignment) => assignment.dueDate === dateStr)
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
    setCurrentDate(newDate)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-red-500 to-red-600"
      case "medium":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600"
      case "low":
        return "bg-gradient-to-r from-green-500 to-green-600"
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600"
    }
  }

  const weekDays = getCurrentWeekDays()
  const weekStats = {
    totalClasses: subjects.length,
    totalAssignments: assignments.length,
    completedAssignments: assignments.filter((a) => a.completed).length,
    pendingAssignments: assignments.filter((a) => !a.completed).length,
  }

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

        <div className="flex gap-2">
          <Button
            onClick={onAddSubject}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
          <Button
            onClick={onAddAssignment}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Assignment
          </Button>
        </div>
      </div>

      {/* Weekly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-xl">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Classes</p>
              <p className="text-2xl font-bold">{weekStats.totalClasses}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-xl">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Assignments</p>
              <p className="text-2xl font-bold">{weekStats.totalAssignments}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 shadow-xl">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Completed</p>
              <p className="text-2xl font-bold">{weekStats.completedAssignments}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 shadow-xl">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Pending</p>
              <p className="text-2xl font-bold">{weekStats.pendingAssignments}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Grid */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 shadow-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {weekDays.map((date, index) => {
              const dayName = DAYS[index]
              const daySubjects = getSubjectsForDay(dayName)
              const dayAssignments = getAssignmentsForDay(date)
              const isToday = date.toDateString() === new Date().toDateString()

              return (
                <div key={date.toISOString()} className="space-y-3">
                  {/* Day Header */}
                  <div
                    className={`text-center p-3 rounded-xl ${
                      isToday
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                        : "bg-white/50 dark:bg-black/20 backdrop-blur-xl"
                    }`}
                  >
                    <div className="font-semibold text-sm">{dayName.slice(0, 3)}</div>
                    <div className="text-lg font-bold">{date.getDate()}</div>
                  </div>

                  {/* Day Content */}
                  <div className="space-y-2 min-h-[400px]">
                    {/* Subjects */}
                    {daySubjects.map((subject) => (
                      <div
                        key={subject.id}
                        className={`${subject.color} rounded-lg p-3 text-white text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-white/20 group relative`}
                      >
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-white hover:bg-white/20"
                            onClick={() => onEditSubject(subject)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-white hover:bg-white/20"
                            onClick={() => onDeleteSubject(subject.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="pr-12">
                          <div className="font-medium truncate">{subject.name}</div>
                          <div className="opacity-90 flex items-center gap-1 text-xs mt-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatTime(subject.startTime)} - {formatTime(subject.endTime)}
                            </span>
                          </div>
                          <div className="opacity-90 flex items-center gap-1 text-xs">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{subject.room}</span>
                          </div>
                          <div className="opacity-90 flex items-center gap-1 text-xs">
                            <User className="w-3 h-3" />
                            <span className="truncate">{subject.instructor}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Assignments */}
                    {dayAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="bg-gradient-to-r from-orange-400 to-red-400 rounded-lg p-3 text-white text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group relative"
                      >
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-white hover:bg-white/20"
                            onClick={() => onEditAssignment(assignment)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-white hover:bg-white/20"
                            onClick={() => onDeleteAssignment(assignment.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="pr-12">
                          <div className="font-medium truncate">📝 {assignment.title}</div>
                          <div className="opacity-90 truncate text-xs">{assignment.subject}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${getPriorityColor(assignment.priority)} border-white/20`}>
                              {assignment.priority}
                            </Badge>
                            {assignment.completed && (
                              <Badge className="text-xs bg-green-600 border-white/20">✓ Done</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Empty State */}
                    {daySubjects.length === 0 && dayAssignments.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No events</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Item Details Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="border-0 bg-white/90 dark:bg-black/80 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>{selectedItem?.type === "subject" ? "Subject Details" : "Assignment Details"}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {selectedItem.type === "subject" ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">{(selectedItem.item as Subject).name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Day:</p>
                      <p>{(selectedItem.item as Subject).day}</p>
                    </div>
                    <div>
                      <p className="font-medium">Time:</p>
                      <p>
                        {(selectedItem.item as Subject).startTime} - {(selectedItem.item as Subject).endTime}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Room:</p>
                      <p>{(selectedItem.item as Subject).room}</p>
                    </div>
                    <div>
                      <p className="font-medium">Instructor:</p>
                      <p>{(selectedItem.item as Subject).instructor}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">{(selectedItem.item as Assignment).title}</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium">Subject:</p>
                      <p>{(selectedItem.item as Assignment).subject}</p>
                    </div>
                    <div>
                      <p className="font-medium">Due Date:</p>
                      <p>{new Date((selectedItem.item as Assignment).dueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Priority:</p>
                      <Badge className={getPriorityColor((selectedItem.item as Assignment).priority)}>
                        {(selectedItem.item as Assignment).priority}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">Description:</p>
                      <p>{(selectedItem.item as Assignment).description}</p>
                    </div>
                    <div>
                      <p className="font-medium">Status:</p>
                      <Badge className={(selectedItem.item as Assignment).completed ? "bg-green-500" : "bg-yellow-500"}>
                        {(selectedItem.item as Assignment).completed ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
