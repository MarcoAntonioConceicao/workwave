describe('Testes de Gerenciamento de Tarefas', () => {
    beforeEach(() => {
        // Adiciona o fluxo de login antes de cada teste
        cy.visit('http://localhost:3000');
        cy.contains('Iniciar Sessão').click();
        cy.get('input[type="email"]').type('conceicao.marco324@gmail.com');
        cy.get('input[type="password"]').type('91042Zed');
        cy.contains('Entrar').click();
        cy.contains('Bem-vindo').should('exist'); // Garante que o login foi bem-sucedido
    });

    it('Deve criar uma nova tarefa', () => {
        // Clica no botão correto de abrir o formulário de criar tarefa
        cy.get('button').contains('Criar Tarefas').should('be.visible').click();
        
        // Preenche os campos do formulário de criação de tarefa
        cy.get('input[placeholder="Título da Tarefa"]').should('be.visible').type('Teste Cypress');
        cy.get('textarea[placeholder="Descrição da Tarefa"]').should('be.visible').type('Descrição automatizada');
        
        // Clica no botão correto para submeter a tarefa
        cy.intercept('POST', '**/tarefas').as('createTask'); // Intercepta a requisição
        cy.get('form button').contains('Criar Tarefa').should('be.visible').and('not.be.disabled').click();
    

        // Verifica se a tarefa foi criada com sucesso
        cy.contains('Teste Cypress', { timeout: 20000 }).should('exist');
    });

    it('Deve adicionar um comentário a uma tarefa', () => {
        // Aguarda a tarefa estar visível e clica nela
        cy.contains('Teste Cypress', { timeout: 10000 }).should('be.visible').click();
        
        // Preenche o campo de comentário
        cy.get('textarea[placeholder="Adicionar um comentário..."]').should('be.visible').type('Comentário Cypress');
        
        // Garante que o botão de adicionar comentário está habilitado e clica nele
        cy.get('button').contains('Adicionar Comentário').should('be.visible').and('not.be.disabled').click();
        
        // Verifica se o comentário foi adicionado com sucesso
        cy.contains('Comentário Cypress', { timeout: 10000 }).should('exist');
    });
});
