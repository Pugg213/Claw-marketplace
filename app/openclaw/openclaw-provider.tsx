'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

type WsStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

type ServerEntry = {
  id: string
  name: string
  serverUrl: string
  token: string
  connectedAt: string
  status?: string
}

type AgentInfo = {
  id: string
  name: string
  status: string
  tasks_per_sec?: number
  cpu?: number
  ram?: number
  uptime?: number
  error?: string
}

type Metrics = {
  total_agents?: number
  active_agents?: number
  cpu_avg?: number
  ram_used?: number
  ram_total?: number
  uptime?: number
}

type OpenClawCtx = {
  servers: ServerEntry[]
  activeServerId: string | null
  connection: ServerEntry | undefined

  isConnected: boolean
  wsStatus: WsStatus
  gatewayInfo: any
  agents: AgentInfo[]
  metrics: Metrics | null

  addServer: (name: string, serverUrl: string, token: string) => Promise<{ success: boolean; error?: string }>
  switchServer: (id: string) => void
  removeServer: (id: string) => void
  disconnectAll: () => void

  fetchAgents: () => Promise<void>
  startAgent: (agentId: string) => Promise<{ success: boolean; error?: string }>
  stopAgent: (agentId: string) => Promise<{ success: boolean; error?: string }>
  restartAgent: (agentId: string) => Promise<{ success: boolean; error?: string }>

  // low-level
  sendWsMessage: (method: string, params?: any) => Promise<any>
}

const SERVERS_KEY = 'openclaw-servers'
const ACTIVE_SERVER_KEY = 'openclaw-active-server'

const MSG_TYPE = {
  REQUEST: 'req',
  RESPONSE: 'res',
  EVENT: 'event',
} as const

const Ctx = createContext<OpenClawCtx | null>(null)

function normalizeHttpUrl(input: string) {
  let url = input.trim()
  if (!url) return ''
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('ws://') && !url.startsWith('wss://')) {
    url = 'https://' + url
  }
  url = url.replace(/\/$/, '')
  return url
}

function toWsUrl(url: string) {
  if (url.startsWith('wss://') || url.startsWith('ws://')) return url
  return url.replace('https://', 'wss://').replace('http://', 'ws://')
}

export function OpenClawProvider({ children }: { children: React.ReactNode }) {
  const [servers, setServers] = useState<ServerEntry[]>([])
  const [activeServerId, setActiveServerId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [wsStatus, setWsStatus] = useState<WsStatus>('disconnected')
  const [gatewayInfo, setGatewayInfo] = useState<any>(null)
  const [agents, setAgents] = useState<AgentInfo[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<any>(null)
  const pendingRequestsRef = useRef(new Map<string, { resolve: any; reject: any; timeout: any }>())
  const requestIdRef = useRef(0)

  useEffect(() => {
    try {
      const savedServers = localStorage.getItem(SERVERS_KEY)
      const savedActiveId = localStorage.getItem(ACTIVE_SERVER_KEY)
      if (savedServers) {
        const parsed = JSON.parse(savedServers)
        if (Array.isArray(parsed)) setServers(parsed)
        if (savedActiveId && parsed.find((s: any) => s.id === savedActiveId)) {
          setActiveServerId(savedActiveId)
          setIsConnected(true)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const connection = useMemo(() => servers.find(s => s.id === activeServerId), [servers, activeServerId])

  const saveServers = useCallback((next: ServerEntry[]) => {
    localStorage.setItem(SERVERS_KEY, JSON.stringify(next))
    setServers(next)
  }, [])

  const getRequestId = () => {
    requestIdRef.current += 1
    return `req_${Date.now()}_${requestIdRef.current}`
  }

  const sendWsMessage = useCallback((method: string, params: any = {}) => {
    return new Promise<any>((resolve, reject) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'))
        return
      }

      const id = getRequestId()
      const message = { type: MSG_TYPE.REQUEST, id, method, params }

      pendingRequestsRef.current.set(id, { resolve, reject, timeout: null })

      const timeout = setTimeout(() => {
        const pending = pendingRequestsRef.current.get(id)
        if (pending) {
          pendingRequestsRef.current.delete(id)
          reject(new Error(`Request ${method} timed out`))
        }
      }, 30000)

      const obj = pendingRequestsRef.current.get(id)
      if (obj) obj.timeout = timeout

      wsRef.current.send(JSON.stringify(message))
    })
  }, [])

  const handleGatewayEvent = useCallback((event: any) => {
    const eventName = event.event
    const payload = event.payload

    switch (eventName) {
      case 'agent.status':
        setAgents(prev =>
          prev.map(a => (a.id === payload.agentId ? { ...a, status: payload.status, ...(payload.metrics || {}) } : a))
        )
        break
      case 'agent.metrics':
        setAgents(prev =>
          prev.map(a =>
            a.id === payload.agentId
              ? { ...a, cpu: payload.cpu, ram: payload.memory, tasks_per_sec: payload.tasksPerSec }
              : a
          )
        )
        break
      case 'agent.error':
        setAgents(prev =>
          prev.map(a => (a.id === payload.agentId ? { ...a, status: 'error', error: payload.message } : a))
        )
        break
      case 'system.metrics':
        setMetrics(prev => ({
          ...(prev || {}),
          cpu_avg: payload.cpu,
          ram_used: payload.memoryUsed,
          ram_total: payload.memoryTotal,
        }))
        break
      default:
        break
    }
  }, [])

  const handleWsMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as any)

        if (data.type === MSG_TYPE.RESPONSE && data.id) {
          const pending = pendingRequestsRef.current.get(data.id)
          if (pending) {
            clearTimeout(pending.timeout)
            pendingRequestsRef.current.delete(data.id)
            if (data.ok) pending.resolve(data.payload)
            else pending.reject(new Error(data.payload?.message || 'Request failed'))
          }
        }

        if (data.type === MSG_TYPE.EVENT) {
          handleGatewayEvent(data)
        }
      } catch (e) {
        console.error('WS message parse failed', e)
      }
    },
    [handleGatewayEvent]
  )

  const fetchAgentsViaWs = useCallback(async () => {
    if (wsStatus !== 'connected') return
    const result = await sendWsMessage('agent.list', {})
    if (result?.agents) {
      const formatted: AgentInfo[] = result.agents.map((agent: any) => ({
        id: agent.id || agent.agentId,
        name: agent.name || agent.id,
        status: agent.status || 'unknown',
        tasks_per_sec: agent.metrics?.tasksPerSec || 0,
        cpu: agent.metrics?.cpu || 0,
        ram: agent.metrics?.memory || 0,
        uptime: agent.metrics?.uptime || 0,
        error: agent.error,
      }))
      setAgents(formatted)
      const running = formatted.filter(a => a.status === 'running').length
      setMetrics(prev => ({ ...(prev || {}), total_agents: formatted.length, active_agents: running }))
    }
  }, [sendWsMessage, wsStatus])

  const subscribeToEvents = useCallback(async () => {
    await sendWsMessage('events.subscribe', {
      events: ['agent.status', 'agent.metrics', 'agent.error', 'agent.log', 'system.metrics'],
    })
  }, [sendWsMessage])

  const connectWebSocket = useCallback(
    async (server: ServerEntry) => {
      if (wsRef.current) wsRef.current.close()
      setWsStatus('connecting')

      const wsUrl = toWsUrl(server.serverUrl)

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        const handshake = {
          type: MSG_TYPE.REQUEST,
          id: getRequestId(),
          method: 'connect',
          params: {
            minProtocol: 3,
            maxProtocol: 3,
            client: {
              id: 'openclaw-dashboard',
              version: '2.0.0',
              platform: 'web',
              mode: 'operator',
            },
            role: 'operator',
            scopes: ['operator.read', 'operator.write', 'agent.read', 'agent.write'],
            auth: { token: server.token },
          },
        }
        ws.send(JSON.stringify(handshake))
      }

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data as any)
          if (data.type === MSG_TYPE.RESPONSE && data.payload?.type === 'hello-ok') {
            setWsStatus('connected')
            setGatewayInfo(data.payload.gateway)
            void fetchAgentsViaWs()
            void subscribeToEvents()
          } else {
            handleWsMessage(ev)
          }
        } catch (e) {
          console.error('WS onmessage parse error', e)
        }
      }

      ws.onerror = () => {
        setWsStatus('error')
      }

      ws.onclose = (event) => {
        setWsStatus('disconnected')
        wsRef.current = null
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (activeServerId === server.id) void connectWebSocket(server)
          }, 5000)
        }
      }
    },
    [activeServerId, fetchAgentsViaWs, handleWsMessage, subscribeToEvents]
  )

  const addServer = useCallback(
    async (name: string, serverUrl: string, token: string) => {
      try {
        const normalized = normalizeHttpUrl(serverUrl)
        if (!normalized) return { success: false, error: 'Server URL required' }
        if (!token?.trim()) return { success: false, error: 'Token required' }

        const newServer: ServerEntry = {
          id: `server-${Date.now()}`,
          name: name || normalized.replace(/https?:\/\//, '').split(/[/:]/)[0],
          serverUrl: normalized,
          token: token.trim(),
          connectedAt: new Date().toISOString(),
          status: 'connecting',
        }

        const updated = [...servers, newServer]
        saveServers(updated)
        setActiveServerId(newServer.id)
        localStorage.setItem(ACTIVE_SERVER_KEY, newServer.id)
        setIsConnected(true)

        void connectWebSocket(newServer)
        return { success: true }
      } catch (e: any) {
        return { success: false, error: e.message || 'Failed' }
      }
    },
    [connectWebSocket, saveServers, servers]
  )

  const switchServer = useCallback(
    (id: string) => {
      const server = servers.find(s => s.id === id)
      if (!server) return
      if (wsRef.current) wsRef.current.close()
      setActiveServerId(id)
      localStorage.setItem(ACTIVE_SERVER_KEY, id)
      setIsConnected(true)
      void connectWebSocket(server)
    },
    [connectWebSocket, servers]
  )

  const removeServer = useCallback(
    (id: string) => {
      const updated = servers.filter(s => s.id !== id)
      saveServers(updated)
      if (activeServerId === id) {
        if (wsRef.current) wsRef.current.close()
        if (updated.length > 0) {
          const first = updated[0]
          setActiveServerId(first.id)
          localStorage.setItem(ACTIVE_SERVER_KEY, first.id)
          setIsConnected(true)
          void connectWebSocket(first)
        } else {
          setActiveServerId(null)
          localStorage.removeItem(ACTIVE_SERVER_KEY)
          setIsConnected(false)
          setAgents([])
          setMetrics(null)
        }
      }
    },
    [activeServerId, connectWebSocket, saveServers, servers]
  )

  const disconnectAll = useCallback(() => {
    if (wsRef.current) wsRef.current.close()
    setServers([])
    setActiveServerId(null)
    setIsConnected(false)
    setAgents([])
    setMetrics(null)
    setWsStatus('disconnected')
    localStorage.removeItem(SERVERS_KEY)
    localStorage.removeItem(ACTIVE_SERVER_KEY)
  }, [])

  const fetchAgents = useCallback(async () => {
    if (!connection) return
    if (wsStatus === 'connected') await fetchAgentsViaWs()
  }, [connection, fetchAgentsViaWs, wsStatus])

  const startAgent = useCallback(
    async (agentId: string) => {
      if (wsStatus !== 'connected') return { success: false, error: 'Not connected' }
      try {
        await sendWsMessage('agent.start', { agentId })
        return { success: true }
      } catch (e: any) {
        return { success: false, error: e.message }
      }
    },
    [sendWsMessage, wsStatus]
  )

  const stopAgent = useCallback(
    async (agentId: string) => {
      if (wsStatus !== 'connected') return { success: false, error: 'Not connected' }
      try {
        await sendWsMessage('agent.stop', { agentId })
        return { success: true }
      } catch (e: any) {
        return { success: false, error: e.message }
      }
    },
    [sendWsMessage, wsStatus]
  )

  const restartAgent = useCallback(
    async (agentId: string) => {
      if (wsStatus !== 'connected') return { success: false, error: 'Not connected' }
      try {
        await sendWsMessage('agent.restart', { agentId })
        return { success: true }
      } catch (e: any) {
        return { success: false, error: e.message }
      }
    },
    [sendWsMessage, wsStatus]
  )

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close()
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (connection && isConnected && wsStatus === 'disconnected') {
      void connectWebSocket(connection)
    }
  }, [connection, connectWebSocket, isConnected, wsStatus])

  const value: OpenClawCtx = {
    servers,
    activeServerId,
    connection,
    isConnected,
    wsStatus,
    gatewayInfo,
    agents,
    metrics,
    addServer,
    switchServer,
    removeServer,
    disconnectAll,
    fetchAgents,
    startAgent,
    stopAgent,
    restartAgent,
    sendWsMessage,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useOpenClaw() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useOpenClaw must be used inside OpenClawProvider')
  return ctx
}
