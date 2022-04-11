// 5. Aplicar testing E2E, con Cypress una vez que se haya finalizado la construcción de la
// aplicación, el mismo debe contener al menos 3 pruebas. (2 Puntos)
// a. Smoke test.
// b. Test a 1 input.
// c. Test a 1 botón.

describe("Prueba2 System", () => {
    it("frontepage can be opened", () => {
        cy.visit("http://localhost:3000/Login");
        cy.contains("Iniciar Sesión");
    });

    it("Click test Boton Ingreso", () => {
        cy.visit("http://localhost:3000/Login");
        cy.contains("Ingresar").click()
    })

    it("Click test Input Email", () => {
        cy.visit("http://localhost:3000/Login");
        cy.get("input:first").type("skater@gmail.com")
    });

    it("Click test Input Password", () => {
        cy.visit("http://localhost:3000/Login");
        cy.get('input[name="password"]').type("pass123")
    });

    it("Click test Boton Registro", () => {
        cy.visit("http://localhost:3000/Login");
        cy.contains("Regístrate").click()
    })
});