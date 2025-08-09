"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, Lightbulb, BookOpen, Clock, Target } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

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

interface AIAssistantProps {
  subjects: Subject[]
  assignments: Assignment[]
}

export function AIAssistant({ subjects, assignments }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your AI study assistant. I can help you with study tips, schedule optimization, assignment planning, and academic advice. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const getContextualInfo = () => {
    const upcomingAssignments = assignments
      .filter((a) => !a.completed && new Date(a.dueDate) >= new Date())
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)

    const todaySubjects = subjects.filter((s) => s.day === new Date().toLocaleDateString("en-US", { weekday: "long" }))

    return {
      totalSubjects: subjects.length,
      upcomingAssignments: upcomingAssignments.length,
      todayClasses: todaySubjects.length,
      subjects: subjects.map((s) => ({ name: s.name, day: s.day, time: `${s.startTime}-${s.endTime}` })),
      assignments: upcomingAssignments.map((a) => ({
        title: a.title,
        subject: a.subject,
        dueDate: a.dueDate,
        priority: a.priority,
      })),
    }
  }

  const generateMockResponse = (userInput: string): string => {
    const context = getContextualInfo()
    const input = userInput.toLowerCase()

    // Study plan responses
    if (input.includes("study plan") || input.includes("plan")) {
      if (context.upcomingAssignments === 0) {
        return "Great! Since you don't have any upcoming assignments, this is a perfect time to review your course materials and get ahead. I recommend:\n\n1. Review notes from recent classes\n2. Read ahead in your textbooks\n3. Practice problems from previous chapters\n4. Organize your study materials\n\nWould you like specific tips for any of your subjects?"
      }
      return `Based on your current schedule, here's a personalized study plan:\n\n📚 **Priority Focus**: You have ${context.upcomingAssignments} upcoming assignments\n\n**This Week's Plan:**\n1. Start with high-priority assignments first\n2. Dedicate 2-3 hours daily to focused study\n3. Use the Pomodoro technique (25 min study, 5 min break)\n4. Review class notes within 24 hours of each lecture\n\n**Subject-specific tips:**\n${context.subjects
        .slice(0, 3)
        .map((s) => `• ${s.name}: Schedule study time after your ${s.day} class`)
        .join("\n")}\n\nWould you like me to break this down further for any specific subject?`
    }

    // Time management responses
    if (input.includes("time management") || input.includes("schedule") || input.includes("organize")) {
      return `Here are some time management strategies tailored to your schedule:\n\n⏰ **Daily Structure:**\n• You have ${context.todayClasses} classes today - plan study blocks between them\n• Use transition time between classes for quick reviews\n• Set specific times for assignment work\n\n📅 **Weekly Planning:**\n• Sunday: Plan the upcoming week\n• Review your ${context.totalSubjects} subjects and upcoming deadlines\n• Block time for each subject based on difficulty and deadlines\n\n🎯 **Pro Tips:**\n• Use a digital calendar with reminders\n• Batch similar tasks together\n• Leave buffer time for unexpected tasks\n• Take regular breaks to maintain focus\n\nWhat specific time management challenge are you facing?`
    }

    // Study techniques responses
    if (input.includes("study tips") || input.includes("techniques") || input.includes("how to study")) {
      return `Here are effective study techniques based on your current subjects:\n\n🧠 **Active Learning Methods:**\n• **Spaced Repetition**: Review material at increasing intervals\n• **Active Recall**: Test yourself without looking at notes\n• **Feynman Technique**: Explain concepts in simple terms\n\n📝 **Subject-Specific Strategies:**\n${context.subjects
        .slice(0, 3)
        .map((s) => {
          if (s.name.toLowerCase().includes("math") || s.name.toLowerCase().includes("calculus")) {
            return `• ${s.name}: Practice problems daily, focus on understanding concepts`
          } else if (s.name.toLowerCase().includes("history") || s.name.toLowerCase().includes("literature")) {
            return `• ${s.name}: Create timelines, summarize key points, discuss with peers`
          } else if (s.name.toLowerCase().includes("science") || s.name.toLowerCase().includes("biology")) {
            return `• ${s.name}: Use diagrams, create concept maps, do lab reviews`
          } else {
            return `• ${s.name}: Take detailed notes, create study guides, form study groups`
          }
        })
        .join(
          "\n",
        )}\n\n🎯 **Environment Tips:**\n• Find a quiet, dedicated study space\n• Remove distractions (phone, social media)\n• Use good lighting and comfortable seating\n\nWhich subject would you like specific study strategies for?`
    }

    // Motivation responses
    if (
      input.includes("overwhelmed") ||
      input.includes("stressed") ||
      input.includes("motivation") ||
      input.includes("help")
    ) {
      return `I understand feeling overwhelmed - you're not alone! Here's how to regain control:\n\n💪 **Immediate Relief:**\n• Take 5 deep breaths right now\n• Break large tasks into smaller, manageable steps\n• Focus on just the next small action, not the whole project\n\n🎯 **Regain Control:**\n• List everything you need to do\n• Prioritize by deadline and importance\n• Tackle one thing at a time\n• Celebrate small wins along the way\n\n📚 **Academic Perspective:**\n• You have ${context.totalSubjects} subjects - that's manageable!\n• ${context.upcomingAssignments} assignments can be handled with good planning\n• Remember: professors want you to succeed\n\n🌟 **Motivation Boosters:**\n• Remember why you're studying (your goals and dreams)\n• Connect with classmates for support\n• Take care of your physical health (sleep, exercise, nutrition)\n• Reward yourself for completing tasks\n\nYou've got this! What's the most pressing thing you're worried about right now?`
    }

    // Assignment help
    if (input.includes("assignment") || input.includes("homework") || input.includes("due")) {
      if (context.upcomingAssignments === 0) {
        return "Great news! You don't have any upcoming assignments right now. This is a perfect opportunity to:\n\n• Get ahead on reading\n• Review and organize your notes\n• Prepare for upcoming exams\n• Work on long-term projects\n\nStaying ahead will make your life much easier when new assignments come up!"
      }
      return `Let's tackle your assignments strategically:\n\n📋 **Current Workload:**\n• ${context.upcomingAssignments} assignments to complete\n• Focus on high-priority items first\n\n🎯 **Action Plan:**\n1. **Immediate**: Start with assignments due soonest\n2. **Daily**: Dedicate 2-3 hours to assignment work\n3. **Weekly**: Review progress and adjust plan\n\n💡 **Assignment Tips:**\n• Start with the hardest task when your energy is highest\n• Break large assignments into daily mini-goals\n• Use the library or quiet study spaces\n• Don't hesitate to ask professors for clarification\n\n📚 **Subject Balance:**\nMake sure to allocate time across all your ${context.totalSubjects} subjects, not just the ones with immediate deadlines.\n\nWhich assignment is causing you the most concern?`
    }

    // Default response
    return `That's a great question! Based on your current academic situation:\n\n📊 **Your Academic Overview:**\n• ${context.totalSubjects} subjects this semester\n• ${context.upcomingAssignments} upcoming assignments\n• ${context.todayClasses} classes today\n\n💡 **General Advice:**\n• Stay organized with a planner or digital calendar\n• Maintain a consistent study routine\n• Don't hesitate to reach out to professors during office hours\n• Form study groups with classmates\n• Take care of your mental and physical health\n\n🎯 **Next Steps:**\nI can help you with specific study strategies, time management, assignment planning, or motivation. What would be most helpful for you right now?\n\nFeel free to ask about:\n• Creating a study schedule\n• Specific subject strategies\n• Managing stress and staying motivated\n• Assignment prioritization`
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)

    // Simulate AI thinking time
    setTimeout(
      () => {
        const response = generateMockResponse(currentInput)

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
      },
      1000 + Math.random() * 2000,
    ) // Random delay between 1-3 seconds
  }

  const quickActions = [
    {
      icon: <Target className="w-4 h-4" />,
      label: "Study Plan",
      prompt: "Create a study plan for my upcoming assignments",
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: "Time Management",
      prompt: "Give me time management tips for my current schedule",
    },
    {
      icon: <BookOpen className="w-4 h-4" />,
      label: "Study Tips",
      prompt: "What are some effective study techniques for my subjects?",
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      label: "Motivation",
      prompt: "I'm feeling overwhelmed with my assignments. Can you help motivate me?",
    },
  ]

  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg">
          <Bot className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Study Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.prompt)}
                  className="text-xs"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about studying, time management, or your schedule..."
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                disabled={isLoading}
              />
              <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
