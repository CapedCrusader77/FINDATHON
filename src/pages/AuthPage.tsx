import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  Sparkles,
  Compass,
  Orbit,
  Moon,
  Activity,
  Layers,
  Check,
  Flame,
  Radio
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, Card, Badge } from '../components/ui'

/* ========================================================================== */
/* WEBGL2 KEPLER ORRERY ENGINE (90,000 SPECTRAL BODIES WITH RICH COSMIC COLOR) */
/* ========================================================================== */
const VS_SOURCE = `#version 300 es
precision highp float;

layout(location = 0) in vec4 aOrb1; // a, e, inc, node
layout(location = 1) in vec4 aOrb2; // peri, M0, n, seed

uniform float uTime;
uniform mat4 uViewProj;
uniform float uDPR;
uniform vec2 uViewport;

out vec4 vColor;
out float vAlpha;

void main() {
  float a    = aOrb1.x;
  float e    = aOrb1.y;
  float inc  = aOrb1.z;
  float node = aOrb1.w;

  float peri = aOrb2.x;
  float M0   = aOrb2.y;
  float n    = aOrb2.z;
  float seed = aOrb2.w;

  // Primary pulsar star pinned to origin
  if (seed < 0.0) {
    gl_Position = uViewProj * vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = uDPR * 28.0 * (26.0 / max(2.0, gl_Position.w));
    vColor = vec4(1.0, 0.96, 0.88, 1.0);
    vAlpha = 1.0;
    return;
  }

  // 1. Keplerian Mean Anomaly: M = M0 + n * t (Kepler's 3rd Law: n = 0.42 / a^1.5)
  float M = M0 + n * uTime;
  M = mod(M, 6.28318530718);

  // 2. Exact Kepler Equation Solver (Initial guess E = M + e*sin(M) + 4 Newton Steps)
  float E = M + e * sin(M);
  for (int i = 0; i < 4; i++) {
    float f = E - e * sin(E) - M;
    float fPrime = max(0.15, 1.0 - e * cos(E));
    E -= f / fPrime;
  }

  // 3. Orbital plane coordinates
  float xOrb = a * (cos(E) - e);
  float yOrb = a * sqrt(max(0.001, 1.0 - e * e)) * sin(E);

  // 4. Exact 3D Euler Sequence: Periapsis in plane -> Inclination (x) -> Ascending Node (z)
  float cosP = cos(peri);
  float sinP = sin(peri);
  float x1 = xOrb * cosP - yOrb * sinP;
  float y1 = xOrb * sinP + yOrb * cosP;

  float cosI = cos(inc);
  float sinI = sin(inc);
  float x2 = x1;
  float y2 = y1 * cosI;
  float z2 = y1 * sinI;

  float cosN = cos(node);
  float sinN = sin(node);
  float x3 = x2 * cosN - y2 * sinN;
  float y3 = x2 * sinN + y2 * cosN;
  float z3 = z2;

  vec4 worldPos = vec4(x3, y3, z3, 1.0);
  vec4 clipPos = uViewProj * worldPos;
  gl_Position = clipPos;

  // Star size & classification
  float big = (fract(seed * 71.3) < 0.02) ? 1.0 : 0.0;
  float superGiant = (fract(seed * 19.1) < 0.004) ? 1.0 : 0.0;
  float ptSize = (uDPR * 0.70) * (1.0 + big * 3.2 + superGiant * 5.5) * (26.0 / max(2.0, clipPos.w));
  gl_PointSize = max(1.0, min(ptSize, 36.0));

  // Depth fade cue: smoothstep on rotated z
  float depthFade = 0.60 + 0.40 * smoothstep(-1.8, 1.8, -worldPos.z);
  float baseAlpha = (0.22 + 0.58 * fract(seed * 13.7)) * (1.0 + big * 2.0) * depthFade;

  // Radiant Spectral Star Colors: Nebula Blue -> Stellar Violet -> Solar Gold -> Supernova Pink
  float colorSeed = fract(seed * 4.31);
  vec3 dustColor;
  if (colorSeed < 0.28) {
    dustColor = mix(vec3(0.38, 0.72, 1.0), vec3(0.60, 0.45, 1.0), colorSeed / 0.28); // Blue to Violet
  } else if (colorSeed < 0.65) {
    dustColor = mix(vec3(0.60, 0.45, 1.0), vec3(1.0, 0.75, 0.35), (colorSeed - 0.28) / 0.37); // Violet to Solar Gold
  } else if (colorSeed < 0.88) {
    dustColor = mix(vec3(1.0, 0.75, 0.35), vec3(1.0, 0.45, 0.60), (colorSeed - 0.65) / 0.23); // Gold to Aurora Pink
  } else {
    dustColor = mix(vec3(1.0, 0.45, 0.60), vec3(0.30, 0.95, 0.75), (colorSeed - 0.88) / 0.12); // Pink to Cyan Starlight
  }

  if (big > 0.5) {
    dustColor = vec3(1.0, 0.84, 0.45); // Solar Gold Amber
  }
  if (superGiant > 0.5) {
    dustColor = vec3(1.0, 0.40, 0.30); // Supergiant Torch Red
  }

  vColor = vec4(dustColor, 1.0);
  vAlpha = min(1.0, baseAlpha);
}
`

const FS_SOURCE = `#version 300 es
precision highp float;

in vec4 vColor;
in float vAlpha;
out vec4 fragColor;

void main() {
  float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
  if (d > 1.0) discard;

  // Blazing core plus luminous celestial halo
  float intensity = exp(-d * 6.5) + exp(-d * 1.6) * 0.38;
  fragColor = vec4(vColor.rgb, vAlpha * intensity);
}
`

function WebGLOrrery({ speedMultiplier = 1.0 }: { speedMultiplier?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false
    })
    if (!gl) return

    const createShader = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const vs = createShader(gl.VERTEX_SHADER, VS_SOURCE)
    const fs = createShader(gl.FRAGMENT_SHADER, FS_SOURCE)
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const uTimeLoc = gl.getUniformLocation(prog, 'uTime')
    const uViewProjLoc = gl.getUniformLocation(prog, 'uViewProj')
    const uDPRLoc = gl.getUniformLocation(prog, 'uDPR')
    const uViewportLoc = gl.getUniformLocation(prog, 'uViewport')

    const isMobile = window.innerWidth < 640
    const isTablet = window.innerWidth < 1024
    const N = isMobile ? 24000 : isTablet ? 50000 : 90000

    // 5 distinct Keplerian bands with gaps
    const bands = [
      { weight: 0.16, aMin: 0.9, aMax: 1.35, maxE: 0.05, maxI: 0.030 },
      { weight: 0.24, aMin: 1.7, aMax: 2.35, maxE: 0.09, maxI: 0.055 },
      { weight: 0.30, aMin: 2.9, aMax: 3.9, maxE: 0.14, maxI: 0.090 },
      { weight: 0.14, aMin: 4.6, aMax: 5.4, maxE: 0.10, maxI: 0.320 },
      { weight: 0.16, aMin: 6.3, aMax: 8.6, maxE: 0.26, maxI: 0.240 }
    ]

    const orb1Data = new Float32Array(N * 4)
    const orb2Data = new Float32Array(N * 4)

    // Primary central body pinned at (0,0,0)
    orb1Data[0] = 0.0; orb1Data[1] = 0.0; orb1Data[2] = 0.0; orb1Data[3] = 0.0
    orb2Data[0] = 0.0; orb2Data[1] = 0.0; orb2Data[2] = 0.0; orb2Data[3] = -1.0

    let offset = 1
    for (let b = 0; b < bands.length; b++) {
      const band = bands[b]
      const count = Math.floor((N - 1) * band.weight)
      for (let i = 0; i < count && offset < N; i++) {
        const u1 = Math.random()
        const u2 = Math.random()
        const u3 = Math.random()
        const u4 = Math.random()

        const a = band.aMin + u3 * (band.aMax - band.aMin)
        const e = Math.abs(u1 + u2 - 1.0) * band.maxE
        const inc = (u1 + u2 - 1.0) * band.maxI
        const node = u4 * Math.PI * 2.0

        const peri = Math.random() * Math.PI * 2.0
        const M0 = Math.random() * Math.PI * 2.0
        const n = 0.42 / Math.pow(a, 1.5)
        const seed = Math.random() * 1000.0

        const idx = offset * 4
        orb1Data[idx] = a
        orb1Data[idx + 1] = e
        orb1Data[idx + 2] = inc
        orb1Data[idx + 3] = node

        orb2Data[idx] = peri
        orb2Data[idx + 1] = M0
        orb2Data[idx + 2] = n
        orb2Data[idx + 3] = seed

        offset++
      }
    }

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    const vbo1 = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo1)
    gl.bufferData(gl.ARRAY_BUFFER, orb1Data, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0)

    const vbo2 = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo2)
    gl.bufferData(gl.ARRAY_BUFFER, orb2Data, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(1)
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    gl.disable(gl.DEPTH_TEST)

    let yaw = 0.50
    let pitch = 0.98
    let yawVel = 0.0025
    let pitchVel = 0.0
    let isDragging = false
    let lastX = 0
    let lastY = 0

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true
      lastX = e.clientX
      lastY = e.clientY
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY

      yawVel = dx * 0.003
      pitchVel = dy * 0.003
      yaw += yawVel
      pitch = Math.max(0.16, Math.min(Math.PI - 0.16, pitch + pitchVel))
    }
    const onPointerUp = () => {
      isDragging = false
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    let simTime = 0.0
    let lastTimestamp = performance.now()
    let animId: number

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTimestamp) / 1000.0)
      lastTimestamp = now
      simTime += dt * speedMultiplier

      if (!isDragging) {
        const decay = Math.pow(0.0016, dt)
        yawVel = yawVel * (1.0 - (1.0 - decay) * 0.4) + 0.00035
        pitchVel *= decay
        yaw += yawVel
        pitch = Math.max(0.16, Math.min(Math.PI - 0.16, pitch + pitchVel + (0.98 - pitch) * 0.02))
      }

      const w = window.innerWidth
      const h = window.innerHeight
      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1.5, 2.0, Math.sqrt(2600000 / (w * h))))
      const targetW = Math.floor(w * dpr)
      const targetH = Math.floor(h * dpr)

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW
        canvas.height = targetH
        gl.viewport(0, 0, targetW, targetH)
      }

      const aspect = w / h
      const fov = 45.0 * (Math.PI / 180.0)
      const near = 0.1
      const far = 100.0
      const f = 1.0 / Math.tan(fov / 2.0)

      const proj = new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) / (near - far), -1,
        0, 0, (2.0 * far * near) / (near - far), 0
      ])

      const dist = 16.5
      const cx = dist * Math.sin(pitch) * Math.sin(yaw)
      const cy = dist * Math.cos(pitch)
      const cz = dist * Math.sin(pitch) * Math.cos(yaw)

      const zAxis = [cx / dist, cy / dist, cz / dist]
      const up = [0, 1, 0]
      let rx = up[1] * zAxis[2] - up[2] * zAxis[1]
      let ry = up[2] * zAxis[0] - up[0] * zAxis[2]
      let rz = up[0] * zAxis[1] - up[1] * zAxis[0]
      const rLen = Math.sqrt(rx * rx + ry * ry + rz * rz)
      rx /= rLen; ry /= rLen; rz /= rLen

      const ux = zAxis[1] * rz - zAxis[2] * ry
      const uy = zAxis[2] * rx - zAxis[0] * rz
      const uz = zAxis[0] * ry - zAxis[1] * rx

      const view = [
        rx, ux, zAxis[0], 0,
        ry, uy, zAxis[1], 0,
        rz, uz, zAxis[2], 0,
        -(rx * cx + ry * cy + rz * cz),
        -(ux * cx + uy * cy + uz * cz),
        -(zAxis[0] * cx + zAxis[1] * cy + zAxis[2] * cz),
        1
      ]

      const vp = new Float32Array(16)
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          let sum = 0
          for (let k = 0; k < 4; k++) sum += proj[k * 4 + i] * view[j * 4 + k]
          vp[j * 4 + i] = sum
        }
      }

      gl.clearColor(0.0, 0.0, 0.0, 0.0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(prog)
      gl.uniform1f(uTimeLoc, simTime)
      gl.uniform1f(uDPRLoc, dpr)
      gl.uniform2f(uViewportLoc, w, h)
      gl.uniformMatrix4fv(uViewProjLoc, false, vp)

      gl.bindVertexArray(vao)
      gl.drawArrays(gl.POINTS, 0, N)

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      cancelAnimationFrame(animId)
    }
  }, [speedMultiplier])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 h-full w-full cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    />
  )
}

/* ========================================================================== */
/* REAL-TIME ASTRONOMICAL EPHEMERIS HOOK                                      */
/* ========================================================================== */
function useEphemeris() {
  const [now, setNow] = useState(Date.now())
  const [seeing, setSeeing] = useState(1.35)

  useEffect(() => {
    const clockTimer = setInterval(() => setNow(Date.now()), 1000)
    const seeingTimer = setInterval(() => {
      setSeeing(prev => {
        const delta = (Math.random() - 0.5) * 0.20
        return Math.max(1.0, Math.min(2.1, Number((prev + delta).toFixed(2))))
      })
    }, 3000)

    return () => {
      clearInterval(clockTimer)
      clearInterval(seeingTimer)
    }
  }, [])

  const jd = now / 86400000 + 2440587.5
  const T = (jd - 2451545.0) / 36525.0

  const rawGmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T
  const gmstDeg = ((rawGmst % 360) + 360) % 360
  const gmstHoursTotal = (gmstDeg / 360) * 24
  const gHours = Math.floor(gmstHoursTotal)
  const gMinutes = Math.floor((gmstHoursTotal - gHours) * 60)
  const gSeconds = Math.floor(((gmstHoursTotal - gHours) * 60 - gMinutes) * 60)
  const siderealStr = `${String(gHours).padStart(2, '0')}:${String(gMinutes).padStart(2, '0')}:${String(gSeconds).padStart(2, '0')}`

  const moonAge = ((jd - 2451550.1) % 29.530588853 + 29.530588853) % 29.530588853
  const moonPhases = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent'
  ]
  const moonPhaseIndex = Math.floor((moonAge / 29.530588853) * 8) % 8
  const moonPhaseName = moonPhases[moonPhaseIndex]

  return {
    sidereal: siderealStr,
    moonPhase: moonPhaseName,
    moonAge: moonAge.toFixed(1),
    seeing: seeing.toFixed(2),
    bodiesCount: '90,000'
  }
}

/* ========================================================================== */
/* POLISHED COSMIC ASTRONOMICAL AUTHENTICATION PAGE                           */
/* ========================================================================== */
export default function AuthPage({ onAuthenticated }: { onAuthenticated?: () => void }) {
  const { login, signup, forgotPassword } = useAuth()
  const ephemeris = useEphemeris()

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const quickRoles = [
    { title: 'Chief Astrometer', email: 'alex.morgan@workspace.io', pass: 'password123', badge: 'Full Admin', tone: 'gold' },
    { title: 'Meridian Transit', email: 'jordan.lee@storage.dev', pass: 'analyst2026', badge: 'Analyst', tone: 'cyan' }
  ]

  const handleQuickFill = (role: typeof quickRoles[0]) => {
    setEmail(role.email)
    setPassword(role.pass)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (mode === 'signin') {
        const res = await login(email, password, rememberMe)
        if (!res.success) setError(res.error || 'Authentication failed.')
        else onAuthenticated?.()
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.')
          setLoading(false)
          return
        }
        const res = await signup(name, email, password)
        if (!res.success) setError(res.error || 'Registration failed.')
        else onAuthenticated?.()
      } else {
        const res = await forgotPassword(email)
        if (!res.success) setError(res.error || 'Password reset request failed.')
        else setSuccessMessage(res.message || 'Check your inbox for reset instructions.')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLaunch = async () => {
    setLoading(true)
    await login('alex.morgan@workspace.io', 'password123', true)
    setLoading(false)
    onAuthenticated?.()
  }

  return (
    <div className="relative min-h-screen w-full bg-[#03050a] text-[#f1f5f9] font-sans selection:bg-[#fbbf24]/30 selection:text-[#fbbf24] flex flex-col justify-between overflow-x-hidden">
      {/* 1. Raw WebGL2 90,000 Keplerian Orbits Canvas */}
      <WebGLOrrery speedMultiplier={1.0} />

      {/* 2. Cosmic Aurora Gradient Overlay & Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 20% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 70%),
            radial-gradient(ellipse 60% 60% at 80% 80%, rgba(245, 158, 11, 0.14) 0%, transparent 70%),
            radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.06) 0%, transparent 60%),
            radial-gradient(circle at 50% 50%, rgba(3, 5, 10, 0.15) 0%, rgba(3, 5, 10, 0.72) 55%, #03050a 95%)
          `
        }}
      />

      {/* 3. Top Observatory Navigation & Telemetry HUD */}
      <header className="relative z-10 flex h-16 items-center justify-between border-b border-white/[0.08] px-6 sm:px-12 bg-[#03050a]/70 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#f59e0b] via-[#fbbf24] to-[#f97316] text-[#05060b] shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Orbit size={18} />
          </div>
          <div>
            <span className="font-display font-black text-base tracking-tight bg-gradient-to-r from-white via-[#fef08a] to-[#fbbf24] bg-clip-text text-transparent">
              Dedupe<span className="text-[#fbbf24]">IQ</span>
            </span>
            <span className="ml-2 text-[9px] uppercase font-mono tracking-widest text-[#94a3b8]">
              Kepler 90k Edition
            </span>
          </div>
        </div>

        {/* Live Ephemeris Telemetry HUD */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] font-mono text-[#94a3b8] border border-amber-500/20 bg-[#070b14]/85 px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.08)]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#f43f5e] animate-pulse shadow-[0_0_8px_#f43f5e]" />
            <span className="text-[#f8fafc] font-bold">Bodies: {ephemeris.bodiesCount}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <Activity size={12} className="text-[#fbbf24]" />
            <span>Sidereal: </span>
            <strong className="text-[#fbbf24]">{ephemeris.sidereal}</strong>
          </div>
          <span className="text-slate-700">|</span>
          <div>
            <span>Seeing: </span>
            <strong className="text-[#38bdf8]">{ephemeris.seeing}″</strong>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1">
            <Moon size={12} className="text-[#c084fc]" />
            <strong className="text-[#e2e8f0]">{ephemeris.moonPhase} ({ephemeris.moonAge}d)</strong>
          </div>
        </div>

        {/* Instant Launch Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGuestLaunch}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold text-[#05060b] bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#fbbf24] hover:from-[#fef08a] hover:to-[#f59e0b] px-4 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.45)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Zap size={14} className="fill-[#05060b]" />
            <span>Instant Demo</span>
          </button>
        </div>
      </header>

      {/* 4. Main Atmospheric Centerpiece */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-14 items-center">
          {/* Left Column: Shimmering Headline & Kepler Engine Highlights */}
          <div className="hidden lg:flex flex-col space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-mono font-bold tracking-wider text-[#fbbf24] mb-3.5 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                <Flame size={13} className="text-[#f59e0b]" />
                <span>KEPLER MULTI-MODAL INTELLIGENCE</span>
              </div>

              <h1 className="text-4xl xl:text-5xl font-black tracking-tight font-display leading-[1.12]">
                <span className="text-white">Ninety thousand orbits.</span> <br />
                <span className="bg-gradient-to-r from-[#fbbf24] via-[#f472b6] to-[#c084fc] bg-clip-text text-transparent drop-shadow-sm">
                  Zero duplicate drift.
                </span>
              </h1>

              <p className="mt-4 text-xs text-[#94a3b8] leading-relaxed max-w-lg">
                Discover duplicate files, downscaled camera photos, and multi-format document drafts structured like a celestial orbital system. 100% computed on-device with mathematical certainty.
              </p>
            </div>

            {/* Interactive Mechanics HUD Card */}
            <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-br from-[#0c101d]/85 via-[#070a14]/90 to-[#120f1e]/85 p-5 space-y-3.5 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between text-xs border-b border-white/[0.08] pb-3">
                <span className="text-[#cbd5e1] flex items-center gap-2 font-medium">
                  <Compass size={14} className="text-[#fbbf24]" />
                  <span>Interactive 3D Celestial Sphere:</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-[#38bdf8] flex items-center gap-1">
                  <Radio size={12} className="text-[#38bdf8] animate-pulse" />
                  <span>Drag sky to navigate</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-[11px] font-mono">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] hover:border-amber-500/30 transition-colors">
                  <p className="text-white font-bold text-xs">5 Bands</p>
                  <p className="mt-0.5 text-[10px] text-[#94a3b8]">Gapped Belts</p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] hover:border-violet-500/30 transition-colors">
                  <p className="text-[#c084fc] font-bold text-xs">n = 0.42/a^1.5</p>
                  <p className="mt-0.5 text-[10px] text-[#94a3b8]">3rd Law Motion</p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] hover:border-emerald-500/30 transition-colors">
                  <p className="text-[#34d399] font-bold text-xs">4 Newton Steps</p>
                  <p className="mt-0.5 text-[10px] text-[#94a3b8]">Smooth Traversal</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Grade Authentication Deck */}
          <div className="w-full max-w-md mx-auto">
            <Card className="p-6 sm:p-8 bg-gradient-to-b from-[#0e1322]/95 via-[#0a0d18]/95 to-[#120e20]/95 border-white/[0.14] shadow-[0_0_50px_-10px_rgba(245,158,11,0.2)] backdrop-blur-2xl rounded-2xl">
              {/* Tab Selector */}
              <div className="mb-6">
                {mode !== 'forgot' ? (
                  <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/[0.1] bg-[#05070e] p-1 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin')
                        setError(null)
                        setSuccessMessage(null)
                      }}
                      className={`rounded-lg py-2 font-bold transition-all ${
                        mode === 'signin'
                          ? 'bg-gradient-to-r from-[#1e2638] to-[#252038] text-[#fbbf24] shadow-sm border border-amber-400/30'
                          : 'text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup')
                        setError(null)
                        setSuccessMessage(null)
                      }}
                      className={`rounded-lg py-2 font-bold transition-all ${
                        mode === 'signup'
                          ? 'bg-gradient-to-r from-[#1e2638] to-[#252038] text-[#fbbf24] shadow-sm border border-amber-400/30'
                          : 'text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      New Observer
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#f43f5e] font-bold">Recovery Mode</span>
                      <h2 className="text-base font-bold text-white mt-0.5">Reset Session Key</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin')
                        setError(null)
                        setSuccessMessage(null)
                      }}
                      className="text-xs text-[#fbbf24] hover:underline font-mono"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                )}
              </div>

              {/* Notification Alerts */}
              {error && (
                <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/15 p-3 text-xs text-rose-200 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#f43f5e] shrink-0 shadow-[0_0_6px_#f43f5e]" />
                  <span>{error}</span>
                </div>
              )}
              {successMessage && (
                <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3 text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form Input Fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 font-mono">Observer Full Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-3 text-[#94a3b8]" />
                      <input
                        type="text"
                        placeholder="Dr. Alex Morgan"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.12] bg-[#05070e] pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24]"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 font-mono">Workstation Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-3 text-[#94a3b8]" />
                    <input
                      type="email"
                      placeholder="alex.morgan@workspace.io"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.12] bg-[#05070e] pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24]"
                      required
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-300 font-mono">Security Passkey</label>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-[10px] text-[#fbbf24] hover:underline font-mono"
                        >
                          Forgot passkey?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-3 text-[#94a3b8]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.12] bg-[#05070e] pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-[#94a3b8] hover:text-white"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 font-mono">Confirm Passkey</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-3 text-[#94a3b8]" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.12] bg-[#05070e] pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] font-mono"
                        required
                      />
                    </div>
                  </div>
                )}

                {mode === 'signin' && (
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 text-xs text-[#94a3b8] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-white/[0.2] bg-[#05070e] text-[#fbbf24] focus:ring-[#fbbf24] cursor-pointer accent-[#fbbf24]"
                      />
                      <span className="text-[11px] font-mono">Persist Observatory Session</span>
                    </label>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="md"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#fbbf24] hover:from-[#fef08a] hover:to-[#f59e0b] text-[#05060b] font-extrabold text-xs h-10 shadow-[0_0_25px_rgba(245,158,11,0.35)] cursor-pointer"
                  >
                    {loading ? (
                      'Aligning Coordinates...'
                    ) : mode === 'signin' ? (
                      'Open Observatory Session'
                    ) : mode === 'signup' ? (
                      'Register Observatory Key'
                    ) : (
                      'Send Reset Instructions'
                    )}
                    <ArrowRight size={14} className="stroke-[2.5]" />
                  </Button>
                </div>
              </form>

              {/* Fast Preset Observer Chips */}
              {mode === 'signin' && (
                <div className="mt-5 pt-4 border-t border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-[#94a3b8] font-mono">
                    <span>⚡ Quick Preset Keys:</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {quickRoles.map(role => (
                      <button
                        key={role.title}
                        type="button"
                        onClick={() => handleQuickFill(role)}
                        className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#05070e] px-3 py-2 text-left hover:border-amber-400/50 hover:bg-[#121624] transition-all group cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-white group-hover:text-[#fbbf24] transition-colors truncate">
                            {role.title}
                          </p>
                          <p className="text-[9px] text-[#94a3b8] font-mono truncate">{role.badge}</p>
                        </div>
                        <span className="text-[10px] text-[#64748b] group-hover:text-[#fbbf24] font-mono shrink-0 pl-1 font-bold">fill</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* 5. Minimalist Observatory Footer */}
      <footer className="relative z-10 flex h-12 items-center justify-between border-t border-white/[0.08] px-6 sm:px-12 text-[10px] text-[#94a3b8] font-mono bg-[#03050a]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f43f5e] shadow-[0_0_6px_#f43f5e]" />
          <span>KEPLER 90k ENGINE · Pure Local Geometry</span>
        </div>
        <span className="hidden sm:inline">GMST {ephemeris.sidereal} · Seeing {ephemeris.seeing}″ · Bortle 4</span>
      </footer>
    </div>
  )
}
