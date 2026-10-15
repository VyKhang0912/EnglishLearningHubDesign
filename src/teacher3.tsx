import { useState } from 'react'
import { Download, CheckCircle2, AlertTriangle, History, Pin, Pencil, Trash2, Paperclip, Check, Bell, Send, Camera, RotateCcw, Save, ClipboardList, Megaphone, Clock, GraduationCap, Mail } from 'lucide-react'
import { QUIZ, SEED_ANSWERS, STUDENT_NAMES, SUBMISSIONS, type Q } from './data'
import { Avatar, Badge, BackLink, Button, Card, Chips, Empty, Field, GradeBadge, Input, Modal, PageHead, Progress, Select, StatusBadge, Tabs, Textarea, Toggle, useApp, cx } from './ui'
import { Donut, HBars, Line } from './charts'

export const isCorrect = (q: Q, a: any) => (q.type === 'fill' ? String(a || '').trim().toLowerCase() === String(q.correct) : a === q.correct)
export const autoScore = (ans: Record<number, any>) => QUIZ.filter((q) => q.type !== 'writing').reduce((s, q) => s + (isCorrect(q, ans[q.id]) ? q.points : 0), 0)
const AUTO_MAX = QUIZ.filter((q) => q.type !== 'writing').reduce((s, q) => s + q.points, 0)
const ESSAY_MAX = 2
export const RUBRIC = ['Nội dung', 'Ngữ pháp', 'Từ vựng', 'Bố cục']

/* ---------------- Grading center ---------------- */
export function Grading() {
  const { go, grade, assignments, classes } = useApp()
  const [tab, setTab] = useState('wait')
  const [cls, setCls] = useState('6A')
  const rows = SUBMISSIONS.map((s) => (s.id === 's1' && grade.published ? { ...s, status: 'graded', score: undefined } : s))
  const filtered = rows.filter((s) => (tab === 'late' ? s.late : s.status === tab))
  const cnt = (t: string) => rows.filter((s) => (t === 'late' ? s.late : s.status === t)).length
  const open = assignments.filter((a) => a.status === 'published')
  return (
    <>
      <PageHead title="Chấm bài" sub="Câu khách quan được chấm tự động. Cô chỉ cần chấm các câu tự luận." />
      <div className="mb-4 flex flex-wrap gap-3">
        <Select className="!w-auto min-w-[160px]" value={cls} onChange={(e: any) => setCls(e.target.value)} aria-label="Lọc theo lớp">{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
        <Select className="!w-auto min-w-[260px] max-w-full" aria-label="Chọn bài tập">{open.map((a) => <option key={a.id}>{a.title}</option>)}</Select>
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'wait', label: 'Chờ chấm', count: cnt('wait') }, { id: 'graded', label: 'Đã chấm', count: cnt('graded') }, { id: 'none', label: 'Chưa nộp', count: cnt('none') }, { id: 'late', label: 'Nộp muộn', count: cnt('late') }]} />
      <Card className="mt-4 overflow-hidden">
        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="bg-bg text-left text-xs font-bold uppercase tracking-wide text-sub"><tr><th className="px-4 py-3">Học sinh</th><th>Thời gian nộp</th><th>Trạng thái</th><th>Điểm</th><th /></tr></thead>
              <tbody className="divide-y divide-line">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-bg/60">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar name={s.name} size={32} /><div><b>{s.name}</b><p className="font-mono text-xs text-sub">{s.code}</p></div></div></td>
                    <td className="text-sub">{s.time} {s.late && <Badge tone="warn">Muộn</Badge>}</td>
                    <td><StatusBadge s={s.status} /></td>
                    <td>{s.id === 's1' && grade.published ? <GradeBadge v={autoScore(SEED_ANSWERS) + (grade.essay || 0)} /> : s.score ? <GradeBadge v={s.score} /> : '—'}</td>
                    <td className="pr-4 text-right">{s.status === 'none' ? <Button size="sm" variant="secondary" onClick={() => go('t-grading')}><Bell size={14} />Nhắc nộp</Button> : <Button size="sm" variant={s.status === 'wait' ? 'primary' : 'secondary'} onClick={() => go('t-review', { sid: s.id })}>{s.status === 'wait' ? 'Chấm bài' : 'Xem lại'}</Button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty title="Không còn bài nào ở mục này" text="Tuyệt vời! Cô đã xử lý hết bài trong danh sách này." />}
      </Card>
    </>
  )
}

/* ---------------- Submission review ---------------- */
export function Review() {
  const { params, quiz, grade, setGrade, go, toast } = useApp()
  const sub = SUBMISSIONS.find((s) => s.id === params?.sid) || SUBMISSIONS[0]
  const mine = sub.id === 's1'
  const ans = mine ? quiz.answers || SEED_ANSWERS : { ...SEED_ANSWERS, 1: 0, 3: 'remind' }
  const [local, setLocal] = useState<number[] | null>(mine && grade.essay !== null ? null : null)
  const [rub, setRub] = useState<number[]>(mine && grade.essay !== null ? [0.5, 0.5, 0.25, 0.25] : [])
  const [fb, setFb] = useState(mine ? grade.feedback : '')
  const [qfb, setQfb] = useState('')
  const [modal, setModal] = useState<null | 'pub' | 'redo' | 'history'>(null)
  const touched = rub.length === 4
  const essay = touched ? rub.reduce((a, b) => a + b, 0) : null
  const auto = autoScore(ans)
  const total = auto + (essay || 0)
  const max = AUTO_MAX + ESSAY_MAX
  const published = mine && grade.published
  const words = String(ans[6] || '').trim().split(/\s+/).filter(Boolean).length
  const setR = (i: number, v: number) => { const r = rub.length === 4 ? [...rub] : [0, 0, 0, 0]; r[i] = v; setRub(r) }
  void local
  return (
    <>
      <PageHead back={<BackLink to="t-grading" label="Chấm bài" />} title={sub.name} sub={`English 6 — Unit 1: My New School · Lớp 6A · Nộp ${sub.time}${sub.late ? ' (muộn)' : ''}`} actions={<><Button variant="secondary" onClick={() => setModal('history')}><History size={16} />Lịch sử chấm</Button>{!published && <Button variant="secondary" onClick={() => setModal('redo')}><RotateCcw size={16} />Yêu cầu làm lại</Button>}</>} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {QUIZ.map((q, i) => {
            const a = ans[q.id]
            const ok = q.type !== 'writing' && isCorrect(q, a)
            return (
              <Card key={q.id} className="p-5">
                <div className="mb-2 flex items-center gap-2 text-xs"><Badge tone="indigo">Câu {i + 1}</Badge><Badge>{q.skill}</Badge>{q.type === 'writing' ? <Badge tone="warn">Chấm thủ công · {q.points}đ</Badge> : <Badge tone={ok ? 'ok' : 'err'}>{ok ? `Đúng · +${q.points}` : 'Sai · 0'} · tự động</Badge>}</div>
                <p className="font-semibold">{q.text}</p>
                {q.type === 'writing' ? (
                  <div className="mt-3"><p className="rounded-xl bg-bg p-4 text-[15px] leading-relaxed">{a}</p><p className="mt-1.5 text-xs text-sub">{words} từ</p>
                    <Field label="Nhận xét cho câu này"><Textarea rows={2} value={qfb} onChange={(e: any) => setQfb(e.target.value)} placeholder="VD: Câu mở đầu rất tốt. Chú ý dùng “and” để nối ý." disabled={published} /></Field></div>
                ) : (
                  <div className="mt-3 text-sm">
                    <p className={cx('flex items-center gap-2 rounded-lg px-3 py-2', ok ? 'bg-ok-soft text-ok' : 'bg-err-soft text-[#b91c1c]')}>{ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}Học sinh chọn: <b>{q.options && typeof a === 'number' ? q.options[a] : a || '(bỏ trống)'}</b></p>
                    {!ok && <p className="mt-2 text-sub">Đáp án đúng: <b className="text-ink">{q.options && typeof q.correct === 'number' ? q.options[q.correct] : q.correct}</b></p>}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
        <div className="h-fit space-y-4 lg:sticky lg:top-4">
          <Card className="p-5">
            <div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wide text-sub">Tổng điểm</p><p className="text-4xl font-extrabold">{essay === null ? auto.toFixed(1) : total.toFixed(1)}<span className="text-lg text-sub"> / {max}</span></p></div>{essay === null ? <Badge tone="warn" dot>Chờ chấm tay</Badge> : published ? <Badge tone="ok" dot>Đã công bố</Badge> : <Badge tone="indigo" dot>Sẵn sàng</Badge>}</div>
            <dl className="mt-4 space-y-1.5 border-t border-line pt-3 text-sm"><div className="flex justify-between"><dt className="text-sub">Tự động ({AUTO_MAX}đ)</dt><dd className="font-bold">{auto.toFixed(1)}</dd></div><div className="flex justify-between"><dt className="text-sub">Tự luận ({ESSAY_MAX}đ)</dt><dd className="font-bold">{essay === null ? 'chưa chấm' : essay.toFixed(2)}</dd></div></dl>
            {essay === null && <p className="mt-3 rounded-lg bg-warn-soft p-2.5 text-xs font-medium text-warn">Điểm cuối chỉ được công bố khi cô chấm xong câu tự luận.</p>}
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 font-bold">Rubric — Câu 6 (tối đa {ESSAY_MAX}đ)</h3>
            <div className="space-y-3">{RUBRIC.map((r, i) => <div key={r} className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{r}</span><div className="flex gap-1" role="group" aria-label={r}>{[0, 0.25, 0.5].map((v) => <button key={v} disabled={published} aria-pressed={rub[i] === v} onClick={() => setR(i, v)} className={cx('h-9 w-12 rounded-lg border text-sm font-semibold transition-colors', rub[i] === v ? 'border-indigo bg-indigo text-white' : 'border-line bg-white text-sub hover:border-indigo/50 disabled:opacity-60')}>{v}</button>)}</div></div>)}</div>
            <Field label="Nhận xét chung"><Textarea rows={3} value={fb} onChange={(e: any) => setFb(e.target.value)} placeholder="Em viết rõ ràng và đúng ngữ pháp. Hãy thử thêm một câu về môn học em thích." disabled={published} /></Field>
            {!published ? <div className="mt-4 grid grid-cols-2 gap-2"><Button variant="secondary" onClick={() => { if (mine) setGrade((g) => ({ ...g, essay, feedback: fb })); toast('Đã lưu điểm nháp (chưa công bố)', 'info') }}><Save size={15} />Lưu nháp</Button><Button disabled={essay === null} onClick={() => setModal('pub')} title={essay === null ? 'Chấm đủ rubric để công bố' : undefined}><Send size={15} />Công bố</Button></div> : <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-ok"><CheckCircle2 size={16} />Học sinh đã xem được kết quả.</p>}
          </Card>
        </div>
      </div>
      {modal === 'pub' && <Modal title="Công bố điểm cho học sinh?" onClose={() => setModal(null)} width="max-w-sm" footer={<><Button variant="secondary" onClick={() => setModal(null)}>Chưa</Button><Button onClick={() => { if (mine) setGrade((g) => ({ ...g, essay, feedback: fb || 'Em làm bài tốt, cố gắng phát huy nhé!', published: true, redo: false })); toast(`Đã công bố ${total.toFixed(1)}/${max} cho ${sub.name}`, 'ok', { label: 'Về danh sách', to: 't-grading' }); go('t-grading') }}>Công bố</Button></>}><p className="text-sm text-sub"><b className="text-ink">{sub.name}</b> sẽ nhận <b className="text-ink">{total.toFixed(1)}/{max}</b> điểm cùng nhận xét và thông báo trên web.</p></Modal>}
      {modal === 'redo' && <Modal title="Yêu cầu học sinh làm lại?" onClose={() => setModal(null)} width="max-w-sm" footer={<><Button variant="secondary" onClick={() => setModal(null)}>Hủy</Button><Button onClick={() => { if (mine) setGrade((g) => ({ ...g, redo: true })); toast('Đã gửi yêu cầu làm lại. Bài nộp cũ được lưu trong lịch sử.'); setModal(null) }}>Gửi yêu cầu</Button></>}><p className="text-sm text-sub">Học sinh sẽ thấy nút “Làm lại”. Bài nộp hiện tại vẫn được lưu để cô đối chiếu.</p></Modal>}
      {modal === 'history' && <Modal title="Lịch sử chấm" onClose={() => setModal(null)}><ol className="space-y-4 border-l-2 border-line pl-4 text-sm">{[['16/10 08:12', 'Học sinh nộp bài'], ['16/10 08:12', `Hệ thống chấm tự động: ${auto.toFixed(1)}/${AUTO_MAX}`], ...(essay !== null ? [['Vừa xong', `Cô Thu Hà chấm tự luận: ${essay}/${ESSAY_MAX}`]] : []), ...(published ? [['Vừa xong', 'Đã công bố điểm']] : [])].map(([t, e]) => <li key={e}><p className="text-xs text-sub">{t}</p><p className="font-semibold">{e}</p></li>)}</ol></Modal>}
    </>
  )
}

/* ---------------- Gradebook ---------------- */
const COLS = ['Unit 1 R&W', 'Unit 3 Vocab', 'Unit 2 Test', 'Grammar', 'Listening']
export function Gradebook() {
  const { quiz, grade, toast } = useApp()
  const [cls, setCls] = useState('6A')
  const [exp, setExp] = useState(false)
  const rows = STUDENT_NAMES.map(([n, code, avg], r) => {
    const cells: (number | null)[] = COLS.map((_, c) => {
      if (c === 0) return r === 0 ? (grade.published ? autoScore(quiz.answers || SEED_ANSWERS) + (grade.essay || 0) : null) : r < 3 ? null : avg > 7 ? Math.min(10, +(avg - 0.3).toFixed(1)) : r === 4 || r === 8 ? null : +avg.toFixed(1)
      const v = avg + ((r * 7 + c * 3) % 5) / 5 - 0.5
      return (r === 8 && c > 1) || (r === 4 && c === 3) ? null : Math.max(3, Math.min(10, +v.toFixed(1)))
    })
    return { n, code, cells, late: r === 2 }
  })
  const colAvg = COLS.map((_, c) => { const v = rows.map((x) => x.cells[c]).filter((x): x is number => x !== null); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : '—' })
  const csv = () => {
    const l = ['Học sinh,Mã,' + COLS.join(',') + ',TB', ...rows.map((r) => { const v = r.cells.filter((x): x is number => x !== null); return `${r.n},${r.code},${r.cells.map((x) => x ?? '').join(',')},${v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : ''}` })].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['﻿' + l], { type: 'text/csv;charset=utf-8' }))
    a.download = `bang-diem-${cls}.csv`
    a.click()
    toast('Đã xuất bảng điểm CSV')
    setExp(false)
  }
  return (
    <>
      <PageHead title="Sổ điểm" sub="Chỉ giáo viên xem được điểm toàn lớp. Học sinh chỉ thấy điểm của mình." actions={<><Select className="!w-36" value={cls} onChange={(e: any) => setCls(e.target.value)} aria-label="Lớp"><option>6A</option></Select><Button onClick={() => setExp(true)}><Download size={16} />Xuất bảng điểm</Button></>} />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-bg text-left text-xs font-bold uppercase tracking-wide text-sub"><tr><th className="sticky left-0 bg-bg px-4 py-3">Học sinh</th>{COLS.map((c) => <th key={c} className="text-center">{c}</th>)}<th className="text-center">TB</th><th className="text-center">Đã nộp</th></tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => { const v = r.cells.filter((x): x is number => x !== null); const avg = v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; return (
                <tr key={r.code} className="hover:bg-bg/60">
                  <td className="sticky left-0 bg-white px-4 py-2.5"><div className="flex items-center gap-2.5"><Avatar name={r.n} size={28} /><b>{r.n}</b></div></td>
                  {r.cells.map((x, c) => <td key={c} className="text-center">{x === null ? (c === 0 && r.n === 'Lê Minh Anh' ? <Badge tone="warn">Chờ chấm</Badge> : c === 0 && r.cells.indexOf(null) === c && r.code < 'HS6A004' ? <Badge tone="warn">Chờ chấm</Badge> : <span className="font-semibold text-err">Thiếu</span>) : <GradeBadge v={x} />}</td>)}
                  <td className="text-center font-extrabold">{avg.toFixed(1)}</td>
                  <td className="text-center text-sub">{v.length}/{COLS.length}</td>
                </tr>) })}
            </tbody>
            <tfoot className="border-t-2 border-line bg-bg font-bold"><tr><td className="sticky left-0 bg-bg px-4 py-3">Trung bình bài</td>{colAvg.map((a, i) => <td key={i} className="text-center">{a}</td>)}<td /><td /></tr></tfoot>
          </table>
        </div>
        <p className="border-t border-line px-4 py-3 text-xs text-sub">Hiển thị 12 / 38 học sinh · “Thiếu” = chưa nộp · “Chờ chấm” = chưa công bố điểm.</p>
      </Card>
      {exp && <Modal title="Xuất bảng điểm" onClose={() => setExp(false)} width="max-w-sm" footer={<><Button variant="secondary" onClick={() => { toast('Đã chuẩn bị tệp Excel (.xlsx)'); setExp(false) }}>Excel</Button><Button onClick={csv}>CSV</Button></>}><p className="text-sm text-sub">Xuất bảng điểm lớp {cls} gồm điểm từng bài, điểm trung bình và số bài đã nộp.</p></Modal>}
    </>
  )
}

/* ---------------- Analytics ---------------- */
export function Analytics() {
  const { classes, toast } = useApp()
  const [cls, setCls] = useState('6A')
  const c = classes.find((x) => x.id === cls)!
  return (
    <>
      <PageHead title="Thống kê học tập" sub="Chỉ giữ những chỉ số giúp cô quyết định cần ôn lại gì và hỗ trợ ai." actions={<Chips options={classes.map((x) => x.id)} value={[cls]} onChange={(v) => setCls(v[0])} />} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5"><h2 className="mb-4 font-bold">Tỷ lệ hoàn thành</h2><div className="flex items-center gap-5"><Donut value={c.completion} color="#0e9f8f" label="đã nộp" /><p className="text-sm text-sub">Trung bình các bài đã đóng trong 30 ngày. Toàn trường: <b className="text-ink">85%</b>.</p></div></Card>
        <Card className="p-5 lg:col-span-2"><div className="mb-1 flex justify-between"><h2 className="font-bold">Điểm trung bình theo tuần</h2><span className="text-xs text-sub">Lớp {cls}: <b className="text-ink">{c.avg}</b></span></div><Line labels={['T1', 'T2', 'T3', 'T4', 'T5', 'T6']} series={[{ name: `Lớp ${cls}`, color: c.color, data: [6.8, 7.1, 7.0, 7.5, 7.7, c.avg] }, { name: 'Toàn trường', color: '#a7b2cc', data: [7.0, 7.1, 7.2, 7.3, 7.4, 7.5] }]} /></Card>
        <Card className="p-5"><h2 className="mb-4 font-bold">Kết quả theo kỹ năng</h2><HBars data={[{ label: 'Reading', value: 84 }, { label: 'Vocabulary', value: 79 }, { label: 'Listening', value: 72 }, { label: 'Grammar', value: 66 }, { label: 'Writing', value: 61 }]} /></Card>
        <Card className="p-5"><h2 className="mb-3 font-bold">Câu sai nhiều nhất</h2><ul className="space-y-3 text-sm">{[['“My school ___ a big library.” (has/have)', 62], ['Listening: What time does Nam get up?', 54], ['Fill: “Our teacher always ___ us.”', 49]].map(([t, n]) => <li key={t as string} className="flex gap-3"><Badge tone="err">{n}% sai</Badge><span>{t}</span></li>)}</ul></Card>
        <Card className="p-5"><h2 className="mb-3 font-bold">Học sinh cần chú ý</h2><ul className="space-y-3">{[['Ngô Tuấn Kiệt', '4.8 · thiếu 3 bài'], ['Đỗ Quang Huy', '5.4 · thiếu 2 bài'], ['Hoàng Đức Anh', '6.1 · điểm giảm 1.2']].map(([n, t]) => <li key={n} className="flex items-center gap-3"><Avatar name={n} size={34} /><div className="min-w-0 flex-1 text-sm"><b>{n}</b><p className="truncate text-xs text-sub">{t}</p></div><Button size="sm" variant="secondary" onClick={() => toast(`Đã gửi nhắc nhở tới ${n}`)}>Nhắc</Button></li>)}</ul></Card>
      </div>
    </>
  )
}

/* ---------------- Announcements ---------------- */
type Ann = { id: number; title: string; body: string; cls: string[]; kind: string; pin: boolean; time: string }
export function Announcements() {
  const { toast, classes } = useApp()
  const [list, setList] = useState<Ann[]>([
    { id: 1, title: 'Kiểm tra 15 phút thứ Năm 22/10', body: 'Nội dung: Unit 1 — từ vựng và thì hiện tại đơn. Các em mang theo bút và tai nghe.', cls: ['6A', '6B'], kind: 'Lịch kiểm tra', pin: true, time: '14/10 17:30' },
    { id: 2, title: 'Nghỉ học thứ Sáu 30/10', body: 'Lớp 7A nghỉ học do hoạt động của trường. Bài tập vẫn mở đến hết Chủ nhật.', cls: ['7A'], kind: 'Lịch học', pin: false, time: '12/10 09:00' },
  ])
  const [edit, setEdit] = useState<Ann | null | 'new'>(null)
  const [del, setDel] = useState<Ann | null>(null)
  return (
    <>
      <PageHead title="Thông báo lớp" sub="Đăng thông báo, lịch học và lịch kiểm tra. Học sinh nhận ngay trên web." actions={<Button onClick={() => setEdit('new')}><Megaphone size={16} />Đăng thông báo</Button>} />
      {list.length ? <div className="space-y-4">{[...list].sort((a, b) => +b.pin - +a.pin).map((a) => (
        <Card key={a.id} className="p-5">
          <div className="flex flex-wrap items-start gap-3"><div className="min-w-0 flex-1"><div className="mb-1.5 flex flex-wrap items-center gap-2">{a.pin && <Badge tone="navy"><Pin size={11} />Đã ghim</Badge>}<Badge tone="teal">{a.kind}</Badge>{a.cls.map((c) => <Badge key={c} tone="indigo">{c}</Badge>)}<span className="text-xs text-sub">{a.time}</span></div><h2 className="font-bold">{a.title}</h2><p className="mt-1 text-sm text-sub">{a.body}</p></div>
            <div className="flex gap-1"><Button size="sm" variant="ghost" aria-label="Ghim" onClick={() => setList((l) => l.map((x) => (x.id === a.id ? { ...x, pin: !x.pin } : x)))}><Pin size={15} /></Button><Button size="sm" variant="ghost" aria-label="Sửa" onClick={() => setEdit(a)}><Pencil size={15} /></Button><Button size="sm" variant="ghost" aria-label="Xóa" onClick={() => setDel(a)}><Trash2 size={15} /></Button></div></div>
        </Card>))}</div> : <Card><Empty title="Chưa có thông báo" text="Đăng thông báo đầu tiên cho lớp." action={<Button onClick={() => setEdit('new')}>Đăng thông báo</Button>} /></Card>}
      {edit && <AnnForm a={edit === 'new' ? null : edit} classes={classes.map((c) => c.id)} onClose={() => setEdit(null)} onSave={(a) => { setList((l) => (a.id ? l.map((x) => (x.id === a.id ? a : x)) : [{ ...a, id: Date.now(), time: 'Vừa xong' }, ...l])); toast('Đã đăng thông báo tới ' + a.cls.join(', ')); setEdit(null) }} />}
      {del && <Modal title="Xóa thông báo?" onClose={() => setDel(null)} width="max-w-sm" footer={<><Button variant="secondary" onClick={() => setDel(null)}>Hủy</Button><Button variant="danger" onClick={() => { setList((l) => l.filter((x) => x.id !== del.id)); setDel(null); toast('Đã xóa thông báo', 'info') }}>Xóa</Button></>}><p className="text-sm text-sub">Thông báo sẽ biến mất khỏi trang của học sinh.</p></Modal>}
    </>
  )
}
function AnnForm({ a, classes, onClose, onSave }: { a: Ann | null; classes: string[]; onClose: () => void; onSave: (a: Ann) => void }) {
  const [t, setT] = useState(a?.title || '')
  const [b, setB] = useState(a?.body || '')
  const [c, setC] = useState(a?.cls || [])
  const [k, setK] = useState(a?.kind || 'Thông báo')
  const [p, setP] = useState(a?.pin || false)
  const [err, setErr] = useState('')
  return (
    <Modal title={a ? 'Sửa thông báo' : 'Đăng thông báo'} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Hủy</Button><Button onClick={() => (!t.trim() || !c.length ? setErr('Cần có tiêu đề và ít nhất một lớp nhận') : onSave({ id: a?.id || 0, title: t, body: b, cls: c, kind: k, pin: p, time: a?.time || '' }))}>Đăng</Button></>}>
      <div className="space-y-4">
        {err && <p className="rounded-lg bg-err-soft px-3 py-2 text-sm font-medium text-[#b91c1c]">{err}</p>}
        <Field label="Loại"><Chips options={['Thông báo', 'Lịch học', 'Lịch kiểm tra']} value={[k]} onChange={(v) => setK(v[0])} /></Field>
        <Field label="Tiêu đề"><Input value={t} onChange={(e: any) => setT(e.target.value)} /></Field>
        <Field label="Nội dung"><Textarea rows={4} value={b} onChange={(e: any) => setB(e.target.value)} /></Field>
        <Field label="Gửi tới lớp"><Chips multi options={classes} value={c} onChange={setC} /></Field>
        <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-semibold"><Paperclip size={15} />Đính kèm tài liệu</span><Button size="sm" variant="secondary">Chọn tệp</Button></div>
        <div className="flex items-center justify-between"><b className="text-sm">Ghim lên đầu</b><Toggle on={p} onChange={setP} label="Ghim" /></div>
      </div>
    </Modal>
  )
}

/* ---------------- Notifications (teacher) ---------------- */
export function TNotifs() {
  const { go } = useApp()
  const [list, setList] = useState([
    { id: 1, t: 'Lê Minh Anh đã nộp “Unit 1: My New School”', s: 'Lớp 6A · cần chấm câu tự luận', time: '8 phút trước', unread: true, to: 't-review' },
    { id: 2, t: 'Trần Bảo Long nộp muộn “Unit 1: My New School”', s: 'Lớp 6A', time: '1 giờ trước', unread: true, to: 't-review' },
    { id: 3, t: 'Bài “Reading Test — Environment” sẽ đăng lúc 07:00 ngày 25/10', s: 'Lớp 7A, 8A', time: 'Hôm qua', unread: true, to: 't-assign' },
    { id: 4, t: 'Lớp 7A đã đủ 40 học sinh', s: 'Không thể thêm học sinh mới', time: '2 ngày trước', unread: false, to: 't-classes' },
  ])
  const [tab, setTab] = useState('all')
  const shown = list.filter((n) => tab === 'all' || n.unread)
  return (
    <>
      <PageHead title="Thông báo" actions={<Button variant="secondary" onClick={() => setList((l) => l.map((n) => ({ ...n, unread: false })))}><Check size={16} />Đánh dấu đã đọc tất cả</Button>} />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'all', label: 'Tất cả' }, { id: 'unread', label: 'Chưa đọc', count: list.filter((n) => n.unread).length }]} />
      <Card className="mt-4 divide-y divide-line overflow-hidden">{shown.length ? shown.map((n) => <button key={n.id} onClick={() => { setList((l) => l.map((x) => (x.id === n.id ? { ...x, unread: false } : x))); go(n.to, n.to === 't-review' ? { sid: 's1' } : undefined) }} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-bg"><span className={cx('h-2.5 w-2.5 shrink-0 rounded-full', n.unread ? 'bg-indigo' : 'bg-transparent')} /><div className="min-w-0 flex-1"><p className={cx('text-sm', n.unread ? 'font-bold' : 'font-medium')}>{n.t}</p><p className="text-xs text-sub">{n.s}</p></div><span className="text-xs text-sub">{n.time}</span></button>) : <Empty title="Không có thông báo chưa đọc" text="Cô đã xem hết rồi." />}</Card>
    </>
  )
}

/* ---------------- Settings / profile (shared) ---------------- */
export function Settings({ student }: { student?: boolean }) {
  const { toast, go } = useApp()
  const [tab, setTab] = useState('profile')
  const [pw, setPw] = useState({ a: '', b: '', c: '' })
  const [err, setErr] = useState<Record<string, string>>({})
  const [name, setName] = useState(student ? 'Lê Minh Anh' : 'Nguyễn Thu Hà')
  const [ns, setNs] = useState([true, true, false])
  const changePw = () => {
    const e: any = {}
    if (!pw.a) e.a = 'Nhập mật khẩu hiện tại'
    if (pw.b.length < 8) e.b = 'Mật khẩu mới cần ít nhất 8 ký tự'
    if (pw.c !== pw.b) e.c = 'Mật khẩu nhập lại chưa khớp'
    setErr(e)
    if (!Object.keys(e).length) { toast('Đã đổi mật khẩu'); setPw({ a: '', b: '', c: '' }) }
  }
  return (
    <>
      <PageHead title={student ? 'Hồ sơ của em' : 'Hồ sơ & cài đặt'} />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'profile', label: 'Hồ sơ' }, ...(student ? [] : [{ id: 'account', label: 'Cài đặt tài khoản' }]), { id: 'password', label: 'Đổi mật khẩu' }]} />
      <div className="mt-6 max-w-2xl">
        {tab === 'profile' && (
          <Card className="space-y-5 p-6">
            <div className="flex items-center gap-4"><Avatar name={name} size={72} />{!student && <Button variant="secondary" onClick={() => toast('Đã cập nhật ảnh đại diện', 'info')}><Camera size={16} />Đổi ảnh</Button>}</div>
            <Field label="Họ và tên"><Input value={name} onChange={(e: any) => setName(e.target.value)} disabled={student} hint="" /></Field>
            {student ? (<>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Mã học sinh"><Input value="HS6A001" disabled /></Field><Field label="Lớp đang tham gia"><Input value="6A · English 6" disabled /></Field></div>
              <p className="text-xs text-sub">Muốn đổi họ tên, em báo giáo viên chủ nhiệm. Chúng tôi chỉ lưu thông tin cần thiết cho việc học.</p>
            </>) : (<>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Email"><Input value="thuha@school.edu.vn" disabled /></Field><Field label="Số điện thoại"><Input defaultValue="0901 234 567" /></Field></div>
              <Field label="Trường / đơn vị (tùy chọn)"><Input defaultValue="THCS Lê Quý Đôn" /></Field>
            </>)}
            {!student && <div className="flex justify-end"><Button onClick={() => toast('Đã lưu hồ sơ')}>Lưu thay đổi</Button></div>}
          </Card>
        )}
        {tab === 'account' && <Card className="divide-y divide-line">{[['Thông báo bài nộp mới', 'Nhận thông báo khi học sinh nộp bài'], ['Nhắc việc cần chấm', 'Tổng hợp hằng ngày lúc 07:00'], ['Email tóm tắt tuần', 'Gửi vào sáng thứ Hai']].map(([t, s], i) => <div key={t} className="flex items-center gap-4 p-5"><div className="flex-1"><b className="text-sm">{t}</b><p className="text-xs text-sub">{s}</p></div><Toggle on={ns[i]} onChange={(v) => setNs(ns.map((x, j) => (j === i ? v : x)))} label={t} /></div>)}<div className="p-5"><Field label="Ngôn ngữ giao diện"><Select><option>Tiếng Việt</option><option>English</option></Select></Field></div></Card>}
        {tab === 'password' && (
          <Card className="space-y-4 p-6">
            <Field label="Mật khẩu hiện tại" error={err.a}><Input type="password" value={pw.a} onChange={(e: any) => setPw({ ...pw, a: e.target.value })} error={err.a} /></Field>
            <Field label="Mật khẩu mới" error={err.b} hint="Ít nhất 8 ký tự"><Input type="password" value={pw.b} onChange={(e: any) => setPw({ ...pw, b: e.target.value })} error={err.b} /></Field>
            <Field label="Nhập lại mật khẩu mới" error={err.c}><Input type="password" value={pw.c} onChange={(e: any) => setPw({ ...pw, c: e.target.value })} error={err.c} /></Field>
            <div className="flex justify-end"><Button onClick={changePw}>Đổi mật khẩu</Button></div>
          </Card>
        )}
        {student && <Button variant="ghost" className="mt-4" onClick={() => go('denied')}>Thử mở trang giáo viên →</Button>}
      </div>
    </>
  )
}
export { Mail, Clock, GraduationCap, ClipboardList, Progress }
