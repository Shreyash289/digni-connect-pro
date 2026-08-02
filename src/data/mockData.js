export const SURVIVORS = [
  { id: 1, initials: 'MR', name: 'Meena Rajeshwari', age: 28, location: 'Chennai, Tamil Nadu', skills: ['Data Entry', 'MS Office', 'Tailoring'], education: 'Class 10 Pass', experience: '2 years', languages: ['Tamil', 'English'], ngo: 'Asha Foundation', status: 'approved', completeness: 92, jobRole: 'Data Entry Operator', stage: 3, jobsApplied: 4, interviews: 2, color: '#2563EB' },
  { id: 2, initials: 'AT', name: 'Arjun Thamizhan', age: 35, location: 'Bengaluru, Karnataka', skills: ['Carpentry', 'Plumbing', 'Painting'], education: 'Class 8 Pass', experience: '5 years', languages: ['Kannada', 'Hindi'], ngo: 'Navjyoti NGO', status: 'approved', completeness: 100, jobRole: 'Skilled Tradesman', stage: 4, jobsApplied: 6, interviews: 3, color: '#0D9488' },
  { id: 3, initials: 'KS', name: 'Kavitha Sundaram', age: 42, location: 'Pondicherry', skills: ['Teaching', 'Child Care', 'Tamil Typing'], education: 'B.Ed Graduate', experience: '8 years', languages: ['Tamil', 'Hindi', 'English'], ngo: 'RRU Partner Cell', status: 'approved', completeness: 100, jobRole: 'Primary Teacher', stage: 5, jobsApplied: 3, interviews: 2, color: '#7C3AED' },
  { id: 4, initials: 'PD', name: 'Priya Devi', age: 24, location: 'Mumbai, Maharashtra', skills: ['Cooking', 'Housekeeping', 'Customer Service'], education: 'Class 12 Pass', experience: '1 year', languages: ['Hindi', 'Marathi', 'English'], ngo: 'Shakti Sewa', status: 'pending', completeness: 65, jobRole: 'Hospitality Staff', stage: 1, jobsApplied: 0, interviews: 0, color: '#DC2626' },
  { id: 5, initials: 'RL', name: 'Rekha Lakshmi', age: 31, location: 'Hyderabad, Telangana', skills: ['Embroidery', 'Garment Stitching', 'Quality Check'], education: 'ITI Certificate', experience: '4 years', languages: ['Telugu', 'Hindi'], ngo: 'Asha Foundation', status: 'approved', completeness: 88, jobRole: 'Garment Worker', stage: 3, jobsApplied: 5, interviews: 2, color: '#D97706' },
  { id: 6, initials: 'SM', name: 'Suresh Murugan', age: 29, location: 'Coimbatore, Tamil Nadu', skills: ['Electrical Work', 'AC Repair', 'Wiring'], education: 'Diploma in Electrical', experience: '3 years', languages: ['Tamil', 'English'], ngo: 'Navjyoti NGO', status: 'approved', completeness: 95, jobRole: 'Electrician', stage: 4, jobsApplied: 7, interviews: 4, color: '#059669' },
  { id: 7, initials: 'AB', name: 'Anita Bose', age: 38, location: 'Kolkata, West Bengal', skills: ['Accounting', 'Tally', 'Data Entry'], education: 'B.Com Graduate', experience: '6 years', languages: ['Bengali', 'Hindi', 'English'], ngo: 'Shakti Sewa', status: 'pending', completeness: 45, jobRole: 'Accounts Assistant', stage: 1, jobsApplied: 0, interviews: 0, color: '#8B5CF6' },
  { id: 8, initials: 'VK', name: 'Vijaya Kumar', age: 26, location: 'Pune, Maharashtra', skills: ['Security Guard', 'CCTV Operation', 'Crowd Management'], education: 'Class 12 Pass', experience: '2 years', languages: ['Marathi', 'Hindi'], ngo: 'RRU Partner Cell', status: 'approved', completeness: 78, jobRole: 'Security Personnel', stage: 2, jobsApplied: 3, interviews: 1, color: '#0891B2' },
  { id: 9, initials: 'LN', name: 'Lakshmi Narayanan', age: 33, location: 'Chennai, Tamil Nadu', skills: ['Nursing Assistant', 'Patient Care', 'Medical Records'], education: 'GNM Nursing', experience: '5 years', languages: ['Tamil', 'English'], ngo: 'Asha Foundation', status: 'approved', completeness: 100, jobRole: 'Nursing Assistant', stage: 5, jobsApplied: 2, interviews: 2, color: '#BE185D' },
  { id: 10, initials: 'RG', name: 'Ravi Gopal', age: 22, location: 'Delhi, NCR', skills: ['Delivery', 'Driving (2W)', 'Mobile Repair'], education: 'Class 10 Pass', experience: '1 year', languages: ['Hindi', 'English'], ngo: 'Navjyoti NGO', status: 'draft', completeness: 30, jobRole: 'Delivery Executive', stage: 1, jobsApplied: 0, interviews: 0, color: '#374151' },
]

export const JOBS = [
  { id: 1, title: 'Data Entry Operator', company: 'Infosys BPO', location: 'Chennai', skills: ['Data Entry', 'MS Office'], type: 'Full Time', salary: '₹12,000 – ₹15,000/mo', posted: '2 days ago', applicants: 8 },
  { id: 2, title: 'Garment Stitcher', company: 'Madura Fashion', location: 'Coimbatore', skills: ['Garment Stitching', 'Quality Check'], type: 'Full Time', salary: '₹10,000 – ₹14,000/mo', posted: '1 day ago', applicants: 12 },
  { id: 3, title: 'Hospital Housekeeping', company: 'Apollo Hospitals', location: 'Bengaluru', skills: ['Housekeeping', 'Customer Service'], type: 'Full Time', salary: '₹11,000 – ₹13,000/mo', posted: '3 days ago', applicants: 5 },
  { id: 4, title: 'Primary School Teacher', company: 'Govt. Model School', location: 'Pondicherry', skills: ['Teaching', 'Child Care'], type: 'Contract', salary: '₹18,000 – ₹22,000/mo', posted: '5 days ago', applicants: 3 },
  { id: 5, title: 'Electrician Trainee', company: 'L&T Construction', location: 'Hyderabad', skills: ['Electrical Work', 'Wiring'], type: 'Full Time', salary: '₹14,000 – ₹18,000/mo', posted: '1 day ago', applicants: 7 },
  { id: 6, title: 'Accounts Assistant', company: 'Tata Consultancy', location: 'Mumbai', skills: ['Accounting', 'Tally'], type: 'Full Time', salary: '₹16,000 – ₹20,000/mo', posted: '4 days ago', applicants: 4 },
]

export const NGOS = [
  { id: 1, name: 'Asha Foundation', location: 'Chennai, TN', contact: 'Radha Krishnan', survivors: 42, placed: 28, active: true },
  { id: 2, name: 'Navjyoti NGO', location: 'Delhi NCR', contact: 'Pradeep Sharma', survivors: 35, placed: 19, active: true },
  { id: 3, name: 'RRU Partner Cell', location: 'Pondicherry', contact: 'Dr. Meera Iyer', survivors: 28, placed: 22, active: true },
  { id: 4, name: 'Shakti Sewa', location: 'Mumbai, MH', contact: 'Sunita Rao', survivors: 19, placed: 8, active: true },
  { id: 5, name: 'Hope Welfare Trust', location: 'Kolkata, WB', contact: 'Anand Ghosh', survivors: 14, placed: 6, active: false },
]

export const ANALYTICS = {
  totalSurvivors: 138,
  placedSurvivors: 83,
  activeNGOs: 12,
  activeRecruiters: 47,
  pendingApprovals: 14,
  monthlyPlacements: [12, 18, 14, 22, 28, 19, 31, 24, 17, 29, 33, 26],
  skillDistribution: [
    { skill: 'Garment / Tailoring', count: 32 },
    { skill: 'Data Entry / Office', count: 28 },
    { skill: 'Teaching / Child Care', count: 21 },
    { skill: 'Construction / Trade', count: 19 },
    { skill: 'Healthcare Support', count: 15 },
    { skill: 'Hospitality', count: 23 },
  ],
  stateDistribution: [
    { state: 'Tamil Nadu', count: 38 },
    { state: 'Maharashtra', count: 27 },
    { state: 'Karnataka', count: 22 },
    { state: 'Telangana', count: 18 },
    { state: 'West Bengal', count: 17 },
    { state: 'Delhi NCR', count: 16 },
  ],
}

export const STAGES = ['Profile Created', 'Resume Ready', 'Interview Ready', 'Applied', 'Placed']

export const ALL_SKILLS = [
  'Data Entry', 'MS Office', 'Tailoring', 'Teaching', 'Child Care',
  'Carpentry', 'Plumbing', 'Cooking', 'Housekeeping', 'Embroidery',
  'Garment Stitching', 'Electrical Work', 'Accounting', 'Tally',
  'Security Guard', 'Nursing Assistant', 'Painting', 'Driving (2W)',
  'Customer Service', 'Tamil Typing', 'Mobile Repair', 'AC Repair',
]
