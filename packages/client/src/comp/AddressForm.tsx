import React from 'react'
import Input from 'muicss/lib/react/input'

import { RoundedButton } from './util/Button'
import { client } from '../lib/trpc'
import { QueryContainer, AddressContainer, ContactContainer } from '../lib/unstated'
import { useControlRef } from './util/ControlRef'
import { TimeoutError } from '@tianhuil/simple-trpc/dist/timedFetch'
import { BaseInput } from './util/Input'
import { StatusReport } from './status/StatusReport'
import { useParams } from 'react-router-dom'
import { useAppHistory } from '../lib/path'
import styled from 'styled-components'
import { sampleAddresses, ImplementedState } from '../common'
import { AppForm } from './util/Form'

const FlexBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  margin: 1em -.5em;
`

const FlexGrow = styled.div`
  flex-grow: 1;
  margin: 0 .5em;
  @media only screen and (min-width: 544px) {
    min-width: 300px;
  }
`

const FlexFixed = styled.div`
  flex-grow: 0;
  margin: 0 .5em;
`

// pulled out for testing
export const RawAddressForm: React.FC<{state: string, zip?: string}> = ({state, zip}) => {
  const { path, pushState } = useAppHistory()
  const addrRef = useControlRef<Input>()
  const { load, error, success } = QueryContainer.useContainer()
  const { address, setAddress } = AddressContainer.useContainer()
  const { setContact } = ContactContainer.useContainer()

  // When we first arrive at page, set focus and move cursor to beginning
  React.useEffect(() => {
    if (path?.type === 'address' && addrRef?.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const controlEl = (addrRef.current as any).controlEl as HTMLInputElement
      controlEl.focus({preventScroll: true})
      controlEl.setSelectionRange(0, 0)
    }
  }, [addrRef, path])

  const partialAddr = zip ? ' ' + state + ', ' + zip : null

  const defaultAddress = () => {
    // if zip was provided, return partial address
    if (partialAddr) return partialAddr
  
    // fill in default address
    if (process.env.REACT_APP_DEFAULT_ADDRESS) {
      const addresses = sampleAddresses[state as ImplementedState] ?? []
      return addresses[0]?.address ?? ''
    } else {
      return ''
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.persist()  // allow async function call
    event.preventDefault()

    const addr = addrRef.value()
    if (addr === null) throw Error('address ref not set')

    load('Fetching information about your address')
    try {
      setContact(null)
      setAddress(null)
      const result = await client.fetchContactAddress(addr)
      switch(result.type) {
        case 'data': {
          const {contact, address} = result.data
          setContact(contact)
          setAddress(address)
          break
        }
        case 'error': {
          error(<><b>Server Error:</b> {result.message}</>)
          return
        }
      }
      pushState(state)
      await success(<><b>Success</b> fetching information about your address</>)
    } catch(e) {
      if (e instanceof TimeoutError) {
        error(<><b>Timeout Error:</b> Try resubmitting.  If this persists, try again in a little while.</>)
      } else if (e instanceof TypeError) {
        error(<><b>Connection Error:</b> Try resubmitting.  If this persists, try again in a little while.</>)
      } else {
        throw e
      }
    }
  }

  return <StatusReport state={state}>
    <AppForm onSubmit={handleSubmit}>
      <p><b>Enter Your Full Address</b> to find your local election official</p>
      <FlexBox>
        <FlexGrow>
          <BaseInput
            id='addr-input'  // This id is used for Warning Box to fill form quickly
            label='Full Address'
            ref={addrRef}
            pattern={`(?!${partialAddr}$).*`}
            required
            defaultValue={ address?.queryAddr ?? defaultAddress() }
            translate="no" 
            lang="en"
          />
        </FlexGrow>
        <FlexFixed>
          <div style={{paddingTop: '15px', marginBottom: '20px'}}>  {/* To match BaseInput's spacing */}
            <RoundedButton
              id='addr-submit'  // This id is used for Warning Box to submit form quickly
              color='primary'
              variant='raised'
              data-testid='submit'
              style={{flexGrow: 0}}
            >Find my election official
            </RoundedButton>
          </div>
        </FlexFixed>
      </FlexBox>
    </AppForm>
  </StatusReport>
}

export const AddressForm = () => {
  const { state, zip } = useParams()
  if (!state) throw Error('state not set in AddressForm')
  return <RawAddressForm state={state} zip={zip} />
}
