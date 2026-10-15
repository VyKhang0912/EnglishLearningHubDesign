import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Home, BookOpen, ClipboardList, Award, UserRound, Bell, FolderOpen, LogOut, Clock, Flag, ChevronLeft, ChevronRight, Play, Pause, WifiOff, CloudCheck, Loader2, CheckCircle2, RotateCcw, Plus, Music, FileText, Trophy, Target, Flame, X, LayoutGrid, Send } from 'lucide-react'
import { QUIZ, NOTIFS, PASSAGE, type Q } from './data'
import { Avatar, Badge, Button, Card, Empty, Field, Input, Logo, Modal, Progress, Tabs, Textarea, useApp, cx, BackLink } from './ui'
import { Donut, Line, HBars } from './charts'
import { autoScore, isCorrect } from './teacher3'

const NAV = [
  ['s-home', 'Trang chủ', Home],
  ['s-classes', 'Lớp học', BookOpen],
  ['s-assign', 'Bài tập', ClipboardList],
  ['s-results', 'Kết quả', Award],
  ['s-materials', 'Học liệu', FolderOpen],
  ['s-notifs', 'Thông báo', Bell],
  ['s-profile', 'Hồ sơ', UserRound],
] as const
const BOTTOM = ['s-home', 's-classes', 's-assign', 's-results', 's-profile']
const ACTIVE: Record<string, string> = { 's-class': 's-classes', 's-submitted': 's-assign', 's-result': 's-results' }

export function StudentShell({ children }: { children: ReactNode }) {
  const { screen, go, logout } = useApp()
  const [out, setOut] = useState(false)
  const act = ACTIVE[screen] || screen
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-[232px] shrink-0 flex-col border-r border-line bg-white p-4 md:flex">
        <div className="mb-6 px-2 pt-1"><Logo /></div>
        <nav className="flex-1 space-y-1" aria-label="Điều hướng học sinh">
          {NAV.map(([id, l, I]) => <button key={id} onClick={() => go(id)} aria-current={act === id ? 'page' : undefined} className={cx('flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors', act === id ? 'bg-indigo text-white' : 'text-sub hover:bg-indigo-soft hover:text-navy')}><I size={19} />{l}</button>)}
        </nav>
        <button onClick={() => setOut(true)} className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-sub hover:bg-bg"><LogOut size={19} />Đăng xuất</button>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-white px-4 md:hidden">
          <Logo />
          <button aria-label="Thông báo, 2 chưa đọc" onClick={() => go('s-notifs')} className="relative grid h-11 w-11 place-items-center rounded-xl text-sub"><Bell size={21} /><span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-err" /></button>
        </header>
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8"><div key={screen} className="anim-up mx-auto max-w-[920px] p-4 sm:p-6 md:p-8">{children}</div></main>
        <nav aria-label="Điều hướng chính" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
          {NAV.filter((n) => BOTTOM.includes(n[0])).map(([id, l, I]) => <button key={id} onClick={() => go(id)} aria-current={act === id ? 'page' : undefined} className={cx('flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold', act === id ? 'text-indigo' : 'text-sub')}><span className={cx('grid h-8 w-14 place-items-center rounded-full transition-colors', act === id && 'bg-indigo-soft')}><I size={21} /></span>{l}</button>)}
        </nav>
      </div>
      {out && <Modal title="Đăng xuất?" onClose={() => setOut(false)} width="max-w-sm" footer={<><Button variant="secondary" onClick={() => setOut(false)}>Ở lại</Button><Button onClick={logout}>Đăng xuất</Button></>}><p className="text-sm text-sub">Em sẽ cần mã học sinh và mật khẩu để đăng nhập lại.</p></Modal>}
    </div>
  )
}

/* ---------- assignment model for student ---------- */
type SA = { id: string; title: string; cls: string; kind: string; assigned: string; due: string; mins: number; max: number; status: string; score?: number }
function useSA(): SA[] {
  const { quiz, grade } = useApp()
  const a1 = grade.redo ? 'retry' : grade.published ? 'graded' : quiz.done ? 'submitted' : 'todo'
  const total = autoScore(quiz.answers || {}) + (grade.essay || 0)
  return [
    { id: 'a1', title: 'English 6 — Unit 1: My New School', cls: '6A', kind: 'Reading & Writing', assigned: '15/10', due: '22/10 23:59', mins: 25, max: 10, status: a1, score: grade.published ? total : undefined },
    { id: 'a8', title: 'English 6 — Unit 2: My House (Grammar)', cls: '6A', kind: 'Grammar', assigned: '14/10', due: '24/10 23:59', mins: 15, max: 10, status: 'progress' },
    { id: 'a6', title: 'Listening Practice — Daily Activities', cls: '6A', kind: 'Listening', assigned: '12/10', due: '19/10 23:59', mins: 20, max: 10, status: 'submitted' },
    { id: 'a2', title: 'English 6 — Unit 3: Vocabulary', cls: '6A', kind: 'Vocabulary', assigned: '12/10', due: '20/10 23:59', mins: 15, max: 10, status: 'graded', score: 8.5 },
    { id: 'a9', title: 'Grammar Practice — Present Simple', cls: '6A', kind: 'Grammar', assigned: '05/10', due: '12/10 23:59', mins: 10, max: 10, status: 'overdue' },
    { id: 'a10', title: 'English 6 — Unit 1: Test 15 phút', cls: '6A', kind: 'Hỗn hợp', assigned: '02/10', due: '09/10 23:59', mins: 15, max: 10, status: 'graded', score: 9.0 },
  ]
}
const SMAP: Record<string, [string, string]> = { todo: ['Cần làm', 'indigo'], progress: ['Đang làm', 'warn'], submitted: ['Đã nộp', 'teal'], graded: ['Đã chấm', 'ok'], overdue: ['Quá hạn', 'err'], retry: ['Làm lại', 'warn'] }
function ActionBtn({ a, big }: { a: SA; big?: boolean }) {
  const { go } = useApp()
  const sz = big ? 'lg' : 'md'
  const w = 'min-h-11'
  if (a.status === 'todo') return <Button size={sz} className={w} onClick={() => go('s-quiz', { id: a.id })}><Play size={16} />Bắt đầu</Button>
  if (a.status === 'progress') return <Button size={sz} className={w} onClick={() => go('s-quiz', { id: a.id, resume: true })}>Tiếp tục</Button>
  if (a.status === 'submitted') return <Button size={sz} className={w} variant="secondary" disabled><CheckCircle2 size={16} />Đã nộp</Button>
  if (a.status === 'graded') return <Button size={sz} className={w} variant="secondary" onClick={() => go('s-result', { id: a.id })}>Xem kết quả</Button>
  if (a.status === 'retry') return <Button size={sz} className={w} variant="teal" onClick={() => go('s-quiz', { id: a.id, retry: true })}><RotateCcw size={16} />Làm lại</Button>
  return <Button size={sz} className={w} variant="danger" onClick={() => go('s-quiz', { id: a.id })}>Làm bù</Button>
}
function SACard({ a }: { a: SA }) {
  const [l, t] = SMAP[a.status]
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-bold leading-snug">{a.title}</p><p className="mt-0.5 text-xs text-sub">Lớp {a.cls} · {a.kind}</p></div><Badge tone={t} dot>{l}</Badge></div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-sub"><div>Giao: <b className="text-ink">{a.assigned}</b></div><div>Hạn: <b className={a.status === 'overdue' ? 'text-err' : 'text-ink'}>{a.due}</b></div><div>~{a.mins} phút</div><div>Tối đa {a.max} điểm</div></dl>
      <div className="mt-4 flex items-center justify-between gap-3">{a.score !== undefined ? <span className="text-2xl font-extrabold text-ok">{a.score.toFixed(1)}<span className="text-sm text-sub">/{a.max}</span></span> : <span />}<ActionBtn a={a} /></div>
    </Card>
  )
}

/* ---------- Home ---------- */
export function SHome() {
  const { go, grade, quiz } = useApp()
  const sa = useSA()
  const todo = sa.filter((a) => ['todo', 'progress', 'retry', 'overdue'].includes(a.status))
  const done = sa.filter((a) => ['submitted', 'graded'].length && ['submitted', 'graded'].includes(a.status)).length
  const featured = todo[0]
  return (
    <>
      <div className="mb-5 flex items-center gap-3"><Avatar name="Lê Minh Anh" size={48} /><div><h1 className="text-xl font-extrabold">Chào Minh Anh! 👋</h1><p className="text-sm text-sub">Hôm nay em có {todo.length} bài cần làm.</p></div></div>
      {featured && (
        <Card className="mb-5 overflow-hidden border-0 bg-navy p-5 text-white">
          <div className="flex items-start justify-between gap-3"><Badge tone="teal">{featured.status === 'overdue' ? 'Quá hạn' : 'Bài tiếp theo'}</Badge><span className="flex items-center gap-1 text-xs text-[#c5d0f5]"><Clock size={13} />Hạn {featured.due}</span></div>
          <h2 className="mt-3 text-lg font-extrabold leading-snug">{featured.title}</h2>
          <p className="mt-1 text-sm text-[#c5d0f5]">Lớp {featured.cls} · {featured.kind} · ~{featured.mins} phút</p>
          <div className="mt-4"><ActionBtn a={featured} big /></div>
        </Card>
      )}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[['Cần làm', todo.length, Target, 'text-indigo bg-indigo-soft'], ['Đã xong', done, CheckCircle2, 'text-ok bg-ok-soft'], ['Điểm TB', '8.8', Trophy, 'text-warn bg-warn-soft']].map(([l, v, I, c]: any) => <Card key={l} className="p-3.5 text-center"><span className={cx('mx-auto mb-1.5 grid h-9 w-9 place-items-center rounded-xl', c)}><I size={18} /></span><p className="text-xl font-extrabold">{v}</p><p className="text-xs text-sub">{l}</p></Card>)}
      </div>
      <SectionTitle t="Sắp đến hạn" a="Tất cả" to="s-assign" />
      <div className="mb-6 space-y-3">{todo.slice(0, 3).map((a) => <SACard key={a.id} a={a} />)}</div>
      <SectionTitle t="Điểm gần đây" a="Xem tất cả" to="s-results" />
      <Card className="mb-6 divide-y divide-line">{sa.filter((a) => a.status === 'graded').slice(0, 3).map((a) => <button key={a.id} onClick={() => go('s-result', { id: a.id })} className="flex min-h-14 w-full items-center gap-3 p-4 text-left"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{a.title}</p><p className="text-xs text-sub">Lớp {a.cls}</p></div><span className="text-lg font-extrabold text-ok">{a.score!.toFixed(1)}</span><ChevronRight size={16} className="text-sub" /></button>)}{quiz.done && !grade.published && <div className="flex items-center gap-3 p-4 text-sm text-sub"><Loader2 size={16} className="animate-spin" />Unit 1: My New School — đang chờ cô chấm</div>}</Card>
      <SectionTitle t="Thông báo mới" a="Xem tất cả" to="s-notifs" />
      <Card className="divide-y divide-line">{NOTIFS.slice(0, 2).map((n) => <div key={n.id} className="p-4 text-sm"><p className="font-semibold">{n.t}</p><p className="text-xs text-sub">{n.s} · {n.time}</p></div>)}</Card>
    </>
  )
}
function SectionTitle({ t, a, to }: { t: string; a: string; to: string }) {
  const { go } = useApp()
  return <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">{t}</h2><button onClick={() => go(to)} className="flex min-h-11 items-center text-sm font-semibold text-indigo">{a}</button></div>
}

/* ---------- Classes ---------- */
export function SClasses() {
  const { go, toast } = useApp()
  const [join, setJoin] = useState(false)
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  return (
    <>
      <div className="mb-5 flex items-center justify-between"><h1 className="text-2xl font-extrabold">Lớp của em</h1><Button variant="secondary" onClick={() => setJoin(true)}><Plus size={16} />Nhập mã lớp</Button></div>
      <div className="grid gap-4 sm:grid-cols-2">{[['6A', 'English 6', '#5368ec', 'Cô Thu Hà', 2], ['6B', 'CLB English Speaking', '#0e9f8f', 'Cô Thu Hà', 0]].map(([id, n, c, t, k]: any) => <Card key={id} onClick={() => go('s-class', { id })} className="overflow-hidden"><div className="h-16" style={{ background: c }} /><div className="p-4"><p className="font-bold">Lớp {id} · {n}</p><p className="text-sm text-sub">{t}</p><p className="mt-2 text-xs font-semibold text-indigo">{k} bài cần làm</p></div></Card>)}</div>
      {join && <Modal title="Tham gia lớp mới" onClose={() => setJoin(false)} width="max-w-sm" footer={<><Button variant="secondary" onClick={() => setJoin(false)}>Hủy</Button><Button onClick={() => (code.trim().length < 6 ? setErr('Mã lớp gồm ít nhất 6 ký tự') : (toast('Mã không đúng hoặc lớp đã đủ chỗ. Hãy hỏi lại cô.', 'err'), setJoin(false)))}>Tham gia</Button></>}><Field label="Mã lớp" error={err} hint="Cô giáo sẽ cho em mã này"><Input value={code} onChange={(e: any) => { setCode(e.target.value); setErr('') }} placeholder="VD: K7A-92PL" error={err} /></Field></Modal>}
    </>
  )
}
export function SClass() {
  const { params } = useApp()
  const sa = useSA()
  const [tab, setTab] = useState('a')
  const id = params?.id || '6A'
  return (
    <>
      <BackLink to="s-classes" label="Lớp học" />
      <Card className="mb-5 overflow-hidden"><div className="h-20 bg-indigo" /><div className="p-4"><h1 className="text-xl font-extrabold">Lớp {id} · {id === '6A' ? 'English 6' : 'CLB English Speaking'}</h1><p className="text-sm text-sub">Giáo viên: Cô Nguyễn Thu Hà</p></div></Card>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'a', label: 'Bài tập' }, { id: 'n', label: 'Thông báo' }, { id: 'm', label: 'Học liệu' }]} />
      <div className="mt-4 space-y-3">
        {tab === 'a' && (id === '6A' ? sa.slice(0, 4).map((a) => <SACard key={a.id} a={a} />) : <Card><Empty title="Chưa có bài tập" text="Cô chưa giao bài nào cho lớp này." /></Card>)}
        {tab === 'n' && <Card className="p-4"><Badge tone="navy">Đã ghim</Badge><p className="mt-2 font-bold">Kiểm tra 15 phút thứ Năm 22/10</p><p className="mt-1 text-sm text-sub">Nội dung: Unit 1 — từ vựng và thì hiện tại đơn. Các em mang theo bút.</p></Card>}
        {tab === 'm' && <MatList />}
      </div>
    </>
  )
}
function MatList() {
  return <Card className="divide-y divide-line">{[['Từ vựng Unit 1: My New School', 'Danh sách từ vựng', BookOpen], ['Present Simple — ghi chú', 'Ngữ pháp', FileText], ['Daily Activities (2:14)', 'Audio nghe', Music]].map(([t, k, I]: any) => <div key={t} className="flex min-h-16 items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-soft text-indigo"><I size={18} /></span><div className="flex-1"><p className="text-sm font-semibold">{t}</p><p className="text-xs text-sub">{k}</p></div><Button size="sm" variant="secondary">Mở</Button></div>)}</Card>
}
export const SMaterials = () => <><h1 className="mb-5 text-2xl font-extrabold">Học liệu</h1><MatList /></>

/* ---------- Assignment list ---------- */
export function SAssign() {
  const sa = useSA()
  const [tab, setTab] = useState('todo')
  const map: Record<string, string[]> = { todo: ['todo', 'retry'], progress: ['progress'], submitted: ['submitted'], graded: ['graded'], overdue: ['overdue'] }
  const list = sa.filter((a) => map[tab].includes(a.status))
  const c = (t: string) => sa.filter((a) => map[t].includes(a.status)).length
  return (
    <>
      <h1 className="mb-4 text-2xl font-extrabold">Bài tập của em</h1>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'todo', label: 'Cần làm', count: c('todo') }, { id: 'progress', label: 'Đang làm', count: c('progress') }, { id: 'submitted', label: 'Đã nộp', count: c('submitted') }, { id: 'graded', label: 'Đã chấm', count: c('graded') }, { id: 'overdue', label: 'Quá hạn', count: c('overdue') }]} />
      <div className="mt-4 grid gap-3 md:grid-cols-2">{list.length ? list.map((a) => <SACard key={a.id} a={a} />) : <div className="md:col-span-2"><Card><Empty title="Không có bài nào ở đây" text="Khi cô giao bài mới, bài sẽ xuất hiện trong mục này." /></Card></div>}</div>
    </>
  )
}

/* ---------- Quiz ---------- */
function Audio({ speed, setSpeed }: { speed: number; setSpeed: (n: number) => void }) {
  const [on, setOn] = useState(false)
  const [t, setT] = useState(0)
  const len = 134
  useEffect(() => {
    if (!on) return
    const i = setInterval(() => setT((x) => (x + speed >= len ? (setOn(false), 0) : x + speed)), 1000)
    return () => clearInterval(i)
  }, [on, speed])
  const f = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  return (
    <div className="rounded-2xl bg-indigo-soft p-4">
      <div className="flex items-center gap-3">
        <button aria-label={on ? 'Tạm dừng' : 'Phát audio'} onClick={() => setOn(!on)} className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-indigo text-white shadow-md active:scale-95">{on ? <Pause /> : <Play className="ml-0.5" />}</button>
        <div className="flex-1"><div className="flex h-8 items-center gap-[3px]" aria-hidden>{Array.from({ length: 36 }).map((_, i) => <span key={i} className={cx('w-1 flex-1 rounded-full', (i / 36) * len <= t ? 'bg-indigo' : 'bg-indigo/25')} style={{ height: `${30 + ((i * 37) % 70)}%` }} />)}</div><div className="mt-1 flex justify-between text-xs font-semibold text-sub"><span>{f(t)}</span><span>{f(len)}</span></div></div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-sub">Tốc độ:{[0.75, 1, 1.25].map((s) => <button key={s} aria-pressed={speed === s} onClick={() => setSpeed(s)} className={cx('h-9 min-w-12 rounded-full px-3', speed === s ? 'bg-indigo text-white' : 'bg-white')}>{s}x</button>)}</div>
    </div>
  )
}

export function Quiz() {
  const { go, params, setQuiz, grade } = useApp()
  const [i, setI] = useState(params?.resume ? 3 : 0)
  const [ans, setAns] = useState<Record<number, any>>(params?.resume ? { 1: 1, 2: 1, 3: 'reminds' } : {})
  const [flag, setFlag] = useState<number[]>([])
  const [secs, setSecs] = useState(25 * 60)
  const [net, setNet] = useState<'ok' | 'off'>('ok')
  const [save, setSave] = useState<'saved' | 'saving'>('saved')
  const [modal, setModal] = useState<null | 'submit' | 'grid' | 'exit'>(null)
  const [speed, setSpeed] = useState(1)
  const [banner, setBanner] = useState(!!params?.resume)
  const tm = useRef<any>(null)
  useEffect(() => { const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000); return () => clearInterval(t) }, [])
  const q: Q = QUIZ[i]
  const set = (v: any) => {
    setAns((a) => ({ ...a, [q.id]: v }))
    if (net === 'ok') { setSave('saving'); clearTimeout(tm.current); tm.current = setTimeout(() => setSave('saved'), 700) }
  }
  const answered = QUIZ.filter((x) => ans[x.id] !== undefined && String(ans[x.id]).trim() !== '').length
  const missing = QUIZ.filter((x) => ans[x.id] === undefined || String(ans[x.id]).trim() === '')
  const wc = String(ans[6] || '').trim().split(/\s+/).filter(Boolean).length
  const mm = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
  const submit = () => { setQuiz({ done: true, answers: ans }); go('s-submitted') }
  void grade
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="sticky top-0 z-20 border-b border-line bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-3">
          <button aria-label="Thoát" onClick={() => setModal('exit')} className="grid h-11 w-11 place-items-center rounded-xl text-sub hover:bg-bg"><X size={20} /></button>
          <div className="min-w-0 flex-1 text-center"><p className="truncate text-sm font-bold">Unit 1: My New School</p><p className="flex items-center justify-center gap-1 text-[11px] text-sub" aria-live="polite">{net === 'off' ? <><WifiOff size={11} className="text-err" /><span className="text-err">Mất kết nối</span></> : save === 'saving' ? <><Loader2 size={11} className="animate-spin" />Đang lưu…</> : <><CloudCheck size={12} className="text-ok" />Đã lưu tự động</>}</p></div>
          <span className={cx('flex h-9 items-center gap-1 rounded-full px-3 text-sm font-bold tabular-nums', secs < 300 ? 'bg-err-soft text-err' : 'bg-indigo-soft text-indigo')}><Clock size={14} />{mm}</span>
        </div>
        <Progress v={(answered / QUIZ.length) * 100} tone="teal" h="h-1" />
      </header>
      {net === 'off' && <div className="bg-err-soft px-4 py-3 text-sm text-[#b91c1c]"><div className="mx-auto flex max-w-2xl items-center gap-3"><WifiOff size={18} /><p className="flex-1"><b>Mất kết nối mạng.</b> Em cứ làm tiếp, bài được giữ trên máy. Kết nối lại để nộp bài.</p><Button size="sm" variant="danger" onClick={() => { setNet('ok'); setSave('saved') }}>Thử lại</Button></div></div>}
      {banner && <div className="bg-teal-soft px-4 py-3 text-sm text-[#0b6e63]"><div className="mx-auto flex max-w-2xl items-center gap-3"><CloudCheck size={18} /><p className="flex-1"><b>Đã khôi phục bài đang làm.</b> Em đã trả lời {answered} câu trước đó.</p><button aria-label="Đóng" onClick={() => setBanner(false)} className="grid h-9 w-9 place-items-center"><X size={16} /></button></div></div>}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5 pb-32">
        <div className="mb-3 flex items-center justify-between text-sm"><span className="font-bold text-indigo">Câu {i + 1}/{QUIZ.length}</span><span className="text-sub">{q.skill} · {q.points} điểm</span></div>
        <div key={q.id} className="anim-up space-y-4">
          {q.type === 'listening' && <Audio speed={speed} setSpeed={setSpeed} />}
          {q.type === 'reading' && <div className="max-h-48 overflow-y-auto rounded-2xl border border-line bg-white p-4 text-[15px] leading-relaxed"><p className="mb-1 text-xs font-bold uppercase tracking-wide text-teal">Đoạn văn</p>{PASSAGE}</div>}
          <h1 className="text-xl font-bold leading-snug">{q.text}</h1>
          {q.options && <div className="space-y-2.5" role="radiogroup" aria-label="Đáp án">{q.options.map((o, k) => { const on = ans[q.id] === k; return <button key={k} role="radio" aria-checked={on} onClick={() => set(k)} className={cx('flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-base font-medium transition-all duration-150 active:scale-[0.99]', on ? 'border-indigo bg-indigo-soft' : 'border-line bg-white hover:border-indigo/40')}><span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold', on ? 'bg-indigo text-white' : 'bg-bg text-sub')}>{q.type === 'tf' ? (k === 0 ? 'T' : 'F') : String.fromCharCode(65 + k)}</span>{o}</button> })}</div>}
          {q.type === 'fill' && <Input value={ans[q.id] || ''} onChange={(e: any) => set(e.target.value)} placeholder="Nhập từ còn thiếu" className="!h-14 !text-lg" autoCapitalize="none" aria-label="Câu trả lời" />}
          {q.type === 'writing' && <div><Textarea rows={9} value={ans[q.id] || ''} onChange={(e: any) => set(e.target.value)} placeholder="Viết bài của em ở đây…" className="!text-base" aria-label="Bài viết" /><p className={cx('mt-1.5 text-right text-sm font-semibold', wc >= 40 && wc <= 60 ? 'text-ok' : 'text-sub')}>{wc} / 40–60 từ</p></div>}
        </div>
      </main>
      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-2xl items-center gap-2 p-3">
          <Button variant="secondary" className="!h-12 !px-3" aria-label="Câu trước" disabled={i === 0} onClick={() => setI(i - 1)}><ChevronLeft size={20} /></Button>
          <button aria-pressed={flag.includes(q.id)} aria-label="Đánh dấu xem lại" onClick={() => setFlag(flag.includes(q.id) ? flag.filter((x) => x !== q.id) : [...flag, q.id])} className={cx('grid h-12 w-12 place-items-center rounded-[10px] border', flag.includes(q.id) ? 'border-[#e9a62a] bg-warn-soft text-warn' : 'border-line text-sub')}><Flag size={18} /></button>
          <Button variant="secondary" className="!h-12 !px-3" aria-label="Danh sách câu" onClick={() => setModal('grid')}><LayoutGrid size={19} /></Button>
          {i < QUIZ.length - 1 ? <Button className="!h-12 flex-1" onClick={() => setI(i + 1)}>Câu tiếp<ChevronRight size={18} /></Button> : <Button variant="teal" className="!h-12 flex-1" onClick={() => setModal('submit')}><Send size={16} />Nộp bài</Button>}
        </div>
      </footer>
      {modal === 'grid' && <Modal title="Danh sách câu hỏi" onClose={() => setModal(null)} width="max-w-sm" footer={<Button variant="teal" onClick={() => setModal('submit')}>Nộp bài</Button>}><div className="grid grid-cols-5 gap-2.5">{QUIZ.map((x, k) => { const d = ans[x.id] !== undefined && String(ans[x.id]).trim() !== ''; return <button key={x.id} onClick={() => { setI(k); setModal(null) }} aria-label={`Câu ${k + 1}${d ? ', đã trả lời' : ', chưa trả lời'}${flag.includes(x.id) ? ', đã đánh dấu' : ''}`} className={cx('relative grid h-12 place-items-center rounded-xl border-2 text-sm font-bold', k === i && 'ring-2 ring-indigo ring-offset-2', d ? 'border-indigo bg-indigo text-white' : 'border-line')}>{k + 1}{flag.includes(x.id) && <Flag size={11} className="absolute -right-1 -top-1 rounded-full bg-[#e9a62a] p-0.5 text-white" />}</button> })}</div><p className="mt-4 text-xs text-sub">Xanh: đã trả lời · Trắng: chưa làm · Cờ: cần xem lại</p><button onClick={() => setNet(net === 'ok' ? 'off' : 'ok')} className="mt-3 text-xs font-semibold text-indigo underline">Demo: {net === 'ok' ? 'mô phỏng mất mạng' : 'khôi phục mạng'}</button></Modal>}
      {modal === 'submit' && <Modal title="Nộp bài?" onClose={() => setModal(null)} width="max-w-sm" footer={<><Button variant="secondary" onClick={() => setModal(null)}>Làm tiếp</Button><Button disabled={net === 'off'} onClick={submit}>{missing.length ? 'Vẫn nộp bài' : 'Nộp bài'}</Button></>}>
        {net === 'off' && <p className="mb-3 rounded-lg bg-err-soft p-3 text-sm text-[#b91c1c]">Chưa có mạng nên chưa nộp được. Bài của em vẫn được giữ an toàn.</p>}
        <p className="text-sm">Em đã trả lời <b>{answered}/{QUIZ.length}</b> câu{flag.length ? <>, <b>{flag.length}</b> câu đang đánh dấu xem lại</> : ''}.</p>
        {missing.length > 0 && <div className="mt-3 rounded-xl bg-warn-soft p-3 text-sm text-warn"><b>Còn {missing.length} câu chưa làm:</b><div className="mt-2 flex flex-wrap gap-2">{missing.map((x) => <button key={x.id} onClick={() => { setI(QUIZ.indexOf(x)); setModal(null) }} className="h-9 min-w-9 rounded-lg bg-white px-2 font-bold">Câu {QUIZ.indexOf(x) + 1}</button>)}</div></div>}
        <p className="mt-3 text-xs text-sub">Sau khi nộp, em không thể sửa bài.</p>
      </Modal>}
      {modal === 'exit' && <Modal title="Thoát khỏi bài làm?" onClose={() => setModal(null)} width="max-w-sm" footer={<><Button variant="secondary" onClick={() => setModal(null)}>Ở lại</Button><Button onClick={() => go('s-assign')}>Thoát</Button></>}><p className="text-sm text-sub">Bài làm của em đã được lưu tự động. Em có thể bấm “Tiếp tục” để làm tiếp sau.</p></Modal>}
    </div>
  )
}

export function Submitted() {
  const { go, quiz } = useApp()
  const n = Object.keys(quiz.answers || {}).length
  return (
    <div className="mx-auto max-w-md pt-6 text-center">
      <div className="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-full bg-ok-soft text-ok"><CheckCircle2 size={52} /></div>
      <h1 className="text-2xl font-extrabold">Em đã nộp bài!</h1>
      <p className="mt-1 text-sub">English 6 — Unit 1: My New School</p>
      <Card className="mt-6 divide-y divide-line text-left text-sm">{[['Nộp lúc', '16/10/2026 08:12'], ['Số câu đã trả lời', `${n}/${QUIZ.length}`], ['Trạng thái', 'Chờ cô chấm câu viết']].map(([a, b]) => <div key={a} className="flex justify-between p-4"><span className="text-sub">{a}</span><b>{b}</b></div>)}</Card>
      <p className="mt-4 text-sm text-sub">Em sẽ nhận thông báo khi cô công bố điểm. Đáp án đúng chưa được hiển thị.</p>
      <div className="mt-6 flex flex-col gap-2"><Button size="lg" onClick={() => go('s-result', { id: 'a1' })}>Xem trạng thái bài</Button><Button size="lg" variant="ghost" onClick={() => go('s-home')}>Về trang chủ</Button></div>
    </div>
  )
}

/* ---------- Result ---------- */
export function Result() {
  const { params, grade, quiz, go } = useApp()
  const sa = useSA()
  const a = sa.find((x) => x.id === (params?.id || 'a1'))!
  if (a.id !== 'a1') return (
    <><BackLink to="s-results" label="Kết quả" /><Card className="p-6 text-center"><p className="text-sm text-sub">{a.title}</p><p className="mt-2 text-6xl font-extrabold text-ok">{a.score?.toFixed(1)}<span className="text-2xl text-sub">/10</span></p><p className="mt-4 rounded-xl bg-bg p-4 text-left text-sm"><b>Nhận xét của cô:</b> Em làm bài rất tốt, nhớ ôn lại các động từ bất quy tắc nhé!</p></Card></>
  )
  if (!grade.published) return (
    <><BackLink to="s-assign" label="Bài tập" /><Card><Empty title={quiz.done ? 'Đang chờ cô chấm' : 'Em chưa làm bài này'} text={quiz.done ? 'Phần trắc nghiệm đã chấm tự động, nhưng điểm cuối chỉ hiện khi cô chấm xong bài viết và công bố.' : 'Hãy làm bài để xem kết quả.'} action={<Button onClick={() => go(quiz.done ? 's-assign' : 's-quiz', { id: 'a1' })}>{quiz.done ? 'Về bài tập' : 'Bắt đầu làm'}</Button>} /></Card></>
  )
  const ans = quiz.answers || {}
  const total = autoScore(ans) + (grade.essay || 0)
  return (
    <>
      <BackLink to="s-results" label="Kết quả" />
      <Card className="mb-5 overflow-hidden"><div className="bg-navy p-6 text-center text-white"><p className="text-sm text-[#c5d0f5]">English 6 — Unit 1: My New School</p><p className="mt-2 text-6xl font-extrabold">{total.toFixed(1)}<span className="text-2xl text-[#9fb0e4]"> / 10</span></p><Badge tone="teal">{total >= 8 ? 'Rất tốt!' : total >= 5 ? 'Khá tốt' : 'Cần cố gắng'}</Badge></div>
        <div className="p-5"><p className="text-xs font-bold uppercase tracking-wide text-sub">Nhận xét của cô Thu Hà</p><p className="mt-1.5 text-[15px]">{grade.feedback}</p></div></Card>
      {grade.redo && <Card className="mb-5 flex items-center gap-3 border-warn/40 bg-warn-soft p-4"><RotateCcw className="text-warn" /><p className="flex-1 text-sm"><b>Cô yêu cầu em làm lại bài này.</b></p><Button variant="teal" onClick={() => go('s-quiz', { id: 'a1', retry: true })}>Làm lại</Button></Card>}
      <h2 className="mb-3 font-bold">Chi tiết từng câu</h2>
      <div className="space-y-3">{QUIZ.map((q, k) => { const w = q.type === 'writing'; const ok = !w && isCorrect(q, ans[q.id]); return <Card key={q.id} className="p-4"><div className="mb-1 flex items-center gap-2"><Badge tone={w ? 'indigo' : ok ? 'ok' : 'err'}>{w ? `${(grade.essay || 0).toFixed(2)}/${q.points}` : ok ? `+${q.points}` : '0'}</Badge><span className="text-xs text-sub">Câu {k + 1} · {q.skill}</span></div><p className="text-sm font-semibold">{q.text}</p>{!w && !ok && <p className="mt-2 text-sm">Đáp án đúng: <b className="text-ok">{q.options && typeof q.correct === 'number' ? q.options[q.correct] : q.correct}</b></p>}{q.explain && !w && <p className="mt-1.5 rounded-lg bg-bg p-2.5 text-xs text-sub">💡 {q.explain}</p>}</Card> })}</div>
    </>
  )
}

/* ---------- Results & progress ---------- */
export function SResults() {
  const { go } = useApp()
  const sa = useSA()
  const graded = sa.filter((a) => a.status === 'graded')
  const avg = graded.reduce((s, a) => s + a.score!, 0) / graded.length
  return (
    <>
      <h1 className="mb-5 text-2xl font-extrabold">Kết quả & tiến độ</h1>
      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <Card className="flex items-center gap-5 p-5"><Donut value={Math.round((sa.filter((a) => ['graded', 'submitted'].includes(a.status)).length / sa.length) * 100)} color="#0e9f8f" label="hoàn thành" /><div><p className="text-sm text-sub">Điểm trung bình</p><p className="text-3xl font-extrabold">{avg.toFixed(1)}</p><p className="mt-1 flex items-center gap-1 text-xs font-semibold text-ok"><Flame size={13} />Đã nộp đúng hạn 5 bài liên tiếp</p></div></Card>
        <Card className="p-5"><p className="mb-3 font-bold">Kỹ năng của em</p><HBars data={[{ label: 'Reading', value: 90 }, { label: 'Vocabulary', value: 85 }, { label: 'Grammar', value: 74 }, { label: 'Writing', value: 68 }]} /></Card>
      </div>
      <Card className="mb-5 p-5"><p className="mb-1 font-bold">Điểm theo thời gian</p><Line labels={['T1', 'T2', 'T3', 'T4', 'T5']} series={[{ name: 'Em', color: '#5368ec', data: [7.5, 8.0, 8.5, 9.0, 8.5] }, { name: 'TB lớp', color: '#a7b2cc', data: [7.4, 7.6, 7.8, 7.9, 7.9] }]} h={170} /></Card>
      <h2 className="mb-3 font-bold">Bài đã chấm</h2>
      <Card className="divide-y divide-line">{graded.map((a) => <button key={a.id} onClick={() => go('s-result', { id: a.id })} className="flex min-h-16 w-full items-center gap-3 p-4 text-left"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{a.title}</p><p className="text-xs text-sub">Lớp {a.cls} · hạn {a.due.split(' ')[0]}</p></div><span className="text-lg font-extrabold text-ok">{a.score!.toFixed(1)}</span><ChevronRight size={16} className="text-sub" /></button>)}</Card>
      <p className="mt-3 text-xs text-sub">Chỉ em và cô giáo xem được điểm này.</p>
    </>
  )
}

export function SNotifs() {
  const [list, setList] = useState(NOTIFS)
  const I = { assign: ClipboardList, due: Clock, grade: Award, news: Bell } as any
  return (
    <>
      <div className="mb-5 flex items-center justify-between"><h1 className="text-2xl font-extrabold">Thông báo</h1><Button variant="ghost" onClick={() => setList(list.map((n) => ({ ...n, unread: false })))}>Đọc tất cả</Button></div>
      <Card className="divide-y divide-line overflow-hidden">{list.map((n) => { const Ic = I[n.kind]; return <button key={n.id} onClick={() => setList(list.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))} className={cx('flex min-h-16 w-full items-start gap-3 p-4 text-left', n.unread && 'bg-indigo-soft/40')}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-soft text-indigo"><Ic size={18} /></span><div className="min-w-0 flex-1"><p className={cx('text-sm', n.unread ? 'font-bold' : 'font-medium')}>{n.t}</p><p className="text-xs text-sub">{n.s} · {n.time}</p></div>{n.unread && <span className="mt-2 h-2.5 w-2.5 rounded-full bg-indigo" aria-label="Chưa đọc" />}</button> })}</Card>
    </>
  )
}
