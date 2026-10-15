import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { X, Inbox, SearchX, Check, AlertTriangle, Info } from 'lucide-react'
import type { Assignment, ClassItem } from './data'

export type Store = {
  screen: string
  params: any
  go: (screen: string, params?: any) => void
  toast: (msg: string, tone?: 'ok' | 'err' | 'info', link?: { label: string; to: string; params?: any }) => void
  classes: ClassItem[]
  setClasses: (f: (c: ClassItem[]) => ClassItem[]) => void
  assignments: Assignment[]
  setAssignments: (f: (a: Assignment[]) => Assignment[]) => void
  newStudents: { name: string; code: string; cls: string }[]
  setNewStudents: (f: (s: { name: string; code: string; cls: string }[]) => { name: string; code: string; cls: string }[]) => void
  quiz: { done: boolean; answers: Record<number, any> | null }
  setQuiz: (q: { done: boolean; answers: Record<number, any> | null }) => void
  grade: { essay: number | null; feedback: string; published: boolean; redo: boolean }
  setGrade: (f: (g: Store['grade']) => Store['grade']) => void
  logout: () => void
}
export const Ctx = createContext<Store>(null as any)
export const useApp = () => useContext(Ctx)

export const cx = (...a: (string | false | undefined | null)[]) => a.filter(Boolean).join(' ')

/* ---------- Button ---------- */
type BtnProps = {
  children?: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'teal' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
  title?: string
  'aria-label'?: string
}
export function Button({ children, variant = 'primary', size = 'md', className, type = 'button', ...p }: BtnProps) {
  const v = {
    primary: 'bg-indigo text-white hover:bg-[#4156d6] disabled:bg-[#b8c0f5]',
    secondary: 'bg-white text-navy border border-line hover:border-indigo hover:text-indigo disabled:text-sub/50 disabled:hover:border-line',
    ghost: 'text-sub hover:bg-indigo-soft hover:text-navy disabled:opacity-40',
    teal: 'bg-teal text-white hover:bg-[#0b877a] disabled:bg-[#9ad8d0]',
    danger: 'bg-err text-white hover:bg-[#b91c1c]',
  }[variant]
  const s = { sm: 'h-8 px-3 text-[13px]', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' }[size]
  return (
    <button
      type={type}
      className={cx('inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-colors duration-150 whitespace-nowrap', v, s, className)}
      {...p}
    >
      {children}
    </button>
  )
}

/* ---------- Card ---------- */
export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const Tag: any = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={cx('rounded-2xl bg-white shadow-card border border-line/70 text-left', onClick && 'transition duration-200 hover:-translate-y-0.5 hover:border-indigo/50 w-full', className)}
    >
      {children}
    </Tag>
  )
}

/* ---------- Badge ---------- */
const tones: Record<string, string> = {
  indigo: 'bg-indigo-soft text-[#3a4ec9]',
  teal: 'bg-teal-soft text-[#0b6e63]',
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  err: 'bg-err-soft text-[#b91c1c]',
  gray: 'bg-[#eaeef6] text-sub',
  navy: 'bg-navy text-white',
}
export function Badge({ children, tone = 'gray', dot }: { children: ReactNode; tone?: string; dot?: boolean }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', tones[tone])}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
export const statusMap: Record<string, [string, string]> = {
  draft: ['Bản nháp', 'gray'],
  published: ['Đang mở', 'ok'],
  scheduled: ['Hẹn giờ', 'indigo'],
  wait: ['Chờ chấm', 'warn'],
  graded: ['Đã chấm', 'ok'],
  none: ['Chưa nộp', 'err'],
  late: ['Nộp muộn', 'warn'],
}
export function StatusBadge({ s }: { s: string }) {
  const [l, t] = statusMap[s]
  return <Badge tone={t} dot>{l}</Badge>
}
export function GradeBadge({ v, max = 10 }: { v: number; max?: number }) {
  const r = v / max
  const t = r >= 0.8 ? 'ok' : r >= 0.5 ? 'warn' : 'err'
  return <Badge tone={t}>{v.toFixed(1)}</Badge>
}

/* ---------- Form ---------- */
export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>
      {children}
      {error ? <span className="mt-1 flex items-center gap-1 text-xs font-medium text-err"><AlertTriangle size={12} />{error}</span> : hint && <span className="mt-1 block text-xs text-sub">{hint}</span>}
    </label>
  )
}
const inputCls = 'w-full rounded-[10px] border border-line bg-white px-3.5 text-sm text-ink placeholder:text-sub/70 transition-colors hover:border-[#c4cde3] focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/20 disabled:bg-bg disabled:text-sub'
export function Input({ error, ...p }: any) {
  return <input {...p} className={cx(inputCls, 'h-11', error && 'border-err', p.className)} />
}
export function Textarea(p: any) {
  return <textarea {...p} className={cx(inputCls, 'py-2.5', p.className)} />
}
export function Select({ children, ...p }: any) {
  return <select {...p} className={cx(inputCls, 'h-11 pr-8', p.className)}>{children}</select>
}
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cx('relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200', on ? 'bg-indigo' : 'bg-[#c4cde3]')}>
      <span className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200', on ? 'left-[22px]' : 'left-0.5')} />
    </button>
  )
}
export function Chips({ options, value, onChange, multi }: { options: string[]; value: string[]; onChange: (v: string[]) => void; multi?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o)
        return (
          <button
            type="button"
            key={o}
            aria-pressed={on}
            onClick={() => onChange(multi ? (on ? value.filter((x) => x !== o) : [...value, o]) : [o])}
            className={cx('inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors duration-150', on ? 'border-indigo bg-indigo-soft text-[#3a4ec9]' : 'border-line bg-white text-sub hover:border-indigo/50')}
          >
            {on && <Check size={14} />}
            {o}
          </button>
        )
      })}
    </div>
  )
}

/* ---------- Tabs ---------- */
export function Tabs({ tabs, value, onChange }: { tabs: { id: string; label: string; count?: number }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cx('relative flex h-11 shrink-0 items-center gap-2 px-4 text-sm font-semibold transition-colors duration-150', value === t.id ? 'text-indigo' : 'text-sub hover:text-navy')}
        >
          {t.label}
          {t.count !== undefined && <span className={cx('rounded-full px-1.5 text-xs', value === t.id ? 'bg-indigo-soft' : 'bg-[#eaeef6]')}>{t.count}</span>}
          {value === t.id && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded bg-indigo" />}
        </button>
      ))}
    </div>
  )
}

/* ---------- Overlays ---------- */
function useEsc(f: () => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && f()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [f])
}
export function Modal({ title, onClose, children, footer, width = 'max-w-lg' }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; width?: string }) {
  useEsc(onClose)
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()} className={cx('anim-up max-h-[92vh] w-full overflow-hidden rounded-t-2xl bg-white shadow-pop sm:rounded-2xl flex flex-col', width)}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button aria-label="Đóng" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-sub hover:bg-bg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-bg/60 px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  )
}
export function Drawer({ title, sub, onClose, children, footer }: { title: string; sub?: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useEsc(onClose)
  return (
    <div className="fixed inset-0 z-50 bg-ink/50" onMouseDown={onClose}>
      <aside role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()} className="anim-slide absolute right-0 top-0 flex h-full w-full max-w-[520px] flex-col bg-white shadow-pop">
        <div className="flex items-start justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            {sub && <p className="text-sm text-sub">{sub}</p>}
          </div>
          <button aria-label="Đóng" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-sub hover:bg-bg"><X size={18} /></button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-6">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-bg/60 px-6 py-4">{footer}</div>}
      </aside>
    </div>
  )
}
export function ToastView({ t, onClose, go }: { t: { msg: string; tone: string; link?: any } | null; onClose: () => void; go: Store['go'] }) {
  if (!t) return null
  const Icon = t.tone === 'err' ? AlertTriangle : t.tone === 'info' ? Info : Check
  const c = t.tone === 'err' ? 'bg-err' : t.tone === 'info' ? 'bg-indigo' : 'bg-ok'
  return (
    <div role="status" className="anim-up fixed bottom-20 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-pop md:bottom-6">
      <span className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-full', c)}><Icon size={14} /></span>
      <span className="flex-1">{t.msg}</span>
      {t.link && <button onClick={() => { go(t.link.to, t.link.params); onClose() }} className="font-semibold text-[#9fb0ff] underline-offset-2 hover:underline">{t.link.label}</button>}
      <button aria-label="Đóng" onClick={onClose} className="text-white/60 hover:text-white"><X size={16} /></button>
    </div>
  )
}

/* ---------- Misc ---------- */
export function Empty({ title, text, action, search }: { title: string; text: string; action?: ReactNode; search?: boolean }) {
  const I = search ? SearchX : Inbox
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-indigo-soft text-indigo"><I size={28} /></div>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-sub">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
export function Progress({ v, tone = 'indigo', h = 'h-2' }: { v: number; tone?: string; h?: string }) {
  const c = { indigo: 'bg-indigo', teal: 'bg-teal', ok: 'bg-ok', warn: 'bg-[#e9a62a]', err: 'bg-err' }[tone]
  return (
    <div className={cx('w-full overflow-hidden rounded-full bg-[#e6ebf5]', h)} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cx('h-full rounded-full transition-all duration-300', c)} style={{ width: `${v}%` }} />
    </div>
  )
}
export function Avatar({ name, size = 36, color }: { name: string; size?: number; color?: string }) {
  const ini = name.split(' ').slice(-2).map((x) => x[0]).join('')
  const colors = ['#5368ec', '#0e9f8f', '#243b7b', '#c2410c', '#7c3aed', '#be185d']
  const bg = color || colors[name.length % colors.length]
  return <span className="grid shrink-0 place-items-center rounded-full font-bold text-white" style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}>{ini}</span>
}
export function PageHead({ title, sub, actions, back }: { title: string; sub?: string; actions?: ReactNode; back?: ReactNode }) {
  return (
    <div className="mb-6">
      {back}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
          {sub && <p className="mt-1 text-sm text-sub">{sub}</p>}
        </div>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>
    </div>
  )
}
export function Skeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Đang tải">
      <div className="skel h-8 w-64" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skel h-28" />)}</div>
      <div className="grid gap-4 lg:grid-cols-3"><div className="skel h-72 lg:col-span-2" /><div className="skel h-72" /></div>
    </div>
  )
}
export function Stat({ label, value, sub, icon, tone = 'indigo' }: { label: string; value: ReactNode; sub?: string; icon: ReactNode; tone?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-sub">{label}</p>
        <span className={cx('grid h-9 w-9 place-items-center rounded-[10px]', tones[tone])}>{icon}</span>
      </div>
      <p className="mt-2 text-[28px] font-extrabold leading-none tracking-tight">{value}</p>
      {sub && <p className="mt-2 text-xs text-sub">{sub}</p>}
    </Card>
  )
}
export function BackLink({ to, label, params }: { to: string; label: string; params?: any }) {
  const { go } = useApp()
  return <button onClick={() => go(to, params)} className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-sub hover:text-indigo">← {label}</button>
}
export function Logo({ light }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-gradient-to-br from-indigo to-teal text-lg font-extrabold text-white">E</span>
      <span className={cx('text-[15px] font-extrabold leading-tight tracking-tight', light ? 'text-white' : 'text-navy')}>English<br />Learning Hub</span>
    </div>
  )
}
