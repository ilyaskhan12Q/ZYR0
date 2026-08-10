export interface FaqItem {
  id: string;
  filename: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'cost',
    filename: 'cost.txt',
    question: 'Is ZYR0 completely free for students?',
    answer:
      'Yes — zero fees, forever. Students never pay to apply, intern, or receive certificates. Companies fund the platform because verified proof-of-work saves them real hiring cost.',
  },
  {
    id: 'storage',
    filename: 'storage.md',
    question: 'Where is my code stored?',
    answer:
      'One hundred percent on your own GitHub account. ZYR0 stores only repository links, submission metadata, reviews, and certificates — never your source code. Your commit history stays your property.',
  },
  {
    id: 'verify',
    filename: 'verify.sh',
    question: 'How do employers verify my certificate?',
    answer:
      'Every certificate carries a unique credential ID and an embedded QR code. Employers open zyroo.org/verify/:id or scan the QR — no account required — and see the cryptographically signed record instantly.',
  },
  {
    id: 'revisions',
    filename: 'revisions.txt',
    question: 'What happens if my submission needs changes?',
    answer:
      'Mentors return actionable, rubric-mapped feedback instead of a bare rejection. You revise in the same branch, re-submit the PR link, and the review loop continues until the work meets the acceptance criteria.',
  },
  {
    id: 'mentors',
    filename: 'mentors.md',
    question: 'Who reviews my work?',
    answer:
      'Working industry engineers. Every submission is scored against a transparent rubric covering code quality, architecture, and security — the same dimensions used in real hiring loops.',
  },
];
