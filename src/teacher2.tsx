import { useState } from 'react'
import { Plus, Copy, MoreHorizontal, Pencil, Archive, Eye, Trash2, ArrowUp, ArrowDown, GripVertical, AlertTriangle, Library, Search, Upload, FileText, Music, Video, BookOpen, Languages, Folder, Check, Send, Save, Link2, CalendarClock, Smartphone, ChevronDown } from 'lucide-react'
import { ASSIGNMENTS, type Assignment } from './data'
import { Badge, Button, Card, Chips, Empty, Field, Input, Modal, PageHead, Progress, Select, StatusBadge, Tabs, Textarea, Toggle, useApp, cx, Drawer, BackLink } from './ui'

/* ---------- Assignment rows with menu + duplicate ---------- */
export function AssignRows({ list, startDup }: { list: Assignment[]; startDup?: string }) {
  const { go } = useApp()
  const [menu, setMenu] = useState<string | null>(null)
  const [dup, setDup] = useState<Assignment | null>(list.find((a) => a.id === startDup) || null)
  const [del, setDel] = useState<Assignment | null>(null)
  const { setAssignments, toast } = useApp()
  return (
    <>
      <div className="divide-y divide-line">
        {list.map((a) => (
          <div key={a.id} className="relative flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5">
            <button onClick={() => go('t-assign-edit', { id: a.id })} className="min-w-0 flex-1 basis-64 text-left">
              <p className="truncate font-semibold hover:text-indigo">{a.title}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-sub">
                {a.classes.map((c) => <Badge key={c} tone="indigo">{c}</Badge>)}<span>{a.type}</span><span>· {a.points} điểm</span><span>· {a.minutes} phút</span>
                {a.copiedFrom && <span className="inline-flex items-center gap-1 text-teal"><Link2 size={11} />Sao chép từ {a.copiedFrom}</span>}
              </p>
            </button>
            <StatusBadge s={a.status} />
            <div className="hidden w-36 md:block"><Progress v={a.total ? (a.submitted / a.total) * 100 : 0} tone="teal" /><p className="mt-1 text-xs text-sub">{a.submitted}/{a.total} đã nộp</p></div>
            <p className="hidden w-32 text-xs text-sub lg:block">Hạn: {a.due}</p>
            <button aria-label={`Menu bài ${a.title}`} aria-expanded={menu === a.id} onClick={() => setMenu(menu === a.id ? null : a.id)} className="grid h-10 w-10 place-items-center rounded-lg text-sub hover:bg-bg"><MoreHorizontal size={18} /></button>
            {menu === a.id && (
              <div className="absolute right-0 top-12 z-20 w-64 rounded-xl border border-line bg-white p-1.5 shadow-pop anim-up">
                {[
                  [Pencil, 'Chỉnh sửa', () => go('t-assign-edit', { id: a.id })],
                  [Copy, 'Nhân bản / Sao chép sang lớp khác', () => setDup(a)],
                  [Eye, 'Xem dưới góc nhìn học sinh', () => go('t-assign-edit', { id: a.id, preview: true })],
                  [Archive, 'Lưu trữ', () => { setAssignments((l) => l.filter((x) => x.id !== a.id)); toast('Đã lưu trữ bài tập', 'info') }],
                  [Trash2, 'Xóa bài', () => setDel(a)],
                ].map(([I, l, f]: any) => (
                  <button key={l} onClick={() => { setMenu(null); f() }} className={cx('flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-bg', l === 'Xóa bài' && 'text-err')}><I size={15} />{l}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {dup && <DuplicateDrawer a={dup} onClose={() => setDup(null)} />}
      {del && (
        <Modal title="Xóa bài tập này?" onClose={() => setDel(null)} width="max-w-sm" footer={<><Button variant="secondary" onClick={() => setDel(null)}>Hủy</Button><Button variant="danger" onClick={() => { setAssignments((l) => l.filter((x) => x.id !== del.id)); toast('Đã xóa bài tập'); setDel(null) }}>Xóa bài</Button></>}>
          <p className="text-sm text-sub">“{del.title}” sẽ bị xóa cùng {del.submitted} bài nộp và điểm của học sinh. Cô nên chọn <b>Lưu trữ</b> nếu muốn giữ kết quả.</p>
        </Modal>
      )}
    </>
  )
}

function DuplicateDrawer({ a, onClose }: { a: Assignment; onClose: () => void }) {
  const { classes, setAssignments, toast, go } = useApp()
  const names = classes.filter((c) => !c.archived).map((c) => c.id)
  const [target, setTarget] = useState<string[]>(names.includes('6B') && a.classes[0] !== '6B' ? ['6B'] : [])
  const [title, setTitle] = useState(a.title)
  const [due, setDue] = useState('2026-10-30T23:59')
  const [keep, setKeep] = useState(true)
  const [edit, setEdit] = useState(false)
  const [err, setErr] = useState('')
  const make = (publish: boolean) => {
    if (!target.length) return setErr('Chọn ít nhất một lớp đích')
    if (!title.trim()) return setErr('Tên bài tập không được để trống')
    const fmt = due.split('T')[0].split('-').reverse().join('/') + ' ' + due.split('T')[1]
    const created = target.map((cl, i) => ({
      ...a, id: `c${Date.now()}${i}`, title: target.length > 1 ? `${title} (${cl})` : title, classes: [cl], status: publish ? ('published' as const) : ('draft' as const),
      due: publish ? fmt : '—', assigned: publish ? '16/10/2026' : '—', submitted: 0, graded: 0, total: classes.find((c) => c.id === cl)?.students || 0, copiedFrom: a.classes[0],
    }))
    setAssignments((l) => [...created, ...l])
    toast(publish ? `Đã đăng ${created.length} bài vào ${target.join(', ')}. Điểm và bài nộp không được sao chép.` : 'Đã lưu bản nháp', 'ok', { label: 'Mở bài vừa sao chép', to: edit ? 't-assign-edit' : 't-assign', params: { id: created[0].id } })
    if (edit) go('t-assign-edit', { id: created[0].id })
    onClose()
  }
  return (
    <Drawer title="Sao chép bài tập" sub={`Từ: ${a.title} (lớp ${a.classes.join(', ')})`} onClose={onClose} footer={<><Button variant="secondary" onClick={() => make(false)}><Save size={16} />Lưu nháp</Button><Button onClick={() => make(true)}><Send size={16} />Đăng ngay</Button></>}>
      <div className="flex gap-3 rounded-xl bg-teal-soft p-3.5 text-sm text-[#0b6e63]"><Link2 size={18} className="mt-0.5 shrink-0" /><p><b>Bản sao hoàn toàn độc lập.</b> Sửa bài ở lớp mới không ảnh hưởng bài gốc. Điểm và bài nộp của học sinh <b>không</b> được sao chép.</p></div>
      <Field label="1. Chọn lớp đích" error={err}><Chips multi options={names} value={target} onChange={(v) => { setTarget(v); setErr('') }} /></Field>
      {target.length > 1 && <p className="-mt-2 text-xs text-sub">Mỗi lớp nhận một bản riêng, tên được gắn hậu tố lớp.</p>}
      <Field label="2. Tên bài tập"><Input value={title} onChange={(e: any) => { setTitle(e.target.value); setErr('') }} /></Field>
      <Field label="3. Hạn nộp mới"><Input type="datetime-local" value={due} onChange={(e: any) => setDue(e.target.value)} /></Field>
      <div className="flex items-center gap-4 rounded-xl border border-line p-4"><div className="flex-1"><b className="text-sm">4. Giữ cài đặt chấm điểm</b><p className="text-xs text-sub">{keep ? `Giữ thang ${a.points} điểm, ${a.minutes} phút, nộp muộn ${a.late ? 'được phép' : 'không'}` : 'Cài đặt lại ở bước chỉnh sửa'}</p></div><Toggle on={keep} onChange={setKeep} label="Giữ cài đặt chấm điểm" /></div>
      <div className="flex items-center gap-4 rounded-xl border border-line p-4"><div className="flex-1"><b className="text-sm">5. Điều chỉnh nội dung ngay</b><p className="text-xs text-sub">Mở trình soạn bài sau khi sao chép</p></div><Toggle on={edit} onChange={setEdit} label="Điều chỉnh nội dung" /></div>
    </Drawer>
  )
}

/* ---------- Assignment list ---------- */
export function AssignList() {
  const { assignments, go, params, classes } = useApp()
  const [tab, setTab] = useState('all')
  const [cls, setCls] = useState('all')
  const [q, setQ] = useState('')
  const list = assignments.filter((a) => (tab === 'all' || a.status === tab) && (cls === 'all' || a.classes.includes(cls)) && a.title.toLowerCase().includes(q.toLowerCase()))
  const cnt = (s: string) => assignments.filter((a) => a.status === s).length
  return (
    <>
      <PageHead title="Bài tập" sub="Bài đã giao cho từng lớp. Kho câu hỏi nằm riêng ở mục Kho câu hỏi." actions={<><Button variant="secondary" onClick={() => go('t-bank')}><Library size={16} />Kho câu hỏi</Button><Button onClick={() => go('t-assign-edit')}><Plus size={16} />Tạo bài tập</Button></>} />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'all', label: 'Tất cả', count: assignments.length }, { id: 'published', label: 'Đang mở', count: cnt('published') }, { id: 'scheduled', label: 'Hẹn giờ', count: cnt('scheduled') }, { id: 'draft', label: 'Bản nháp', count: cnt('draft') }]} />
      <div className="my-4 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] max-w-sm flex-1"><Search size={16} className="absolute left-3.5 top-3.5 text-sub" /><Input value={q} onChange={(e: any) => setQ(e.target.value)} placeholder="Tìm bài tập…" className="pl-10" aria-label="Tìm bài tập" /></div>
        <Select value={cls} onChange={(e: any) => setCls(e.target.value)} className="!w-40" aria-label="Lọc theo lớp"><option value="all">Tất cả lớp</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
      </div>
      <Card className="px-5">{list.length ? <AssignRows list={list} startDup={params?.dup} /> : <Empty search={!!q} title={q ? 'Không tìm thấy bài tập' : 'Chưa có bài tập'} text={q ? 'Thử từ khóa hoặc bộ lọc khác.' : 'Tạo bài tập đầu tiên hoặc sao chép từ lớp khác.'} action={!q && <Button onClick={() => go('t-assign-edit')}>Tạo bài tập</Button>} />}</Card>
    </>
  )
}

/* ---------- Question builder ---------- */
export type BQ = { id: number; kind: string; text: string; options: string[]; correct: number[]; answer: string; points: number; skill: string; difficulty: string; required: boolean; explain: string; section?: boolean }
const TYPES: [string, string, 'choice' | 'multi' | 'tf' | 'text' | 'pairs' | 'reorder' | 'free'][] = [
  ['Multiple Choice', 'Chọn một đáp án', 'choice'],
  ['Multiple Select', 'Chọn nhiều đáp án', 'multi'],
  ['True / False', 'Đúng hoặc sai', 'tf'],
  ['Fill in the Blanks', 'Điền vào chỗ trống', 'text'],
  ['Matching', 'Nối từ / câu', 'pairs'],
  ['Sentence Reordering', 'Sắp xếp câu', 'reorder'],
  ['Reading Comprehension', 'Đoạn văn + câu hỏi', 'choice'],
  ['Listening Comprehension', 'Audio + câu hỏi', 'choice'],
  ['Short Answer', 'Trả lời ngắn', 'text'],
  ['Essay / Writing', 'Bài viết, giáo viên chấm', 'free'],
  ['Vocabulary Practice', 'Từ vựng', 'choice'],
  ['Grammar Practice', 'Ngữ pháp', 'choice'],
]
const kindOf = (k: string) => TYPES.find((t) => t[0] === k)![2]
const mk = (kind: string, id: number): BQ => {
  const t = kindOf(kind)
  return { id, kind, text: '', options: t === 'tf' ? ['True', 'False'] : t === 'choice' || t === 'multi' ? ['', '', '', ''] : t === 'pairs' ? ['|', '|', '|'] : t === 'reorder' ? ['', '', ''] : [], correct: [], answer: '', points: kind.startsWith('Essay') ? 3 : 1, skill: kind.startsWith('Listening') ? 'Listening' : kind.startsWith('Essay') ? 'Writing' : kind.startsWith('Vocab') ? 'Vocabulary' : kind.startsWith('Reading') ? 'Reading' : 'Grammar', difficulty: 'Trung bình', required: true, explain: '' }
}
const SEED: BQ[] = [
  { ...mk('Multiple Choice', 1), text: 'My new school ______ a big library.', options: ['have', 'has', 'is having', 'are'], correct: [1], points: 1.5, explain: 'Chủ ngữ số ít → has.' },
  { ...mk('True / False', 2), text: 'The school has twenty classrooms.', correct: [0], points: 1.5 },
  { ...mk('Fill in the Blanks', 3), text: 'Our teacher always ______ us to do homework. (remind)', answer: 'reminds', points: 2, skill: 'Vocabulary' },
  { ...mk('Essay / Writing', 4), text: 'Write 40–60 words about your new school.', points: 2, skill: 'Writing' },
]
export const BANK = [
  { id: 'b1', text: 'There ______ many students in the yard.', kind: 'Multiple Choice', grade: 'Khối 6', unit: 'Unit 1', skill: 'Grammar', diff: 'Dễ', used: 6 },
  { id: 'b2', text: 'Match each school subject with its picture.', kind: 'Matching', grade: 'Khối 6', unit: 'Unit 1', skill: 'Vocabulary', diff: 'Dễ', used: 4 },
  { id: 'b3', text: 'Listen and tick the activity Nam does at 6.30.', kind: 'Listening Comprehension', grade: 'Khối 6', unit: 'Unit 2', skill: 'Listening', diff: 'Trung bình', used: 3 },
  { id: 'b4', text: 'Why do volunteers clean the beach every month?', kind: 'Reading Comprehension', grade: 'Khối 7', unit: 'Unit 3', skill: 'Reading', diff: 'Trung bình', used: 5 },
  { id: 'b5', text: 'Write a paragraph about a community service you joined.', kind: 'Essay / Writing', grade: 'Khối 7', unit: 'Unit 3', skill: 'Writing', diff: 'Khó', used: 2 },
  { id: 'b6', text: 'The homework ______ by the students yesterday. (do)', kind: 'Fill in the Blanks', grade: 'Khối 8', unit: 'Grammar', skill: 'Grammar', diff: 'Trung bình', used: 7 },
  { id: 'b7', text: 'Reorder: school / goes / to / She / every / day.', kind: 'Sentence Reordering', grade: 'Khối 6', unit: 'Unit 1', skill: 'Grammar', diff: 'Dễ', used: 8 },
]

function problems(q: BQ): string[] {
  const p: string[] = []
  const t = kindOf(q.kind)
  if (!q.text.trim()) p.push('Chưa có nội dung câu hỏi')
  if ((t === 'choice' || t === 'multi') && q.options.filter((o) => o.trim()).length < 2) p.push('Cần ít nhất 2 đáp án')
  if ((t === 'choice' || t === 'tf') && q.correct.length !== 1) p.push('Chưa chọn đáp án đúng')
  if (t === 'multi' && q.correct.length < 1) p.push('Chưa chọn đáp án đúng')
  if (t === 'text' && !q.answer.trim()) p.push('Chưa nhập đáp án đúng')
  if (t === 'pairs' && q.options.some((o) => !o.split('|')[0].trim() || !o.split('|')[1]?.trim())) p.push('Có cặp nối chưa điền đủ')
  if (t === 'reorder' && q.options.some((o) => !o.trim())) p.push('Có phần chưa điền')
  return p
}

export function Editor() {
  const { params, assignments, setAssignments, go, toast, classes } = useApp()
  const ex = assignments.find((a) => a.id === params?.id)
  const [step, setStep] = useState<'info' | 'q'>(params?.id || params?.cls ? 'info' : 'info')
  const [title, setTitle] = useState(ex?.title || '')
  const [desc, setDesc] = useState('')
  const [targets, setTargets] = useState<string[]>(ex?.classes || (params?.cls ? [params.cls] : []))
  const [due, setDue] = useState('2026-10-30T23:59')
  const [when, setWhen] = useState<'now' | 'later'>('now')
  const [attempts, setAttempts] = useState('1')
  const [minutes, setMinutes] = useState(String(ex?.minutes || 20))
  const [late, setLate] = useState(ex?.late ?? false)
  const [reveal, setReveal] = useState('after-grade')
  const [qs, setQs] = useState<BQ[]>(ex || params?.id ? SEED : params?.bank ? params.bank : [])
  const [sel, setSel] = useState(0)
  const [addMenu, setAddMenu] = useState(false)
  const [modal, setModal] = useState<null | 'preview' | 'check' | 'bank'>(params?.preview ? 'preview' : null)
  const [errs, setErrs] = useState<{ title?: string; cls?: string }>({})
  const [dragI, setDragI] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)
  const nid = () => Math.max(0, ...qs.map((q) => q.id)) + 1
  const upd = (patch: Partial<BQ>) => { setQs((l) => l.map((q, i) => (i === sel ? { ...q, ...patch } : q))); setSaved(false) }
  const move = (i: number, j: number) => { if (j < 0 || j >= qs.length) return; setQs((l) => { const c = [...l]; const [x] = c.splice(i, 1); c.splice(j, 0, x); return c }); setSel(j) }
  const total = qs.filter((q) => !q.section).reduce((s, q) => s + (+q.points || 0), 0)
  const issues = qs.flatMap((q, i) => (q.section ? [] : problems(q).map((m) => ({ i, m }))))
  const q = qs[sel]
  const infoOk = () => {
    const e: any = {}
    if (!title.trim()) e.title = 'Vui lòng nhập tên bài tập'
    if (!targets.length) e.cls = 'Chọn ít nhất một lớp'
    setErrs(e)
    return !e.title && !e.cls
  }
  const save = (publish: boolean) => {
    if (!infoOk()) { setStep('info'); return }
    if (publish && (issues.length || !qs.length)) { setModal('check'); return }
    const status = publish ? (when === 'now' ? 'published' : 'scheduled') : 'draft'
    const rec: Assignment = { id: ex?.id || `n${Date.now()}`, title, classes: targets, type: 'Hỗn hợp', skill: 'Reading', status, due: publish ? due.split('T')[0].split('-').reverse().join('/') + ' ' + due.split('T')[1] : '—', assigned: publish ? '16/10/2026' : '—', submitted: ex?.submitted || 0, graded: ex?.graded || 0, total: targets.reduce((s, c) => s + (classes.find((x) => x.id === c)?.students || 0), 0), points: total || 10, minutes: +minutes, late, copiedFrom: ex?.copiedFrom }
    setAssignments((l) => (ex ? l.map((x) => (x.id === ex.id ? rec : x)) : [rec, ...l]))
    toast(publish ? (when === 'now' ? `Đã đăng bài cho lớp ${targets.join(', ')}` : 'Đã hẹn giờ đăng bài') : 'Đã lưu bản nháp', 'ok', publish ? { label: 'Xem danh sách', to: 't-assign' } : undefined)
    if (publish) go('t-assign')
  }
  const t = q && !q.section ? kindOf(q.kind) : null
  return (
    <>
      <PageHead back={<BackLink to="t-assign" label="Bài tập" />} title={ex ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'} sub={saved ? 'Đã lưu nháp lúc vừa xong' : 'Chưa lưu thay đổi'}
        actions={<><Button variant="secondary" onClick={() => setModal('preview')}><Eye size={16} />Xem trước</Button><Button variant="secondary" onClick={() => { save(false); setSaved(true) }}><Save size={16} />Lưu nháp</Button><Button onClick={() => save(true)}><Send size={16} />{when === 'now' ? 'Đăng bài' : 'Hẹn giờ đăng'}</Button></>} />
      <Tabs value={step} onChange={(v) => setStep(v as any)} tabs={[{ id: 'info', label: '1. Thông tin & cài đặt' }, { id: 'q', label: '2. Câu hỏi', count: qs.filter((x) => !x.section).length }]} />
      {step === 'info' && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card className="space-y-5 p-6">
            <Field label="Tên bài tập" error={errs.title}><Input value={title} onChange={(e: any) => { setTitle(e.target.value); setErrs({ ...errs, title: undefined }) }} placeholder="VD: English 6 — Unit 2: My House" error={errs.title} /></Field>
            <Field label="Hướng dẫn cho học sinh"><Textarea rows={3} value={desc} onChange={(e: any) => setDesc(e.target.value)} placeholder="Đọc kỹ đề và trả lời tất cả các câu." /></Field>
            <Field label="Giao cho lớp" error={errs.cls}><Chips multi options={classes.filter((c) => !c.archived).map((c) => c.id)} value={targets} onChange={(v) => { setTargets(v); setErrs({ ...errs, cls: undefined }) }} /></Field>
            <p className="-mt-3 text-xs text-sub">Chọn nhiều lớp để giao cùng nội dung. Muốn giao cho vài học sinh cụ thể, vào <b>Lớp → Học sinh</b> sau khi đăng.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Thời điểm đăng"><Select value={when} onChange={(e: any) => setWhen(e.target.value)}><option value="now">Đăng ngay</option><option value="later">Hẹn giờ</option></Select></Field>
              <Field label="Hạn nộp"><Input type="datetime-local" value={due} onChange={(e: any) => setDue(e.target.value)} /></Field>
            </div>
          </Card>
          <Card className="space-y-5 p-6">
            <h2 className="font-bold">Cài đặt làm bài</h2>
            <div className="grid grid-cols-2 gap-3"><Field label="Số lần làm"><Select value={attempts} onChange={(e: any) => setAttempts(e.target.value)}><option>1</option><option>2</option><option>3</option><option value="0">Không giới hạn</option></Select></Field><Field label="Thời gian (phút)" hint="0 = không giới hạn"><Input type="number" min={0} value={minutes} onChange={(e: any) => setMinutes(e.target.value)} /></Field></div>
            <div className="flex items-center justify-between gap-3"><div><b className="text-sm">Cho phép nộp muộn</b><p className="text-xs text-sub">Bài muộn được gắn nhãn riêng</p></div><Toggle on={late} onChange={setLate} label="Nộp muộn" /></div>
            <Field label="Hiển thị đáp án"><Select value={reveal} onChange={(e: any) => setReveal(e.target.value)}><option value="after-submit">Ngay sau khi nộp</option><option value="after-grade">Sau khi cô công bố điểm</option><option value="after-due">Sau hạn nộp</option><option value="never">Không hiển thị</option></Select></Field>
            <Button className="w-full" onClick={() => setStep('q')}>Tiếp: Soạn câu hỏi →</Button>
          </Card>
        </div>
      )}
      {step === 'q' && (
        <div className="mt-6 grid gap-4 lg:grid-cols-[260px_1fr] xl:grid-cols-[270px_1fr_300px]">
          <Card className="flex max-h-[680px] flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-line p-3.5"><b className="text-sm">Câu hỏi · {total.toFixed(1)} điểm</b>{issues.length > 0 && <Badge tone="warn"><AlertTriangle size={12} />{issues.length}</Badge>}</div>
            <ol className="flex-1 space-y-1 overflow-y-auto p-2">
              {qs.length === 0 && <li className="p-4 text-center text-sm text-sub">Chưa có câu hỏi. Thêm câu đầu tiên bên dưới.</li>}
              {qs.map((x, i) => {
                const n = qs.slice(0, i + 1).filter((y) => !y.section).length
                return (
                  <li key={x.id} draggable onDragStart={() => setDragI(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragI !== null) move(dragI, i); setDragI(null) }}>
                    <button onClick={() => setSel(i)} className={cx('flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left transition-colors', sel === i ? 'bg-indigo-soft' : 'hover:bg-bg')}>
                      <GripVertical size={15} className="shrink-0 cursor-grab text-sub/60" />
                      {x.section ? <span className="min-w-0 flex-1 truncate text-xs font-extrabold uppercase tracking-wide text-teal">{x.text || 'Phần mới'}</span> : (<>
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white text-xs font-bold shadow-sm">{n}</span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold">{x.text || 'Câu hỏi trống'}</span><span className="block truncate text-[11px] text-sub">{x.kind} · {x.points}đ</span></span>
                        {problems(x).length > 0 && <AlertTriangle size={14} className="shrink-0 text-warn" aria-label="Thiếu dữ liệu" />}</>)}
                    </button>
                  </li>
                )
              })}
            </ol>
            <div className="relative space-y-2 border-t border-line p-3">
              <Button className="w-full" onClick={() => setAddMenu(!addMenu)}><Plus size={16} />Thêm câu hỏi<ChevronDown size={14} /></Button>
              <div className="grid grid-cols-2 gap-2"><Button variant="secondary" size="sm" onClick={() => setModal('bank')}><Library size={14} />Kho câu hỏi</Button><Button variant="secondary" size="sm" onClick={() => { setQs([...qs, { ...mk('Multiple Choice', nid()), section: true, text: 'Phần mới' }]); setSel(qs.length) }}>+ Phần</Button></div>
              {addMenu && (
                <div className="absolute bottom-full left-3 right-3 z-20 mb-1 max-h-72 overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-pop anim-up">
                  {TYPES.map(([k, d]) => <button key={k} onClick={() => { setQs([...qs, mk(k, nid())]); setSel(qs.length); setAddMenu(false) }} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-bg"><span className="block text-sm font-semibold">{k}</span><span className="text-xs text-sub">{d}</span></button>)}
                </div>
              )}
            </div>
          </Card>
          {!q ? <Card className="lg:col-span-1 xl:col-span-2"><Empty title="Bắt đầu soạn câu hỏi" text="Chọn một dạng bài ở cột bên trái hoặc lấy câu hỏi từ kho." action={<Button onClick={() => { setQs([mk('Multiple Choice', 1)]); setSel(0) }}>Thêm câu trắc nghiệm</Button>} /></Card> : q.section ? (
            <Card className="p-6 lg:col-span-1 xl:col-span-2"><Field label="Tên phần"><Input value={q.text} onChange={(e: any) => upd({ text: e.target.value })} /></Field><div className="mt-4 flex gap-2"><Button variant="secondary" onClick={() => move(sel, sel - 1)}><ArrowUp size={15} />Lên</Button><Button variant="secondary" onClick={() => move(sel, sel + 1)}><ArrowDown size={15} />Xuống</Button><Button variant="ghost" onClick={() => { setQs(qs.filter((_, i) => i !== sel)); setSel(Math.max(0, sel - 1)) }}><Trash2 size={15} />Xóa phần</Button></div></Card>
          ) : (<>
            <Card className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge tone="indigo">{q.kind}</Badge>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" aria-label="Lên" onClick={() => move(sel, sel - 1)}><ArrowUp size={15} /></Button>
                  <Button size="sm" variant="ghost" aria-label="Xuống" onClick={() => move(sel, sel + 1)}><ArrowDown size={15} /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { setQs((l) => { const c = [...l]; c.splice(sel + 1, 0, { ...q, id: nid() }); return c }); setSel(sel + 1); toast('Đã nhân bản câu hỏi', 'info') }}><Copy size={15} />Nhân bản</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setQs(qs.filter((_, i) => i !== sel)); setSel(Math.max(0, sel - 1)) }}><Trash2 size={15} />Xóa</Button>
                </div>
              </div>
              {q.kind.startsWith('Reading') && <Field label="Đoạn văn"><Textarea rows={4} placeholder="Dán đoạn văn đọc hiểu…" /></Field>}
              {q.kind.startsWith('Listening') && <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-indigo/40 bg-indigo-soft/50 p-4 text-sm"><Music className="text-indigo" /><span className="flex-1"><b>daily-activities.mp3</b><br /><span className="text-xs text-sub">02:14 · 1.8 MB</span></span><Button size="sm" variant="secondary"><Upload size={14} />Đổi tệp</Button></div>}
              <Field label="Nội dung câu hỏi" error={!q.text.trim() ? 'Chưa có nội dung' : undefined}><Textarea rows={3} value={q.text} onChange={(e: any) => upd({ text: e.target.value })} placeholder="Nhập câu hỏi. Dùng ______ cho chỗ trống." /></Field>
              <div className="flex gap-2 text-xs text-sub"><Button size="sm" variant="secondary"><Upload size={13} />Ảnh</Button><Button size="sm" variant="secondary"><FileText size={13} />PDF</Button><Button size="sm" variant="secondary"><Music size={13} />Audio</Button></div>
              {(t === 'choice' || t === 'multi' || t === 'tf') && (
                <div className="space-y-2.5">
                  <p className="text-[13px] font-semibold">Đáp án <span className="font-normal text-sub">— bấm vòng tròn để chọn đáp án đúng</span></p>
                  {q.options.map((o, i) => {
                    const on = q.correct.includes(i)
                    return (
                      <div key={i} className={cx('flex items-center gap-2 rounded-xl border p-1.5 pl-2', on ? 'border-ok bg-ok-soft/50' : 'border-line')}>
                        <button aria-label={`Đặt đáp án ${i + 1} là đúng`} aria-pressed={on} onClick={() => upd({ correct: t === 'multi' ? (on ? q.correct.filter((c) => c !== i) : [...q.correct, i]) : [i] })} className={cx('grid h-7 w-7 shrink-0 place-items-center border-2', t === 'multi' ? 'rounded-md' : 'rounded-full', on ? 'border-ok bg-ok text-white' : 'border-[#b4bfd6]')}>{on && <Check size={14} />}</button>
                        {t === 'tf' ? <span className="px-2 py-2 text-sm font-semibold">{o}</span> : <input aria-label={`Đáp án ${i + 1}`} value={o} onChange={(e) => upd({ options: q.options.map((x, j) => (j === i ? e.target.value : x)) })} placeholder={`Đáp án ${String.fromCharCode(65 + i)}`} className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm focus:outline-none" />}
                        {t !== 'tf' && q.options.length > 2 && <button aria-label="Xóa đáp án" onClick={() => upd({ options: q.options.filter((_, j) => j !== i), correct: q.correct.filter((c) => c !== i).map((c) => (c > i ? c - 1 : c)) })} className="grid h-8 w-8 place-items-center rounded-lg text-sub hover:bg-white"><Trash2 size={14} /></button>}
                      </div>
                    )
                  })}
                  {t !== 'tf' && <Button size="sm" variant="ghost" onClick={() => upd({ options: [...q.options, ''] })}><Plus size={14} />Thêm đáp án</Button>}
                </div>
              )}
              {t === 'text' && <Field label="Đáp án đúng" hint="Có thể nhập nhiều đáp án, cách nhau bằng dấu |"><Input value={q.answer} onChange={(e: any) => upd({ answer: e.target.value })} placeholder="VD: reminds" /></Field>}
              {t === 'pairs' && <div className="space-y-2"><p className="text-[13px] font-semibold">Các cặp nối</p>{q.options.map((o, i) => { const [a, b = ''] = o.split('|'); return <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"><Input value={a} placeholder="Vế trái" onChange={(e: any) => upd({ options: q.options.map((x, j) => (j === i ? `${e.target.value}|${b}` : x)) })} /><span className="text-sub">↔</span><Input value={b} placeholder="Vế phải" onChange={(e: any) => upd({ options: q.options.map((x, j) => (j === i ? `${a}|${e.target.value}` : x)) })} /></div> })}<Button size="sm" variant="ghost" onClick={() => upd({ options: [...q.options, '|'] })}><Plus size={14} />Thêm cặp</Button></div>}
              {t === 'reorder' && <div className="space-y-2"><p className="text-[13px] font-semibold">Các phần theo thứ tự đúng <span className="font-normal text-sub">(hệ thống sẽ xáo trộn khi học sinh làm)</span></p>{q.options.map((o, i) => <div key={i} className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-indigo-soft text-xs font-bold text-indigo">{i + 1}</span><Input value={o} onChange={(e: any) => upd({ options: q.options.map((x, j) => (j === i ? e.target.value : x)) })} /></div>)}<Button size="sm" variant="ghost" onClick={() => upd({ options: [...q.options, ''] })}><Plus size={14} />Thêm phần</Button></div>}
              {t === 'free' && <p className="rounded-xl bg-warn-soft p-3 text-sm text-warn">Câu tự luận do giáo viên chấm thủ công. Bài sẽ ở trạng thái “Chờ chấm” cho đến khi cô hoàn tất.</p>}
            </Card>
            <Card className="space-y-4 p-5 lg:col-span-2 xl:col-span-1">
              <h3 className="font-bold">Cấu hình câu</h3>
              <Field label="Điểm"><Input type="number" min={0} step={0.5} value={q.points} onChange={(e: any) => upd({ points: e.target.value })} /></Field>
              <Field label="Kỹ năng"><Chips options={['Reading', 'Listening', 'Writing', 'Vocabulary', 'Grammar']} value={[q.skill]} onChange={(v) => upd({ skill: v[0] })} /></Field>
              <Field label="Độ khó"><Chips options={['Dễ', 'Trung bình', 'Khó']} value={[q.difficulty]} onChange={(v) => upd({ difficulty: v[0] })} /></Field>
              <div className="flex items-center justify-between"><b className="text-sm">Bắt buộc trả lời</b><Toggle on={q.required} onChange={(v) => upd({ required: v })} label="Bắt buộc" /></div>
              <Field label="Giải thích đáp án"><Textarea rows={3} value={q.explain} onChange={(e: any) => upd({ explain: e.target.value })} placeholder="Hiển thị cho học sinh khi được phép xem đáp án." /></Field>
              {problems(q).map((m) => <p key={m} className="flex items-center gap-2 rounded-lg bg-warn-soft px-3 py-2 text-xs font-semibold text-warn"><AlertTriangle size={13} />{m}</p>)}
            </Card>
          </>)}
        </div>
      )}
      {modal === 'check' && (
        <Modal title="Cần hoàn thiện trước khi đăng" onClose={() => setModal(null)} footer={<Button onClick={() => { setModal(null); setStep('q') }}>Quay lại chỉnh sửa</Button>}>
          {!qs.length ? <p className="text-sm">Bài tập chưa có câu hỏi nào.</p> : <ul className="space-y-2">{issues.map((x, k) => <li key={k}><button onClick={() => { setSel(x.i); setStep('q'); setModal(null) }} className="flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left text-sm hover:border-warn"><AlertTriangle size={16} className="text-warn" /><span className="flex-1"><b>Câu {qs.slice(0, x.i + 1).filter((y) => !y.section).length}:</b> {x.m}</span><span className="text-xs font-semibold text-indigo">Sửa</span></button></li>)}</ul>}
        </Modal>
      )}
      {modal === 'bank' && <BankPicker onClose={() => setModal(null)} onAdd={(items) => { setQs([...qs, ...items.map((b, i) => ({ ...mk(b.kind, nid() + i), text: b.text, skill: b.skill, difficulty: b.diff }))]); toast(`Đã thêm ${items.length} câu từ kho (bản sao độc lập)`); setModal(null) }} />}
      {modal === 'preview' && (
        <Modal title="Xem trước — góc nhìn học sinh" onClose={() => setModal(null)} width="max-w-sm">
          <div className="mx-auto w-full max-w-[300px] rounded-[28px] border-[6px] border-ink bg-bg p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-sub"><Smartphone size={14} />{title || 'Tên bài tập'}</div>
            <Progress v={25} />
            {(qs.filter((x) => !x.section)[0] || ({ text: 'Chưa có câu hỏi', options: [] } as any)) && (() => { const f = qs.filter((x) => !x.section)[0] || ({ text: 'Chưa có câu hỏi', options: [], points: 0 } as any); return <div className="mt-3 rounded-2xl bg-white p-3.5"><p className="text-[11px] font-bold text-indigo">CÂU 1 · {f.points} ĐIỂM</p><p className="mt-1 text-sm font-semibold">{f.text || 'Câu hỏi trống'}</p><div className="mt-3 space-y-2">{(f.options || []).slice(0, 4).map((o: string, i: number) => <div key={i} className="rounded-xl border border-line px-3 py-2.5 text-sm">{o || `Đáp án ${String.fromCharCode(65 + i)}`}</div>)}</div></div> })()}
            <div className="mt-3 rounded-xl bg-indigo py-2.5 text-center text-sm font-semibold text-white">Câu tiếp theo</div>
          </div>
          <p className="mt-3 text-center text-xs text-sub">Đáp án đúng không hiển thị khi học sinh đang làm bài.</p>
        </Modal>
      )}
    </>
  )
}

function BankPicker({ onClose, onAdd }: { onClose: () => void; onAdd: (items: typeof BANK) => void }) {
  const [pick, setPick] = useState<string[]>([])
  return (
    <Modal title="Chọn từ kho câu hỏi" onClose={onClose} width="max-w-2xl" footer={<><Button variant="secondary" onClick={onClose}>Hủy</Button><Button disabled={!pick.length} onClick={() => onAdd(BANK.filter((b) => pick.includes(b.id)))}>Thêm {pick.length || ''} câu</Button></>}>
      <ul className="space-y-2">{BANK.map((b) => <li key={b.id}><button onClick={() => setPick(pick.includes(b.id) ? pick.filter((x) => x !== b.id) : [...pick, b.id])} aria-pressed={pick.includes(b.id)} className={cx('flex w-full items-center gap-3 rounded-xl border p-3 text-left', pick.includes(b.id) ? 'border-indigo bg-indigo-soft' : 'border-line hover:border-indigo/50')}><span className={cx('grid h-6 w-6 place-items-center rounded-md border-2', pick.includes(b.id) ? 'border-indigo bg-indigo text-white' : 'border-[#b4bfd6]')}>{pick.includes(b.id) && <Check size={14} />}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{b.text}</span><span className="text-xs text-sub">{b.kind} · {b.unit} · {b.skill}</span></span></button></li>)}</ul>
    </Modal>
  )
}

/* ---------- Question Bank ---------- */
export function Bank() {
  const { go, toast } = useApp()
  const [f, setF] = useState({ grade: '', skill: '', kind: '', diff: '', q: '' })
  const [pick, setPick] = useState<string[]>([])
  const list = BANK.filter((b) => (!f.grade || b.grade === f.grade) && (!f.skill || b.skill === f.skill) && (!f.kind || b.kind === f.kind) && (!f.diff || b.diff === f.diff) && b.text.toLowerCase().includes(f.q.toLowerCase()))
  const sel = (k: string, o: string[], ph: string) => <Select value={(f as any)[k]} onChange={(e: any) => setF({ ...f, [k]: e.target.value })} className="!w-auto min-w-[140px]" aria-label={ph}><option value="">{ph}</option>{o.map((x) => <option key={x}>{x}</option>)}</Select>
  return (
    <>
      <PageHead title="Kho câu hỏi" sub="Câu hỏi mẫu có thể tái sử dụng. Khi thêm vào bài, hệ thống tạo bản sao — sửa bản sao không đổi câu gốc." actions={<Button disabled={!pick.length} onClick={() => { const items = BANK.filter((b) => pick.includes(b.id)).map((b, i) => ({ ...mk(b.kind, i + 1), text: b.text, skill: b.skill, difficulty: b.diff })); toast(`Đã thêm ${items.length} câu vào bài nháp mới`); go('t-assign-edit', { bank: items }) }}><Plus size={16} />Thêm {pick.length || ''} câu vào bài tập</Button>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] max-w-xs flex-1"><Search size={16} className="absolute left-3.5 top-3.5 text-sub" /><Input value={f.q} onChange={(e: any) => setF({ ...f, q: e.target.value })} className="pl-10" placeholder="Tìm câu hỏi…" aria-label="Tìm câu hỏi" /></div>
        {sel('grade', ['Khối 6', 'Khối 7', 'Khối 8'], 'Khối lớp')}{sel('skill', ['Reading', 'Listening', 'Writing', 'Vocabulary', 'Grammar'], 'Kỹ năng')}{sel('kind', TYPES.map((t) => t[0]), 'Dạng bài')}{sel('diff', ['Dễ', 'Trung bình', 'Khó'], 'Độ khó')}
      </div>
      <Card className="overflow-hidden">
        {list.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-bg text-left text-xs font-bold uppercase tracking-wide text-sub"><tr><th className="w-12 px-4 py-3" /><th>Câu hỏi</th><th>Dạng</th><th>Unit</th><th>Kỹ năng</th><th>Độ khó</th><th>Đã dùng</th></tr></thead><tbody className="divide-y divide-line">{list.map((b) => <tr key={b.id} className="hover:bg-bg/60"><td className="px-4 py-3"><input type="checkbox" className="h-4 w-4 accent-[#5368ec]" checked={pick.includes(b.id)} onChange={() => setPick(pick.includes(b.id) ? pick.filter((x) => x !== b.id) : [...pick, b.id])} aria-label={`Chọn ${b.text}`} /></td><td className="max-w-sm py-3 pr-4 font-semibold">{b.text}</td><td className="text-sub">{b.kind}</td><td>{b.grade} · {b.unit}</td><td><Badge tone="indigo">{b.skill}</Badge></td><td><Badge tone={b.diff === 'Dễ' ? 'ok' : b.diff === 'Khó' ? 'err' : 'warn'}>{b.diff}</Badge></td><td className="text-sub">{b.used} bài</td></tr>)}</tbody></table></div> : <Empty search title="Không có câu hỏi phù hợp" text="Thử bỏ bớt bộ lọc." action={<Button variant="secondary" onClick={() => setF({ grade: '', skill: '', kind: '', diff: '', q: '' })}>Xóa bộ lọc</Button>} />}
      </Card>
    </>
  )
}

/* ---------- Materials ---------- */
const MATS = [
  ['Từ vựng Unit 1: My New School', 'Vocabulary list', 'Khối 6 / Unit 1', BookOpen, '#5368ec'],
  ['Present Simple — ghi chú ngữ pháp', 'Grammar note', 'Khối 6 / Ngữ pháp', Languages, '#0e9f8f'],
  ['Reading: Save Our Planet', 'Reading passage', 'Khối 7 / Environment', FileText, '#243b7b'],
  ['Daily Activities — audio 2:14', 'Listening audio', 'Khối 6 / Unit 2', Music, '#c2410c'],
  ['Community Service — worksheet.pdf', 'PDF', 'Khối 7 / Unit 3', FileText, '#be185d'],
  ['Passive Voice in 5 minutes', 'Video / liên kết', 'Khối 8 / Ngữ pháp', Video, '#7c3aed'],
] as const
export function Materials() {
  const { toast } = useApp()
  const [folder, setFolder] = useState('Tất cả')
  const [q, setQ] = useState('')
  const [up, setUp] = useState(false)
  const [view, setView] = useState<string | null>(null)
  const folders = ['Tất cả', 'Khối 6', 'Khối 7', 'Khối 8']
  const list = MATS.filter((m) => (folder === 'Tất cả' || m[2].startsWith(folder)) && m[0].toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <PageHead title="Học liệu" sub="Tài liệu dùng chung để gắn vào bài tập hoặc chia sẻ với lớp." actions={<Button onClick={() => setUp(true)}><Upload size={16} />Tải lên</Button>} />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="h-fit p-2">{folders.map((f) => <button key={f} onClick={() => setFolder(f)} className={cx('flex h-11 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-semibold', folder === f ? 'bg-indigo-soft text-indigo' : 'text-sub hover:bg-bg')}><Folder size={17} />{f}</button>)}<button onClick={() => toast('Đã tạo thư mục “Khối 9”', 'info')} className="flex h-11 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-sub hover:bg-bg"><Plus size={17} />Thư mục mới</button></Card>
        <div>
          <div className="relative mb-4 max-w-sm"><Search size={16} className="absolute left-3.5 top-3.5 text-sub" /><Input value={q} onChange={(e: any) => setQ(e.target.value)} className="pl-10" placeholder="Tìm học liệu…" aria-label="Tìm học liệu" /></div>
          {list.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{list.map(([t, k, p, I, c]) => <Card key={t} className="p-4"><span className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: c }}><I size={20} /></span><p className="mt-3 font-bold leading-snug">{t}</p><p className="mt-1 text-xs text-sub">{k} · {p}</p><div className="mt-4 flex gap-2"><Button size="sm" variant="secondary" onClick={() => setView(t)}><Eye size={14} />Xem</Button><Button size="sm" variant="secondary" onClick={() => toast('Đã gắn vào bài nháp hiện tại', 'info')}><Link2 size={14} />Gắn vào bài</Button></div></Card>)}</div> : <Card><Empty search title="Không tìm thấy học liệu" text="Thử từ khóa hoặc thư mục khác." /></Card>}
        </div>
      </div>
      {up && <Modal title="Tải học liệu lên" onClose={() => setUp(false)} footer={<><Button variant="secondary" onClick={() => setUp(false)}>Hủy</Button><Button onClick={() => { toast('Đã tải lên học liệu'); setUp(false) }}>Tải lên</Button></>}><button className="flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-indigo/40 bg-indigo-soft/50 px-6 py-10"><Upload className="mb-2 text-indigo" /><b>Kéo thả tệp vào đây</b><span className="text-sm text-sub">PDF, MP3, hình ảnh · tối đa 25 MB</span></button><div className="mt-4"><Field label="Hoặc dán liên kết video"><Input placeholder="https://" /></Field></div></Modal>}
      {view && <Modal title={view} onClose={() => setView(null)}><div className="rounded-xl bg-bg p-5 text-sm leading-relaxed text-sub"><b className="text-ink">Xem trước nội dung</b><p className="mt-2">school (n) — trường học · classroom (n) — phòng học · playground (n) — sân chơi · library (n) — thư viện · friendly (adj) — thân thiện</p></div></Modal>}
    </>
  )
}
export { ASSIGNMENTS, CalendarClock }
