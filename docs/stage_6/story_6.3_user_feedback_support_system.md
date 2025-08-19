# Story 6.3: User Feedback & Support System

## Story Details
- **Stage**: 6 - Post-Launch Tasks
- **Priority**: High
- **Estimated Hours**: 4-6 hours
- **Dependencies**: Core application complete

## Objective
Implement a comprehensive user feedback and support system including in-app feedback widgets, support ticket system, feature request voting, bug reporting, and user satisfaction surveys. Create a seamless support experience that helps users get help quickly while gathering valuable insights.

## Acceptance Criteria
- [ ] In-app feedback widget
- [ ] Support ticket system
- [ ] Feature request board with voting
- [ ] Bug reporting with screenshots
- [ ] User satisfaction surveys (CSAT/NPS)
- [ ] Live chat integration
- [ ] Email support integration
- [ ] Knowledge base integration
- [ ] Response time tracking
- [ ] Support analytics dashboard
- [ ] Multi-language support
- [ ] Automated responses

## Implementation Steps

### 1. Feedback Widget System

#### Create `src/components/feedback/feedback-widget.tsx`
```typescript
'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Heart, 
  X, 
  Send,
  Camera,
  Loader2,
  CheckCircle 
} from 'lucide-react'
import { useAnalytics } from '@/providers/analytics-provider'
import { cn } from '@/lib/utils'
import html2canvas from 'html2canvas'

type FeedbackType = 'general' | 'bug' | 'feature' | 'praise'

interface FeedbackData {
  type: FeedbackType
  message: string
  email?: string
  screenshot?: string
  metadata?: Record<string, any>
}

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [feedbackType, setFeedbackType] = React.useState<FeedbackType>('general')
  const [message, setMessage] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [screenshot, setScreenshot] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [isCapturingScreenshot, setIsCapturingScreenshot] = React.useState(false)
  
  const { toast } = useToast()
  const { trackEvent } = useAnalytics()
  
  const feedbackTypes = [
    { 
      value: 'general', 
      label: 'General Feedback', 
      icon: MessageSquare,
      description: 'Share your thoughts or suggestions' 
    },
    { 
      value: 'bug', 
      label: 'Report a Bug', 
      icon: Bug,
      description: 'Something not working correctly?' 
    },
    { 
      value: 'feature', 
      label: 'Feature Request', 
      icon: Lightbulb,
      description: 'Have an idea for a new feature?' 
    },
    { 
      value: 'praise', 
      label: 'Send Praise', 
      icon: Heart,
      description: 'Let us know what you love!' 
    },
  ]
  
  const captureScreenshot = async () => {
    setIsCapturingScreenshot(true)
    
    try {
      // Hide feedback widget during capture
      const widget = document.getElementById('feedback-widget')
      if (widget) widget.style.display = 'none'
      
      const canvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        scale: 0.5, // Reduce size
        logging: false,
      })
      
      const dataUrl = canvas.toDataURL('image/png', 0.8)
      setScreenshot(dataUrl)
      
      // Show widget again
      if (widget) widget.style.display = 'block'
      
      toast({
        title: 'Screenshot captured',
        description: 'The screenshot has been attached to your feedback',
      })
    } catch (error) {
      console.error('Failed to capture screenshot:', error)
      toast({
        title: 'Screenshot failed',
        description: 'Could not capture screenshot',
        variant: 'destructive',
      })
    } finally {
      setIsCapturingScreenshot(false)
    }
  }
  
  const submitFeedback = async () => {
    if (!message.trim()) {
      toast({
        title: 'Message required',
        description: 'Please enter your feedback message',
        variant: 'destructive',
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const feedbackData: FeedbackData = {
        type: feedbackType,
        message,
        email: email || undefined,
        screenshot: screenshot || undefined,
        metadata: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          locale: document.documentElement.lang,
        },
      }
      
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      })
      
      if (!response.ok) throw new Error('Failed to submit feedback')
      
      // Track event
      trackEvent('Feedback Submitted', {
        category: 'Engagement',
        type: feedbackType,
        hasScreenshot: !!screenshot,
      })
      
      setIsSuccess(true)
      
      // Reset form after delay
      setTimeout(() => {
        setIsOpen(false)
        setIsSuccess(false)
        setMessage('')
        setEmail('')
        setScreenshot(null)
        setFeedbackType('general')
      }, 2000)
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: 'Please try again later',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <>
      {/* Feedback Button */}
      <Button
        id="feedback-button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 shadow-lg"
        size="sm"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Feedback
      </Button>
      
      {/* Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              id="feedback-widget"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed bottom-4 right-4 z-50 w-full max-w-md"
            >
              <Card className="shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Send Feedback</CardTitle>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    We'd love to hear your thoughts
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {isSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8"
                    >
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Thank you!</h3>
                      <p className="text-muted-foreground">
                        Your feedback has been received
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      {/* Feedback Type Selection */}
                      <RadioGroup
                        value={feedbackType}
                        onValueChange={(value) => setFeedbackType(value as FeedbackType)}
                      >
                        <div className="grid grid-cols-2 gap-2">
                          {feedbackTypes.map((type) => {
                            const Icon = type.icon
                            return (
                              <div key={type.value}>
                                <RadioGroupItem
                                  value={type.value}
                                  id={type.value}
                                  className="peer sr-only"
                                />
                                <Label
                                  htmlFor={type.value}
                                  className={cn(
                                    "flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors",
                                    "hover:bg-accent",
                                    "peer-data-[state=checked]:border-primary",
                                    "peer-data-[state=checked]:bg-primary/5"
                                  )}
                                >
                                  <Icon className="h-6 w-6 mb-2" />
                                  <span className="text-sm font-medium">
                                    {type.label}
                                  </span>
                                </Label>
                              </div>
                            )
                          })}
                        </div>
                      </RadioGroup>
                      
                      {/* Message Input */}
                      <div className="space-y-2">
                        <Label htmlFor="message">Your Message</Label>
                        <Textarea
                          id="message"
                          placeholder={
                            feedbackType === 'bug' 
                              ? 'Please describe the issue you encountered...'
                              : feedbackType === 'feature'
                              ? 'Describe the feature you would like to see...'
                              : feedbackType === 'praise'
                              ? 'What do you love about our service?'
                              : 'Share your feedback with us...'
                          }
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={4}
                        />
                      </div>
                      
                      {/* Email Input (Optional) */}
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Email (optional)
                          <span className="text-xs text-muted-foreground ml-2">
                            If you'd like a response
                          </span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      
                      {/* Screenshot Section */}
                      {feedbackType === 'bug' && (
                        <div className="space-y-2">
                          <Label>Screenshot</Label>
                          {screenshot ? (
                            <div className="relative">
                              <img
                                src={screenshot}
                                alt="Screenshot"
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                className="absolute top-2 right-2"
                                onClick={() => setScreenshot(null)}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={captureScreenshot}
                              disabled={isCapturingScreenshot}
                              className="w-full"
                            >
                              {isCapturingScreenshot ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Camera className="h-4 w-4 mr-2" />
                              )}
                              Capture Screenshot
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
                
                {!isSuccess && (
                  <CardFooter>
                    <Button
                      onClick={submitFeedback}
                      disabled={isSubmitting || !message.trim()}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send Feedback
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
```

### 2. Support Ticket System

#### Create `src/lib/support/ticket-system.ts`
```typescript
import { z } from 'zod'
import { nanoid } from 'nanoid'

// Ticket schemas
export const TicketPriority = z.enum(['low', 'medium', 'high', 'urgent'])
export const TicketStatus = z.enum(['open', 'pending', 'resolved', 'closed'])
export const TicketCategory = z.enum([
  'technical',
  'billing',
  'feature',
  'account',
  'other',
])

export const CreateTicketSchema = z.object({
  subject: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  category: TicketCategory,
  priority: TicketPriority.optional(),
  email: z.string().email(),
  attachments: z.array(z.string()).optional(),
})

export const TicketResponseSchema = z.object({
  message: z.string().min(1).max(5000),
  isInternal: z.boolean().optional(),
  attachments: z.array(z.string()).optional(),
})

export interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  description: string
  category: z.infer<typeof TicketCategory>
  priority: z.infer<typeof TicketPriority>
  status: z.infer<typeof TicketStatus>
  email: string
  userId?: string
  assignedTo?: string
  tags: string[]
  attachments: string[]
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  firstResponseAt?: Date
  responses: TicketResponse[]
  metadata?: Record<string, any>
}

export interface TicketResponse {
  id: string
  ticketId: string
  message: string
  isInternal: boolean
  authorId?: string
  authorEmail: string
  authorName: string
  attachments: string[]
  createdAt: Date
}

export class TicketSystem {
  // Generate unique ticket number
  generateTicketNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = nanoid(4).toUpperCase()
    return `TKT-${timestamp}-${random}`
  }
  
  // Create new ticket
  async createTicket(data: z.infer<typeof CreateTicketSchema>): Promise<Ticket> {
    const validated = CreateTicketSchema.parse(data)
    
    const ticket: Ticket = {
      id: nanoid(),
      ticketNumber: this.generateTicketNumber(),
      subject: validated.subject,
      description: validated.description,
      category: validated.category,
      priority: validated.priority || 'medium',
      status: 'open',
      email: validated.email,
      tags: this.generateTags(validated),
      attachments: validated.attachments || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: [],
    }
    
    // Save to database
    await db.ticket.create({ data: ticket })
    
    // Send confirmation email
    await this.sendTicketConfirmation(ticket)
    
    // Notify support team
    await this.notifySupportTeam(ticket)
    
    // Auto-assign if rules match
    await this.autoAssignTicket(ticket)
    
    return ticket
  }
  
  // Add response to ticket
  async addResponse(
    ticketId: string,
    data: z.infer<typeof TicketResponseSchema>,
    author: { id?: string; email: string; name: string }
  ): Promise<TicketResponse> {
    const validated = TicketResponseSchema.parse(data)
    
    const response: TicketResponse = {
      id: nanoid(),
      ticketId,
      message: validated.message,
      isInternal: validated.isInternal || false,
      authorId: author.id,
      authorEmail: author.email,
      authorName: author.name,
      attachments: validated.attachments || [],
      createdAt: new Date(),
    }
    
    // Save response
    await db.ticketResponse.create({ data: response })
    
    // Update ticket
    const ticket = await db.ticket.findUnique({ where: { id: ticketId } })
    if (ticket) {
      // Update first response time
      if (!ticket.firstResponseAt && !response.isInternal) {
        await db.ticket.update({
          where: { id: ticketId },
          data: { firstResponseAt: new Date() },
        })
      }
      
      // Send notification to customer
      if (!response.isInternal && response.authorEmail !== ticket.email) {
        await this.sendResponseNotification(ticket, response)
      }
    }
    
    return response
  }
  
  // Update ticket status
  async updateStatus(
    ticketId: string,
    status: z.infer<typeof TicketStatus>,
    userId?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    }
    
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date()
    }
    
    await db.ticket.update({
      where: { id: ticketId },
      data: updateData,
    })
    
    // Log status change
    await db.ticketLog.create({
      data: {
        ticketId,
        action: 'status_change',
        details: { from: 'previous_status', to: status },
        userId,
        createdAt: new Date(),
      },
    })
  }
  
  // Auto-assign ticket based on rules
  private async autoAssignTicket(ticket: Ticket): Promise<void> {
    // Category-based assignment
    const categoryAssignments: Record<string, string> = {
      technical: 'tech-support-team',
      billing: 'billing-team',
      feature: 'product-team',
    }
    
    const assignTo = categoryAssignments[ticket.category]
    if (assignTo) {
      await db.ticket.update({
        where: { id: ticket.id },
        data: { assignedTo: assignTo },
      })
    }
  }
  
  // Generate tags based on content
  private generateTags(data: any): string[] {
    const tags: string[] = [data.category]
    
    // Add tags based on keywords
    const keywords = {
      'api': ['api', 'endpoint', 'integration'],
      'performance': ['slow', 'performance', 'speed'],
      'error': ['error', 'bug', 'broken'],
      'payment': ['payment', 'charge', 'billing'],
    }
    
    const content = `${data.subject} ${data.description}`.toLowerCase()
    
    for (const [tag, terms] of Object.entries(keywords)) {
      if (terms.some(term => content.includes(term))) {
        tags.push(tag)
      }
    }
    
    return [...new Set(tags)]
  }
  
  // Send ticket confirmation email
  private async sendTicketConfirmation(ticket: Ticket): Promise<void> {
    await sendEmail({
      to: ticket.email,
      subject: `Ticket Received: ${ticket.ticketNumber}`,
      template: 'ticket-confirmation',
      data: {
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        trackingUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/support/ticket/${ticket.ticketNumber}`,
      },
    })
  }
  
  // Notify support team
  private async notifySupportTeam(ticket: Ticket): Promise<void> {
    // Send to Slack
    await slack.chat.postMessage({
      channel: '#support-tickets',
      text: `New ${ticket.priority} priority ticket`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `New Ticket: ${ticket.ticketNumber}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Subject:*\n${ticket.subject}`,
            },
            {
              type: 'mrkdwn',
              text: `*Category:*\n${ticket.category}`,
            },
            {
              type: 'mrkdwn',
              text: `*Priority:*\n${ticket.priority}`,
            },
            {
              type: 'mrkdwn',
              text: `*From:*\n${ticket.email}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Description:*\n${ticket.description.substring(0, 200)}...`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Ticket',
              },
              url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/support/ticket/${ticket.id}`,
            },
          ],
        },
      ],
    })
  }
  
  // Send response notification
  private async sendResponseNotification(
    ticket: Ticket,
    response: TicketResponse
  ): Promise<void> {
    await sendEmail({
      to: ticket.email,
      subject: `RE: ${ticket.subject} [${ticket.ticketNumber}]`,
      template: 'ticket-response',
      data: {
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        response: response.message,
        authorName: response.authorName,
        trackingUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/support/ticket/${ticket.ticketNumber}`,
      },
    })
  }
}

export const ticketSystem = new TicketSystem()
```

### 3. Feature Request Board

#### Create `src/components/feedback/feature-board.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ThumbsUp, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  Search,
  Filter
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FeatureRequest {
  id: string
  title: string
  description: string
  category: string
  status: 'under-review' | 'planned' | 'in-progress' | 'completed' | 'declined'
  votes: number
  hasVoted: boolean
  comments: number
  author: {
    name: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
}

export function FeatureBoard() {
  const [showNewRequest, setShowNewRequest] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [sortBy, setSortBy] = React.useState<'votes' | 'recent'>('votes')
  
  const debouncedSearch = useDebounce(searchQuery, 300)
  const queryClient = useQueryClient()
  
  const { data: features, isLoading } = useQuery({
    queryKey: ['feature-requests', debouncedSearch, statusFilter, sortBy],
    queryFn: () => fetchFeatureRequests({
      search: debouncedSearch,
      status: statusFilter,
      sort: sortBy,
    }),
  })
  
  const voteMutation = useMutation({
    mutationFn: (featureId: string) => voteForFeature(featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-requests'] })
    },
  })
  
  const statusConfig = {
    'under-review': { label: 'Under Review', color: 'bg-yellow-500' },
    'planned': { label: 'Planned', color: 'bg-blue-500' },
    'in-progress': { label: 'In Progress', color: 'bg-purple-500' },
    'completed': { label: 'Completed', color: 'bg-green-500' },
    'declined': { label: 'Declined', color: 'bg-red-500' },
  }
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feature Requests</h1>
          <p className="text-muted-foreground">
            Vote on features you'd like to see or submit your own ideas
          </p>
        </div>
        <Button onClick={() => setShowNewRequest(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search feature requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy as any}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="votes">Most Votes</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Feature Requests */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : features?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No feature requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {features?.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onVote={() => voteMutation.mutate(feature.id)}
              statusConfig={statusConfig}
            />
          ))}
        </div>
      )}
      
      {/* New Request Modal */}
      <AnimatePresence>
        {showNewRequest && (
          <NewFeatureRequest onClose={() => setShowNewRequest(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function FeatureCard({ 
  feature, 
  onVote, 
  statusConfig 
}: { 
  feature: FeatureRequest
  onVote: () => void
  statusConfig: any
}) {
  const status = statusConfig[feature.status]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="secondary"
                  className={cn("text-white", status.color)}
                >
                  {status.label}
                </Badge>
                <Badge variant="outline">{feature.category}</Badge>
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription className="mt-2">
                {feature.description}
              </CardDescription>
            </div>
            
            <div className="flex flex-col items-center">
              <Button
                variant={feature.hasVoted ? "default" : "outline"}
                size="sm"
                onClick={onVote}
                className="mb-2"
              >
                <ThumbsUp className={cn(
                  "h-4 w-4",
                  feature.hasVoted && "fill-current"
                )} />
              </Button>
              <span className="text-lg font-semibold">{feature.votes}</span>
              <span className="text-xs text-muted-foreground">votes</span>
            </div>
          </div>
        </CardHeader>
        
        <CardFooter className="text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{feature.author.name}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {feature.comments} comments
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(feature.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

function NewFeatureRequest({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [category, setCategory] = React.useState('')
  const queryClient = useQueryClient()
  
  const createMutation = useMutation({
    mutationFn: () => createFeatureRequest({ title, description, category }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-requests'] })
      onClose()
    },
  })
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-x-4 top-[20%] mx-auto max-w-lg z-50"
      >
        <Card>
          <CardHeader>
            <CardTitle>Submit Feature Request</CardTitle>
            <CardDescription>
              Describe the feature you'd like to see
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief title for your feature request"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="ui-ux">UI/UX</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="integrations">Integrations</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed description of the feature..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!title || !description || !category || createMutation.isPending}
            >
              {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </>
  )
}

// API functions
async function fetchFeatureRequests(params: any) {
  const searchParams = new URLSearchParams(params)
  const response = await fetch(`/api/feedback/features?${searchParams}`)
  return response.json()
}

async function voteForFeature(featureId: string) {
  const response = await fetch(`/api/feedback/features/${featureId}/vote`, {
    method: 'POST',
  })
  return response.json()
}

async function createFeatureRequest(data: any) {
  const response = await fetch('/api/feedback/features', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return response.json()
}
```

### 4. User Satisfaction Surveys

#### Create `src/components/feedback/satisfaction-survey.tsx`
```typescript
'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Star, Frown, Meh, Smile } from 'lucide-react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useAnalytics } from '@/providers/analytics-provider'
import { cn } from '@/lib/utils'

interface SurveyConfig {
  id: string
  type: 'nps' | 'csat' | 'ces'
  trigger: 'time' | 'event' | 'exit'
  conditions?: {
    afterMinutes?: number
    afterEvent?: string
    minInteractions?: number
  }
  questions: SurveyQuestion[]
}

interface SurveyQuestion {
  id: string
  type: 'rating' | 'emoji' | 'text' | 'choice'
  question: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
}

export function SatisfactionSurvey({ config }: { config: SurveyConfig }) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [currentQuestion, setCurrentQuestion] = React.useState(0)
  const [responses, setResponses] = React.useState<Record<string, any>>({})
  const [hasSubmitted, setHasSubmitted] = React.useState(false)
  
  const [surveyHistory, setSurveyHistory] = useLocalStorage<Record<string, number>>(
    'survey-history',
    {}
  )
  
  const { trackEvent } = useAnalytics()
  
  const question = config.questions[currentQuestion]
  const isLastQuestion = currentQuestion === config.questions.length - 1
  
  // Check if should show survey
  React.useEffect(() => {
    const lastShown = surveyHistory[config.id] || 0
    const daysSinceLastShown = (Date.now() - lastShown) / (1000 * 60 * 60 * 24)
    
    // Don't show if shown in last 30 days
    if (daysSinceLastShown < 30) return
    
    // Check trigger conditions
    if (config.trigger === 'time' && config.conditions?.afterMinutes) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, config.conditions.afterMinutes * 60 * 1000)
      
      return () => clearTimeout(timer)
    }
    
    // Other trigger implementations...
  }, [config, surveyHistory])
  
  const handleResponse = (value: any) => {
    setResponses({ ...responses, [question.id]: value })
  }
  
  const handleNext = () => {
    if (isLastQuestion) {
      submitSurvey()
    } else {
      setCurrentQuestion(currentQuestion + 1)
    }
  }
  
  const handleSkip = () => {
    if (!question.required) {
      handleNext()
    }
  }
  
  const submitSurvey = async () => {
    try {
      // Submit to API
      await fetch('/api/feedback/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: config.id,
          type: config.type,
          responses,
          metadata: {
            url: window.location.href,
            timestamp: new Date().toISOString(),
          },
        }),
      })
      
      // Track completion
      trackEvent('Survey Completed', {
        category: 'Feedback',
        surveyId: config.id,
        surveyType: config.type,
      })
      
      // Update history
      setSurveyHistory({ ...surveyHistory, [config.id]: Date.now() })
      
      setHasSubmitted(true)
      
      // Hide after delay
      setTimeout(() => {
        setIsVisible(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to submit survey:', error)
    }
  }
  
  const handleDismiss = () => {
    setIsVisible(false)
    
    // Track dismissal
    trackEvent('Survey Dismissed', {
      category: 'Feedback',
      surveyId: config.id,
      questionIndex: currentQuestion,
    })
  }
  
  if (!isVisible) return null
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 z-50 w-full max-w-sm"
      >
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {hasSubmitted ? 'Thank you!' : 'Quick Question'}
              </CardTitle>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDismiss}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {hasSubmitted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                <Smile className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Your feedback helps us improve!
                </p>
              </motion.div>
            ) : (
              <>
                <CardDescription className="mb-4">
                  {question.question}
                </CardDescription>
                
                {question.type === 'rating' && (
                  <NPSRating
                    value={responses[question.id]}
                    onChange={handleResponse}
                  />
                )}
                
                {question.type === 'emoji' && (
                  <EmojiRating
                    value={responses[question.id]}
                    onChange={handleResponse}
                  />
                )}
                
                {question.type === 'text' && (
                  <Textarea
                    placeholder="Your feedback..."
                    value={responses[question.id] || ''}
                    onChange={(e) => handleResponse(e.target.value)}
                    rows={3}
                  />
                )}
                
                {question.type === 'choice' && question.options && (
                  <RadioGroup
                    value={responses[question.id]}
                    onValueChange={handleResponse}
                  >
                    {question.options.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value}>{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </>
            )}
          </CardContent>
          
          {!hasSubmitted && (
            <CardFooter className="flex justify-between">
              <div className="flex gap-1">
                {config.questions.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1.5 w-6 rounded-full transition-colors",
                      index === currentQuestion
                        ? "bg-primary"
                        : index < currentQuestion
                        ? "bg-primary/50"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
              
              <div className="flex gap-2">
                {!question.required && (
                  <Button variant="ghost" size="sm" onClick={handleSkip}>
                    Skip
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleNext}
                  disabled={question.required && !responses[question.id]}
                >
                  {isLastQuestion ? 'Submit' : 'Next'}
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

function NPSRating({ 
  value, 
  onChange 
}: { 
  value?: number
  onChange: (value: number) => void 
}) {
  return (
    <div className="flex justify-between gap-1">
      {[...Array(11)].map((_, i) => (
        <Button
          key={i}
          variant={value === i ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(i)}
          className="flex-1 p-0 h-10"
        >
          {i}
        </Button>
      ))}
    </div>
  )
}

function EmojiRating({ 
  value, 
  onChange 
}: { 
  value?: number
  onChange: (value: number) => void 
}) {
  const emojis = [
    { value: 1, icon: Frown, color: 'text-red-500' },
    { value: 2, icon: Meh, color: 'text-yellow-500' },
    { value: 3, icon: Smile, color: 'text-green-500' },
  ]
  
  return (
    <div className="flex justify-center gap-4">
      {emojis.map(({ value: v, icon: Icon, color }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            "p-3 rounded-lg transition-all",
            value === v
              ? "bg-primary/10 scale-110"
              : "hover:bg-muted"
          )}
        >
          <Icon className={cn("h-8 w-8", color)} />
        </button>
      ))}
    </div>
  )
}
```

### 5. Support Analytics Dashboard

#### Create `src/app/[locale]/admin/support/analytics/page.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { BarChart, LineChart, PieChart } from '@/components/charts'
import { useQuery } from '@tanstack/react-query'

export default function SupportAnalyticsPage() {
  const [dateRange, setDateRange] = React.useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })
  
  const { data: metrics } = useQuery({
    queryKey: ['support-metrics', dateRange],
    queryFn: () => fetchSupportMetrics(dateRange),
  })
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Support Analytics</h1>
        <DatePickerWithRange value={dateRange} onChange={setDateRange} />
      </div>
      
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Tickets"
          value={metrics?.totalTickets || 0}
          change={metrics?.ticketChange}
        />
        <MetricCard
          title="Avg Response Time"
          value={`${metrics?.avgResponseTime || 0}h`}
          change={metrics?.responseTimeChange}
        />
        <MetricCard
          title="Resolution Rate"
          value={`${metrics?.resolutionRate || 0}%`}
          change={metrics?.resolutionRateChange}
        />
        <MetricCard
          title="CSAT Score"
          value={`${metrics?.csatScore || 0}/5`}
          change={metrics?.csatChange}
        />
      </div>
      
      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tickets" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={metrics?.ticketVolume || []}
                  xKey="date"
                  yKeys={['created', 'resolved']}
                  height={300}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tickets by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={metrics?.ticketsByCategory || []}
                  dataKey="count"
                  nameKey="category"
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Response Time Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={metrics?.responseTimeDistribution || []}
                xKey="range"
                yKey="count"
                height={300}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Types</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={metrics?.feedbackTypes || []}
                  dataKey="count"
                  nameKey="type"
                  height={300}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Feature Request Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={metrics?.featureRequestTrends || []}
                  xKey="date"
                  yKeys={['requests', 'votes']}
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="satisfaction" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>NPS Score</CardTitle>
                <CardDescription>Net Promoter Score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{metrics?.npsScore || 0}</div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Promoters</span>
                    <span className="text-green-600">{metrics?.npsPromoters || 0}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Passives</span>
                    <span className="text-yellow-600">{metrics?.npsPassives || 0}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Detractors</span>
                    <span className="text-red-600">{metrics?.npsDetractors || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>CSAT Trend</CardTitle>
                <CardDescription>Customer Satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={metrics?.csatTrend || []}
                  xKey="date"
                  yKey="score"
                  height={200}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>CES Score</CardTitle>
                <CardDescription>Customer Effort Score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{metrics?.cesScore || 0}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Lower is better (1-5 scale)
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({ title, value, change }: any) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={cn(
            "text-xs mt-1",
            change > 0 ? "text-green-600" : "text-red-600"
          )}>
            {change > 0 ? '+' : ''}{change}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  )
}

async function fetchSupportMetrics(dateRange: any) {
  const params = new URLSearchParams({
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
  })
  const response = await fetch(`/api/admin/support/metrics?${params}`)
  return response.json()
}
```

## Testing & Verification

1. Test feedback widget submission
2. Verify ticket system workflow
3. Test feature voting mechanism
4. Check survey trigger conditions
5. Verify support analytics accuracy
6. Test multi-language support

## Success Indicators
- ✅ Feedback widget easily accessible
- ✅ Support tickets tracked efficiently
- ✅ Feature requests democratized
- ✅ User satisfaction measured
- ✅ Response times monitored
- ✅ Support analytics actionable

## Next Steps
Proceed to Story 6.4: Content Management System

## Notes
- Monitor feedback response rates
- Regular review of feature requests
- Automate common support responses
- Train support team on new system
- Set up SLA monitoring