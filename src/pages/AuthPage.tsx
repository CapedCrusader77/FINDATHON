import React, { useState, useEffect, useRef, useMemo } from 'react'
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
  RotateCcw,
  Orbit,
  Moon,
  Wind,
  Layers,
  Check
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, Card, Badge } from '../components/ui'

/* ========================================================================== */
/* WEBGL2 KEPLER ORRERY ENGINE (90,000 BODIES ON EXACT KEPLER ORBITS)         */
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

  // Primary star pinned to origin
  if (seed < 0.0) {
    gl_Position = uViewProj * vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = uDPR * 26.0 * (26.0 / max(2.0, gl_Position.w));
    vColor = vec4(1.0, 0.98, 0.94, 1.0);
    vAlpha = 1.0;
    return;
  }

  // 1. Mean anomaly: M = M0 + n * t (Kepler's Third Law: n = 0.42 / a^1.5)
  float M = M0 + n * uTime;
  M = mod(M, 6.28318530718);

  // 2. Solve Kepler's Equation with initial guess E0 = M + e*sin(M) and 4 Newton steps
  float E = M + e * sin(M);
  for (int i = 0; i < 4; i++) {
    float f = E - e * sin(E) - M;
    float fPrime = max(0.15, 1.0 - e * cos(E));
    E -= f / fPrime;
  }

  // 3. Orbital plane coordinates
  float xOrb = a * (cos(E) - e);
  float yOrb = a * sqrt(max(0.001, 1.0 - e * e)) * sin(E);

  // 4. Exact Rotation Order: Argument of periapsis (in plane) -> Inclination (x-axis) -> Node (z-axis)
  float cosP = cos(peri);
  float sinP = sin(peri);
  float x1 = xOrb * cosP - yOrb * sinP;
  float y1 = xOrb * sinP + yOrb * cosP;
  float z1 = 0.0;

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

  // Point size and styling
  float big = (fract(seed * 71.3) < 0.015) ? 1.0 : 0.0;
  float ptSize = (uDPR * 0.62) * (1.0 + big * 3.4) * (26.0 / max(2.0, clipPos.w));
  gl_PointSize = max(1.0, min(ptSize, 32.0));

  // Near/Far cue: fade the far half very slightly
  float depthFade = 0.62 + 0.38 * smoothstep(-1.6, 1.6, -worldPos.z);
  float baseAlpha = (0.20 + 0.55 * fract(seed * 13.7)) * (1.0 + big * 2.2) * depthFade;

  // Cold blue-white dust shading to warm amber for big bodies
  vec3 dustColor = mix(vec3(0.65, 0.78, 1.0), vec3(1.0, 0.82, 0.55), fract(seed * 3.1));
  if (big > 0.5) {
    dustColor = vec3(1.0, 0.81, 0.48); // Amber warm highlight
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

  // Tight core plus wide halo
  float intensity = exp(-d * 6.5) + exp(-d * 1.7) * 0.30;
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

    // Compile Shaders
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

    // Determine particle count based on screen width
    const isMobile = window.innerWidth < 640
    const isTablet = window.innerWidth < 1024
    const N = isMobile ? 22000 : isTablet ? 45000 : 90000

    // Generate 5 distinct Keplerian bands with gaps
    const bands = [
      { weight: 0.16, aMin: 0.9, aMax: 1.35, maxE: 0.05, maxI: 0.030 },
      { weight: 0.24, aMin: 1.7, aMax: 2.35, maxE: 0.09, maxI: 0.055 },
      { weight: 0.30, aMin: 2.9, aMax: 3.9, maxE: 0.14, maxI: 0.090 },
      { weight: 0.14, aMin: 4.6, aMax: 5.4, maxE: 0.10, maxI: 0.320 }, // Inclined band
      { weight: 0.16, aMin: 6.3, aMax: 8.6, maxE: 0.26, maxI: 0.240 }
    ]

    const orb1Data = new Float32Array(N * 4)
    const orb2Data = new Float32Array(N * 4)

    // Body 0 is the primary star (pinned at origin)
    orb1Data[0] = 0.0; orb1Data[1] = 0.0; orb1Data[2] = 0.0; orb1Data[3] = 0.0
    orb2Data[0] = 0.0; orb2Data[1] = 0.0; orb2Data[2] = 0.0; orb2Data[3] = -1.0 // Seed < 0 signals primary

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
        // Rule 5: Sum of two uniforms for e and inc to prevent flat bowl
        const e = Math.abs(u1 + u2 - 1.0) * band.maxE
        const inc = (u1 + u2 - 1.0) * band.maxI
        const node = u4 * Math.PI * 2.0

        const peri = Math.random() * Math.PI * 2.0
        const M0 = Math.random() * Math.PI * 2.0
        // Rule 1: Kepler's Third Law: n = 0.42 / a^1.5
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

    // Blend: Additive blending (SRC_ALPHA, ONE), no depth test
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    gl.disable(gl.DEPTH_TEST)

    // Camera, rotation and drag physics with inertia
    let yaw = 0.45
    let pitch = 0.95
    let yawVel = 0.002
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

      // Advance clock with speed multiplier
      simTime += dt * speedMultiplier

      // Physics inertia decay: pow(0.0016, dt)
      if (!isDragging) {
        const decay = Math.pow(0.0016, dt)
        yawVel = yawVel * (1.0 - (1.0 - decay) * 0.4) + 0.0003
        pitchVel *= decay
        yaw += yawVel
        // Gentle ease back to default pitch
        pitch = Math.max(0.16, Math.min(Math.PI - 0.16, pitch + pitchVel + (0.95 - pitch) * 0.02))
      }

      // Resize with clamped DPR
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

      // Matrix calculations
      const aspect = w / h
      const fov = 45.0 * (Math.PI / 180.0)
      const near = 0.1
      const far = 100.0
      const f = 1.0 / Math.tan(fov / 2.0)

      // Perspective Projection
      const proj = new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) / (near - far), -1,
        0, 0, (2.0 * far * near) / (near - far), 0
      ])

      // View Matrix (spherical orbit camera at radius = 16.5)
      const dist = 16.5
      const cx = dist * Math.sin(pitch) * Math.sin(yaw)
      const cy = dist * Math.cos(pitch)
      const cz = dist * Math.sin(pitch) * Math.cos(yaw)

      // LookAt: camera to (0,0,0)
      const zAxis = [cx / dist, cy / dist, cz / dist]
      const up = [0, 1, 0]
      // Cross up x zAxis
      let rx = up[1] * zAxis[2] - up[2] * zAxis[1]
      let ry = up[2] * zAxis[0] - up[0] * zAxis[2]
      let rz = up[0] * zAxis[1] - up[1] * zAxis[0]
      const rLen = Math.sqrt(rx * rx + ry * ry + rz * rz)
      rx /= rLen; ry /= rLen; rz /= rLen

      // Cross zAxis x right
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

      // Multiply Proj x View
      const vp = new Float32Array(16)
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          let sum = 0
          for (let k = 0; k < 4; k++) {
            sum += proj[k * 4 + i] * view[j * 4 + k]
          }
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
/* REAL ASTRONOMICAL EPHEMERIS CALCULATOR                                     */
/* ========================================================================== */
function useEphemeris() {
  const [now, setNow] = useState(Date.now())
  const [seeing, setSeeing] = useState(1.4)

  useEffect(() => {
    const clockTimer = setInterval(() => setNow(Date.now()), 1000)
    const seeingTimer = setInterval(() => {
      // Atmospheric seeing walks between 1.0 and 2.1 arcseconds
      setSeeing(prev => {
        const delta = (Math.random() - 0.5) * 0.22
        return Math.max(1.0, Math.min(2.1, Number((prev + delta).toFixed(2))))
      })
    }, 3000)

    return () => {
      clearInterval(clockTimer)
      clearInterval(seeingTimer)
    }
  }, [])

  // 1. Julian Date
  const jd = now / 86400000 + 2440587.5
  const T = (jd - 2451545.0) / 36525.0

  // 2. Greenwich Mean Sidereal Time (GMST) in degrees -> HH:MM:SS
  const rawGmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T
  const gmstDeg = ((rawGmst % 360) + 360) % 360
  const gmstHoursTotal = (gmstDeg / 360) * 24
  const gHours = Math.floor(gmstHoursTotal)
  const gMinutes = Math.floor((gmstHoursTotal - gHours) * 60)
  const gSeconds = Math.floor(((gmstHoursTotal - gHours) * 60 - gMinutes) * 60)
  const siderealStr = `${String(gHours).padStart(2, '0')}:${String(gMinutes).padStart(2, '0')}:${String(gSeconds).padStart(2, '0')}`

  // 3. Moon Phase from synodic month age
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
/* MAIN ASTRONOMICAL ORRERY AUTHENTICATION PAGE                               */
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
    { title: 'Chief Astrometer', email: 'alex.morgan@workspace.io', pass: 'password123', badge: 'Observatory Admin' },
    { title: 'Meridian Transit', email: 'jordan.lee@storage.dev', pass: 'analyst2026', badge: 'Cluster Analyst' }
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
    <div className="relative min-h-screen w-full bg-[#05060b] text-[#e8e6df] font-sans selection:bg-[#ffcf7a]/30 selection:text-[#ffcf7a] flex flex-col justify-between overflow-x-hidden">
      {/* 1. Raw WebGL2 90,000 Keplerian Orbits Canvas (z-index 0) */}
      <WebGLOrrery speedMultiplier={1.0} />

      {/* 2. Fixed Radial Vignette (Rule 7: No CSS filter on canvas) */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(5, 6, 11, 0.25) 0%, rgba(5, 6, 11, 0.75) 60%, #05060b 95%)'
        }}
      />

      {/* 3. Top Observatory Navigation & Live Ephemeris Bar (z-index 10) */}
      <header className="relative z-10 flex h-16 items-center justify-between border-b border-white/[0.08] px-6 sm:px-12 bg-[#05060b]/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#ffcf7a]/15 text-[#ffcf7a] border border-[#ffcf7a]/30 shadow-sm">
            <Orbit size={16} />
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-tight text-[#e8e6df]">
              Dedupe<span className="text-[#ffcf7a]">IQ</span>
            </span>
            <span className="ml-2 text-[9px] uppercase font-mono tracking-widest text-[#7c7a86]">
              Kepler Edition
            </span>
          </div>
        </div>

        {/* Live Ephemeris Telemetry HUD */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] font-mono text-[#7c7a86] border border-white/[0.08] bg-[#05060b]/80 px-3.5 py-1.5 rounded-full">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e0563c] animate-pulse" />
            <span className="text-[#e8e6df]">Bodies: {ephemeris.bodiesCount}</span>
          </div>
          <span>·</span>
          <div>
            <span>Sidereal: </span>
            <strong className="text-[#ffcf7a]">{ephemeris.sidereal}</strong>
          </div>
          <span>·</span>
          <div>
            <span>Seeing: </span>
            <strong className="text-[#e8e6df]">{ephemeris.seeing}″</strong>
          </div>
          <span>·</span>
          <div>
            <span>Moon: </span>
            <strong className="text-[#e8e6df]">{ephemeris.moonPhase} ({ephemeris.moonAge}d)</strong>
          </div>
        </div>

        {/* Quick Launch CTA */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGuestLaunch}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#05060b] bg-[#ffcf7a] hover:bg-[#ffe0a3] px-3.5 py-1.5 rounded-lg transition-all shadow-[0_0_15px_rgba(255,207,122,0.3)] cursor-pointer"
          >
            <Zap size={13} />
            <span>Instant Demo</span>
          </button>
        </div>
      </header>

      {/* 4. Centered Almanac & Login Console (z-index 10) */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-4xl grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
          {/* Left: Atmospheric Astronomical Manifesto */}
          <div className="hidden lg:flex flex-col space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#e0563c] mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e0563c]" />
                <span>Orbiting File Deduplication</span>
              </div>

              <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-[#e8e6df] font-display leading-[1.15]">
                Ninety thousand orbits. <br />
                <span className="text-[#ffcf7a]">Zero duplicate drift.</span>
              </h1>

              <p className="mt-3 text-xs text-[#7c7a86] leading-relaxed max-w-md">
                Every duplicate copy is indexed like a celestial body on a pure Keplerian trajectory. Identify bit-for-bit SHA-256 matches, visual photo variations, and document revisions with mathematical certainty.
              </p>
            </div>

            {/* Drag Hint & Mechanics Badges */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0c0e14]/70 p-4 space-y-3 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs border-b border-white/[0.06] pb-2.5">
                <span className="text-[#7c7a86] flex items-center gap-1.5">
                  <Compass size={13} className="text-[#ffcf7a]" />
                  <span>Interactive Celestial Sphere:</span>
                </span>
                <span className="text-[11px] font-mono text-[#ffcf7a]">Drag sky to rotate</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-[#7c7a86]">
                <div className="p-2 rounded bg-black/40 border border-white/[0.05]">
                  <p className="text-[#e8e6df] font-bold">5 Bands</p>
                  <p className="mt-0.5 text-[9px]">Gapped belts</p>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/[0.05]">
                  <p className="text-[#ffcf7a] font-bold">n = 0.42/a^1.5</p>
                  <p className="mt-0.5 text-[9px]">3rd Law Motion</p>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/[0.05]">
                  <p className="text-[#10b981] font-bold">4 Newton Steps</p>
                  <p className="mt-0.5 text-[9px]">Exact anomalies</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Focused Desktop Authentication Deck */}
          <div className="w-full max-w-md mx-auto">
            <Card className="p-6 sm:p-8 bg-[#0c0e14]/90 border-white/[0.12] shadow-2xl backdrop-blur-2xl">
              {/* Tab Selector */}
              <div className="mb-6">
                {mode !== 'forgot' ? (
                  <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/[0.08] bg-[#05060b] p-1 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin')
                        setError(null)
                        setSuccessMessage(null)
                      }}
                      className={`rounded-md py-2 font-semibold transition-all ${
                        mode === 'signin'
                          ? 'bg-[#181b26] text-[#ffcf7a] shadow-sm border border-white/[0.1]'
                          : 'text-[#7c7a86] hover:text-[#e8e6df]'
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
                      className={`rounded-md py-2 font-semibold transition-all ${
                        mode === 'signup'
                          ? 'bg-[#181b26] text-[#ffcf7a] shadow-sm border border-white/[0.1]'
                          : 'text-[#7c7a86] hover:text-[#e8e6df]'
                      }`}
                    >
                      New Observer
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#e0563c]">Recovery</span>
                      <h2 className="text-base font-bold text-white mt-0.5">Reset Session Key</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin')
                        setError(null)
                        setSuccessMessage(null)
                      }}
                      className="text-xs text-[#ffcf7a] hover:underline font-mono"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                )}
              </div>

              {/* Notification Banners */}
              {error && (
                <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e0563c] shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMessage && (
                <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 font-mono">Observer Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-3 text-[#7c7a86]" />
                      <input
                        type="text"
                        placeholder="Dr. Alex Morgan"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full rounded-lg border border-white/[0.1] bg-[#05060b] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#ffcf7a]"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 font-mono">Workstation Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-3 text-[#7c7a86]" />
                    <input
                      type="email"
                      placeholder="alex.morgan@workspace.io"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.1] bg-[#05060b] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#ffcf7a]"
                      required
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-300 font-mono">Passkey</label>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-[10px] text-[#ffcf7a] hover:underline font-mono"
                        >
                          Forgot passkey?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-3 text-[#7c7a86]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-white/[0.1] bg-[#05060b] pl-9 pr-10 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#ffcf7a] font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-[#7c7a86] hover:text-white"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 font-mono">Confirm Passkey</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-3 text-[#7c7a86]" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-white/[0.1] bg-[#05060b] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#ffcf7a] font-mono"
                        required
                      />
                    </div>
                  </div>
                )}

                {mode === 'signin' && (
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 text-xs text-[#7c7a86] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-white/[0.15] bg-[#05060b] text-[#ffcf7a] focus:ring-[#ffcf7a] cursor-pointer accent-[#ffcf7a]"
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
                    className="w-full bg-[#ffcf7a] hover:bg-[#ffe0a3] text-[#05060b] font-bold text-xs h-10 shadow-[0_0_20px_rgba(255,207,122,0.2)] cursor-pointer"
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
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </form>

              {/* Fast Preset Roles */}
              {mode === 'signin' && (
                <div className="mt-5 pt-4 border-t border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-[#7c7a86] font-mono">
                    <span>⚡ Quick Preset Access:</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {quickRoles.map(role => (
                      <button
                        key={role.title}
                        type="button"
                        onClick={() => handleQuickFill(role)}
                        className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#05060b] px-2.5 py-1.5 text-left hover:border-[#ffcf7a]/40 hover:bg-[#12151e] transition-colors group cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-[#e8e6df] truncate">{role.title}</p>
                          <p className="text-[9px] text-[#7c7a86] font-mono truncate">{role.badge}</p>
                        </div>
                        <span className="text-[10px] text-[#7c7a86] group-hover:text-[#ffcf7a] font-mono shrink-0 pl-1">fill</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* 5. Minimalist Observatory Footer (z-index 10) */}
      <footer className="relative z-10 flex h-12 items-center justify-between border-t border-white/[0.08] px-6 sm:px-12 text-[10px] text-[#7c7a86] font-mono bg-[#05060b]/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e0563c]" />
          <span>ORRERY KEPLER 90k · Local Memory Only</span>
        </div>
        <span className="hidden sm:inline">GMST {ephemeris.sidereal} · Seeing {ephemeris.seeing}″ · Bortle 4</span>
      </footer>
    </div>
  )
}
