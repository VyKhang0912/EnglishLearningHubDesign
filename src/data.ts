export type ClassItem = {
  id: string
  name: string
  course: string
  year: string
  students: number
  max: number
  code: string
  color: string
  avg: number
  completion: number
  archived?: boolean
}

export const CLASSES: ClassItem[] = [
  { id: '6A', name: 'Lớp 6A', course: 'English 6', year: '2026–2027', students: 38, max: 40, code: 'K6A-7QX2', color: '#5368ec', avg: 7.9, completion: 91 },
  { id: '6B', name: 'Lớp 6B', course: 'English 6', year: '2026–2027', students: 35, max: 40, code: 'K6B-M4RT', color: '#0e9f8f', avg: 7.4, completion: 84 },
  { id: '7A', name: 'Lớp 7A', course: 'English 7', year: '2026–2027', students: 40, max: 40, code: 'K7A-92PL', color: '#243b7b', avg: 8.1, completion: 88 },
  { id: '8A', name: 'Lớp 8A', course: 'English 8', year: '2026–2027', students: 32, max: 40, code: 'K8A-HV3D', color: '#c2410c', avg: 6.8, completion: 76 },
]

export type Assignment = {
  id: string
  title: string
  classes: string[]
  type: string
  skill: string
  status: 'draft' | 'published' | 'scheduled'
  due: string
  assigned: string
  submitted: number
  total: number
  graded: number
  points: number
  minutes: number
  late: boolean
  copiedFrom?: string
}

export const ASSIGNMENTS: Assignment[] = [
  { id: 'a1', title: 'English 6 — Unit 1: My New School (Reading & Writing)', classes: ['6A'], type: 'Hỗn hợp', skill: 'Reading', status: 'published', due: '22/10/2026 23:59', assigned: '15/10/2026', submitted: 31, total: 38, graded: 18, points: 10, minutes: 25, late: true },
  { id: 'a2', title: 'English 6 — Unit 3: Vocabulary', classes: ['6A'], type: 'Vocabulary', skill: 'Vocabulary', status: 'published', due: '20/10/2026 23:59', assigned: '12/10/2026', submitted: 36, total: 38, graded: 36, points: 10, minutes: 15, late: false },
  { id: 'a3', title: 'English 7 — Unit 3: Community Service', classes: ['7A'], type: 'Reading', skill: 'Reading', status: 'published', due: '19/10/2026 23:59', assigned: '10/10/2026', submitted: 37, total: 40, graded: 30, points: 10, minutes: 30, late: true },
  { id: 'a4', title: 'English 8 — Grammar Practice: Passive Voice', classes: ['8A'], type: 'Grammar', skill: 'Grammar', status: 'published', due: '18/10/2026 23:59', assigned: '09/10/2026', submitted: 22, total: 32, graded: 22, points: 10, minutes: 20, late: false },
  { id: 'a5', title: 'Reading Test — Environment', classes: ['7A', '8A'], type: 'Reading', skill: 'Reading', status: 'scheduled', due: '30/10/2026 23:59', assigned: '25/10/2026 07:00', submitted: 0, total: 72, graded: 0, points: 20, minutes: 40, late: false },
  { id: 'a6', title: 'Listening Practice — Daily Activities', classes: ['6B'], type: 'Listening', skill: 'Listening', status: 'published', due: '21/10/2026 23:59', assigned: '14/10/2026', submitted: 24, total: 35, graded: 24, points: 10, minutes: 20, late: true },
  { id: 'a7', title: 'English 6 — Unit 2: My House (Draft)', classes: ['6B'], type: 'Hỗn hợp', skill: 'Grammar', status: 'draft', due: '—', assigned: '—', submitted: 0, total: 35, graded: 0, points: 10, minutes: 20, late: false },
]

export const STUDENT_NAMES = [
  ['Lê Minh Anh', 'HS6A001', 9.0],
  ['Nguyễn Gia Hân', 'HS6A002', 8.6],
  ['Trần Bảo Long', 'HS6A003', 7.2],
  ['Phạm Khánh Linh', 'HS6A004', 8.9],
  ['Đỗ Quang Huy', 'HS6A005', 5.4],
  ['Vũ Thảo Nguyên', 'HS6A006', 7.8],
  ['Hoàng Đức Anh', 'HS6A007', 6.1],
  ['Bùi Ngọc Mai', 'HS6A008', 9.3],
  ['Ngô Tuấn Kiệt', 'HS6A009', 4.8],
  ['Đặng Phương Vy', 'HS6A010', 8.0],
  ['Mai Thanh Tùng', 'HS6A011', 7.5],
  ['Trịnh Hải Yến', 'HS6A012', 8.2],
] as [string, string, number][]

export type Q = {
  id: number
  type: 'mcq' | 'tf' | 'fill' | 'writing' | 'listening' | 'reading'
  skill: string
  points: number
  text: string
  options?: string[]
  correct?: number | string
  explain?: string
  passage?: string
  difficulty?: string
}

export const PASSAGE =
  'Linh is a new student at Lê Quý Đôn Secondary School. Her school is big and beautiful. It has a large playground, a library and twenty classrooms. Linh likes her new classmates because they are friendly. Every morning, she walks to school with her friend Mai. They usually arrive at 6.45 and play in the yard before class.'

export const QUIZ: Q[] = [
  { id: 1, type: 'mcq', skill: 'Grammar', points: 1.5, text: 'My new school ______ a big library and a large playground.', options: ['have', 'has', 'is having', 'are'], correct: 1, explain: 'Chủ ngữ số ít “My new school” → dùng “has”.' },
  { id: 2, type: 'tf', skill: 'Reading', points: 1.5, text: 'True or False: “Students at Lê Quý Đôn have to wear a uniform on Fridays.”', options: ['True', 'False'], correct: 1, explain: 'Đề bài không đề cập đến đồng phục vào thứ Sáu → False.' },
  { id: 3, type: 'fill', skill: 'Vocabulary', points: 2, text: 'Complete the sentence: Our teacher always ______ us to do our homework. (remind)', correct: 'reminds', explain: 'Hiện tại đơn, ngôi thứ ba số ít: remind → reminds.' },
  { id: 4, type: 'listening', skill: 'Listening', points: 1.5, text: 'What time does Nam get up on school days?', options: ['5.30', '6.00', '6.30', '7.00'], correct: 1, explain: 'Nam nói: “I usually get up at six o’clock.”' },
  { id: 5, type: 'reading', skill: 'Reading', points: 1.5, text: 'Why does Linh like her new classmates?', passage: PASSAGE, options: ['They are tall.', 'They are friendly.', 'They are noisy.', 'They are old.'], correct: 1, explain: 'Đoạn văn: “…because they are friendly.”' },
  { id: 6, type: 'writing', skill: 'Writing', points: 2, text: 'Write 40–60 words about your new school. Mention at least two things you like.' },
]

export const SEED_ANSWERS: Record<number, any> = {
  1: 1,
  2: 0,
  3: 'reminds',
  4: 1,
  5: 1,
  6: 'My new school is Lê Quý Đôn. It is very big and has a beautiful library. I like my classmates because they are friendly and help me a lot. My favourite place is the playground, where we play badminton after class. I am happy at my new school.',
}

export const SUBMISSIONS = [
  { id: 's1', name: 'Lê Minh Anh', code: 'HS6A001', status: 'wait', time: '16/10 08:12', late: false },
  { id: 's2', name: 'Nguyễn Gia Hân', code: 'HS6A002', status: 'wait', time: '16/10 09:40', late: false },
  { id: 's3', name: 'Trần Bảo Long', code: 'HS6A003', status: 'wait', time: '23/10 00:30', late: true },
  { id: 's4', name: 'Bùi Ngọc Mai', code: 'HS6A008', status: 'graded', time: '15/10 20:05', late: false, score: 9.3 },
  { id: 's5', name: 'Phạm Khánh Linh', code: 'HS6A004', status: 'graded', time: '15/10 21:11', late: false, score: 8.9 },
  { id: 's6', name: 'Đỗ Quang Huy', code: 'HS6A005', status: 'none', time: '—', late: false },
  { id: 's7', name: 'Ngô Tuấn Kiệt', code: 'HS6A009', status: 'none', time: '—', late: false },
]

export const NOTIFS = [
  { id: 1, t: 'Bài tập mới: Unit 1: My New School (Reading & Writing)', s: 'Lớp 6A · Cô Thu Hà', time: '15 phút trước', kind: 'assign', unread: true },
  { id: 2, t: 'Sắp đến hạn: Unit 3: Vocabulary còn 1 ngày', s: 'Lớp 6A', time: '2 giờ trước', kind: 'due', unread: true },
  { id: 3, t: 'Cô đã chấm điểm: Listening Practice — Daily Activities', s: 'Điểm: 8.5 / 10', time: 'Hôm qua', kind: 'grade', unread: false },
  { id: 4, t: 'Thông báo: Kiểm tra 15 phút vào thứ Năm 22/10', s: 'Lớp 6A', time: '2 ngày trước', kind: 'news', unread: false },
]
