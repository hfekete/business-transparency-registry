import { defineStore } from 'pinia'
import { StatusCodes } from 'http-status-codes'
import { Ref } from 'vue'
import { ErrorI } from '../../btr-common-components/interfaces/error-i'
import fileSIApi from '@/services/file-significant-individual'
import { SignificantIndividualFilingI } from '~/interfaces/significant-individual-filing-i'
import { SiSchemaType } from '~/utils/si-schema/definitions'
import { getEmptySiFiling } from '~/utils/si-schema/defaults'
import { dateToString } from '../../btr-common-components/utils/date'

/** Manages Significant */
export const useSignificantIndividuals = defineStore('significantIndividuals', () => {
  const currentSIFiling: Ref<SignificantIndividualFilingI> = ref(getEmptySiFiling()) // current significant individual change filing
  const currentSavedSIs: Ref<SiSchemaType[]> = ref([]) // saved SIs from api for this business
  const showErrors = ref(false) // show submit error validations
  const submitting = ref(false)
  const errors: Ref<ErrorI[]> = ref([])

  /** Add currentSI to the currentSIFiling. */
  function filingAddSI (significantIndividual: SiSchemaType) {
    currentSIFiling.value.noSignificantIndividualsExist = false
    // put it at the end of the new individuals
    currentSIFiling.value.significantIndividuals.push(significantIndividual)
  }

  const _getFolioNumber = (): string => {
    const business = useBcrosBusiness()
    if (business.currentFolioNumber) {
      return business.currentFolioNumber
    }
    return ''
  }

  /** Update the significant individual at the given index */
  function filingUpdateSI (index: number, significantIndividual: SiSchemaType) {
    if (!significantIndividual.ui.action) {
      significantIndividual.ui.action = FilingActionE.EDIT
    }
    currentSIFiling.value.significantIndividuals.splice(index, 1, significantIndividual)
  }

  /** Mark the significant individual at the given index as removed so it will not be displayed in the table */
  function filingRemoveSI (index: number) {
    currentSIFiling.value.significantIndividuals[index].ui.action = FilingActionE.REMOVE
  }

  /** Initialize a new significant individual filing */
  async function filingInit (businessIdentifier: string) {
    await loadSavedSIs(businessIdentifier)
    const folioNum = _getFolioNumber()
    currentSIFiling.value = {
      noSignificantIndividualsExist: false,
      businessIdentifier,
      significantIndividuals: currentSavedSIs.value,
      effectiveDate: dateToString(new Date(), 'YYYY-MM-DD'),
      certified: false,
      folioNumber: folioNum
    }
  }

  /** Save the current significant individual filing */
  async function filingSave () {
    console.info('Save', currentSIFiling.value)
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  /** Submit the current significant individual filing */
  async function filingSubmit () {
    submitting.value = true
    const { error } = await fileSIApi.submitSignificantIndividualFiling(currentSIFiling.value)
    if (error) {
      console.error(error)
      const err = {
        statusCode: error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR,
        message: error.message,
        category: ErrorCategoryE.SIGNIFICANT_INDIVIDUAL
      }
      errors.value.push(err)
    }
    submitting.value = false
  }

  /** Get the current significant individuals for the business */
  async function getSIs (businessIdentifier: string): Promise<SiSchemaType[] | null> {
    const { data, error } = await fileSIApi.getCurrentOwners(businessIdentifier)
    if (error) {
      if (error.statusCode !== StatusCodes.NOT_FOUND) {
        console.error(error)
        const err = {
          statusCode: error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR,
          message: error.message,
          category: ErrorCategoryE.SIGNIFICANT_INDIVIDUAL
        }
        errors.value.push(err)
      }
      return null
    }
    return data
  }

  /** Load the significant individuals for the business into the store */
  async function loadSavedSIs (businessIdentifier: string, force = false) {
    if (currentSavedSIs.value.length === 0 || force) {
      currentSavedSIs.value = await getSIs(businessIdentifier) || []
    }
  }

  function reset () {
    currentSIFiling.value = getEmptySiFiling()
    currentSavedSIs.value = []
    showErrors.value = false
    submitting.value = false
  }

  return {
    currentSIFiling,
    currentSavedSIs,
    showErrors,
    submitting,
    filingAddSI,
    filingUpdateSI,
    filingRemoveSI,
    filingInit,
    filingSave,
    filingSubmit,
    getSIs,
    loadSavedSIs,
    reset
  }
})
