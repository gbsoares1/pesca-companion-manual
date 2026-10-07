# Histórico de versões

## 2.8.61

- Mostra o aviso de peixe em destaque e o bônus em twishcoins quando presentes na resposta da captura.

## 2.8.60

- Resultado da pesca permanece visível até a próxima tentativa, sem desaparecer após 12 segundos.
- Leitura contínua ignora respostas anteriores ao comando atual para não associar falha antiga à nova captura.
- Testes com aracu em destaque e bônus, outra conta, falha antiga e exibição após 30 segundos.


## 2.8.59

- Leitura direta do chat próprio durante a espera da pesca e do Hoje, além do observador de mensagens.
- Consulta de resposta a cada 250 ms por até 15 segundos, cancelada ao receber o resultado; não reenvia comandos.
- Captura recebida pela leitura direta também atualiza o estado compartilhado do painel.
- Testes da pesca e do Hoje a partir da janela independente e leitura sem callback do observador.


## 2.8.58

- Janela independente para mover o painel entre monitores, pelo botão ↗ ou pelo ícone da extensão.
- Reutiliza as mesmas telas, dados, ações e abas exclusivas do produto.
- Abrir novamente foca a janela existente; fechar restaura o painel da Twitch sem desligar o monitor.
- Testes de abertura simultânea, reabertura, fechamento e ações a partir da página da extensão.


## 2.8.57

- Verifica a versão carregada pelo script do chat próprio e a presença do leitor contínuo.
- Recarrega somente o chat exclusivo se o script estiver antigo, ausente ou invalidado após atualizar a extensão.
- O envio aguarda o leitor da versão atual estar pronto.
- Teste de atualização de 2.8.56 para 2.8.57 sem recargas repetidas.


## 2.8.56

- Bloco Hoje inclui Taxa de sucesso, calculada como peixes / lançadas, com uma casa decimal.
- Recalcula junto com os totais recebidos do chat; sem lançadas ou sem dados, apresenta um traço.


## 2.8.55

- Resumo Hoje atualizado pela leitura contínua do chat exclusivo, inclusive para respostas tardias.
- A resposta do resumo resolve a espera do botão sem aguardar a fila de comandos.
- Aviso antigo de resumo não encontrado removido quando chegam os novos totais.
- Testes com 26 lançadas, 19 peixes e 7 sem captura; rejeita resumo de outra aba.


## 2.8.54

- Sem captura reconhecida, mostra sempre Não foi desta vez pescador, inclusive ao encerrar a espera sem resposta.
- Remove o aviso de resultado não confirmado do bloco da pesca.
- Mantém captura reconhecida e mensagem exibida por 12 segundos.


## 2.8.53

- Remove a lista de frases específicas de pesca sem captura.
- Resposta completa à pesca sem peixe apresenta Não foi desta vez pescador; captura parcial aguarda o texto completo.
- Respostas concluídas são tratadas na mutação do chat próprio, sem timer em segundo plano.
- Testes com a resposta da alga, frase inédita, nome destacado, captura parcial e sucesso.


## 2.8.52

- Reconhece imediatamente a resposta sentiu ... antes da fisgada como pesca sem captura.
- Testa o texto reportado com menção destacada e corpo renderizado em partes, sem depender de temporizador na aba inativa.


## 2.8.51

- Desativação fecha ambas as abas próprias mesmo com registro de leitura ausente ou navegação alterada.
- Ativação posterior cria novas abas exclusivas.
- Preserva a identificação das abas próprias após reiniciar o navegador.
- Teste do ciclo ativar, desativar e reativar preservando abas pessoais.


## 2.8.50

- Leitura contínua das respostas após $pescar da conta configurada, exclusivamente no chat próprio do produto.
- Nome destacado e corpo separados reconhecidos; captura mostra o peixe e demais resultados mostram Não foi desta vez pescador.
- Respostas não aguardam a fila de comandos e leituras antigas não substituem o cooldown atual.
- Fim da Maré Turbo consulta novamente o cooldown oficial; abas próprias mantêm o endereço configurado.
- Aviso da captura permanece por 12 segundos.


## 2.8.49

- Leitura da captura liberada no clique oficial de envio, sem depender do eco de $pescar no chat.
- Teste com a resposta de acará sem exibição do comando enviado.

## 2.8.48

- Início de Maré Turbo com anúncio de reset recarrega a aba própria do inventário uma vez por evento para obter o cooldown oficial.
- Registro persistido evita recargas repetidas durante o mesmo evento.
- Testes para evento de reset, leitura seguinte, nova ocorrência e eventos sem reset.

## 2.8.47

- Observa também alterações nos atributos de autor e corpo da mensagem no chat.
- Teste com autor carregado depois do texto e captura de acará no formato observado na Twitch.
- Cabeçalho mostra Aguardando resposta durante o envio, em vez de Disponível.

## 2.8.46

- Resumo Hoje lê também mensagens sem o seletor antigo de corpo do chat e normaliza espaços invisíveis.
- Resposta do Hoje é entregue diretamente pela observação do chat, sem consultas periódicas.
- Comando de pesca renderizado em partes não é descartado antes de ficar completo.
- Testes de resumo parcial, novos totais, timeout e comando parcial de pesca.

## 2.8.45

- Status lista todas as expedições liberadas para a vara equipada, com maré e orientação por destino.
- Troca de vara inicia nova consulta sem aguardar o intervalo da consulta anterior.
- Respostas de uma consulta iniciada com outra vara são descartadas pelo painel.

## 2.8.44

- Tutorial de instalação com voz em português, legendas e capturas reais do GitHub, Chrome e painel, acessível pelo README e guia de instalação.

- Leitura de captura aguarda mensagem completa, reconhece mandi/lula e ignora resumo do dia ou respostas anteriores ao comando atual.
- Falta de confirmação deixa de ser exibida como pesca sem captura.
- Monitor preserva conta e barco enquanto ligado; troca de contexto requer pausa.
- Contador ausente em sessão identificada não é tratado automaticamente como falta de login.
- Novos testes de mensagens parciais, resposta imediata, ausência de confirmação e isolamento de abas.

## 2.8.43

- Créditos do produto e da documentação para @MadtraxBR, com link da Twitch.
- Guia de publicação no Git removido.
- Exemplos de Status e Inventário com imagens baseadas em capturas anonimizadas.

- Removidos blocos comentados de Mercado, atalhos antigos e ações de equipamento, além dos estilos exclusivos desses blocos.
- Mantidos comentários que explicam código em uso.
- Documentação atualizada e exemplo de inventário baseado em captura fornecida pelo usuário, sem identificação pessoal.

## 2.8.42

- Catálogo de metas reconhece artigos de pesca e cartões de cosméticos.
- Preços promocionais são separados da etiqueta percentual.
- Um item com moedas alternativas pode oferecer mais de uma meta.
- Catálogo antigo é invalidado pela versão do leitor.
- Documentação de instalação, telas, metas, problemas e arquitetura, com ilustrações de dados fictícios e verificador local.

## 2.8.41

- Leitores de perfil, loja e cais reconstruídos a partir da base funcional, preservando a interface modular e a identificação dinâmica da conta.
- Identificação usa o documento da página por padrão, corrigindo falha compartilhada em consultas.
- Proprietário do inventário é conservado separadamente da conta conectada.

## 2.8.40

- Status consulta a maré da vara equipada.
- Destinos sem maré são apresentados sem falha de recomendação.
- Meta salva é sincronizada entre abas; seleção provisória permanece no editor até salvar.
- Loja renova cache por dia e situação do desconto.
- Status recupera saldos da loja, incluindo escamas.

## 2.8.39 — edição manual

- Cópia separada para pesca por clique, sem envio de pesca por temporizador.
- Mantidos acompanhamento de cooldown, inventário, equipamentos, marés, metas e interface móvel.

A série manual é mantida separada da edição original. Este histórico resume as alterações registradas na preparação desta versão.

## Créditos

Criação, desenvolvimento e documentação: **[@MadtraxBR](https://www.twitch.tv/madtraxbr)**.
