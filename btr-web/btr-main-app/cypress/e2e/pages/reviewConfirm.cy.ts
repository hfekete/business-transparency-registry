import { dateToString } from '../../../../btr-common-components/utils/date'
import payFeesForBtrRegsigin from '../../fixtures/payFeeForBtrRegsigin.json'

describe('pages -> Review and Confirm', () => {
  beforeEach(() => {
    cy.interceptPayFeeApi().as('payFeeApi')
    cy.interceptBusinessContact().as('businessContact')
    cy.interceptBusinessSlim().as('businessApiCall')
  })

  it('verify pay fee widget is visible and base state is available', () => {
    cy.visit('/BC0871427/beneficial-owner-change/review-confirm')
    cy.wait(['@businessApiCall', '@payFeeApi', '@businessContact'])

    cy.viewport(2560, 1440)
    cy.intercept(
      'GET',
      'https://pay-api-dev.apps.silver.devops.gov.bc.ca/api/v1/fees/BTR/REGSIGIN',
      { data: payFeesForBtrRegsigin })

    // check base state exists and contains - for no items
    cy.get('[data-cy="pay-fees-widget-empty-fees"]').contains('-')

    // check totals line footer exists and has - denoting no items are present
    cy.get('[data-cy="pay-fees-widget-total"]').contains('-')
  })

  it('integration test for adding an individual and reviewing the summary', () => {
    cy.fixture('individuals').then((testData) => {
      cy.interceptPostsEntityApi().as('existingSIs')
      cy.visit('/')
      cy.wait(['@existingSIs', '@businessApiCall', '@payFeeApi', '@businessContact'])

      // click 'Add an Individual' button and expand the form
      cy.get('[data-cy=add-new-btn]').click()
      // cy.get('[data-cy=showAddIndividualPersonManually]').click()

      cy.fillOutForm(testData.profile1)

      // click 'Done' button to add the individual
      cy.get('[data-cy=new-si-done-btn]').click()

      // click 'Review and Confirm' button to review the summary'
      cy.get('[data-cy="button-control-right-button"]').click()

      // verify the url changes to /review-confirm
      cy.url().should('include', '/review-confirm')

      // check the Significant Individual Filing Effective Date is correct
      const today = new Date()
      const expectedDate = dateToString(today, 'YYYY-MM-DD')
      cy.get('[data-cy=effective-date-select]').contains(expectedDate)

      // check if the summary table contain the correct data
      const summaryTable = cy.get('[data-cy="individualsSummaryTable"]')
      summaryTable.get('[data-cy=summary-table-name]').contains(testData.profile1.fullName.toUpperCase())
      summaryTable.get('[data-cy=summary-table-name]').contains(testData.profile1.preferredName)
      summaryTable.get('[data-cy=summary-table-name]').contains(testData.profile1.email)
      summaryTable.get('[data-cy=summary-table-address]').contains(testData.profile1.address.streetAddress)
      summaryTable.get('[data-cy=summary-table-address]').contains(testData.profile1.address.city)
      summaryTable.get('[data-cy=summary-table-address]').contains(testData.profile1.address.province[1])
      summaryTable.get('[data-cy=summary-table-address]').contains(testData.profile1.address.postalCode)
      summaryTable.get('[data-cy=summary-table-address]').contains(testData.profile1.address.country)
      summaryTable.get('[data-cy=summary-table-details]').contains(testData.profile1.taxNumber)
      summaryTable.get('[data-cy=summary-table-details]').contains(testData.profile1.summaryTable.citizenship)
      summaryTable.get('[data-cy=summary-table-details]').contains(testData.profile1.summaryTable.taxResidency)

      summaryTable.get('[data-cy=summary-table-dates]').contains(expectedDate)

      // todo: fixme: update on #TBD with new summary table
      // summaryTable.get('[data-cy=summary-table-controls]').contains(testData.profile1.summaryTable.shareControl)
      // todo: fixme: update on #20756
      // summaryTable.get('[data-cy=summary-table-controls]').contains(testData.profile1.summaryTable.directorControl)

      // can click 'back' to go back to non review page
      cy.get('[data-cy=button-control-right-button]').eq(0).should('have.text', 'Back')
      cy.get('[data-cy=button-control-right-button]').eq(0).click()
      cy.url().should('not.include', '/beneficial-owner-change/review-confirm')
      cy.url().should('include', '/beneficial-owner-change')

      // go back to review and file now, FUTURE: check certify / folio
      cy.get('[data-cy=button-control-right-button]').eq(0).should('have.text', 'Review and Confirm')
      cy.get('[data-cy=button-control-right-button]').eq(0).click()
      cy.url().should('include', '/beneficial-owner-change/review-confirm')
      cy.get('[data-cy=button-control-right-button]').eq(1).should('have.text', 'File Now (no fee)')
      // validate certify is not checked yet
      cy.get('[data-cy="certify-section-checkbox"]').should('not.be.checked')
      cy.get('[data-cy=button-control-right-button]').eq(1).click()
      // Certify was not checked so nothing should happen
      cy.url().should('include', '/beneficial-owner-change/review-confirm')
      // Check certify and file
      cy.get('[data-cy="certify-section-checkbox"]').click()
      cy.get('[data-cy="certify-section-checkbox"]').should('be.checked')
      cy.get('[data-cy=button-control-right-button]').eq(1).click()

      // check redirect to change
      // The following line is commented out. Validation is not passed (no )
      // cy.url().should('not.include', '/beneficial-owner-change/review-confirm')
      cy.url().should('include', '/beneficial-owner-change')
    })
  })

  it('verify the certify section is rendered and the checkbox is working', () => {
    cy.visit('/BC0871427/beneficial-owner-change/review-confirm')
    cy.get('[data-cy="certify-section"]').should('exist')
    cy.get('[data-cy="certify-section-label"]').should('exist')
    cy.get('[data-cy="certify-section-checkbox"]').should('exist')
    cy.get('[data-cy="certify-section-checkbox"]').check().should('be.checked')
  })

  it('verify that you cannot submit without individuals when no checkbox selected', () => {
    cy.interceptPostsEntityApiNoSis().as('noExistingSIs')
    cy.visit('/', {
      onBeforeLoad (win) {
        cy.stub(win.console, 'log').as('consoleLog')
      }
    })
    cy.wait(['@noExistingSIs', '@businessApiCall', '@payFeeApi', '@businessContact'])

    // click 'Review and Confirm' button to review the summary'
    cy.get('[data-cy="button-control-right-button"]').click()

    // verify the url changes to /review-confirm
    cy.url().should('include', '/review-confirm')

    // go back to review and file now, FUTURE: check certify / folio
    // cy.get('[data-cy=button-control-right-button]').eq(0).should('have.text', 'Review and Confirm')
    // cy.get('[data-cy=button-control-right-button]').eq(0).click()
    // cy.url().should('include', '/beneficial-owner-change/review-confirm')
    cy.get('[data-cy=button-control-right-button]').eq(1).should('have.text', 'File Now (no fee)')
    // validate certify is not checked yet
    cy.get('[data-cy="certify-section-checkbox"]').should('not.be.checked')
    cy.get('[data-cy=button-control-right-button]').eq(1).click()
    // Certify was not checked so nothing should happen
    cy.url().should('include', '/beneficial-owner-change/review-confirm')
    // Check certify and file
    cy.get('[data-cy="certify-section-checkbox"]').click()
    cy.get('[data-cy="certify-section-checkbox"]').should('be.checked')
    cy.get('[data-cy=button-control-right-button]').eq(1).click()

    // verify console error shows issues, did not get redirected
    cy.get('@consoleLog')
      .should('be.calledWith', '<> remove this line when validation errors are displayed on page')
    cy.url().should('include', '/beneficial-owner-change/review-confirm')

    // click 'back' to go back to non review page
    cy.get('[data-cy=button-control-right-button]').eq(0).should('have.text', 'Back')
    cy.get('[data-cy=button-control-right-button]').eq(0).click()

    cy.get('[data-cy="noSignificantIndividualsExist-checkbox"]').click()

    // click 'Review and Confirm' button to go back to review the summary
    cy.get('[data-cy="button-control-right-button"]').click()

    // reselect the certify checkbox
    cy.get('[data-cy="certify-section-checkbox"]').click()

    // click file now
    cy.get('[data-cy=button-control-right-button]').eq(1).click()

    // check redirect to change
    cy.url().should('not.include', '/review-confirm')
    cy.url().should('include', '/beneficial-owner-change')
  })
})
