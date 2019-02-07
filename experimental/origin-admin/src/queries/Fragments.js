import gql from 'graphql-tag'

export default {
  Account: {
    balance: gql`
      fragment balanceFields on Account {
        id
        role
        name
        balance {
          eth
          wei
        }
        ogn: token(symbol: "OGN") {
          id
          balance
        }
      }
    `
  },
  Listing: {
    basic: gql`
      fragment basicListingFields on ListingResult {
        id
        status
        totalEvents
        seller {
          id
        }
        arbitrator {
          id
        }
        deposit
        depositAvailable
        createdEvent {
          timestamp
        }

        category
        categoryStr
        title
        description
        currencyId
        featured
        hidden
        price {
          amount
          currency
        }
        media {
          url
          contentType
        }
        commission
        commissionPerUnit

        ... on UnitListing {
          unitsTotal
          unitsAvailable
          unitsSold
        }
      }
    `
  },
  Offer: {
    basic: gql`
      fragment basicOfferFields on Offer {
        id
        listingId
        offerId
        value
        currency
        refund
        commission
        status
        finalizes
        quantity
        valid
        validationError
        arbitrator {
          id
        }
        affiliate {
          id
        }
        buyer {
          id
        }
        withdrawnBy {
          id
        }
      }
    `
  }
}