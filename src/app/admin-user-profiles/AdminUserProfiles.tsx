'use client'

import UserPhoto from '@/components/ui-elements/UserPhoto/UserPhoto'
import { QuizUser } from '@/models/user-profile.model'
import { AdminUserAction } from '@/schemas/user.schema'
import { csrfHeaders } from '@/util/get-cookie'
import { useState } from 'react'
import classes from './page.module.scss'

type AdminUserProfilesProps = {
  users: QuizUser[]
  viewerId: string
}

const confirmMessages: Record<AdminUserAction['action'] | 'deleteAndBan', string> = {
  grantAdmin: 'Grant admin access to this user?',
  revokeAdmin: 'Revoke admin access for this user?',
  revokeSubmitQuestions: "Revoke this user's permission to submit questions?",
  deleteAndBan: 'Delete this profile and ban this user from signing in again?',
}

const AdminUserProfiles = ({ users: initialUsers, viewerId }: AdminUserProfilesProps) => {
  const [users, setUsers] = useState(initialUsers)
  const [errorMessage, setErrorMessage] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const runAction = async (userId: string, action: AdminUserAction['action'] | 'deleteAndBan') => {
    if (!window.confirm(confirmMessages[action])) {
      return
    }

    setBusyId(userId)

    try {
      if (action === 'deleteAndBan') {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          headers: csrfHeaders(),
        })

        if (!response.ok) {
          setErrorMessage(await response.text())
          return
        }

        setUsers((current) => current.filter((user) => user.uid !== userId))
        setErrorMessage('')
        return
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        setErrorMessage(await response.text())
        return
      }

      const updated: QuizUser = await response.json()
      setUsers((current) => current.map((user) => (user.uid === userId ? updated : user)))
      setErrorMessage('')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className={classes.page}>
      <h2>Review User Profiles</h2>

      {errorMessage && <div className={classes.errorMsg}>{errorMessage}</div>}

      {users.length === 0 ? (
        <p>No user profiles to review.</p>
      ) : (
        <ul className={classes.list}>
          {users.map((user) => {
            const isSelf = user.uid === viewerId
            const busy = busyId === user.uid

            return (
              <li key={user.uid} className={classes.card}>
                <div className={classes.identity}>
                  <UserPhoto photoURL={user.photoURL} size={64} />
                  <dl className={classes.fields}>
                    <dt>Name</dt>
                    <dd>
                      {user.displayName}
                      {isSelf ? ' (you)' : ''}
                    </dd>
                    {user.nickname && (
                      <>
                        <dt>Nickname</dt>
                        <dd>{user.nickname}</dd>
                      </>
                    )}
                    {user.email && (
                      <>
                        <dt>Email</dt>
                        <dd>{user.email}</dd>
                      </>
                    )}
                    {user.phoneNumber && (
                      <>
                        <dt>Phone</dt>
                        <dd>{user.phoneNumber}</dd>
                      </>
                    )}
                    <dt>Roles</dt>
                    <dd className={classes.roles}>
                      {user.isAdmin && <span className={classes.role}>Admin</span>}
                      {user.canSubmitQuestions && <span className={classes.role}>Can submit questions</span>}
                      {!user.isAdmin && !user.canSubmitQuestions && <span>None</span>}
                    </dd>
                  </dl>
                </div>

                {isSelf ? (
                  <p className={classes.hint}>You cannot change your own account here.</p>
                ) : (
                  <div className={classes.actions}>
                    {user.isAdmin ? (
                      <button
                        type="button"
                        className="btn"
                        disabled={busy}
                        onClick={() => void runAction(user.uid, 'revokeAdmin')}
                      >
                        Revoke admin
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn"
                        disabled={busy}
                        onClick={() => void runAction(user.uid, 'grantAdmin')}
                      >
                        Grant admin
                      </button>
                    )}
                    {user.canSubmitQuestions && (
                      <button
                        type="button"
                        className="btn"
                        disabled={busy}
                        onClick={() => void runAction(user.uid, 'revokeSubmitQuestions')}
                      >
                        Revoke question submission
                      </button>
                    )}
                    <button
                      type="button"
                      className={classes.danger}
                      disabled={busy}
                      onClick={() => void runAction(user.uid, 'deleteAndBan')}
                    >
                      Delete and ban
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default AdminUserProfiles
