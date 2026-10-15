import { useState } from 'react'
import { ShieldAlert, GraduationCap, School, CheckCircle2, Eye, EyeOff, Mail } from 'lucide-react'
import { Button, Field, Input, Logo, useApp, cx } from './ui'

function Split({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Logo light />
        <div className="relative z-10 max-w-md">
          <p className="text-4xl font-extrabold leading-[1.15] tracking-tight">Giao bài, chấm điểm và theo dõi từng học sinh — trong một nơi.</p>
          <p className="mt-5 text-[#c5d0f5]">Dành cho giáo viên tiếng Anh quản lý nhiều lớp, và học sinh làm bài ngay trên điện thoại.</p>
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
            {[['4', 'lớp học'], ['145', 'học sinh'], ['312', 'bài đã chấm']].map(([a, b]) => (
              <div key={b}><p className="text-3xl font-extrabold">{a}</p><p className="text-sm text-[#c5d0f5]">{b}</p></div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full border-[40px] border-indigo/40" />
        <div className="absolute -bottom-10 right-40 h-40 w-40 rounded-full bg-teal/80" />
        <p className="relative z-10 text-xs text-[#9fb0e4]">© 2026 English Learning Hub</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="anim-up w-full max-w-[400px]">
          <div className="mb-8 lg:hidden"><Logo /></div>
          {children}
        </div>
      </div>
    </div>
  )
}

export function Login({ onLogin }: { onLogin: (r: 'teacher' | 'student') => void }) {
  const { go } = useApp()
  const [role, setRole] = useState<'teacher' | 'student'>('student')
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState<{ u?: string; p?: string }>({})
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const er: any = {}
    if (!u.trim()) er.u = role === 'teacher' ? 'Vui lòng nhập email đăng nhập' : 'Vui lòng nhập mã học sinh'
    if (p.length < 6) er.p = 'Mật khẩu cần ít nhất 6 ký tự'
    setErr(er)
    if (!er.u && !er.p) onLogin(role)
  }
  const demo = (r: 'teacher' | 'student') => { setRole(r); setU(r === 'teacher' ? 'thuha@school.edu.vn' : 'HS6A001'); setP('123456'); setErr({}) }
  return (
    <Split>
      <h1 className="text-[28px] font-extrabold tracking-tight">Đăng nhập</h1>
      <p className="mt-1 text-sm text-sub">Chào mừng trở lại! Chọn vai trò của bạn để tiếp tục.</p>
      <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-[#e9edf7] p-1" role="tablist">
        {([['student', 'Học sinh', GraduationCap], ['teacher', 'Giáo viên', School]] as const).map(([id, l, I]) => (
          <button key={id} role="tab" aria-selected={role === id} onClick={() => { setRole(id); setU(''); setErr({}) }} className={cx('flex h-11 items-center justify-center gap-2 rounded-[9px] text-sm font-semibold transition-all duration-150', role === id ? 'bg-white text-navy shadow-sm' : 'text-sub')}>
            <I size={16} />{l}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label={role === 'teacher' ? 'Email' : 'Mã học sinh'} error={err.u} hint={role === 'student' ? 'Giáo viên đã cấp mã này cho em, không cần email.' : undefined}>
          <Input value={u} onChange={(e: any) => setU(e.target.value)} placeholder={role === 'teacher' ? 'ten@truong.edu.vn' : 'VD: HS6A001'} error={err.u} autoComplete="username" />
        </Field>
        <Field label="Mật khẩu" error={err.p}>
          <div className="relative">
            <Input type={show ? 'text' : 'password'} value={p} onChange={(e: any) => setP(e.target.value)} error={err.p} autoComplete="current-password" className="pr-11" />
            <button type="button" aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShow(!show)} className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-lg text-sub hover:bg-bg">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
        </Field>
        <div className="flex justify-end"><button type="button" onClick={() => go('forgot')} className="text-sm font-semibold text-indigo hover:underline">Quên mật khẩu?</button></div>
        <Button type="submit" size="lg" className="w-full">Đăng nhập</Button>
      </form>
      <div className="mt-6 rounded-xl border border-dashed border-indigo/40 bg-indigo-soft/60 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-indigo">Bản prototype — điền nhanh</p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => demo('teacher')}>Tài khoản giáo viên</Button>
          <Button size="sm" variant="secondary" onClick={() => demo('student')}>Tài khoản học sinh</Button>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-sub">Tài khoản do giáo viên cấp. Không có đăng ký công khai. <button onClick={() => go('denied')} className="font-semibold text-sub underline">Xem màn hình bị từ chối</button></p>
    </Split>
  )
}

export function Forgot() {
  const { go, toast } = useApp()
  const [step, setStep] = useState(0)
  const [v, setV] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  return (
    <Split>
      {step === 0 && (
        <>
          <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-soft text-indigo"><Mail /></span>
          <h1 className="text-[28px] font-extrabold tracking-tight">Quên mật khẩu?</h1>
          <p className="mt-1 text-sm text-sub">Giáo viên nhập email để nhận liên kết đặt lại. Học sinh không có email vui lòng nhờ giáo viên cấp lại mật khẩu.</p>
          <div className="mt-6 space-y-4">
            <Field label="Email" error={err}><Input value={v} onChange={(e: any) => { setV(e.target.value); setErr('') }} placeholder="ten@truong.edu.vn" error={err} /></Field>
            <Button size="lg" className="w-full" onClick={() => (/\S+@\S+\.\S+/.test(v) ? setStep(1) : setErr('Email chưa đúng định dạng'))}>Gửi liên kết đặt lại</Button>
            <Button variant="ghost" className="w-full" onClick={() => go('login')}>← Quay lại đăng nhập</Button>
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-ok-soft text-ok"><CheckCircle2 /></span>
          <h1 className="text-[28px] font-extrabold tracking-tight">Đã gửi email</h1>
          <p className="mt-1 text-sm text-sub">Chúng tôi đã gửi liên kết tới <b className="text-ink">{v}</b>. Liên kết có hiệu lực trong 30 phút.</p>
          <Button size="lg" className="mt-6 w-full" onClick={() => setStep(2)}>Mở liên kết trong email (demo)</Button>
        </>
      )}
      {step === 2 && (
        <>
          <h1 className="text-[28px] font-extrabold tracking-tight">Đặt lại mật khẩu</h1>
          <p className="mt-1 text-sm text-sub">Chọn mật khẩu mới có ít nhất 8 ký tự.</p>
          <div className="mt-6 space-y-4">
            <Field label="Mật khẩu mới" error={err}><Input type="password" value={pw} onChange={(e: any) => { setPw(e.target.value); setErr('') }} error={err} /></Field>
            <Button size="lg" className="w-full" onClick={() => { if (pw.length < 8) return setErr('Mật khẩu cần ít nhất 8 ký tự'); toast('Đã đặt lại mật khẩu. Hãy đăng nhập lại.'); go('login') }}>Lưu mật khẩu mới</Button>
          </div>
        </>
      )}
    </Split>
  )
}

export function Denied({ role }: { role: string | null }) {
  const { go } = useApp()
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div className="anim-up max-w-md">
        <span className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-err-soft text-err"><ShieldAlert size={36} /></span>
        <h1 className="text-3xl font-extrabold tracking-tight">Bạn không có quyền truy cập</h1>
        <p className="mt-2 text-sub">Trang này chỉ dành cho giáo viên quản trị. Nếu bạn nghĩ đây là nhầm lẫn, hãy liên hệ giáo viên của lớp.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => go(role === 'teacher' ? 't-dash' : role === 'student' ? 's-home' : 'login')}>{role ? 'Về trang chủ' : 'Về trang đăng nhập'}</Button>
        </div>
      </div>
    </div>
  )
}
