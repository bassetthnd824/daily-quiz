'use client'

import { useAppForm } from '@/components/form/form'
import ThemeSelector from '@/components/ui-elements/ThemeSelector/ThemeSelector'
import UserPhoto from '@/components/ui-elements/UserPhoto/UserPhoto'
import { useAuth } from '@/context/user-context'
import { QuizUser } from '@/models/user-profile.model'
import { nicknameSchema, updateUserProfileSchema } from '@/schemas/user.schema'
import { csrfHeaders } from '@/util/get-cookie'
import { useState } from 'react'
import * as v from 'valibot'
import classes from './page.module.scss'

type UserProfileFormProps = {
  user: QuizUser
}

const UserProfileForm = ({ user }: UserProfileFormProps) => {
  const { currentUser, updateCurrentUser } = useAuth()
  const profile = currentUser ?? user
  const [errorMessage, setErrorMessage] = useState('')

  const form = useAppForm({
    defaultValues: {
      nickname: profile.nickname ?? '',
    },
    onSubmit: async ({ value, formApi }) => {
      const payload = v.parse(updateUserProfileSchema, value)

      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...csrfHeaders(),
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const updated: QuizUser = await response.json()
        updateCurrentUser(updated)
        formApi.reset({ nickname: updated.nickname ?? '' })
        setErrorMessage('')
        return
      }

      setErrorMessage(await response.text())
    },
  })

  return (
    <div className={classes.profile}>
      <h2>Your Profile</h2>

      <div className={classes.identity}>
        <UserPhoto photoURL={profile.photoURL} size={96} />

        <dl className={classes.fields}>
          <dt>Name</dt>
          <dd>{profile.displayName}</dd>
          {profile.email && (
            <>
              <dt>Email</dt>
              <dd>{profile.email}</dd>
            </>
          )}
          {profile.phoneNumber && (
            <>
              <dt>Phone</dt>
              <dd>{profile.phoneNumber}</dd>
            </>
          )}
          {(profile.isAdmin || profile.canSubmitQuestions) && (
            <>
              <dt>Roles</dt>
              <dd className={classes.roles}>
                {profile.isAdmin && <span className={classes.role}>Admin</span>}
                {profile.canSubmitQuestions && <span className={classes.role}>Can submit questions</span>}
              </dd>
            </>
          )}
        </dl>
      </div>

      {errorMessage && <div className={classes.errorMsg}>{errorMessage}</div>}

      <form.AppForm>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.AppField name="nickname" validators={{ onChange: nicknameSchema }}>
            {(field) => <field.TextField label="Nickname" />}
          </form.AppField>
          <p className={classes.hint}>Shown on the leader board. Leave blank to use your name.</p>

          <div className="btn-container">
            <form.SubmitButton label="Save" submittingLabel="Saving..." />
          </div>
        </form>
      </form.AppForm>

      <div className={classes.themeSection}>
        <ThemeSelector />
      </div>
    </div>
  )
}

export default UserProfileForm
