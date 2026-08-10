export interface ReviewItem {
  name: string;
  handle: string;
  role: string;
  badge: string;
  time: string;
  quote: string;
  image: string;
}

export const REVIEWS: ReviewItem[] = [
  {
    name: 'Akbar Ali',
    handle: 'akbar-ali',
    role: 'Company Official, Zyroo.org',
    badge: 'Company',
    time: '3 weeks ago',
    quote:
      'Zyroo has transformed how we identify, onboard, and develop emerging talent. The structured internship framework and verified credentials give us full confidence in every candidate we bring on board.',
    image: '/reviews/akbar-review.jpeg',
  },
  {
    name: 'Atta',
    handle: 'atta-student',
    role: 'Student',
    badge: 'Student',
    time: '2 weeks ago',
    quote:
      'Zyroo turned my internship into a guided, hands-on experience. Clear milestones and regular mentor feedback helped me build practical skills and real confidence for my career.',
    image: '/reviews/atta-review.jpeg',
  },
  {
    name: 'Amir Jawad',
    handle: 'amir-jawad',
    role: 'Student',
    badge: 'Student',
    time: '2 weeks ago',
    quote:
      'With Zyroo, I learned through real work rather than theory alone. The structure, guidance, and constructive feedback helped me grow into a more capable and confident professional.',
    image: '/reviews/jawad-review.jpeg',
  },
  {
    name: 'Bibi Tabassum',
    handle: 'bibi-tabassum',
    role: 'Intern',
    badge: 'Intern',
    time: '1 week ago',
    quote:
      'Zyroo gave me a structured way to learn through real projects. The clarity of the workflow and the quality of the mentor feedback made my internship genuinely effective.',
    image: '/reviews/bibi-tabassum-review.jpeg',
  },
  {
    name: 'Saba Iftikhar',
    handle: 'saba-iftikhar',
    role: 'AI/ML Engineer & Mentor',
    badge: 'Mentor',
    time: '4 days ago',
    quote:
      'As an engineer and mentor, Zyroo gives me a structured way to guide interns through real projects. The clarity of the workflow and the quality of the feedback tools make mentoring genuinely effective.',
    image: '/reviews/saba-review.jpeg',
  },
];
