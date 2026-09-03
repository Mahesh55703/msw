'use client'

import TeamEditor from './TeamEditor'

export default function TeamMemberForm(props: Record<string, unknown>) {
  return <TeamEditor availableManagers={[]} {...props} />
}
