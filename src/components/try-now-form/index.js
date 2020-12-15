import React from 'react'
import { Link as ReactRouterLink } from 'react-router-dom'

import { SIGN_UP } from '../../constants/routes'
import OptForm from '../opt-form'

export default function TryNowForm ({ children, ...restProps }) {
  return (
    <ReactRouterLink
      to={
        {
          pathname: SIGN_UP
        }
      }
      style={{textDecoration: 'none'}}
      {...restProps}
    >
      {children}
      <OptForm>
        <OptForm.Input placeholder='Email address' />
        <OptForm.Button>Try it now</OptForm.Button>
        <OptForm.Break />
        <OptForm.Text>
          Ready to watch? Enter your email to create or restart your membership.
        </OptForm.Text>
      </OptForm>
    </ReactRouterLink>
  )
}