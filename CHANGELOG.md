# Histórico de versões

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
