describe('Hub Group Management Tests', () => {
    var host = Cypress.env("host");
    var adminUsername = Cypress.env("username");
    var adminPassword = Cypress.env("password");

    beforeEach(() => {
        cy.visit(host);
    });

    it.skip('admin user can create and delete a group', () => {
        var name = 'testGroup';
        cy.login(adminUsername, adminPassword);
        cy.createGroup(name);
        cy.contains(name).should('exist');
        cy.addAllPermissions(name);
        cy.deleteGroup(name);
        cy.contains(name).should('not.exist');
    });

    it('admin user can add a user toa  group', () => {
        var groupName = 'testGroup';
        var userName = 'testUser';
        cy.login(adminUsername, adminPassword);
        cy.createGroup(groupName);
        cy.createUser(userName);
        cy.addUserToGroup(groupName, userName);
        cy.removeUserFromGroup(groupName, userName);
        cy.deleteGroup(groupName);
        cy.deleteUser(userName);
    });

    it.skip('admin user can edit a group', () => {
        var name = 'testGroup';
        cy.login(adminUsername, adminPassword);
        cy.createGroup(name);
        cy.contains(name).should('exist');
        cy.addAllPermissions(name);
        cy.removePermissions(name, [{
            group: 'namespaces', permissions: ['Add namespace', 'Change namespace', 'Upload to namespace']
        }, {
            group: 'collections', permissions: ['Modify Ansible repo content']
        },{
            group: 'users', permissions: ['View user', 'Delete user', 'Add user', 'Change user']
        },{
            group: 'groups', permissions: ['View group', 'Delete group', 'Add group', 'Change group']
        },{
            group: 'remotes', permissions: ['Change collection remote', 'View collection remote']
        }]);
        [ 'namespaces', 'collections', 'users', 'groups', 'remotes' ].forEach(permGroup => cy.get(`.pf-l-flex.pf-m-align-items-center.${permGroup}  [placeholder="No permission"]`).should('exist'));;
        cy.deleteGroup(name);
        cy.contains(name).should('not.exist');
    });

});
