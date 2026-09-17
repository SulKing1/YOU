export interface Project {
  name: string
  description: string
  url: string
  tags: string[]
}

export interface Profile {
  name: string
  role: string
  location: string
  summary: string
  email: string
  links: { label: string; url: string }[]
  skills: string[]
  projects: Project[]
}

export const profile: Profile = {
  name: 'Sultan',
  role: 'Software Engineering Student',
  location: 'Remote',
  summary:
    'I build clean, reliable web applications and enjoy learning by shipping. ' +
    'This site is my playground for experimenting with modern front-end tooling.',
  email: 'hello@example.com',
  links: [
    { label: 'GitHub', url: 'https://github.com/SulKing1' },
    { label: 'Email', url: 'mailto:hello@example.com' },
  ],
  skills: [
    'TypeScript',
    'React',
    'Vite',
    'Node.js',
    'CSS',
    'Testing',
  ],
  projects: [
    {
      name: 'YOU — Portfolio',
      description:
        'This very website. A fast, accessible personal site built with Vite, React, and TypeScript.',
      url: 'https://github.com/SulKing1/YOU',
      tags: ['React', 'Vite', 'TypeScript'],
    },
    {
      name: 'Task Tracker',
      description:
        'A small productivity app for organizing coursework and side-projects with a focus on keyboard-first UX.',
      url: '#',
      tags: ['React', 'State'],
    },
    {
      name: 'API Playground',
      description:
        'An experiment sandbox for testing REST and GraphQL endpoints with saved request collections.',
      url: '#',
      tags: ['Node.js', 'HTTP'],
    },
  ],
}
