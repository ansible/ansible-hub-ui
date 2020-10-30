// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("findnear", {prevSubject: true}, (subject, selector) => {
    return subject.closest(`*:has(${selector})`).find(selector)
})

Cypress.Commands.add("containsnear", {}, (...args) => {
    if (args.length >= 2) {
        if (typeof(args[0]) == "string" && typeof(args[1]) == "string") {
            return cy.get(`*:has(${args[0]})`).contains(...args.slice(1))
        }
    }
    cy.log("constainsnear requires selector and content parameters")
})
