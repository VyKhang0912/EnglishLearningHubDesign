import { useState, type ReactNode } from 'react'
import {
  LayoutDashboard, Users, ClipboardList, Library, FolderOpen, CheckCheck, Table2, BarChart3, Megaphone, Bell, Settings, Menu, ChevronsLeft, ChevronsRight, LogOut, Plus, UserPlus, Copy, Search, Upload, MoreHorizontal, Lock, ArrowRightLeft, FileSpreadsheet, GraduationCap, AlertCircle, Clock, Check, Archive, Trash2, KeyRound, ChevronRight,
} from 'lucide-react'
import { CLASSES, STUDENT_NAMES, type ClassItem } from './data'
import { Avatar, Badge, Button, Card, Empty, Field, Input, Modal, PageHead, Progress, Select, Stat, StatusBadge, Tabs, Textarea, Toggle, Chips, GradeBadge, useApp, cx, BackLink } from './ui'
import { Bars, Donut } from './charts'
import { AssignRows } from './teacher2'

const NAV = [
  ['t-dash', 'Tổng quan', LayoutDashboard],
  ['t-classes', 'Lớp học', Users],
  ['t-assign', 'Bài tập', ClipboardList],
  ['t-bank', 'Kho câu hỏi', Library],
  ['t-materials', 'Học liệu', FolderOpen],
  ['t-grading', 'Chấm bài', CheckCheck],
  ['t-gradebook', 'Sổ điểm', Table2],
  ['t-analytics', 'Thống kê', BarChart3],
  ['t-announce', 'Thông báo lớp', Megaphone],
  ['t-notifs', 'Thông báo', Bell],
  ['t-settings', 'Cài đặt', Settings],
] as const
const ACTIVE: Record<string, string> = { 't-class-new': 't-classes', 't-class': 't-classes', 't-assign-edit': 't-assign', 't-review': 't-grading' }

export function TeacherShell({ children }: { children: ReactNode }) {
  const { screen, go, logout } = useApp()
  const [col, setCol] = useState(false)
  const [open, setOpen] = useState(false)
  const [out, setOut] = useState(false)
  const act = ACTIVE[screen] || screen
  const side = (collapsed: boolean) => (
    <nav className="flex h-full flex-col bg-navy text-white" aria-label="Điều hướng giáo viên">
      <div className={cx('flex h-[72px] items-center px-5', collapsed && 'justify-center px-0')}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-gradient-to-br from-indigo to-teal text-lg font-extrabold">E</span>
        {!collapsed && <span className="ml-2.5 text-[15px] font-extrabold leading-tight">English<br />Learning Hub</span>}
      </div>
      <div className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {NAV.map(([id, l, I]) => (
          <button key={id} onClick={() => { go(id); setOpen(false) }} title={collapsed ? l : undefined} aria-current={act === id ? 'page' : undefined} className={cx('relative flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-sm font-semibold transition-colors duration-150', collapsed && 'justify-center px-0', act === id ? 'bg-indigo text-white' : 'text-[#c9d3f3] hover:bg-white/10 hover:text-white')}>
            <I size={19} />
            {!collapsed && l}
            {id === 't-grading' && <span className={cx('rounded-full bg-teal px-1.5 text-[11px] font-bold', collapsed ? 'absolute right-1 top-1' : 'ml-auto')}>20</span>}
          </button>
        ))}
      </div>
      <div className="border-t border-white/10 p-3">
        <button onClick={() => setOut(true)} className={cx('flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-sm font-semibold text-[#c9d3f3] hover:bg-white/10', collapsed && 'justify-center px-0')}><LogOut size={19} />{!collapsed && 'Đăng xuất'}</button>
      </div>
    </nav>
  )
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={cx('hidden shrink-0 transition-all duration-200 lg:block', col ? 'w-[76px]' : 'w-[256px]')}>{side(col)}</aside>
      {open && (
        <div className="fixed inset-0 z-40 bg-ink/50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="anim-slide h-full w-[272px]" style={{ animationName: 'none' }} onClick={(e) => e.stopPropagation()}>{side(false)}</div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
          <button aria-label="Mở menu" className="grid h-10 w-10 place-items-center rounded-lg text-sub hover:bg-bg lg:hidden" onClick={() => setOpen(true)}><Menu /></button>
          <button aria-label="Thu gọn thanh bên" className="hidden h-10 w-10 place-items-center rounded-lg text-sub hover:bg-bg lg:grid" onClick={() => setCol(!col)}>{col ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}</button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search size={16} className="absolute left-3.5 top-3.5 text-sub" />
            <input aria-label="Tìm kiếm" placeholder="Tìm lớp, học sinh, bài tập…" className="h-11 w-full rounded-[10px] bg-bg pl-10 pr-3 text-sm placeholder:text-sub focus:outline-none focus:ring-2 focus:ring-indigo/30" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button aria-label="Thông báo, 3 chưa đọc" onClick={() => go('t-notifs')} className="relative grid h-10 w-10 place-items-center rounded-lg text-sub hover:bg-bg"><Bell size={20} /><span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-err" /></button>
            <button onClick={() => go('t-settings')} className="flex items-center gap-2.5 rounded-lg p-1 pr-2 hover:bg-bg" aria-label="Hồ sơ">
              <Avatar name="Nguyễn Thu Hà" size={36} />
              <span className="hidden text-left leading-tight sm:block"><span className="block text-sm font-bold">Cô Thu Hà</span><span className="block text-xs text-sub">Giáo viên · Admin</span></span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto"><div className="anim-up mx-auto max-w-[1280px] p-4 sm:p-6 lg:p-8" key={screen}>{children}</div></main>
      </div>
      {out && (
        <Modal title="Đăng xuất?" onClose={() => setOut(false)} width="max-w-sm" footer={<><Button variant="secondary" onClick={() => setOut(false)}>Ở lại</Button><Button onClick={logout}>Đăng xuất</Button></>}>
          <p className="text-sm text-sub">Các bản nháp chưa lưu trong trình soạn bài sẽ không được giữ lại.</p>
        </Modal>
      )}
    </div>
  )
}

/* ---------------- Dashboard ---------------- */
export function Dashboard() {
  const { go, classes, assignments } = useApp()
  const pub = assignments.filter((a) => a.status === 'published')
  const toGrade = pub.reduce((s, a) => s + (a.submitted - a.graded), 0)
  const missing = pub.reduce((s, a) => s + (a.total - a.submitted), 0)
  const students = classes.reduce((s, c) => s + c.students, 0)
  const need = pub.filter((a) => a.submitted > a.graded)
  const quick = [
    ['Tạo bài tập', ClipboardList, () => go('t-assign-edit')],
    ['Tạo lớp mới', Plus, () => go('t-class-new')],
    ['Thêm học sinh', UserPlus, () => go('t-class', { id: '6A', tab: 'students', add: true })],
    ['Xem bài cần chấm', CheckCheck, () => go('t-grading')],
    ['Sao chép bài tập', Copy, () => go('t-assign', { dup: 'a2' })],
  ] as const
  return (
    <>
      <PageHead title="Chào buổi sáng, cô Thu Hà" sub="Thứ Sáu, 16/10/2026 · Hôm nay có 20 bài đang chờ cô chấm." />
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {quick.map(([l, I, f], i) => (
          <button key={l} onClick={f} className={cx('flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors duration-150', i === 0 ? 'bg-indigo text-white hover:bg-[#4156d6]' : 'border border-line bg-white text-navy hover:border-indigo hover:text-indigo')}><I size={17} />{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Lớp đang hoạt động" value={classes.filter((c) => !c.archived).length} sub={`${students} học sinh`} icon={<Users size={18} />} />
        <Stat label="Bài đã đăng" value={pub.length} sub="1 bài hẹn giờ · 1 bản nháp" icon={<ClipboardList size={18} />} tone="teal" />
        <Stat label="Cần chấm" value={toGrade} sub="Ưu tiên bài sắp công bố" icon={<CheckCheck size={18} />} tone="warn" />
        <Stat label="Chưa nộp" value={missing} sub="Trên các bài đang mở" icon={<AlertCircle size={18} />} tone="err" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between p-5 pb-3"><h2 className="font-bold">Bài cần xử lý</h2><Button variant="ghost" size="sm" onClick={() => go('t-grading')}>Xem tất cả <ChevronRight size={14} /></Button></div>
          <div className="divide-y divide-line">
            {need.map((a) => (
              <button key={a.id} onClick={() => go('t-grading', { a: a.id })} className="flex w-full items-center gap-4 px-5 py-3.5 text-left hover:bg-bg">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{a.title}</p>
                  <p className="mt-0.5 text-xs text-sub">Lớp {a.classes.join(', ')} · Hạn {a.due.split(' ')[0]}</p>
                </div>
                <div className="hidden w-32 sm:block"><Progress v={(a.submitted / a.total) * 100} /><p className="mt-1 text-xs text-sub">{a.submitted}/{a.total} đã nộp</p></div>
                <Badge tone="warn" dot>{a.submitted - a.graded} chờ chấm</Badge>
              </button>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 font-bold">Sắp hết hạn</h2>
          <div className="space-y-3">
            {pub.filter((a) => a.submitted < a.total).slice(0, 4).map((a) => (
              <div key={a.id} className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-warn-soft text-warn"><Clock size={18} /></span>
                <div className="min-w-0"><p className="truncate text-sm font-semibold">{a.title.replace('English ', 'E')}</p><p className="text-xs text-sub">{a.due} · còn {a.total - a.submitted} bạn chưa nộp</p></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-2 flex items-center justify-between"><h2 className="font-bold">Điểm trung bình theo lớp</h2><span className="text-xs text-sub">Thang 10 · 30 ngày qua</span></div>
          <Bars data={classes.map((c) => ({ label: c.id, value: c.avg, color: c.color }))} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-bold">Tỷ lệ hoàn thành</h2>
          <div className="flex items-center gap-5">
            <Donut value={Math.round(classes.reduce((s, c) => s + c.completion, 0) / classes.length)} color="#0e9f8f" label="Toàn bộ lớp" />
            <ul className="flex-1 space-y-2 text-sm">{classes.map((c) => <li key={c.id} className="flex justify-between"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: c.color }} />{c.id}</span><b>{c.completion}%</b></li>)}</ul>
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <h2 className="mb-3 font-bold">Lớp của tôi</h2>
          <div className="grid gap-3 sm:grid-cols-2">{classes.map((c) => <ClassCard key={c.id} c={c} compact />)}</div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 font-bold">Hoạt động gần đây</h2>
          <ul className="space-y-4 text-sm">
            {[['Lê Minh Anh', 'đã nộp Unit 1: My New School', '8 phút'], ['Trần Bảo Long', 'nộp muộn Unit 1 (6A)', '1 giờ'], ['Phạm Khánh Linh', 'xem kết quả Unit 3: Vocabulary', '3 giờ'], ['Cô đã sao chép', 'Unit 3: Vocabulary → 6B', 'Hôm qua']].map(([n, t, tm]) => (
              <li key={t} className="flex gap-3"><Avatar name={n} size={32} /><div className="min-w-0 flex-1"><p><b>{n}</b> {t}</p><p className="text-xs text-sub">{tm} trước</p></div></li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}

/* ---------------- Classes ---------------- */
export function ClassCard({ c, compact }: { c: ClassItem; compact?: boolean }) {
  const { go } = useApp()
  const full = c.students >= c.max
  return (
    <Card onClick={() => go('t-class', { id: c.id })} className="overflow-hidden">
      <div className="flex items-center gap-3 p-4" style={{ borderTop: `4px solid ${c.color}` }}>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-base font-extrabold text-white" style={{ background: c.color }}>{c.id}</span>
        <div className="min-w-0 flex-1"><p className="truncate font-bold">{c.name} · {c.course}</p><p className="text-xs text-sub">Năm học {c.year}</p></div>
        {c.archived && <Badge>Đã lưu trữ</Badge>}
      </div>
      <div className="px-4 pb-4">
        <div className="mb-1.5 flex justify-between text-xs"><span className="font-semibold">{c.students}/{c.max} học sinh</span>{full && <span className="font-bold text-warn">Đã đầy</span>}</div>
        <Progress v={(c.students / c.max) * 100} tone={full ? 'warn' : 'indigo'} />
        {!compact && <div className="mt-3 flex justify-between text-xs text-sub"><span>TB: <b className="text-ink">{c.avg}</b></span><span>Hoàn thành: <b className="text-ink">{c.completion}%</b></span><span>Mã: <b className="font-mono text-ink">{c.code}</b></span></div>}
      </div>
    </Card>
  )
}

export function ClassList() {
  const { classes, go } = useApp()
  const [q, setQ] = useState('')
  const [f, setF] = useState('active')
  const list = classes.filter((c) => (f === 'active' ? !c.archived : c.archived)).filter((c) => (c.name + c.course).toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <PageHead title="Lớp học" sub={`${classes.filter((c) => !c.archived).length} lớp đang hoạt động`} actions={<Button onClick={() => go('t-class-new')}><Plus size={16} />Tạo lớp mới</Button>} />
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative w-full max-w-xs"><Search size={16} className="absolute left-3.5 top-3.5 text-sub" /><Input placeholder="Tìm lớp…" value={q} onChange={(e: any) => setQ(e.target.value)} className="pl-10" aria-label="Tìm lớp" /></div>
        <Chips options={['Đang hoạt động', 'Đã lưu trữ']} value={[f === 'active' ? 'Đang hoạt động' : 'Đã lưu trữ']} onChange={(v) => setF(v[0] === 'Đang hoạt động' ? 'active' : 'arch')} />
      </div>
      {list.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{list.map((c) => <ClassCard key={c.id} c={c} />)}</div>
      ) : (
        <Card>
          {q ? <Empty search title="Không tìm thấy lớp phù hợp" text={`Không có lớp nào khớp với “${q}”. Thử từ khóa khác.`} action={<Button variant="secondary" onClick={() => setQ('')}>Xóa tìm kiếm</Button>} /> : <Empty title={f === 'active' ? 'Chưa có lớp nào' : 'Chưa có lớp lưu trữ'} text="Tạo lớp đầu tiên để bắt đầu thêm học sinh và giao bài tập." action={<Button onClick={() => go('t-class-new')}><Plus size={16} />Tạo lớp</Button>} />}
        </Card>
      )}
    </>
  )
}

const COLORS = ['#5368ec', '#0e9f8f', '#243b7b', '#c2410c', '#7c3aed', '#be185d']
export function ClassForm() {
  const { go, toast, setClasses, classes, params } = useApp()
  const edit = classes.find((c) => c.id === params?.id)
  const [name, setName] = useState(edit?.name.replace('Lớp ', '') || '')
  const [grade, setGrade] = useState(edit ? [edit.course.replace('English ', 'Khối ')] : ['Khối 6'])
  const [year, setYear] = useState('2026–2027')
  const [color, setColor] = useState(edit?.color || COLORS[0])
  const [max, setMax] = useState(String(edit?.max || 40))
  const [desc, setDesc] = useState('')
  const [err, setErr] = useState('')
  const code = `K${name.toUpperCase() || 'XX'}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const save = () => {
    if (!name.trim()) return setErr('Vui lòng đặt tên lớp, ví dụ 6C')
    if (!edit && classes.some((c) => c.id.toLowerCase() === name.trim().toLowerCase())) return setErr('Tên lớp này đã tồn tại')
    const id = name.trim().toUpperCase()
    if (edit) setClasses((cs) => cs.map((c) => (c.id === edit.id ? { ...c, color, max: +max } : c)))
    else setClasses((cs) => [...cs, { id, name: `Lớp ${id}`, course: `English ${grade[0].replace('Khối ', '')}`, year, students: 0, max: +max || 40, code, color, avg: 0, completion: 0 }])
    toast(edit ? 'Đã lưu thay đổi lớp' : `Đã tạo lớp ${id}. Hãy thêm học sinh đầu tiên.`)
    go('t-class', { id: edit ? edit.id : id, tab: edit ? 'overview' : 'students' })
  }
  return (
    <>
      <PageHead back={<BackLink to="t-classes" label="Lớp học" />} title={edit ? `Chỉnh sửa ${edit.name}` : 'Tạo lớp mới'} sub="Học sinh sẽ dùng mã lớp để tham gia, hoặc cô thêm trực tiếp." />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="space-y-5 p-6">
          <Field label="Tên lớp" error={err}><Input value={name} onChange={(e: any) => { setName(e.target.value); setErr('') }} placeholder="VD: 6C" error={err} disabled={!!edit} /></Field>
          <Field label="Khối lớp"><Chips options={['Khối 6', 'Khối 7', 'Khối 8', 'Khối 9']} value={grade} onChange={setGrade} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Năm học"><Select value={year} onChange={(e: any) => setYear(e.target.value)}><option>2026–2027</option><option>2025–2026</option></Select></Field>
            <Field label="Sĩ số tối đa" hint="Mặc định 40 học sinh"><Input type="number" min={1} max={60} value={max} onChange={(e: any) => setMax(e.target.value)} /></Field>
          </div>
          <Field label="Mô tả"><Textarea rows={3} value={desc} onChange={(e: any) => setDesc(e.target.value)} placeholder="VD: Lớp học thứ Ba–Năm, tiết 3–4." /></Field>
          <Field label="Màu đại diện"><div className="flex gap-3">{COLORS.map((c) => <button key={c} aria-label={`Màu ${c}`} aria-pressed={color === c} onClick={() => setColor(c)} className="grid h-10 w-10 place-items-center rounded-full ring-offset-2 transition-all" style={{ background: c, boxShadow: color === c ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : 'none' }}>{color === c && <Check size={16} className="text-white" />}</button>)}</div></Field>
          <div className="flex justify-end gap-2 border-t border-line pt-5"><Button variant="secondary" onClick={() => go('t-classes')}>Hủy</Button><Button onClick={save}>{edit ? 'Lưu thay đổi' : 'Tạo lớp'}</Button></div>
        </Card>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-sub">Xem trước</p>
          <ClassCard c={{ id: name.toUpperCase() || '?', name: `Lớp ${name.toUpperCase() || '…'}`, course: `English ${grade[0].replace('Khối ', '')}`, year, students: edit?.students || 0, max: +max || 40, code: edit?.code || code, color, avg: 0, completion: 0 }} />
          <Card className="mt-4 p-4 text-sm text-sub"><p className="font-bold text-ink">Mã tham gia lớp</p><p className="mt-1 font-mono text-lg font-bold text-indigo">{edit?.code || code}</p><p className="mt-1">Học sinh nhập mã này sau khi đăng nhập. Cô có thể khóa mã bất cứ lúc nào.</p></Card>
        </div>
      </div>
    </>
  )
}

/* ---------------- Class detail ---------------- */
export function ClassDetail() {
  const { params, classes, go, toast, assignments, newStudents, setNewStudents, setClasses } = useApp()
  const c = classes.find((x) => x.id === params?.id) || classes[0]
  const [tab, setTab] = useState(params?.tab || 'overview')
  const [modal, setModal] = useState<string | null>(params?.add ? 'add' : null)
  const [q, setQ] = useState('')
  const [locked, setLocked] = useState<string[]>(['HS6A009'])
  const [menu, setMenu] = useState<string | null>(null)
  const [mv, setMv] = useState<string | null>(null)
  const full = c.students >= c.max
  const own = newStudents.filter((s) => s.cls === c.id)
  const base = c.id === '6A' || c.id === '6B' || c.id === '7A' || c.id === '8A' ? STUDENT_NAMES.map(([n, code, s]) => ({ name: n, code: code.replace('6A', c.id), score: s })) : []
  const rows = [...base, ...own.map((s) => ({ ...s, score: 0 }))].filter((s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.code.toLowerCase().includes(q.toLowerCase()))
  const myAssign = assignments.filter((a) => a.classes.includes(c.id))
  const addStudents = (list: { name: string; code: string }[]) => {
    const room = c.max - c.students
    const ok = list.slice(0, room)
    setNewStudents((s) => [...s, ...ok.map((x) => ({ ...x, cls: c.id }))])
    setClasses((cs) => cs.map((x) => (x.id === c.id ? { ...x, students: x.students + ok.length } : x)))
    return ok.length
  }
  return (
    <>
      <BackLink to="t-classes" label="Lớp học" />
      <Card className="mb-6 overflow-hidden">
        <div className="h-20" style={{ background: `linear-gradient(120deg, ${c.color}, ${c.color}cc)` }} />
        <div className="flex flex-wrap items-end gap-4 p-5 pt-0">
          <span className="-mt-8 grid h-16 w-16 place-items-center rounded-2xl border-4 border-white text-xl font-extrabold text-white" style={{ background: c.color }}>{c.id}</span>
          <div className="min-w-[200px] flex-1"><h1 className="text-xl font-extrabold">{c.name} · {c.course}</h1><p className="text-sm text-sub">Năm học {c.year} · Mã lớp <b className="font-mono text-ink">{c.code}</b></p></div>
          <div className="w-52"><div className="mb-1 flex justify-between text-xs"><b>{c.students}/{c.max} học sinh</b>{full && <b className="text-warn">Đã đầy</b>}</div><Progress v={(c.students / c.max) * 100} tone={full ? 'warn' : 'indigo'} /></div>
          <Button onClick={() => go('t-assign-edit', { cls: c.id })}><Plus size={16} />Giao bài</Button>
        </div>
      </Card>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'overview', label: 'Tổng quan' }, { id: 'assignments', label: 'Bài tập', count: myAssign.length }, { id: 'students', label: 'Học sinh', count: c.students }, { id: 'grades', label: 'Điểm' }, { id: 'materials', label: 'Học liệu' }, { id: 'settings', label: 'Cài đặt' }]} />
      <div className="mt-6">
        {tab === 'overview' && (
          <div className="grid gap-4 lg:grid-cols-3">
            <Stat label="Điểm trung bình" value={c.avg || '—'} icon={<GraduationCap size={18} />} />
            <Stat label="Hoàn thành bài tập" value={`${c.completion}%`} icon={<Check size={18} />} tone="teal" />
            <Stat label="Bài đang mở" value={myAssign.filter((a) => a.status === 'published').length} icon={<ClipboardList size={18} />} tone="warn" />
            <Card className="p-5 lg:col-span-3"><h2 className="mb-2 font-bold">Bài tập gần đây</h2>{myAssign.length ? <AssignRows list={myAssign.slice(0, 3)} /> : <Empty title="Chưa có bài tập" text="Giao bài đầu tiên cho lớp này." action={<Button onClick={() => go('t-assign-edit', { cls: c.id })}>Tạo bài mới</Button>} />}</Card>
          </div>
        )}
        {tab === 'assignments' && <Card className="p-5">{myAssign.length ? <AssignRows list={myAssign} /> : <Empty title="Chưa có bài tập" text="Giao bài đầu tiên cho lớp này." action={<Button onClick={() => go('t-assign-edit', { cls: c.id })}>Tạo bài mới</Button>} />}</Card>}
        {tab === 'students' && (
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
              <div className="relative min-w-[200px] flex-1"><Search size={16} className="absolute left-3.5 top-3.5 text-sub" /><Input value={q} onChange={(e: any) => setQ(e.target.value)} placeholder="Tìm tên hoặc mã học sinh" className="pl-10" aria-label="Tìm học sinh" /></div>
              <Button variant="secondary" onClick={() => setModal('import')} disabled={full}><FileSpreadsheet size={16} />Nhập từ Excel</Button>
              <Button onClick={() => setModal('add')} disabled={full}><UserPlus size={16} />Thêm học sinh</Button>
            </div>
            {full && <p className="flex items-center gap-2 bg-warn-soft px-4 py-2.5 text-sm font-medium text-warn"><AlertCircle size={16} />Lớp đã đủ {c.max} học sinh. Tăng sĩ số trong Cài đặt để thêm.</p>}
            {rows.length === 0 && !q ? (
              <Empty title="Lớp chưa có học sinh" text="Thêm từng em, nhập danh sách từ Excel hoặc chia sẻ mã lớp để học sinh tự tham gia." action={<div className="flex flex-wrap justify-center gap-2"><Button onClick={() => setModal('add')}><UserPlus size={16} />Thêm học sinh</Button><Button variant="secondary" onClick={() => { navigator.clipboard?.writeText(c.code); toast(`Đã sao chép mã lớp ${c.code}`) }}><Copy size={16} />Sao chép mã lớp</Button></div>} />
            ) : rows.length === 0 ? (
              <Empty search title="Không có kết quả" text={`Không tìm thấy học sinh “${q}”.`} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-bg text-left text-xs font-bold uppercase tracking-wide text-sub"><tr><th className="px-4 py-3">Học sinh</th><th>Mã</th><th>Điểm TB</th><th>Tiến độ</th><th>Trạng thái</th><th /></tr></thead>
                  <tbody className="divide-y divide-line">
                    {rows.map((s, i) => (
                      <tr key={s.code} className="hover:bg-bg/60">
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar name={s.name} size={32} /><b>{s.name}</b></div></td>
                        <td className="font-mono text-xs text-sub">{s.code}</td>
                        <td>{s.score ? <GradeBadge v={s.score} /> : <span className="text-sub">—</span>}</td>
                        <td className="w-40"><Progress v={s.score ? 60 + s.score * 4 : 0} tone="teal" /></td>
                        <td>{locked.includes(s.code) ? <Badge tone="err" dot>Đã khóa</Badge> : <Badge tone="ok" dot>Hoạt động</Badge>}</td>
                        <td className="relative px-2">
                          <button aria-label={`Thao tác với ${s.name}`} onClick={() => setMenu(menu === s.code ? null : s.code)} className="grid h-9 w-9 place-items-center rounded-lg text-sub hover:bg-white"><MoreHorizontal size={18} /></button>
                          {menu === s.code && (
                            <div className={cx('absolute right-2 z-20 w-52 rounded-xl border border-line bg-white p-1.5 shadow-pop', i > rows.length - 3 && rows.length > 3 ? 'bottom-10' : 'top-10')}>
                              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-bg" onClick={() => { setMv(s.name); setModal('move'); setMenu(null) }}><ArrowRightLeft size={15} />Chuyển lớp</button>
                              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-bg" onClick={() => { setLocked((l) => (l.includes(s.code) ? l.filter((x) => x !== s.code) : [...l, s.code])); toast(locked.includes(s.code) ? 'Đã mở khóa quyền tham gia' : 'Đã khóa quyền tham gia lớp', 'info'); setMenu(null) }}><Lock size={15} />{locked.includes(s.code) ? 'Mở khóa' : 'Khóa quyền tham gia'}</button>
                              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-bg" onClick={() => { toast(`Đã đặt lại mật khẩu cho ${s.name}`); setMenu(null) }}><KeyRound size={15} />Cấp lại mật khẩu</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {rows.length > 0 && <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-sub"><span>Hiển thị {rows.length} / {c.students} học sinh</span><div className="flex gap-1"><Button size="sm" variant="secondary" disabled>Trước</Button><Button size="sm" variant="secondary">Sau</Button></div></div>}
          </Card>
        )}
        {tab === 'grades' && (
          <Card className="p-5"><h2 className="mb-3 font-bold">Điểm theo bài tập</h2>{myAssign.filter((a) => a.status === 'published').map((a) => <div key={a.id} className="flex items-center gap-4 border-t border-line py-3 first:border-0"><p className="min-w-0 flex-1 truncate text-sm font-semibold">{a.title}</p><span className="text-xs text-sub">{a.graded}/{a.submitted} đã chấm</span></div>)}<Button className="mt-3" variant="secondary" onClick={() => go('t-gradebook')}><Table2 size={16} />Mở sổ điểm đầy đủ</Button></Card>
        )}
        {tab === 'materials' && (
          <Card><Empty title="Học liệu của lớp" text="Gắn tài liệu từ kho học liệu để học sinh lớp này xem." action={<Button onClick={() => go('t-materials')}>Mở kho học liệu</Button>} /></Card>
        )}
        {tab === 'settings' && <ClassSettings c={c} />}
      </div>
      {modal === 'add' && <AddStudent c={c} onClose={() => setModal(null)} onAdd={(n, code) => { addStudents([{ name: n, code }]); toast(`Đã thêm ${n} vào ${c.name}`); setModal(null) }} />}
      {modal === 'import' && <ImportModal c={c} onClose={() => setModal(null)} onImport={() => { const n = addStudents([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => ({ name: ['An Nhiên', 'Bảo Châu', 'Cát Tường', 'Duy Khang', 'Gia Bảo', 'Hà My', 'Khôi Nguyên', 'Lan Anh', 'Minh Khôi', 'Ngọc Diệp'][i - 1], code: `HS${c.id}${100 + i}` }))); toast(`Đã nhập ${n} học sinh. 2 dòng lỗi được bỏ qua.`); setModal(null) }} />}
      {modal === 'move' && <Modal title={`Chuyển ${mv} sang lớp khác`} onClose={() => setModal(null)} width="max-w-sm" footer={<><Button variant="secondary" onClick={() => setModal(null)}>Hủy</Button><Button onClick={() => { toast(`Đã chuyển ${mv}. Điểm và bài nộp được giữ nguyên.`); setModal(null) }}>Chuyển lớp</Button></>}><Field label="Lớp đích"><Select>{classes.filter((x) => x.id !== c.id && x.students < x.max).map((x) => <option key={x.id}>{x.name}</option>)}</Select></Field><p className="mt-3 text-xs text-sub">Lớp đã đủ sĩ số không hiển thị trong danh sách.</p></Modal>}
    </>
  )
}

function AddStudent({ c, onClose, onAdd }: { c: ClassItem; onClose: () => void; onAdd: (n: string, code: string) => void }) {
  const [n, setN] = useState('')
  const [err, setErr] = useState('')
  const code = `HS${c.id}${String(c.students + 1).padStart(3, '0')}`
  return (
    <Modal title="Thêm học sinh" onClose={onClose} width="max-w-md" footer={<><Button variant="secondary" onClick={onClose}>Hủy</Button><Button onClick={() => (n.trim().split(' ').length < 2 ? setErr('Nhập đầy đủ họ và tên') : onAdd(n.trim(), code))}>Thêm vào lớp</Button></>}>
      <div className="space-y-4">
        <Field label="Họ và tên" error={err}><Input value={n} onChange={(e: any) => { setN(e.target.value); setErr('') }} placeholder="VD: Nguyễn Thảo Vy" error={err} autoFocus /></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="Mã học sinh"><Input value={code} readOnly /></Field><Field label="Mật khẩu ban đầu"><Input value="hoc2026" readOnly /></Field></div>
        <p className="rounded-xl bg-indigo-soft p-3 text-xs text-[#3a4ec9]">Học sinh không cần email. Mật khẩu ban đầu sẽ được yêu cầu đổi ở lần đăng nhập đầu tiên.</p>
      </div>
    </Modal>
  )
}
function ImportModal({ c, onClose, onImport }: { c: ClassItem; onClose: () => void; onImport: () => void }) {
  const [f, setF] = useState<string | null>(null)
  return (
    <Modal title="Nhập danh sách từ Excel" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Hủy</Button><Button disabled={!f} onClick={onImport}>Nhập 10 học sinh hợp lệ</Button></>}>
      {!f ? (
        <button onClick={() => setF('danh-sach-lop-' + c.id + '.xlsx')} className="flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-indigo/40 bg-indigo-soft/50 px-6 py-10 text-center transition-colors hover:bg-indigo-soft">
          <Upload className="mb-3 text-indigo" /><b>Kéo thả hoặc bấm để chọn tệp .xlsx</b><span className="mt-1 text-sm text-sub">Cột: Họ tên, Mã học sinh (tùy chọn)</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-line p-3"><FileSpreadsheet className="text-ok" /><div className="flex-1 text-sm"><b>{f}</b><p className="text-xs text-sub">12 dòng · 10 hợp lệ · 2 lỗi</p></div></div>
          <div className="rounded-xl bg-err-soft p-3 text-sm text-[#b91c1c]"><b>2 dòng lỗi sẽ bị bỏ qua</b><br />Dòng 4: thiếu họ tên · Dòng 9: mã học sinh trùng.</div>
          <p className="text-xs text-sub">Sĩ số còn lại: {c.max - c.students} chỗ. Học sinh vượt sĩ số sẽ không được thêm.</p>
        </div>
      )}
    </Modal>
  )
}

function ClassSettings({ c }: { c: ClassItem }) {
  const { go, toast, setClasses } = useApp()
  const [open, setOpen] = useState<null | 'archive' | 'delete'>(null)
  const [join, setJoin] = useState(true)
  return (
    <div className="max-w-2xl space-y-4">
      <Card className="divide-y divide-line">
        <div className="flex items-center gap-4 p-5"><div className="flex-1"><b>Cho phép tham gia bằng mã lớp</b><p className="text-sm text-sub">Mã hiện tại: <span className="font-mono font-bold text-ink">{c.code}</span></p></div><Toggle on={join} onChange={(v) => { setJoin(v); toast(v ? 'Đã bật mã tham gia' : 'Đã khóa mã tham gia', 'info') }} label="Mã lớp" /></div>
        <div className="flex items-center gap-4 p-5"><div className="flex-1"><b>Thông tin lớp</b><p className="text-sm text-sub">Tên, khối, sĩ số tối đa, màu đại diện.</p></div><Button variant="secondary" onClick={() => go('t-class-new', { id: c.id })}>Chỉnh sửa</Button></div>
      </Card>
      <Card className="border-err/30 p-5">
        <b className="text-err">Vùng nhạy cảm</b>
        <div className="mt-3 flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setOpen('archive')}><Archive size={16} />Lưu trữ lớp</Button><Button variant="secondary" onClick={() => setOpen('delete')} className="!text-err"><Trash2 size={16} />Xóa lớp</Button></div>
      </Card>
      {open && (
        <Modal title={open === 'archive' ? `Lưu trữ ${c.name}?` : `Xóa vĩnh viễn ${c.name}?`} onClose={() => setOpen(null)} width="max-w-sm" footer={<><Button variant="secondary" onClick={() => setOpen(null)}>Hủy</Button><Button variant={open === 'delete' ? 'danger' : 'primary'} onClick={() => { setClasses((cs) => (open === 'delete' ? cs.filter((x) => x.id !== c.id) : cs.map((x) => (x.id === c.id ? { ...x, archived: true } : x)))); toast(open === 'delete' ? 'Đã xóa lớp' : 'Đã lưu trữ lớp'); go('t-classes') }}>{open === 'delete' ? 'Xóa lớp' : 'Lưu trữ'}</Button></>}>
          <p className="text-sm text-sub">{open === 'archive' ? 'Học sinh sẽ không làm thêm bài mới, nhưng điểm và bài nộp vẫn được giữ. Cô có thể khôi phục sau.' : `Thao tác này xóa ${c.students} học sinh khỏi lớp cùng toàn bộ bài nộp và điểm. Không thể hoàn tác.`}</p>
        </Modal>
      )}
    </div>
  )
}
export { CLASSES }
