import { expect, describe, it } from 'vitest'
import { VueWrapper, flushPromises } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { mockedI18n } from '../../utils/mockedi18n'
import { testSI } from '../../utils/mockedData'
import { IndividualPersonSummaryTable } from '#components'

describe('AddIndividualPersonSummaryTable tests', () => {
  let wrapper: VueWrapper<any>
  const si = { ...testSI }

  beforeEach(async () => {
    wrapper = await mountSuspended(IndividualPersonSummaryTable, {
      props: { individuals: [], edit: true },
      global: { plugins: [mockedI18n] }
    })
    await flushPromises()
  })
  afterEach(() => {
    wrapper.unmount()
  })

  it('renders SummaryTable with no data provided', () => {
    const summaryTable = wrapper.find('[data-cy=individualsSummaryTable]')
    expect(summaryTable.exists()).toBe(true)
    expect(summaryTable.findAll('th').length).toBe(5)
    expect(summaryTable.findAll('th').at(0)?.text()).toBe('Name')
    expect(summaryTable.findAll('th').at(1)?.text()).toBe('Address')
    expect(summaryTable.findAll('th').at(2)?.text()).toBe('Details')
    expect(summaryTable.findAll('th').at(3)?.text()).toBe('Significance Dates')
    expect(summaryTable.findAll('th').at(4)?.text()).toBe('Control')
    expect(summaryTable.findAll('td').length).toBe(1)
    expect(summaryTable.find('td').text()).toBe('You have no Significant individuals listed')
    expect(wrapper.find('[data-cy=summary-table-name]').exists()).toBe(false)
    expect(wrapper.find('[data-cy=summary-table-address]').exists()).toBe(false)
    expect(wrapper.find('[data-cy=summary-table-details]').exists()).toBe(false)
    expect(wrapper.find('[data-cy=summary-table-dates]').exists()).toBe(false)
    // todo: fixme: update on #TBD with new summary table
    // expect(wrapper.find('[data-cy=summary-table-controls]').exists()).toBe(false)
    expect(wrapper.find('[data-cy=summary-table-buttons]').exists()).toBe(false)
  })
  it('updates SummaryTable with data dynamically', async () => {
    await wrapper.setProps({ individuals: [si] })
    expect(wrapper.find('[data-cy=individualsSummaryTable] tbody tr').findAll('td').length).toBe(6)
    expect(wrapper.find('[data-cy=summary-table-name]').exists()).toBe(true)
    expect(wrapper.find('[data-cy=summary-table-address]').exists()).toBe(true)
    expect(wrapper.find('[data-cy=summary-table-details]').exists()).toBe(true)
    expect(wrapper.find('[data-cy=summary-table-dates]').exists()).toBe(true)
    // todo: fixme: update on #TBD with new summary table
    // expect(wrapper.find('[data-cy=summary-table-controls]').exists()).toBe(true)
    expect(wrapper.find('[data-cy=summary-table-buttons]').exists()).toBe(true)
  })
  it('displays the Name column as expected', async () => {
    si.name.fullName = 'full name'
    si.name.preferredName = 'preferred name'
    si.email = 'test@email.com'
    await wrapper.setProps({ individuals: [si] })
    expect(wrapper.find('[data-cy=summary-table-name]').text()).toContain(si.name.fullName.toUpperCase())
    expect(wrapper.find('[data-cy=summary-table-name]').text()).toContain(si.name.preferredName)
    expect(wrapper.find('[data-cy=summary-table-name]').text()).toContain(si.email)
  })
  it('displays the Address column as expected', async () => {
    await wrapper.setProps({ individuals: [si] })
    expect(wrapper.find('[data-cy=summary-table-address]').text()).toContain(si.address.line1)
    expect(wrapper.find('[data-cy=summary-table-address]').text()).toContain(si.address.city)
    expect(wrapper.find('[data-cy=summary-table-address]').text()).toContain(si.address.region)
    expect(wrapper.find('[data-cy=summary-table-address]').text()).toContain(si.address.postalCode)
    expect(wrapper.find('[data-cy=summary-table-address]').text()).toContain(si.address.country.name)
  })
  it('displays the Details column as expected', async () => {
    await wrapper.setProps({ individuals: [si] })
    const details = wrapper.find('[data-cy=summary-table-details]')
    expect(details.text()).toContain(si.birthDate)
    expect(details.text()).toContain(si.tax.taxNumber)
    expect(details.text()).toContain('Citizenship(s):Canada')
    expect(details.text()).toContain('Tax Resident of Canada')
  })
  // todo: fixme: update on #TBD with new summary table && 20756
  it.skip('displays the Controls column as expected', async () => {
    // only shares
    si.controlOfVotes.registeredOwner = true
    si.controlOfVotes.beneficialOwner = true
    si.controlOfVotes.indirectControl = true
    si.controlOfVotes.inConcertControl = true
    si.controlOfVotes.percentage = PercentageRangeE.AT_LEAST_25_TO_50
    si.controlOfShares.registeredOwner = true
    si.controlOfShares.beneficialOwner = true
    si.controlOfShares.indirectControl = true
    si.controlOfShares.inConcertControl = true
    si.controlOfShares.percentage = PercentageRangeE.MORE_THAN_50_TO_75
    si.controlOfDirectors.directControl = false
    si.controlOfDirectors.indirectControl = false
    si.controlOfDirectors.significantInfluence = false
    si.controlOfDirectors.inConcertControl = false
    si.controlOther = ''
    await wrapper.setProps({ individuals: [si] })
    // todo: fixme: update on #TBD with new summary table
    // let controls = wrapper.find('[data-cy=summary-table-controls]')
    // expect(controls.text()).toContain('Shares')
    // expect(controls.text()).toContain('Registered owner, Beneficial owner, and Indirect control')
    // expect(controls.text()).toContain('At least 25% and up to 50% of shares')
    // expect(controls.text()).toContain('More than 50% and up to 75% of votes')
    // expect(controls.text()).toContain('25% or more of shares or votes exercised in concert')
    // expect(controls.text()).not.toContain('Directors')
    // expect(controls.text()).not.toContain('Other')
    // Only directors
    // todo: fixme: update on #20756
    // si.controlType.sharesVotes.registeredOwner = false
    // si.controlType.sharesVotes.beneficialOwner = false
    // si.controlType.sharesVotes.indirectControl = false
    // si.controlType.sharesVotes.inConcertControl = false
    // si.controlType.directors.directControl = true
    // si.controlType.directors.indirectControl = true
    // si.controlType.directors.significantInfluence = true
    // si.controlType.directors.inConcertControl = true
    // si.controlType.other = ''
    await wrapper.setProps({ individuals: [si] })
    controls = wrapper.find('[data-cy=summary-table-controls]')
    expect(controls.text()).toContain('Directors')
    expect(controls.text())
      .toContain('Direct control, Indirect control, and Significant influence control of the majority of directors')
    expect(controls.text()).toContain('Control of directors exercised in concert')
    expect(controls.text()).not.toContain('Shares')
    expect(controls.text()).not.toContain('Other')
    // Only other control
    si.controlType.sharesVotes.registeredOwner = false
    si.controlType.sharesVotes.beneficialOwner = false
    si.controlType.sharesVotes.indirectControl = false
    si.controlType.sharesVotes.inConcertControl = false
    si.controlType.directors.directControl = false
    si.controlType.directors.indirectControl = false
    si.controlType.directors.significantInfluence = false
    si.controlType.directors.inConcertControl = false
    si.controlType.other = 'My lawyer said so'
    await wrapper.setProps({ individuals: [si] })
    controls = wrapper.find('[data-cy=summary-table-controls]')
    expect(controls.text()).toContain('Other')
    expect(controls.text()).toContain(si.controlType.other)
    expect(controls.text()).not.toContain('Shares')
    expect(controls.text()).not.toContain('Directors')
    // all at once
    si.controlType.sharesVotes.registeredOwner = true
    si.controlType.sharesVotes.beneficialOwner = false
    si.controlType.sharesVotes.indirectControl = true
    si.controlType.sharesVotes.inConcertControl = true
    si.controlType.directors.directControl = true
    si.controlType.directors.indirectControl = true
    si.controlType.directors.significantInfluence = false
    si.controlType.directors.inConcertControl = false
    si.controlType.other = 'My lawyer said so'
    await wrapper.setProps({ individuals: [si] })
    controls = wrapper.find('[data-cy=summary-table-controls]')
    expect(controls.text()).toContain('Shares')
    expect(controls.text()).toContain('Shares')
    expect(controls.text()).toContain('Registered owner and Indirect control')
    expect(controls.text()).toContain('25% or more of shares or votes exercised in concert')
    expect(controls.text()).toContain('Directors')
    expect(controls.text())
      .toContain('Direct control and Indirect control of the majority of directors')
    expect(controls.text()).not.toContain('Control of directors exercised in concert')
    expect(controls.text()).toContain('Other')
    expect(controls.text()).toContain(si.controlType.other)
  })
})
