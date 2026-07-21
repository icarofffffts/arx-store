'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  Mail,
  MessageSquare,
  Users,
  Ticket,
  ShoppingCart,
  Zap,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Lead {
  id: string
  name: string
  email: string | null
  discord_server: string | null
  discord_id: string | null
  bot_interest: string
  server_size: string | null
  message: string | null
  status: string
  source: string
  created_at: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'Novo', color: 'bg-blue-500/10 text-blue-500' },
  contacted: { label: 'Contactado', color: 'bg-yellow-500/10 text-yellow-500' },
  converted: { label: 'Convertido', color: 'bg-emerald-500/10 text-emerald-500' },
  lost: { label: 'Perdido', color: 'bg-gray-500/10 text-gray-500' },
}

const BOT_ICONS: Record<string, React.ReactNode> = {
  'arx-ticket': <Ticket className="h-4 w-4" />,
  'arx-shop': <ShoppingCart className="h-4 w-4" />,
  'both': <Zap className="h-4 w-4" />,
}

const BOT_LABELS: Record<string, string> = {
  'arx-ticket': 'ARX Ticket',
  'arx-shop': 'ARX Shop',
  'both': 'Os dois',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    try {
      const res = await fetch('/api/store/leads')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setLeads(data.leads || [])
    } catch (err) {
      console.error('Error fetching leads:', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(leadId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/store/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
      }
    } catch (err) {
      console.error('Error updating lead:', err)
    }
  }

  const filteredLeads = filterStatus === 'all' 
    ? leads 
    : leads.filter(l => l.status === filterStatus)

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="animate-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os interessados nos seus bots
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.new}</p>
                <p className="text-xs text-muted-foreground">Novos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.contacted}</p>
                <p className="text-xs text-muted-foreground">Contactados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold">{stats.converted}</p>
                <p className="text-xs text-muted-foreground">Convertidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Filtrar:</span>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="new">Novos</SelectItem>
            <SelectItem value="contacted">Contactados</SelectItem>
            <SelectItem value="converted">Convertidos</SelectItem>
            <SelectItem value="lost">Perdidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <Card className="glass flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum lead encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Compartilhe /demo para receber interessados
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead) => {
            const status = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new
            return (
              <Card key={lead.id} className="glass">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{lead.name}</p>
                        <Badge variant="secondary" className={cn('text-xs', status.color)}>
                          {status.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {BOT_ICONS[lead.bot_interest]}
                          <span className="ml-1">{BOT_LABELS[lead.bot_interest] || lead.bot_interest}</span>
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {lead.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </span>
                        )}
                        {lead.discord_server && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {lead.discord_server}
                          </span>
                        )}
                        {lead.discord_id && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {lead.discord_id}
                          </span>
                        )}
                        {lead.server_size && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {lead.server_size === 'small' ? 'Até 500' : lead.server_size === 'medium' ? '500-5k' : '5k+'}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {lead.message && (
                        <p className="text-sm text-muted-foreground bg-muted/50 rounded p-2">
                          {lead.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <Select
                        value={lead.status}
                        onValueChange={(v) => updateStatus(lead.id, v)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Novo</SelectItem>
                          <SelectItem value="contacted">Contactado</SelectItem>
                          <SelectItem value="converted">Convertido</SelectItem>
                          <SelectItem value="lost">Perdido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
