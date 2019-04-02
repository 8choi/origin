import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'

import Price from 'components/Price'
import Buy from './mutations/Buy'
import WithPrices from 'components/WithPrices'
import PaymentOptions from './_PaymentOptions'

const SingleUnit = ({ listing, from, refetch }) => {
  const acceptsDai = listing.acceptedTokens.find(t => t.id === 'token-DAI')
  const [token, setToken] = useState(acceptsDai ? 'token-DAI' : 'token-ETH')
  return (
    <WithPrices price={listing.price} targets={['token-ETH', 'token-DAI']}>
      {prices => {
        if (!prices) return null
        return (
          <div className="listing-buy">
            <div className="price">
              <Price listing={listing} descriptor />
            </div>
            <PaymentOptions
              price={listing.price}
              acceptedTokens={listing.acceptedTokens}
              value={token}
              onChange={setToken}
            >
              <Buy
                refetch={refetch}
                listing={listing}
                from={from}
                value={listing.price.amount}
                quantity={1}
                className="btn btn-primary"
                children={fbt('Purchase', 'Purchase')}
              />
            </PaymentOptions>
          </div>
        )
      }}
    </WithPrices>
  )
}

export default SingleUnit