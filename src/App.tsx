import { profile } from './data'
import { initials } from './utils'
import './App.css'

function App() {
  return (
    <div className="page">
      <header className="hero">
        <div className="avatar" aria-hidden="true">
          {initials(profile.name)}
        </div>
        <h1 className="name">{profile.name}</h1>
        <p className="role">{profile.role}</p>
        <p className="location">{profile.location}</p>
        <p className="summary">{profile.summary}</p>
        <nav className="links" aria-label="Contact links">
          {profile.links.map((link) => (
            <a
              key={link.label}
              className="link"
              href={link.url}
              target="_blank"
              rel="noreferrer"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <section className="section" aria-labelledby="skills-heading">
          <h2 id="skills-heading">Skills</h2>
          <ul className="skills">
            {profile.skills.map((skill) => (
              <li key={skill} className="chip">
                {skill}
              </li>
            ))}
          </ul>
        </section>

        <section className="section" aria-labelledby="projects-heading">
          <h2 id="projects-heading">Projects</h2>
          <div className="projects">
            {profile.projects.map((project) => (
              <article key={project.name} className="card">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className="tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  className="card-link"
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View project →
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          Built with React + Vite + TypeScript. © {new Date().getFullYear()}{' '}
          {profile.name}.
        </p>
      </footer>
    </div>
  )
}

export default App
