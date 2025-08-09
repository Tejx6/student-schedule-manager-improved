"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, Edit, Trash2, Calendar } from "lucide-react"

interface Assignment {
  id: string
  title: string
  subject: string
  dueDate: string
  description: string
  completed: boolean
  priority: "low" | "medium" | "high"
}

interface WorkStatusManagerProps {
  assignments: Assignment[]
  onToggleComplete: (id: string) => void
  onEditAssignment: (assignment: Assignment) => void
  onDeleteAssignment: (id: string) => void
}

export function WorkStatusManager({
  assignments,
  onToggleComplete,
  onEditAssignment,
  onDeleteAssignment,
}: WorkStatusManagerProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "overdue">("all")

  const now = new Date()

  const pendingAssignments = assignments.filter((a) => !a.completed && new Date(a.dueDate) >= now)
  const completedAssignments = assignments.filter((a) => a.completed)
  const overdueAssignments = assignments.filter((a) => !a.completed && new Date(a.dueDate) < now)

  const completionRate = assignments.length > 0 ? (completedAssignments.length / assignments.length) * 100 : 0

  const getFilteredAssignments = () => {
    switch (filter) {
      case "pending":
        return pendingAssignments
      case "completed":
        return completedAssignments
      case "overdue":
        return overdueAssignments
      default:
        return assignments
    }
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

  const getStatusIcon = (assignment: Assignment) => {
    if (assignment.completed) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    } else if (new Date(assignment.dueDate) < now) {
      return <AlertCircle className="w-5 h-5 text-red-500" />
    } else {
      return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusText = (assignment: Assignment) => {
    if (assignment.completed) {
      return "Completed"
    } else if (new Date(assignment.dueDate) < now) {
      return "Overdue"
    } else {
      return "Pending"
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</p>
                <p className="text-2xl font-bold">{pendingAssignments.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Completed</p>
                <p className="text-2xl font-bold">{completedAssignments.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Overdue</p>
                <p className="text-2xl font-bold">{overdueAssignments.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="border-0 bg-white/50 dark:bg-black/20 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle>Completion Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(completionRate)}%</span>
            </div>
            <Progress value={completionRate} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="font-medium text-green-600">{completedAssignments.length} Completed</p>
              </div>
              <div>
                <p className="font-medium text-yellow-600">{pendingAssignments.length} Pending</p>
              </div>
              <div>
                <p className="font-medium text-red-600">{overdueAssignments.length} Overdue</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value: any) => setFilter(value)}>
        <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-1">
          <TabsTrigger
            value="all"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            All ({assignments.length})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white"
          >
            Pending ({pendingAssignments.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
          >
            Completed ({completedAssignments.length})
          </TabsTrigger>
          <TabsTrigger
            value="overdue"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
          >
            Overdue ({overdueAssignments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <div className="grid gap-4">
            {getFilteredAssignments().length === 0 ? (
              <Card className="border-0 bg-white/50 dark:bg-black/20 backdrop-blur-xl shadow-xl">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No assignments in this category</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              getFilteredAssignments().map((assignment) => (
                <Card
                  key={assignment.id}
                  className="border-0 bg-white/50 dark:bg-black/20 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <input
                          type="checkbox"
                          checked={assignment.completed}
                          onChange={() => onToggleComplete(assignment.id)}
                          className="w-5 h-5 rounded"
                        />
                        <div className="flex items-center gap-3">
                          {getStatusIcon(assignment)}
                          <div className={assignment.completed ? "opacity-50" : ""}>
                            <h3 className="font-semibold text-lg">{assignment.title}</h3>
                            <p className="text-muted-foreground">{assignment.subject}</p>
                            <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-white/50 dark:bg-black/20">
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </Badge>
                            <Badge className={`${getPriorityColor(assignment.priority)} text-white`}>
                              {assignment.priority}
                            </Badge>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${
                              assignment.completed
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : new Date(assignment.dueDate) < now
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {getStatusText(assignment)}
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditAssignment(assignment)}
                            className="hover:scale-105 transition-transform"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteAssignment(assignment.id)}
                            className="hover:scale-105 transition-transform"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
