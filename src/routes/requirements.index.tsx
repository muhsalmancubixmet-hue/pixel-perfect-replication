import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/requirements/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/requirements/"!</div>
}
