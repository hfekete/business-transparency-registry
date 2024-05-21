import {
  BodsCountryI, BodsIdentifierI, BodsInterestI, BodsNameI, BodsBtrAddressI
} from '~/interfaces/btr-bods/components-i'
import {
  ControlOfDirectorsDetailsE,
  BodsInterestDirectOrIndirectE,
  BodsInterestTypeE,
  BodsNameTypeE,
  BodsPersonTypeE, ControlOfSharesDetailsE, ControlOfVotesDetailsE
} from '~/enums/btr-bods-e'
import { PercentageRangeE } from '~/enums/percentage-range-e'
import { SiControlOfDirectorsSchemaType, SiControlOfSchemaType, SiSchemaType } from '~/utils/si-schema/definitions'

const getBodsAddressFromSi = (si: SiSchemaType): BodsBtrAddressI => {
  return {
    street: si.address.line1,
    streetAdditional: si.address.line2,
    city: si.address.city,
    region: si.address.region,
    postalCode: si.address.postalCode,
    locationDescription: si.address.locationDescription ? si.address.locationDescription : '',
    country: si.address.country?.alpha_2 ? si.address.country.alpha_2 : '',
    countryName: si.address.country?.name ? si.address.country.name : ''
  }
}

const getBodsNamesFromSi = (si: SiSchemaType) => {
  const names: BodsNameI[] = [
    {
      fullName: si.name.fullName,
      type: BodsNameTypeE.INDIVIDUAL
    }
  ]

  if (si.name.preferredName) {
    names.push({
      fullName: si.name.preferredName,
      type: BodsNameTypeE.ALTERNATIVE
    })
  }
  return names
}

const getBodsIdentifiersFromSi = (si: SiSchemaType) => {
  const identifiers: BodsIdentifierI[] = []
  if (si.tax?.taxNumber) {
    identifiers.push({
      id: si.tax.taxNumber,
      scheme: 'CAN-TAXID',
      schemeName: 'ITN'
    })
  }
  return identifiers
}

const getPersonType = (_si: SiSchemaType): BodsPersonTypeE => {
  // future: when we have requirements to hide person details we can use
  // BodsPersonTypeE.ANONYMOUS_PERSON
  return BodsPersonTypeE.KNOWN_PERSON
}

const _getDirectorsInterests =
  (controlOfDirectors: SiControlOfDirectorsSchemaType, startDate: string, endDate?: string) => {
    const interests: BodsInterestI[] = []

    if (controlOfDirectors.directControl) {
      const interest =
        _createInterest(
          BodsInterestDirectOrIndirectE.DIRECT,
          ControlOfDirectorsDetailsE.DIRECT_CONTROL,
          startDate,
          endDate
        )
      interests.push(interest)
    }
    if (controlOfDirectors.indirectControl) {
      const interest =
        _createInterest(
          BodsInterestDirectOrIndirectE.INDIRECT,
          ControlOfDirectorsDetailsE.INDIRECT_CONTROL,
          startDate,
          endDate
        )
      interests.push(interest)
    }
    if (controlOfDirectors.significantInfluence) {
      const interest =
        _createInterest(
          BodsInterestDirectOrIndirectE.INDIRECT,
          ControlOfDirectorsDetailsE.SIGNIFICANT_INFLUENCE,
          startDate,
          endDate
        )
      interests.push(interest)
    }
    if (controlOfDirectors.inConcertControl) {
      const interest =
        _createInterest(
          BodsInterestDirectOrIndirectE.UNKNOWN,
          ControlOfDirectorsDetailsE.IN_CONCERT_CONTROL,
          startDate,
          endDate
        )
      interests.push(interest)
    }
    if (controlOfDirectors.actingJointly) {
      const interest =
        _createInterest(
          BodsInterestDirectOrIndirectE.UNKNOWN,
          ControlOfDirectorsDetailsE.ACTING_JOINTLY,
          startDate,
          endDate
        )
      interests.push(interest)
    }

    return interests
  }

const _createInterest = (
  directOrIndirect: BodsInterestDirectOrIndirectE,
  details: string,
  startDate: string,
  endDate?: string
): BodsInterestI => {
  if (startDate?.trim() === '') {
    startDate = (new Date()).toISOString().substring(0, 10)
  }
  return {
    directOrIndirect,
    details,
    startDate,
    endDate: endDate || undefined
  }
}

const _updateInterestWithPercentRange =
  (interest: BodsInterestI, range: PercentageRangeE, sharesAndVotes: BodsInterestTypeE) => {
    // the default range is (min, max]
    interest.share = {
      exclusiveMinimum: true,
      exclusiveMaximum: false
    }
    interest.type = sharesAndVotes

    switch (range) {
      case PercentageRangeE.LESS_THAN_25:
        // [0, 25)
        interest.share.minimum = 0
        interest.share.maximum = 25
        interest.share.exclusiveMinimum = false
        interest.share.exclusiveMaximum = true
        break
      case PercentageRangeE.AT_LEAST_25_TO_50:
        // [25, 50]
        interest.share.minimum = 25
        interest.share.maximum = 50
        interest.share.exclusiveMinimum = false
        break
      case PercentageRangeE.MORE_THAN_50_TO_75:
        // (50, 75]
        interest.share.minimum = 50
        interest.share.maximum = 75
        break
      case PercentageRangeE.MORE_THAN_75:
        // (75, 100]
        interest.share.minimum = 75
        interest.share.maximum = 100
        break
    }
  }

const _getInterestsOfSharesOrVotes =
  (controlOf: SiControlOfSchemaType, startDate: string, endDate?: string): BodsInterestI[] => {
    const interests: BodsInterestI[] = []
    let controlOfDetails: typeof ControlOfSharesDetailsE | typeof ControlOfVotesDetailsE = ControlOfVotesDetailsE
    let bodsInterestType: BodsInterestTypeE = BodsInterestTypeE.UNKNOWN_INTEREST

    if (controlOf.controlName === 'controlOfShares') {
      controlOfDetails = ControlOfSharesDetailsE
      bodsInterestType = BodsInterestTypeE.SHAREHOLDING
    } else if (controlOf.controlName === 'controlOfVotes') {
      controlOfDetails = ControlOfVotesDetailsE
      bodsInterestType = BodsInterestTypeE.VOTING_RIGHTS
    }

    if (controlOf.indirectControl) {
      const interest = _createInterest(
        BodsInterestDirectOrIndirectE.INDIRECT,
        controlOfDetails.INDIRECT_CONTROL,
        startDate,
        endDate
      )
      _updateInterestWithPercentRange(interest, controlOf.percentage!, bodsInterestType)
      interests.push(interest)
    }
    if (controlOf.beneficialOwner) {
      const interest =
        _createInterest(
          BodsInterestDirectOrIndirectE.DIRECT,
          controlOfDetails.BENEFICIAL_OWNER,
          startDate,
          endDate
        )
      _updateInterestWithPercentRange(interest, controlOf.percentage!, bodsInterestType)
      interests.push(interest)
    }
    if (controlOf.registeredOwner) {
      const interest =
        _createInterest(
          BodsInterestDirectOrIndirectE.DIRECT,
          controlOfDetails.REGISTERED_OWNER,
          startDate,
          endDate
        )
      _updateInterestWithPercentRange(interest, controlOf.percentage!, bodsInterestType)
      interests.push(interest)
    }
    if (controlOf.actingJointly) {
      const interest =
        _createInterest(
          BodsInterestDirectOrIndirectE.UNKNOWN,
          controlOfDetails.ACTING_JOINTLY,
          startDate,
          endDate
        )
      _updateInterestWithPercentRange(interest, controlOf.percentage!, bodsInterestType)
      interests.push(interest)
    }
    if (controlOf.inConcertControl) {
      const interest =
        _createInterest(
          BodsInterestDirectOrIndirectE.UNKNOWN,
          controlOfDetails.IN_CONCERT_CONTROL,
          startDate,
          endDate
        )
      _updateInterestWithPercentRange(interest, controlOf.percentage!, bodsInterestType)
      interests.push(interest)
    }

    return interests
  }

const getInterests = (si: SiSchemaType) => {
  let interests: BodsInterestI[] = []

  // todo: update to loop through array we convert to having multiple start/end dates
  if (si.controlOfShares.percentage !== PercentageRangeE.NO_SELECTION) {
    const newInterests = _getInterestsOfSharesOrVotes(si.controlOfShares, si.startDate, si.endDate)
    interests = interests.concat(newInterests)
  }

  if (si.controlOfVotes.percentage !== PercentageRangeE.NO_SELECTION) {
    const newInterests = _getInterestsOfSharesOrVotes(si.controlOfVotes, si.startDate, si.endDate)
    interests = interests.concat(newInterests)
  }

  if (si.controlOfDirectors.indirectControl ||
    si.controlOfDirectors.inConcertControl ||
    si.controlOfDirectors.directControl ||
    si.controlOfDirectors.actingJointly ||
    si.controlOfDirectors.significantInfluence
  ) {
    const newInterests = _getDirectorsInterests(si.controlOfDirectors, si.startDate, si.endDate)
    interests = interests.concat(newInterests)
  }

  if (si.controlOther) {
    interests.push({
      type: BodsInterestTypeE.OTHER_INFLUENCE_OR_CONTROL,
      details: si.controlOther
    })
  }

  return interests
}

const getBodsNationalitiesFromSi = (si: SiSchemaType): BodsCountryI[] => {
  const citizenships: BodsCountryI[] = []
  for (const btrCountry of si.citizenships) {
    if (btrCountry.alpha_2 !== 'CA_PR') {
      const code = btrCountry.alpha_2
      const name = code === 'CA' ? 'Canada' : btrCountry.name
      citizenships.push({ name, code })
    }
  }
  return citizenships
}

const getTaxResidenciesFromSi = (si: SiSchemaType): BodsCountryI[] => {
  const taxResidencies: BodsCountryI[] = []
  if (si.isTaxResident) {
    taxResidencies.push({ name: 'Canada', code: 'CA' })
  }
  return taxResidencies
}

export default {
  getBodsAddressFromSi,
  getBodsNamesFromSi,
  getBodsIdentifiersFromSi,
  getBodsNationalitiesFromSi,
  getInterests,
  getTaxResidenciesFromSi,
  getPersonType
}
