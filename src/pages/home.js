import React from 'react'
import { HeaderContainer } from '../containers/header'
import { Feature, TryNowForm } from '../components'
import { FaqsContainer } from '../containers/faqs'
import { FooterContainer } from '../containers/footer'
import { JumbotronContainer } from '../containers/Jumbotron'

export default function Home () {
  return (
    <>
      <HeaderContainer>
        <Feature>
          <Feature.Title>All Web Development, all the time.</Feature.Title>
          <Feature.SubTitle>
            Watch anywhere. Focus on your skills.
          </Feature.SubTitle>
          <TryNowForm />
        </Feature>
      </HeaderContainer>
      <JumbotronContainer />
      <FaqsContainer />
      <FooterContainer />
    </>
  )
}
