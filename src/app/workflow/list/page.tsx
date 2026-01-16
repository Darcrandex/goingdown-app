import Link from 'next/link'

export default function WorkflowList() {
  return (
    <>
      <h1>Workflow List</h1>

      <ol>
        <li>
          <Link href={`/workflow/1`}>Workflow 1</Link>
        </li>
        <li>
          <Link href={`/workflow/2`}>Workflow 2</Link>
        </li>
      </ol>
    </>
  )
}
