import React from 'react'

type Props = {
  title: string
  content: string
  onBack?: () => void
}

const ProjectView = ({ title, content, onBack }: Props) => {
  return (
    <div style={{ padding: 12 }}>
      <button onClick={onBack} style={{ marginBottom: 12 }}>Back</button>
      <h2>{title}</h2>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{content}</pre>
    </div>
  )
}

export default ProjectView
