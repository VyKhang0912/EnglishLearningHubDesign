import { useCallback, useEffect, useRef, useState } from 'react'
import { ASSIGNMENTS, CLASSES } from './data'
import { Ctx, Skeleton, ToastView, type Store } from './ui'
import { Denied, Forgot, Login } from './auth'
import { TeacherShell, Dashboard, ClassList, ClassForm, ClassDetail } from './teacher'
import { AssignList, Editor, Bank, Materials } from './teacher2'
import { Grading, Review, Gradebook, Analytics, Announcements, TNotifs, Settings } from './teacher3'
import { StudentShell, SHome, SClasses, SClass, SAssign, Quiz, Submitted, Result, SResults, SNotifs, SMaterials } from './student'

const TEACHER: Record<string, () => React.ReactNode> = {
  't-dash': () => <Dashboard />,
  't-classes': () => <ClassList />,
  't-class-new': () => <ClassForm />,
  't-class': () => <ClassDetail />,
  't-assign': () => <AssignList />,
  't-assign-edit': () => <Editor />,
  't-bank': () => <Bank />,
  't-materials': () => <Materials />,
  't-grading': () => <Grading />,
  't-review': () => <Review />,
  't-gradebook': () => <Gradebook />,
  't-analytics': () => <Analytics />,
  't-announce': () => <Announcements />,
  't-notifs': () => <TNotifs />,
  't-settings': () => <Settings />,
}
const STUDENT: Record<string, () => React.ReactNode> = {
  's-home': () => <SHome />,
  's-classes': () => <SClasses />,
  's-class': () => <SClass />,
  's-assign': () => <SAssign />,
  's-submitted': () => <Submitted />,
  's-result': () => <Result />,
  's-results': () => <SResults />,
  's-materials': () => <SMaterials />,
  's-notifs': () => <SNotifs />,
  's-profile': () => <Settings student />,
}

export default function App() {
  const [role, setRole] = useState<'teacher' | 'student' | null>(null)
  const [route, setRoute] = useState<{ screen: string; params: any }>({ screen: 'login', params: null })
  const [classes, setClasses] = useState(CLASSES)
  const [assignments, setAssignments] = useState(ASSIGNMENTS)
  const [newStudents, setNewStudents] = useState<{ name: string; code: string; cls: string }[]>([])
  const [quiz, setQuiz] = useState<Store['quiz']>({ done: false, answers: null })
  const [grade, setGrade] = useState<Store['grade']>({ essay: null, feedback: '', published: false, redo: false })
  const [toastS, setToastS] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const tt = useRef<any>(null)

  const go = useCallback((screen: string, params?: any) => {
    setRoute({ screen, params: params ?? null })
    window.scrollTo(0, 0)
  }, [])
  const toast: Store['toast'] = useCallback((msg, tone = 'ok', link) => {
    setToastS({ msg, tone, link })
    clearTimeout(tt.current)
    tt.current = setTimeout(() => setToastS(null), 6000)
  }, [])
  const logout = () => { setRole(null); go('login') }

  useEffect(() => {
    if (!route.screen.startsWith('t-') || route.screen === 't-assign-edit' || route.screen === 't-review') return
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 320)
    return () => clearTimeout(t)
  }, [route.screen])

  const store: Store = { screen: route.screen, params: route.params, go, toast, classes, setClasses, assignments, setAssignments, newStudents, setNewStudents, quiz, setQuiz, grade, setGrade, logout }
  const s = route.screen

  let view: React.ReactNode
  if (s === 'denied') view = <Denied role={role} />
  else if (s === 'forgot') view = <Forgot />
  else if (!role || s === 'login') view = <Login onLogin={(r) => { setRole(r); go(r === 'teacher' ? 't-dash' : 's-home') }} />
  else if (s.startsWith('t-')) view = role !== 'teacher' ? <Denied role={role} /> : <TeacherShell>{loading ? <Skeleton /> : TEACHER[s]?.()}</TeacherShell>
  else if (s === 's-quiz') view = role === 'student' ? <Quiz key={JSON.stringify(route.params)} /> : <Denied role={role} />
  else if (s.startsWith('s-')) view = role !== 'student' ? <Denied role={role} /> : <StudentShell>{STUDENT[s]?.()}</StudentShell>
  else view = <Login onLogin={() => {}} />

  return (
    <Ctx.Provider value={store}>
      {view}
      <ToastView t={toastS} onClose={() => setToastS(null)} go={go} />
    </Ctx.Provider>
  )
}
