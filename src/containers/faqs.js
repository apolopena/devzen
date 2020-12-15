import React from 'react'
import { Accordion } from '../components'
import TryNowForm from '../components/try-now-form'
import faqsData from '../fixtures/faqs.json'

export function FaqsContainer () {
  return (
    <Accordion>
      <Accordion.Title>Frequently Asked Questions</Accordion.Title>
      {faqsData.map(item => (
        <Accordion.Item key={item.id}>
          <Accordion.Header>{item.header}</Accordion.Header>
          <Accordion.Body>{item.body}</Accordion.Body>
        </Accordion.Item>
      ))}
      <Accordion.Item />
      <TryNowForm />
    </Accordion>
  )
}
