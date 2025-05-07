# PROJETO DE SOFTWARE - Plataforma de Cursos

# BackLogs

## TAREFAS - MILESTONE I

- Requisitos (revisão e adição)
- Protótipo Figma (revisão e adição)
- Modelagem do Banco (revisão e alteração para não relacional)
- Documentação de cada rota (incluindo regras de negócio)

## TAREFAS - MILESTONE II

- Requisitos implementados na API (Explicar escolha e quantos ficarão para a Milestone III);
- Documentação das rotas implementadas (incluindo regras de negócio);
- Plano de Teste do projeto com cenários de teste implementados (explicar o fluxo principal ssociando a regra de negócio aos testes);
- Teste unitário das funcionalidades implementadas (explicação do teste do fluxo principal, demonstrar a cobertura de testes unitários);
- Fluxos de branches no git (mostrar gráfico de _commits_ e o painel de tarefa com uma tarefa);
- Apresentação prática do produto (Postman).

# REQUISITOS DO SOFTWARE

A especificação dos requisitos deste projeto segue as recomendações da norma IEEE Std-830-1998, considerando as boas práticas para definição de requisitos.  

## REQUISITOS FUNCIONAIS

A tabela a seguir contém a relação dos Requisitos Funcionais elicitados, com as colunas: identificador, nome e descrição:

| IDENTIFICADOR | NOME                    | DESCRIÇÃO                                                                                                                                          |  
|:-------------|:------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------|  
| **RF-001**   | Manter Cursos                  | Permite o administrador criar, atualizar e remover cursos, bem como incluir conteúdos extras para disponibilizar aos alunos. |
| **RF-002**   | Incorporar Vídeos              | Permite o administrador incorporar vídeos do Youtube. |
| **RF-003**   | Gerenciar Conteúdo Extra       | O administrador pode gerenciar os conteúdos extras dos cursos, como PDFs. |
| **RF-004**   | Manter Usuários                | Permite o administrador remover usuários e conceder permissão de administração. |
| **RF-005**   | Acompanhar Progresso           | O administrador pode acompanhar o progresso dos usuários em cada curso. |
| **RF-006**   | Acompanhar o Próprio Progresso | Os usuários podem acompanhar o próprio progresso em cada curso. |
| **RF-007**   | Obter Certificados             | Permite que os usuários tenham acesso ao certificado após a conclusão de cada curso. |


## REQUISITOS NÃO FUNCIONAIS
A tabela a seguir contém a relação com os Requisitos Não Funcionais identificados, contendo identificador, nome e descrição:

| IDENTIFICADOR | NOME                           | DESCRIÇÃO                                                                                                |  
|:-------------|:-------------------------------|:----------------------------------------------------------------------------------------------------------|  
| **RNF-001**  | Desempenho e Escalabilidade                      | O sistema deve suportar simultaneamente pelo menos 100 usuários ativos sem degradação perceptível de desempenho, garantindo um tempo de resposta de no máximo 1 segundo. |  
| **RNF-002**  | Usabilidade                     | A interface deve ser intuitiva e claras tanto para administradores quanto para usuários. |  
| **RNF-003**  |Acessibilidade Multiplataforma                   | O sistema será acessível via navegador, com design responsivo para dispositivos móveis, permitindo aos usuários acessarem os cursos de qualquer lugar. |
| **RNF-004**  | Formato Markdown                  | O sistema possuirá campos de textos em formato Markdown para que seja realizada a formatação da maneira que desejar nos campos de texto. |
| **RNF-005**  | Emissão de Certificados                 | O sistema deve emitir um certificado de conclusão após cada curso ser concluído por usuário. |

