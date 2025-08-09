"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, Calendar, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

interface ExportScheduleProps {
  subjects: Subject[]
  assignments: Assignment[]
}

export function ExportSchedule({ subjects, assignments }: ExportScheduleProps) {
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv" | "ical" | "json">("pdf")
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const generateCSV = () => {
    const headers = ["Subject", "Day", "Start Time", "End Time", "Room", "Instructor"]
    const rows = subjects.map((subject) => [
      subject.name,
      subject.day,
      subject.startTime,
      subject.endTime,
      subject.room,
      subject.instructor,
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    return csvContent
  }

  const generateICalendar = () => {
    const now = new Date()
    const events = subjects.map((subject) => {
      const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(
        subject.day,
      )
      const nextOccurrence = new Date(now)
      nextOccurrence.setDate(now.getDate() + ((dayIndex - now.getDay() + 7) % 7))

      const [startHour, startMinute] = subject.startTime.split(":").map(Number)
      const [endHour, endMinute] = subject.endTime.split(":").map(Number)

      const startDateTime = new Date(nextOccurrence)
      startDateTime.setHours(startHour, startMinute, 0, 0)

      const endDateTime = new Date(nextOccurrence)
      endDateTime.setHours(endHour, endMinute, 0, 0)

      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
      }

      return `BEGIN:VEVENT
DTSTART:${formatDate(startDateTime)}
DTEND:${formatDate(endDateTime)}
SUMMARY:${subject.name}
DESCRIPTION:Instructor: ${subject.instructor}
LOCATION:${subject.room}
RRULE:FREQ=WEEKLY;BYDAY=${subject.day.slice(0, 2).toUpperCase()}
END:VEVENT`
    })

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Student Schedule Manager//EN
${events.join("\n")}
END:VCALENDAR`
  }

  const generateJSON = () => {
    return JSON.stringify(
      {
        subjects,
        assignments,
        exportDate: new Date().toISOString(),
        version: "1.0",
      },
      null,
      2,
    )
  }

  const generatePDFContent = () => {
    // This would typically use a PDF library like jsPDF
    // For now, we'll create an HTML representation
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>My Schedule</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .schedule-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .schedule-table th, .schedule-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .schedule-table th { background-color: #f2f2f2; }
        .assignments { margin-top: 30px; }
        .assignment-item { margin-bottom: 15px; padding: 10px; border-left: 4px solid #007bff; }
        .priority-high { border-left-color: #dc3545; }
        .priority-medium { border-left-color: #ffc107; }
        .priority-low { border-left-color: #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>My Class Schedule</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
    
    <h2>Weekly Schedule</h2>
    <table class="schedule-table">
        <thead>
            <tr>
                <th>Subject</th>
                <th>Day</th>
                <th>Time</th>
                <th>Room</th>
                <th>Instructor</th>
            </tr>
        </thead>
        <tbody>
            ${subjects
              .map(
                (subject) => `
                <tr>
                    <td>${subject.name}</td>
                    <td>${subject.day}</td>
                    <td>${subject.startTime} - ${subject.endTime}</td>
                    <td>${subject.room}</td>
                    <td>${subject.instructor}</td>
                </tr>
            `,
              )
              .join("")}
        </tbody>
    </table>
    
    <div class="assignments">
        <h2>Upcoming Assignments</h2>
        ${assignments
          .filter((a) => !a.completed)
          .map(
            (assignment) => `
            <div class="assignment-item priority-${assignment.priority}">
                <h3>${assignment.title}</h3>
                <p><strong>Subject:</strong> ${assignment.subject}</p>
                <p><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>
                <p><strong>Priority:</strong> ${assignment.priority}</p>
                <p>${assignment.description}</p>
            </div>
        `,
          )
          .join("")}
    </div>
</body>
</html>`
    return html
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = () => {
    const timestamp = new Date().toISOString().split("T")[0]

    switch (exportFormat) {
      case "csv":
        downloadFile(generateCSV(), `schedule-${timestamp}.csv`, "text/csv")
        break
      case "ical":
        downloadFile(generateICalendar(), `schedule-${timestamp}.ics`, "text/calendar")
        break
      case "json":
        downloadFile(generateJSON(), `schedule-${timestamp}.json`, "application/json")
        break
      case "pdf":
        downloadFile(generatePDFContent(), `schedule-${timestamp}.html`, "text/html")
        break
    }

    toast({
      title: "Export Successful",
      description: `Your schedule has been exported as ${exportFormat.toUpperCase()}`,
    })

    setIsOpen(false)
  }

  const shareSchedule = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Class Schedule",
          text: "Check out my class schedule!",
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link Copied",
        description: "Schedule link copied to clipboard",
      })
    }
  }

  return (
    <div className="flex gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="hover:scale-105 transition-transform bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DialogTrigger>
        <DialogContent className="border-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Export Schedule
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Export Format</label>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      PDF Document
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      CSV Spreadsheet
                    </div>
                  </SelectItem>
                  <SelectItem value="ical">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      iCalendar (.ics)
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      JSON Data
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleExport}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={shareSchedule}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Export formats:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>PDF: Printable schedule document</li>
                <li>CSV: Import into Excel or Google Sheets</li>
                <li>iCalendar: Import into calendar apps</li>
                <li>JSON: Backup your data</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
