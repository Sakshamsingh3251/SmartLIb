


const CREDENTIALS = {
  students: [
    { id: 'student', password: '1234', name: 'Alex Johnson' },
    { id: 'STU001',  password: 'pass1', name: 'Priya Sharma'  },
    { id: 'STU002',  password: 'pass2', name: 'Rahul Mehta'   },
  ],
  admins: [
    { username: 'admin', password: 'admin', key: '123456', name: 'Dr. Meena Kapoor' },
  ]
};

let SEATS = [
  { id:'A-01', zone:'Reading Hall',   amenities:'Window, Power outlet', status:'available', reservedBy:null },
  { id:'A-02', zone:'Reading Hall',   amenities:'Power outlet',          status:'occupied',  reservedBy:'Priya Sharma' },
  { id:'A-03', zone:'Reading Hall',   amenities:'Window view',           status:'available', reservedBy:null },
  { id:'A-04', zone:'Reading Hall',   amenities:'Lamp, Power outlet',    status:'reserved',  reservedBy:'Rahul Mehta' },
  { id:'A-05', zone:'Reading Hall',   amenities:'Quiet zone',            status:'available', reservedBy:null },
  { id:'A-06', zone:'Reading Hall',   amenities:'Power outlet',          status:'available', reservedBy:null },
  { id:'A-07', zone:'Reading Hall',   amenities:'Window, Lamp',          status:'occupied',  reservedBy:'Ananya Singh' },
  { id:'A-08', zone:'Reading Hall',   amenities:'Quiet zone',            status:'available', reservedBy:null },
  { id:'B-01', zone:'Computer Lab',   amenities:'PC, Power outlet',      status:'available', reservedBy:null },
  { id:'B-02', zone:'Computer Lab',   amenities:'PC, Power outlet',      status:'occupied',  reservedBy:'Dev Nair' },
  { id:'B-03', zone:'Computer Lab',   amenities:'PC, Power outlet',      status:'available', reservedBy:null },
  { id:'B-04', zone:'Computer Lab',   amenities:'PC, Power outlet',      status:'reserved',  reservedBy:'Tanvi Desai' },
  { id:'B-05', zone:'Computer Lab',   amenities:'PC, Power outlet',      status:'available', reservedBy:null },
  { id:'B-06', zone:'Computer Lab',   amenities:'PC, Power outlet',      status:'available', reservedBy:null },
  { id:'C-01', zone:'Discussion Room',amenities:'Whiteboard, Group table',status:'available', reservedBy:null },
  { id:'C-02', zone:'Discussion Room',amenities:'Whiteboard',            status:'occupied',  reservedBy:'Priya Sharma' },
  { id:'C-03', zone:'Discussion Room',amenities:'Power outlet',          status:'available', reservedBy:null },
  { id:'C-04', zone:'Discussion Room',amenities:'Whiteboard',            status:'available', reservedBy:null },
  { id:'D-01', zone:'Quiet Zone',     amenities:'Soundproof, Lamp',      status:'available', reservedBy:null },
  { id:'D-02', zone:'Quiet Zone',     amenities:'Soundproof, Lamp',      status:'occupied',  reservedBy:'Rahul Mehta' },
  { id:'D-03', zone:'Quiet Zone',     amenities:'Soundproof, Window',    status:'available', reservedBy:null },
  { id:'D-04', zone:'Quiet Zone',     amenities:'Soundproof, Power',     status:'reserved',  reservedBy:'Ananya Singh' },
  { id:'D-05', zone:'Quiet Zone',     amenities:'Soundproof, Lamp',      status:'available', reservedBy:null },
  { id:'D-06', zone:'Quiet Zone',     amenities:'Soundproof',            status:'available', reservedBy:null },
];

let RACKS = [
  {
    id:'rack-1', name:'Science Rack', genre:'Science',
    location:'Aisle 1, Row A', capacity:60,
    books:[
      { id:'b001', title:'A Brief History of Time', author:'Stephen Hawking', isbn:'978-0553380163', status:'available', borrowedBy:null, dueDate:null },
      { id:'b002', title:'The Selfish Gene',         author:'Richard Dawkins', isbn:'978-0198788607', status:'borrowed',  borrowedBy:'Priya Sharma', dueDate:'2025-08-10' },
      { id:'b003', title:'Cosmos',                   author:'Carl Sagan',      isbn:'978-0345539434', status:'available', borrowedBy:null, dueDate:null },
      { id:'b004', title:'The Double Helix',         author:'James D. Watson', isbn:'978-0393950755', status:'borrowed',  borrowedBy:'Rahul Mehta', dueDate:'2025-08-15' },
      { id:'b005', title:"Surely You're Joking",     author:'R. Feynman',      isbn:'978-0393316049', status:'available', borrowedBy:null, dueDate:null },
    ]
  },
  {
    id:'rack-2', name:'Literature Rack', genre:'Literature',
    location:'Aisle 1, Row B', capacity:80,
    books:[
      { id:'b006', title:'To Kill a Mockingbird',  author:'Harper Lee',          isbn:'978-0061935466', status:'available', borrowedBy:null, dueDate:null },
      { id:'b007', title:'1984',                    author:'George Orwell',       isbn:'978-0451524935', status:'borrowed',  borrowedBy:'Ananya Singh', dueDate:'2025-08-12' },
      { id:'b008', title:'Pride and Prejudice',     author:'Jane Austen',         isbn:'978-0141439518', status:'available', borrowedBy:null, dueDate:null },
      { id:'b009', title:'The Great Gatsby',        author:'F. Scott Fitzgerald', isbn:'978-0743273565', status:'available', borrowedBy:null, dueDate:null },
      { id:'b010', title:'Brave New World',         author:'Aldous Huxley',       isbn:'978-0060850524', status:'available', borrowedBy:null, dueDate:null },
    ]
  },
  {
    id:'rack-3', name:'History Rack', genre:'History',
    location:'Aisle 2, Row A', capacity:50,
    books:[
      { id:'b011', title:'Sapiens',               author:'Yuval Noah Harari', isbn:'978-0062316097', status:'borrowed',  borrowedBy:'Rahul Mehta',  dueDate:'2025-08-08' },
      { id:'b012', title:'Guns, Germs, and Steel', author:'Jared Diamond',    isbn:'978-0393354324', status:'available', borrowedBy:null, dueDate:null },
      { id:'b013', title:'The Silk Roads',         author:'Peter Frankopan',  isbn:'978-1101946329', status:'available', borrowedBy:null, dueDate:null },
    ]
  },
  {
    id:'rack-4', name:'Technology Rack', genre:'Technology',
    location:'Aisle 2, Row B', capacity:45,
    books:[
      { id:'b014', title:'The Innovators',           author:'Walter Isaacson', isbn:'978-1476708706', status:'available', borrowedBy:null, dueDate:null },
      { id:'b015', title:'Clean Code',               author:'Robert C. Martin',isbn:'978-0132350884', status:'borrowed',  borrowedBy:'Priya Sharma', dueDate:'2025-08-14' },
      { id:'b016', title:'The Pragmatic Programmer', author:'David Thomas',    isbn:'978-0135957059', status:'available', borrowedBy:null, dueDate:null },
    ]
  },
  {
    id:'rack-5', name:'Mathematics Rack', genre:'Mathematics',
    location:'Aisle 3, Row A', capacity:40,
    books:[
      { id:'b017', title:"Fermat's Last Theorem",    author:'Simon Singh',        isbn:'978-1857025217', status:'available', borrowedBy:null, dueDate:null },
      { id:'b018', title:'Gödel, Escher, Bach',      author:'Douglas Hofstadter', isbn:'978-0465026562', status:'available', borrowedBy:null, dueDate:null },
    ]
  },
  {
    id:'rack-6', name:'Philosophy Rack', genre:'Philosophy',
    location:'Aisle 3, Row B', capacity:35,
    books:[
      { id:'b019', title:'Meditations',          author:'Marcus Aurelius',     isbn:'978-0140449334', status:'available', borrowedBy:null, dueDate:null },
      { id:'b020', title:'Beyond Good and Evil',  author:'Friedrich Nietzsche', isbn:'978-0679724650', status:'borrowed',  borrowedBy:'Ananya Singh', dueDate:'2025-08-16' },
    ]
  }
];

const ACTIVE_USERS = [
  { id:'STU001', name:'Priya Sharma',  seat:'A-02', since:'09:14 AM' },
  { id:'STU002', name:'Rahul Mehta',   seat:'D-02', since:'09:45 AM' },
  { id:'STU003', name:'Ananya Singh',  seat:'C-02', since:'10:02 AM' },
  { id:'STU004', name:'Dev Nair',      seat:'B-02', since:'10:20 AM' },
  { id:'STU005', name:'Tanvi Desai',   seat:null,   since:'10:40 AM' },
];

const GENRE_ICONS = {
  'Science':     'fa-flask',
  'Literature':  'fa-feather-pointed',
  'History':     'fa-landmark',
  'Technology':  'fa-microchip',
  'Mathematics': 'fa-square-root-variable',
  'Philosophy':  'fa-brain',
  'Arts':        'fa-palette',
};
const GENRE_COLORS = {
  'Science':     '#dbeafe:#2563eb',
  'Literature':  '#ede9fe:#7c3aed',
  'History':     '#fef3c7:#d97706',
  'Technology':  '#dcfce7:#16a34a',
  'Mathematics': '#fee2e2:#dc2626',
  'Philosophy':  '#ccfbf1:#0d9488',
  'Arts':        '#fce7f3:#be185d',
};
