"use client"

import type React from "react"

import firebaseapp from "./firebase.js"

import { collection, addDoc, setDoc, doc, getDocs, updateDoc, deleteDoc } from "firebase/firestore"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Clock, BookOpen, Bell, Plus, Trash2, Edit, Grid3X3, CalendarDays, Eye } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { ThemeToggle } from "@/components/theme-toggle"
import { AIAssistant } from "@/components/ai-assistant"
import { ScheduleViews } from "@/components/schedule-views"
import { ExportSchedule } from "@/components/export-schedule"
import { WorkStatusManager } from "@/components/work-status-manager"
import { WeeklyReport } from "@/components/weekly-report"

// Import Firestore instance directly from firebase config
import { db } from "./firebase.js"

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

interface Reminder {
  id: string
  type: "lecture" | "assignment"
  title: string
  time: string
  enabled: boolean
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const COLORS = [
  "bg-gradient-to-r from-blue-500 to-blue-600",
  "bg-gradient-to-r from-green-500 to-green-600",
  "bg-gradient-to-r from-purple-500 to-purple-600",
  "bg-gradient-to-r from-red-500 to-red-600",
  "bg-gradient-to-r from-yellow-500 to-yellow-600",
  "bg-gradient-to-r from-pink-500 to-pink-600",
  "bg-gradient-to-r from-indigo-500 to-indigo-600",
]

export default function StudentScheduleApp() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() - 1] || "Monday")
  const [viewMode, setViewMode] = useState<"list" | "daily" | "weekly">("list")
  const [isAddingSubject, setIsAddingSubject] = useState(false)
  const [isAddingAssignment, setIsAddingAssignment] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)

  // REMOVE localStorage loading
  // useEffect(() => {
  //   const savedSubjects = localStorage.getItem("student-subjects")
  //   const savedAssignments = localStorage.getItem("student-assignments")
  //   const savedReminders = localStorage.getItem("student-reminders")
  //
  //   if (savedSubjects) setSubjects(JSON.parse(savedSubjects))
  //   if (savedAssignments) setAssignments(JSON.parse(savedAssignments))
  //   if (savedReminders) setReminders(JSON.parse(savedReminders))
  // }, [])

  // REMOVE localStorage saving
  // useEffect(() => {
  //   localStorage.setItem("student-subjects", JSON.stringify(subjects))
  // }, [subjects])
  //
  // useEffect(() => {
  //   localStorage.setItem("student-assignments", JSON.stringify(assignments))
  // }, [assignments])
  //
  // useEffect(() => {
  //   localStorage.setItem("student-reminders", JSON.stringify(reminders))
  // }, [reminders])

  const addSubject = async (subjectData: Omit<Subject, "id">) => {
    try {
      console.log("Adding subject:", subjectData)
      
      // Generate unique ID for the document
      const uniqueId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      
      // Create organized document path: form/unique#/subject-name/day/time/instructor
      const docPath = `form/${uniqueId}/${subjectData.name}/${subjectData.day}/${subjectData.startTime}/${subjectData.instructor}`
      
      const subjectDoc = {
        ...subjectData,
        docPath,
        uniqueId,
        createdAt: new Date().toISOString()
      }
      
      console.log("Saving to Firestore:", subjectDoc)
      
      // Save to Firestore with organized path structure
      await setDoc(doc(db, "student-schedule-subjects", uniqueId), subjectDoc)
      
      console.log("Successfully saved subject to Firestore")
      
      const newSubject: Subject = { ...subjectData, id: uniqueId }
      setSubjects([...subjects, newSubject])
      setIsAddingSubject(false)
    } catch (error) {
      console.error("Error adding subject to Firestore:", error)
      alert("Failed to save subject. Please try again.")
    }
  }

  const updateSubject = async (updatedSubject: Subject) => {
    // Update the document path with new data
    const docPath = `form/${updatedSubject.id}/${updatedSubject.name}/${updatedSubject.day}/${updatedSubject.startTime}/${updatedSubject.instructor}`
    
    await setDoc(doc(db, "student-schedule-subjects", updatedSubject.id), {
      ...updatedSubject,
      docPath,
      updatedAt: new Date().toISOString()
    })
    setSubjects(subjects.map((s) => (s.id === updatedSubject.id ? updatedSubject : s)))
    setEditingSubject(null)
  }

  const deleteSubject = async (id: string) => {
    await deleteDoc(doc(db, "student-schedule-subjects", id))
    setSubjects(subjects.filter((s) => s.id !== id))
  }

  const addAssignment = async (assignmentData: Omit<Assignment, "id">) => {
    try {
      console.log("Adding assignment:", assignmentData)
      
      // Generate unique ID for the document
      const uniqueId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      
      // Create organized document path: form/unique#/assignment-title/subject/due-date
      const docPath = `form/${uniqueId}/${assignmentData.title}/${assignmentData.subject}/${assignmentData.dueDate}`
      
      const assignmentDoc = {
        ...assignmentData,
        docPath,
        uniqueId,
        createdAt: new Date().toISOString()
      }
      
      console.log("Saving to Firestore:", assignmentDoc)
      
      // Save to Firestore with organized path structure
      await setDoc(doc(db, "student-schedule-assignments", uniqueId), assignmentDoc)
      
      console.log("Successfully saved assignment to Firestore")
      
      const newAssignment: Assignment = { ...assignmentData, id: uniqueId }
      setAssignments([...assignments, newAssignment])
      setIsAddingAssignment(false)
    } catch (error) {
      console.error("Error adding assignment to Firestore:", error)
      alert("Failed to save assignment. Please try again.")
    }
  }

  const updateAssignment = async (updatedAssignment: Assignment) => {
    // Update the document path with new data
    const docPath = `form/${updatedAssignment.id}/${updatedAssignment.title}/${updatedAssignment.subject}/${updatedAssignment.dueDate}`
    
    await setDoc(doc(db, "student-schedule-assignments", updatedAssignment.id), {
      ...updatedAssignment,
      docPath,
      updatedAt: new Date().toISOString()
    })
    setAssignments(assignments.map((a) => (a.id === updatedAssignment.id ? updatedAssignment : a)))
    setEditingAssignment(null)
  }

  const toggleAssignmentComplete = async (id: string) => {
    const assignment = assignments.find(a => a.id === id)
    if (assignment) {
      const updatedAssignment = { ...assignment, completed: !assignment.completed }
      await setDoc(doc(db, "student-schedule-assignments", id), {
        ...updatedAssignment,
        updatedAt: new Date().toISOString()
      })
      setAssignments(assignments.map((a) => (a.id === id ? updatedAssignment : a)))
    }
  }

  const deleteAssignment = async (id: string) => {
    await deleteDoc(doc(db, "student-schedule-assignments", id))
    setAssignments(assignments.filter((a) => a.id !== id))
  }

  const getTodaysSubjects = () => {
    return subjects
      .filter((subject) => subject.day === selectedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const getUpcomingAssignments = () => {
    const today = new Date()
    return assignments
      .filter((a) => !a.completed && new Date(a.dueDate) >= today)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
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

  // Test Firestore connection and fetch data on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("Testing Firestore connection...")
        console.log("Firestore instance:", db)
        
        // Test write operation
        const testDoc = {
          test: true,
          timestamp: new Date().toISOString(),
          message: "Connection test"
        }
        
        const testId = "connection-test-" + Date.now()
        await setDoc(doc(db, "test", testId), testDoc)
        console.log("Write test successful")
        
        // Test read operation
        const testSnap = await getDocs(collection(db, "test"))
        console.log("Read test successful, found", testSnap.docs.length, "test documents")
        
        // Clean up test document
        await deleteDoc(doc(db, "test", testId))
        console.log("Connection test completed successfully")
        
      } catch (error) {
        console.error("Firestore connection test failed:", error)
        alert("Firebase connection failed. Please check your configuration.")
        return
      }
    }
    
    const fetchData = async () => {
      try {
        console.log("Fetching data from Firestore...")
        const subjectsSnap = await getDocs(collection(db, "student-schedule-subjects"))
        const assignmentsSnap = await getDocs(collection(db, "student-schedule-assignments"))
        
        console.log("Subjects from Firestore:", subjectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        console.log("Assignments from Firestore:", assignmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        
        setSubjects(subjectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject)))
        setAssignments(assignmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment)))
        
        console.log("Data loaded successfully")
      } catch (error) {
        console.error("Error fetching data from Firestore:", error)
        alert("Failed to load data from database.")
      }
    }
    
    testConnection().then(() => {
      fetchData()
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto p-6">
        {/* Futuristic Header */}
        <header className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Student Schedule Manager
                </h1>
                <p className="text-muted-foreground text-lg">
                  Manage your classes, assignments, and stay on top of your academic schedule
                </p>
              </div>
              <div className="flex items-center gap-4">
                <ExportSchedule subjects={subjects} assignments={assignments} />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-1">
            <TabsTrigger
              value="schedule"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              Schedule
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              Assignments
            </TabsTrigger>
            <TabsTrigger
              value="reminders"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              Reminders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            {/* View Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                {viewMode === "list" && (
                  <>
                    <Label htmlFor="day-select">Select Day:</Label>
                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                      <SelectTrigger className="w-40 bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/20 rounded-xl p-1">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-gradient-to-r from-blue-500 to-purple-500" : ""}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "daily" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("daily")}
                    className={viewMode === "daily" ? "bg-gradient-to-r from-blue-500 to-purple-500" : ""}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "weekly" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("weekly")}
                    className={viewMode === "weekly" ? "bg-gradient-to-r from-blue-500 to-purple-500" : ""}
                  >
                    <CalendarDays className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Dialog open={isAddingSubject} onOpenChange={setIsAddingSubject}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subject
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-0 bg-white/90 dark:bg-black/80 backdrop-blur-xl">
                  <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                  </DialogHeader>
                  <SubjectForm onSubmit={addSubject} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Schedule Content */}
            {viewMode === "list" ? (
              <div className="grid gap-4">
                {getTodaysSubjects().length === 0 ? (
                  <Card className="border-0 bg-white/50 dark:bg-black/20 backdrop-blur-xl shadow-xl">
                    <CardContent className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No classes scheduled for {selectedDay}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  getTodaysSubjects().map((subject) => (
                    <Card
                      key={subject.id}
                      className="border-0 bg-white/50 dark:bg-black/20 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full ${subject.color} shadow-lg`} />
                            <div>
                              <h3 className="font-semibold text-xl">{subject.name}</h3>
                              <p className="text-muted-foreground">{subject.instructor}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {subject.startTime} - {subject.endTime}
                                </span>
                                <span>{subject.room}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingSubject(subject)}
                              className="hover:scale-105 transition-transform"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteSubject(subject.id)}
                              className="hover:scale-105 transition-transform"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : viewMode === "weekly" ? (
              <WeeklyReport
                subjects={subjects}
                assignments={assignments}
                onEditSubject={setEditingSubject}
                onDeleteSubject={deleteSubject}
                onEditAssignment={setEditingAssignment}
                onDeleteAssignment={deleteAssignment}
                onAddSubject={() => setIsAddingSubject(true)}
                onAddAssignment={() => setIsAddingAssignment(true)}
              />
            ) : (
              <ScheduleViews subjects={subjects} assignments={assignments} viewMode={viewMode} />
            )}
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Assignments
              </h2>
              <Dialog open={isAddingAssignment} onOpenChange={setIsAddingAssignment}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-0 bg-white/90 dark:bg-black/80 backdrop-blur-xl">
                  <DialogHeader>
                    <DialogTitle>Add New Assignment</DialogTitle>
                  </DialogHeader>
                  <AssignmentForm onSubmit={addAssignment} subjects={subjects} />
                </DialogContent>
              </Dialog>
            </div>

            <WorkStatusManager
              assignments={assignments}
              onToggleComplete={toggleAssignmentComplete}
              onEditAssignment={setEditingAssignment}
              onDeleteAssignment={deleteAssignment}
            />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <Card className="border-0 bg-white/50 dark:bg-black/20 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Reminder Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-black/20 rounded-xl">
                  <div>
                    <p className="font-medium">Class Reminders</p>
                    <p className="text-sm text-muted-foreground">Get notified 15 minutes before each class</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-black/20 rounded-xl">
                  <div>
                    <p className="font-medium">Assignment Reminders</p>
                    <p className="text-sm text-muted-foreground">Get notified 1 day before assignment due dates</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-black/20 rounded-xl">
                  <div>
                    <p className="font-medium">Daily Schedule</p>
                    <p className="text-sm text-muted-foreground">Receive your daily schedule every morning at 8 AM</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/50 dark:bg-black/20 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Upcoming Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getTodaysSubjects()
                    .slice(0, 3)
                    .map((subject) => (
                      <div
                        key={subject.id}
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl border border-white/20"
                      >
                        <Bell className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{subject.name}</p>
                          <p className="text-sm text-muted-foreground">Starts at {subject.startTime}</p>
                        </div>
                      </div>
                    ))}
                  {getUpcomingAssignments()
                    .slice(0, 2)
                    .map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-xl border border-white/20"
                      >
                        <Calendar className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Due {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Subject Dialog */}
        <Dialog open={!!editingSubject} onOpenChange={() => setEditingSubject(null)}>
          <DialogContent className="border-0 bg-white/90 dark:bg-black/80 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
            </DialogHeader>
            {editingSubject && <SubjectForm initialData={editingSubject} onSubmit={updateSubject} isEditing />}
          </DialogContent>
        </Dialog>

        {/* Edit Assignment Dialog */}
        <Dialog open={!!editingAssignment} onOpenChange={() => setEditingAssignment(null)}>
          <DialogContent className="border-0 bg-white/90 dark:bg-black/80 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Edit Assignment</DialogTitle>
            </DialogHeader>
            {editingAssignment && (
              <AssignmentForm
                initialData={editingAssignment}
                onSubmit={updateAssignment}
                subjects={subjects}
                isEditing
              />
            )}
          </DialogContent>
        </Dialog>

        {/* AI Assistant */}
        <AIAssistant subjects={subjects} assignments={assignments} />
      </div>
    </div>
  )
}

// Keep the existing SubjectForm and AssignmentForm components unchanged
function SubjectForm({
  onSubmit,
  initialData,
  isEditing = false,
}: {
  onSubmit: (data: any) => void
  initialData?: Subject
  isEditing?: boolean
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    day: initialData?.day || "Monday",
    startTime: initialData?.startTime || "",
    endTime: initialData?.endTime || "",
    room: initialData?.room || "",
    instructor: initialData?.instructor || "",
    color: initialData?.color || COLORS[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing && initialData) {
      onSubmit({ ...initialData, ...formData })
    } else {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Subject Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/20"
        />
      </div>

      <div>
        <Label htmlFor="day">Day</Label>
        <Select value={formData.day} onValueChange={(value) => setFormData({ ...formData, day: value })}>
          <SelectTrigger className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DAYS.map((day) => (
              <SelectItem key={day} value={day}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
            className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/20"
          />
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
            className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/20"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="room">Room</Label>
        <Input
          id="room"
          value={formData.room}
          onChange={(e) => setFormData({ ...formData, room: e.target.value })}
          required
          className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/20"
        />
      </div>

      <div>
        <Label htmlFor="instructor">Instructor</Label>
        <Input
          id="instructor"
          value={formData.instructor}
          onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
          required
          className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/20"
        />
      </div>

      <div>
        <Label>Color</Label>
        <div className="flex gap-2 mt-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-10 h-10 rounded-full ${color} ${formData.color === color ? "ring-4 ring-blue-400" : ""} hover:scale-110 transition-transform shadow-lg`}
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
      >
        {isEditing ? "Update Subject" : "Add Subject"}
      </Button>
    </form>
  )
}

// Updated AssignmentForm with text input and suggestions
function AssignmentForm({
  onSubmit,
  subjects,
  initialData,
  isEditing = false,
}: {
  onSubmit: (data: any) => void
  subjects: Subject[]
  initialData?: Assignment
  isEditing?: boolean
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    subject: initialData?.subject || "",
    dueDate: initialData?.dueDate || "",
    description: initialData?.description || "",
    completed: initialData?.completed || false,
    priority: initialData?.priority || ("medium" as "low" | "medium" | "high"),
  })

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSubjects, setFilteredSubjects] = useState<string[]>([])

  // Get unique subject names from existing subjects and assignments
  const getAllSubjectNames = () => {
    const subjectNames = new Set<string>()

    // Add subjects from schedule
    subjects.forEach((subject) => subjectNames.add(subject.name))

    // Add subjects from existing assignments
    // This would need to be passed as a prop or accessed from context
    // For now, we'll just use the schedule subjects

    return Array.from(subjectNames)
  }

  const handleSubjectChange = (value: string) => {
    setFormData({ ...formData, subject: value })

    if (value.trim()) {
      const allSubjects = getAllSubjectNames()
      const filtered = allSubjects.filter((subject) => subject.toLowerCase().includes(value.toLowerCase()))
      setFilteredSubjects(filtered)
      setShowSuggestions(filtered.length > 0 && value !== filtered[0])
    } else {
      setShowSuggestions(false)
      setFilteredSubjects([])
    }
  }

  const selectSuggestion = (suggestion: string) => {
    setFormData({ ...formData, subject: suggestion })
    setShowSuggestions(false)
    setFilteredSubjects([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing && initialData) {
      onSubmit({ ...initialData, ...formData })
    } else {
      onSubmit(formData)
    }
    if (!isEditing) {
      setFormData({
        title: "",
        subject: "",
        dueDate: "",
        description: "",
        completed: false,
        priority: "medium",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Assignment Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/20"
          placeholder="Enter assignment title"
        />
      </div>

      <div className="relative">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => handleSubjectChange(e.target.value)}
          onFocus={() => {
            if (formData.subject.trim()) {
              const allSubjects = getAllSubjectNames()
              const filtered = allSubjects.filter((subject) =>
                subject.toLowerCase().includes(formData.subject.toLowerCase()),
              )
              setFilteredSubjects(filtered)
              setShowSuggestions(filtered.length > 0)
            }
          }}
          onBlur={() => {
            // Delay hiding suggestions to allow clicking on them
            setTimeout(() => setShowSuggestions(false), 200)
          }}
          required
          className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/20"
          placeholder="Type subject name (e.g., Mathematics, Physics, History)"
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSubjects.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-black border border-white/20 rounded-lg shadow-lg backdrop-blur-xl">
            <div className="p-2">
              <p className="text-xs text-muted-foreground mb-2">Suggestions from your subjects:</p>
              {filteredSubjects.slice(0, 5).map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-950 rounded-md transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault() // Prevent input blur
                    selectSuggestion(suggestion)
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-1">
          You can type any subject name. Suggestions will appear from your existing subjects.
        </p>
      </div>

      <div>
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          required
          className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/20"
        />
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={formData.priority}
          onValueChange={(value: "low" | "medium" | "high") => setFormData({ ...formData, priority: value })}
        >
          <SelectTrigger className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/20"
          placeholder="Enter assignment details, requirements, or notes"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
      >
        {isEditing ? "Update Assignment" : "Add Assignment"}
      </Button>
    </form>
  )
}
