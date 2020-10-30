describe('Hub User Management Tests', () => {
    var host = Cypress.env("host")
    var username = Cypress.env("username")
    var password = Cypress.env("password")

    beforeEach(() => {
        cy.visit(host)

        cy.contains('.pf-c-form__group', 'Username').find('input').first().type(username)
        cy.contains('.pf-c-form__group', 'Password').find('input').first().type(`${password}{enter}`)

        cy.contains('#page-sidebar a', 'Users').click()
    })

    it('User table lists users', () => {
        cy.contains('[aria-label="User list"] [aria-labelledby=admin]', "admin")
    })

    describe("Creation and management of users", () => {
        beforeEach(() => {
            cy.contains('#page-sidebar a', 'Users').click()

            const user = {
                firstName: "Test F",
                lastName: "Test L",
                username: "test ",
                email: "test@example.com",
                password: "p@ssword1",
            }
            cy.contains('Create user').click()
            cy.contains('div', 'First name').findnear('input').first().type(user.firstName)
            cy.contains('div', 'Last name').findnear('input').first().type(user.lastName)
            cy.contains('div', 'Email').findnear('input').first().type(user.email)
            cy.contains('div', 'Username').findnear('input').first().type(user.username)
            cy.contains('div', 'Password').findnear('input').first().type(user.password)
            cy.contains('div', 'Password confirmation').findnear('input').first().type(user.password)

            cy.server()
            cy.route('POST', Cypress.env("prefix") + '_ui/v1/users/').as('createUser')
            cy.contains('Save').click()
            cy.wait('@createUser')

            cy.contains('[aria-labelledby=test]', "Test F")
        })

        afterEach(() => {
            cy.get('.pf-c-page__header-tools .pf-c-dropdown button').click()
            cy.contains('Logout').click()

            cy.contains('.pf-c-form__group', 'Username').find('input').first().type(username)
            cy.contains('.pf-c-form__group', 'Password').find('input').first().type(`${password}{enter}`)

            cy.contains('#page-sidebar a', 'Users').click()

            cy.get('[aria-labelledby=test] [aria-label=Actions]').click({"force": true})
            cy.containsnear('[aria-labelledby=test] [aria-label=Actions]', 'Delete').click({"force": true})
            cy.contains('[role=dialog] button', 'Delete').click({"force": true})
        })

        it('Can create new users', () => {
            cy.contains('[aria-labelledby=test]', "Test F")
            cy.contains('[aria-labelledby=test]', "Test L")
            cy.contains('[aria-labelledby=test]', "test@example.com")

            cy.contains('.body', "Test F").not()
        })
    })
})
