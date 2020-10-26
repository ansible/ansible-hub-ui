var admin_menu = [
    'Collections',
    'Namespaces',
    'My Namespaces',
    'API Token',
    'Users',
    'Certification',
]

describe('Hub User Management Tests', () => {
    var host = Cypress.env("host")
    var username = Cypress.env("username")
    var password = Cypress.env("password")

    beforeEach(() => {
        cy.visit(host)

        // let e = cy.contains('div', 'Username').first()
        // cy.log(1)
        // Array.prototype.forEach.call(e, () => cy.log(`${p} = ${e}`))
        // cy.log(2)

        cy.contains('.pf-c-form__group', 'Username').find('input').first().type(username)
        cy.contains('.pf-c-form__group', 'Password').find('input').first().type(`${password}{enter}`)

        cy.contains('#page-sidebar a', 'Users').click()
    })

    it('User table lists users', () => {
        cy.contains('.body', "autohubtest1")
        cy.contains('.body', "autohubtest2")
        cy.contains('.body', "admin")
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
            cy.route('POST', '/api/galaxy/v3/_ui/users/').as('post')
            cy.contains('Save').click()

            cy.contains('[aria-labelledby=test]', "Test F")
        })

        afterEach(() => {
            cy.get('.pf-c-page__header-tools .pf-c-dropdown button').then(dd => {
                dd.click()
                cy.contains('Logout').click()
            })

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

        it('Can edit users', () => {
            var username = "test"

            cy.contains('.pf-c-page__header-tools .pf-c-dropdown', 'admin').click()
            cy.contains('Logout').click()

            cy.visit('https://192.168.1.200')

            cy.contains('.pf-c-form__group', 'Username').find('input').first().type(username)
            cy.contains('.pf-c-form__group', 'Password').find('input').first().type(`${password}{enter}`)

            // Test user does not have permission to manage users
            cy.contains('#page-sidebar a', 'Users').should('not.exist')
        })
    })
})