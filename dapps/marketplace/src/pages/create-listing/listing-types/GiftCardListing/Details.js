import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import omit from 'lodash/omit'

import Steps from 'components/Steps'
import Wallet from 'components/Wallet'
import ImagePicker from 'components/ImagePicker'
import Redirect from 'components/Redirect'
import Link from 'components/Link'
import CurrencySelect from 'components/CurrencySelect'
import countryCodeMapping from '@origin/graphql/src/constants/CountryCodes'

import { CurrenciesByCountryCode } from 'constants/Currencies'
import { GiftCardRetailers } from 'constants/GiftCardRetailers'

import { formInput, formFeedback } from 'utils/formHelpers'

import PricingChooser from '../_PricingChooser'
import withConfig from 'hoc/withConfig'

class Details extends Component {
  constructor(props) {
    super(props)
    props.listing.media.shift() // Remove first image if there (It will be card image)
    this.state = omit(props.listing, 'valid')
  }

  componentDidMount() {
    if (this.titleInput) {
      this.titleInput.focus()
    }
  }

  render() {
    if (this.state.valid) {
      return <Redirect to={this.props.next} push />
    }
    const { ipfsGateway } = this.props.config

    const input = formInput(this.state, state => this.setState(state))
    const Feedback = formFeedback(this.state)
    const isMulti = Number(this.state.quantity || 0) > 1

    const issuingCountrySelect = Object.keys(CurrenciesByCountryCode)

    const retailerSelect = Object.keys(GiftCardRetailers).map(function(key) {
      return [key, GiftCardRetailers[key]]
    })

    return (
      <div className="row">
        <div className="col-md-8">
          <div className="create-listing-step-2">
            <div className="wrap">
              <div className="step">
                <fbt desc="create.step">
                  Step
                  <fbt:param name="step">{this.props.step}</fbt:param>
                </fbt>
              </div>
              <div className="step-description">
                <fbt desc="create.details.title">Provide listing details</fbt>
              </div>
              <Steps steps={this.props.steps} step={this.props.step} />

              <form
                onSubmit={e => {
                  e.preventDefault()
                  this.validate()
                }}
              >
                {this.state.valid !== false ? null : (
                  <div className="alert alert-danger">
                    <fbt desc="fix errors">Please fix the errors below...</fbt>
                  </div>
                )}

                <div className="form-group">
                  <label>
                    <fbt desc="create.details.retailer">Retailer</fbt>
                  </label>
                  <select
                    className="form-control form-control-lg"
                    value={this.state.retailer}
                    onChange={e => {
                      this.setState({ retailer: e.target.value })
                    }}
                  >
                    <option key="none" value="">
                      <fbt desc="select">Select</fbt>
                    </option>
                    {retailerSelect.map(([name, hash]) => (
                      <option key={name} value={name} disabled={hash == ''}>
                        {name}
                      </option>
                    ))}
                  </select>
                  {Feedback('retailer')}

                  <div className="giftcard-image">
                    <img
                      src={
                        this.state.retailer
                          ? `${ipfsGateway}/ipfs/${
                              GiftCardRetailers[this.state.retailer]
                            }`
                          : `${ipfsGateway}/ipfs/QmVffY9nUZYPt8uBy1ra9aMvixc1NC6jT7JjFNUgsuqbpJ`
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <fbt desc="create.details.issuingCountry">
                      Issuing Country
                    </fbt>
                  </label>
                  <select
                    className="form-control form-control-lg"
                    value={this.state.issuingCountry}
                    onChange={e => {
                      this.setState({ issuingCountry: e.target.value })
                    }}
                  >
                    {issuingCountrySelect.map(countryCode => (
                      <option key={countryCode} value={countryCode}>
                        {countryCodeMapping['en'][countryCode]}
                      </option>
                    ))}
                  </select>
                  {Feedback('issuingCountry')}
                </div>

                <div className="form-group">
                  <label className="mb-0">
                    <fbt desc="create.details.cardAmount">Amount on Card</fbt>
                  </label>
                  <div className="with-symbol">
                    <input {...input('cardAmount')} />
                    <div className={('dropdown', 'currency-select-dropdown')}>
                      <span
                        data-content={
                          CurrenciesByCountryCode[this.state.issuingCountry][2]
                        }
                      >
                        {CurrenciesByCountryCode[this.state.issuingCountry][1]}
                      </span>
                    </div>
                  </div>

                  {Feedback('cardAmount')}
                </div>

                <div className="form-group">
                  <label>
                    <fbt desc="create.details.quantity">Quantity</fbt>
                  </label>
                  <input {...input('quantity')} />
                  {Feedback('quantity')}
                </div>

                <div className="form-group">
                  <input
                    type="checkbox"
                    checked={this.state.isDigital}
                    id="isDigital-checkbox"
                    onChange={() => {
                      this.setState({ isDigital: !this.state.isDigital })
                    }}
                  />
                  <label htmlFor="isDigital-checkbox">
                    <fbt desc="create.details.giftcard.isDigital">
                      Is this card digital?
                    </fbt>
                  </label>
                </div>

                <div className="form-group">
                  <input
                    type="checkbox"
                    checked={this.state.isCashPurchase}
                    id="isCashPurchase-checkbox"
                    onChange={() => {
                      this.setState({
                        isCashPurchase: !this.state.isCashPurchase
                      })
                    }}
                  />
                  <label htmlFor="isCashPurchase-checkbox">
                    <fbt desc="create.details.giftcard.isCashPurchase">
                      Was this a cash purchase?
                    </fbt>
                  </label>
                </div>

                <div className="form-group">
                  <input
                    type="checkbox"
                    checked={this.state.receiptAvailable}
                    id="receiptAvailable-checkbox"
                    onChange={() => {
                      this.setState({
                        receiptAvailable: !this.state.receiptAvailable
                      })
                    }}
                  />
                  <label htmlFor="receiptAvailable-checkbox">
                    <fbt desc="create.details.giftcard.receiptAvailable">
                      Is a receipt available?
                    </fbt>
                  </label>
                </div>

                <div className="form-group">
                  <label className="mb-0">
                    <fbt desc="create.details.description">Notes</fbt>
                  </label>
                  <textarea {...input('description')} />
                  {Feedback('description')}
                </div>

                <PricingChooser {...input('acceptedTokens', true)}>
                  <div className="form-group">
                    <label>
                      {!isMulti && <fbt desc="price-per-unit">Price</fbt>}
                      {isMulti && (
                        <fbt desc="price-per-unit">Price (per card)</fbt>
                      )}
                    </label>
                    <div className="with-symbol" style={{ maxWidth: 270 }}>
                      <input {...input('price')} />
                      <CurrencySelect {...input('currency', true)} />
                    </div>
                    {Feedback('price')}
                    <div className="help-text price">
                      <fbt desc="create.details.help-text.price">
                        Price is an approximation of what you will receive.
                      </fbt>
                      <a
                        href="#/about/payments"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        &nbsp;
                        <fbt desc="create.details.help-text.price.more">
                          Learn More
                        </fbt>
                      </a>
                    </div>
                  </div>
                </PricingChooser>

                <div className="form-group">
                  <label>
                    <fbt desc="create.select-photos">Select photos</fbt>
                  </label>
                  <ImagePicker
                    images={this.state.media}
                    onChange={media => this.setState({ media })}
                  >
                    <div className="add-photos">
                      <fbt desc="create.select-photos">Select photos</fbt>
                    </div>
                  </ImagePicker>
                  <ul className="help-text photo-help list-unstyled">
                    <fbt desc="create.listing.photos.help">
                      <li>
                        Hold down &apos;command&apos; (⌘) to select multiple
                        images.
                      </li>
                      <li>Maximum 10 images per listing.</li>
                      <li>
                        First image will be featured - drag and drop images to
                        reorder.
                      </li>
                      <li>Recommended aspect ratio is 4:3</li>
                    </fbt>
                  </ul>
                </div>

                <div className="actions">
                  <Link
                    className="btn btn-outline-primary"
                    to={this.props.prev}
                  >
                    <fbt desc="back">Back</fbt>
                  </Link>
                  <button type="submit" className="btn btn-primary">
                    <fbt desc="continue">Continue</fbt>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-4 d-none d-md-block">
          <Wallet />
        </div>
      </div>
    )
  }

  validate() {
    const newState = {}

    if (!this.state.description) {
      newState.descriptionError = fbt(
        'Description is required',
        'create.error.Description is required'
      )
    } else if (this.state.description.length < 10) {
      newState.descriptionError = fbt(
        'Description is too short',
        'create.error.Description is too short'
      )
    } else if (this.state.description.length > 1024) {
      // Limit from origin-validator/src/schemas/listing.json
      newState.descriptionError = fbt(
        'Description is too long',
        'create.error.Description is too long'
      )
    }

    if (!this.state.retailer) {
      newState.retailerError = fbt(
        'Please select a card retailer',
        'create.listing.giftcard.select-retailer'
      )
    }

    if (!this.state.cardAmount) {
      newState.cardAmountError = fbt(
        'Amount on card is required',
        'Amount on card is required'
      )
    } else if (!this.state.cardAmount.match(/^-?[0-9.]+$/)) {
      newState.cardAmountError = fbt(
        'Amount on card must be a number',
        'Amount on card must be a number'
      )
    } else if (Number(this.state.cardAmount) <= 0) {
      newState.cardAmountError = fbt(
        'Amount on card must be greater than zero',
        'Amount on card must be greater than zero'
      )
    }

    if (!this.state.price) {
      newState.priceError = fbt('Price is required', 'Price is required')
    } else if (!this.state.price.match(/^-?[0-9.]+$/)) {
      newState.priceError = fbt(
        'Price must be a number',
        'Price must be a number'
      )
    } else if (Number(this.state.price) <= 0) {
      newState.priceError = fbt(
        'Price must be greater than zero',
        'Price must be greater than zero'
      )
    }

    newState.valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

    if (!newState.valid) {
      window.scrollTo(0, 0)
    } else if (this.props.onChange) {
      this.props.onChange(this.state)
    }
    this.setState(newState)
    return newState.valid
  }
}

export default withConfig(Details)

require('react-styl')(`
  .create-listing .create-listing-step-2 .pricing-chooser
    .help-text
      .help-icon
        margin-left: auto
  .giftcard-image
    height: 202px
    padding: 16px
    overflow: hidden
    img
      width: 270px
      height: auto
`)
