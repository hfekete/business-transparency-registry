describe('pages -> Control Table', () => {
  beforeEach(() => {
    cy.visitHomePageWithFakeData()
  })

  it('The control table is hidden if no significant individual has claimed a shared control or interest', () => {
    cy.get('[data-cy=individualsControlTable]').should('not.exist')
  })

  // test a 'happy-path' scenario:
  // 1) the first SI has shares in concert with the second SI
  // 2) the first SI has shares held jointly with the third SI
  it('The control table is working as expected', () => {
    cy.fixture('plotsEntityExistingSiResponse').then((plotsEntityExistingSiResponse) => {
      const name1 = plotsEntityExistingSiResponse.payload.personStatements[0].names[0].fullName.toUpperCase()
      const name2 = plotsEntityExistingSiResponse.payload.personStatements[1].names[0].fullName.toUpperCase()
      const name3 = plotsEntityExistingSiResponse.payload.personStatements[2].names[0].fullName.toUpperCase()
      const numOfSI = plotsEntityExistingSiResponse.payload.personStatements.length

      // update the first SI to add control of shares held in concert and jointly
      cy.get('[data-cy=edit-button]').eq(0).click()
      cy.get('[data-cy="controlOfShares.jointlyOrInConcert.hasJointlyOrInConcert"]').check()
      cy.get('[data-cy="controlOfShares.jointlyOrInConcert.actingJointly"]').check()
      cy.get('[data-cy="controlOfShares.jointlyOrInConcert.inConcertControl"]').check()
      cy.get('[data-cy=new-si-done-btn]').click()

      // update the second SI to add control of shares in concert
      cy.get('[data-cy=edit-button]').eq(1).click()
      cy.get('[data-cy="controlOfShares.jointlyOrInConcert.hasJointlyOrInConcert"]').check()
      cy.get('[data-cy="controlOfShares.jointlyOrInConcert.inConcertControl"]').check()
      cy.get('[data-cy=new-si-done-btn]').click()

      // update the third SI to add control of shares held jointly
      cy.get('[data-cy=edit-button]').eq(2).click()
      cy.get('[data-cy="controlOfShares.jointlyOrInConcert.hasJointlyOrInConcert"]').check()
      cy.get('[data-cy="controlOfShares.jointlyOrInConcert.actingJointly"]').check()
      cy.get('[data-cy=new-si-done-btn]').click()

      // the table should display the information of all three people
      cy.get('[data-cy=individualsControlTable]')
        .should('exist')
        .and('contain', 'Name')
        .and('contain', 'Control Type')
        .and('contain', 'Individual Connection')
      cy.get('[data-cy="control-table-name"]')
        .should('have.length', 3)
        .and('contain', name1)
        .and('contain', name2)
        .and('contain', name3)
      cy.get('[data-cy="control-table-individual-connection"]').should('have.length', 3)
      cy.get('[data-cy="individualConnection0.shares.jointly.select"').should('exist')
      cy.get('[data-cy="individualConnection0.shares.inConcert.select"').should('exist')
      cy.get('[data-cy="individualConnection1.shares.jointly.select"').should('not.exist')
      cy.get('[data-cy="individualConnection1.shares.inConcert.select"').should('exist')
      cy.get('[data-cy="individualConnection2.shares.jointly.select"').should('exist')
      cy.get('[data-cy="individualConnection2.shares.inConcert.select"').should('not.exist')

      // For each combobox dropdown:
      // 1) verify that the dropdown menus of an SI should include all individuals except for the SI
      // 2) make a selection based on the scenario

      cy.get('[data-cy="individualConnection0.shares.jointlyComboboxButton"]').click({ force: true })
      cy.get('[id^="headlessui-combobox-options"]').find('li').should('have.length', numOfSI - 1)
        .and('not.contain', name1)
      cy.get('[id^="headlessui-combobox-options"]').find('li').eq(1).click({ force: true })

      cy.get('[data-cy="individualConnection0.shares.inConcertComboboxButton"]').click({ force: true })
      cy.get('[id^="headlessui-combobox-options"]').find('li').should('have.length', numOfSI - 1)
        .and('not.contain', name1)
      cy.get('[id^="headlessui-combobox-options"]').find('li').eq(0).click({ force: true })

      cy.get('[data-cy="individualConnection1.shares.inConcertComboboxButton"]').click({ force: true })
      cy.get('[id^="headlessui-combobox-options"]').find('li').should('have.length', numOfSI - 1)
        .and('not.contain', name2)
      cy.get('[id^="headlessui-combobox-options"]').find('li').eq(0).click({ force: true })

      cy.get('[data-cy="individualConnection2.shares.jointlyComboboxButton"]').click({ force: true })
      cy.get('[id^="headlessui-combobox-options"]').find('li').should('have.length', numOfSI - 1)
        .and('not.contain', name3)
      cy.get('[id^="headlessui-combobox-options"]').find('li').eq(0).click({ force: true })

      // Verify that individuals are selected correctly
      cy.get('[data-cy="individualConnection0.shares.jointlyComboboxChip"]').should('have.text', name3)
      cy.get('[data-cy="individualConnection0.shares.inConcertComboboxChip"]').should('have.text', name2)
      cy.get('[data-cy="individualConnection1.shares.inConcertComboboxChip"]').should('have.text', name1)
      cy.get('[data-cy="individualConnection2.shares.jointlyComboboxChip"]').should('have.text', name1)
    })
  })

  it('A warning message is displayed when only one siginiciant individual has shared control', () => {
    // update the first SI to add control of votes in concert
    cy.get('[data-cy=edit-button]').eq(0).click()
    cy.get('[data-cy="controlOfVotes.jointlyOrInConcert.hasJointlyOrInConcert"]').check()
    cy.get('[data-cy="controlOfVotes.jointlyOrInConcert.inConcertControl"]').check()
    cy.get('[data-cy=new-si-done-btn]').click()

    // the warning message should be rendered
    cy.get('[data-cy="alertsMessage:alert"]').should('exist')

    // add another SI to the table
    cy.get('[data-cy=edit-button]').eq(1).click()
    cy.get('[data-cy="controlOfVotes.jointlyOrInConcert.hasJointlyOrInConcert"]').check()
    cy.get('[data-cy="controlOfVotes.jointlyOrInConcert.inConcertControl"]').check()
    cy.get('[data-cy=new-si-done-btn]').click()

    // the warning message is hidden
    cy.get('[data-cy="alertsMessage:alert"]').should('not.exist')
  })
})
