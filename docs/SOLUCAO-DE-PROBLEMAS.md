# Resolver problemas

[Voltar ao início](../README.md)

Comece conferindo o cartão da extensão em `chrome://extensions`, a conta/barco no cabeçalho e o login nas duas abas de apoio. Recarregar a extensão exige também recarregar as páginas para substituir os leitores antigos.

| Sintoma | O que conferir e fazer |
| --- | --- |
| Painel não aparece | Confira se a extensão está ativada e se a página é `www.twitch.tv`. Recarregue a Twitch. O painel não aparece no site da Twish nem no chat popout de apoio |
| Dois painéis ou ações duplicadas | Deixe instalada/ativada apenas uma edição do Pesca Companion e recarregue as páginas |
| Conta pendente | Abra a Twish conectada em uma aba normal e ativa; visite o inventário da sua conta e volte à Twitch |
| Conta ou barco incorretos | Pause o monitor, abra o inventário do contexto correto em uma aba normal da Twish e ligue novamente. Confira o cabeçalho antes de agir |
| Conectando… ou contador sem atualização | Abra o inventário fixo e confira login, carregamento, contador e eventual verificação. Espere a nova leitura. Se necessário, pause e ligue o monitor |
| Pescar desabilitado | Aguarde cooldown zero e leitura recente; confira se o monitor está ligado, se não há erro e se não existe envio/tentativa recente em andamento |
| Comando no campo sem envio confirmado | Confira o chat de apoio. Não repita imediatamente: veja se o comando saiu ou se existe rascunho, desconexão ou botão de envio indisponível |
| Resposta não aparece no painel | Confira o contexto do chat e se a resposta veio do bot para sua conta. O resultado é temporário; falhas de leitura exigem registro para análise |
| Inventário antigo após uma ação | Aguarde uma leitura e abra novamente Inventário com o monitor ligado, o que solicita atualização. Confira também se a ação foi concluída no site/chat |
| Vender selecionados desabilitado | Marque ao menos uma espécie sem proteção. Protegidos ficam fora da seleção |
| Venda selecionada abriu o site, mas não vendeu | Esse é o fluxo esperado: conclua a venda da espécie no inventário oficial |
| Vender todos pelo chat bloqueado | Há proteção lida no inventário. Use a seleção ou confira a venda no site |
| Info com poucos campos | O diálogo mostra apenas os campos identificados na leitura oficial. Confira o exemplar no site e registre a diferença |
| Catálogo de metas vazio ou com erro | Ative o monitor, confira a sessão da Twish e use Progresso → Alterar meta → Atualizar loja. Confira se a versão é 2.8.44 ou mais recente |
| Item não aparece no seletor | Confira se tem preço/moeda disponíveis no cartão oficial. Itens gratuitos, equipados ou mostrados apenas como já possuídos podem não ser opções de compra |
| Falta juntar não inclui peixes ou revenda | É o comportamento atual: a meta usa o saldo consultado; venda disponível e revenda são informações separadas |
| Maré ainda não consultada | Confira se a vara foi identificada, ligue o monitor e use Atualizar maré. O acesso é definido no cais oficial |
| Destino sem estrelas | Nem todo destino participa de uma maré reconhecida. Consulte suas condições no cais |
| Painel fora de uma posição confortável | Arraste pelo cabeçalho, expanda/minimize ou ajuste a janela. Confira também depois de entrar/sair da tela cheia |
| Extensão atualizada. Recarregue esta página. | Recarregue a página da Twitch e as abas da Twish após atualizar o cartão da extensão |
| Verificação ou bloqueio do jogo | Abra a página oficial e resolva manualmente. O monitor não resolve verificações ou bloqueios |

## Registrar um problema para o mantenedor

Abra uma issue no repositório e informe:

1. Versão da extensão e do Chrome, sistema operacional e tela usada.
2. Ação executada e resultado esperado.
3. O que apareceu de fato e o texto do erro, se houver.
4. Se o monitor estava ligado e se o contador estava recente.
5. Se aconteceu em tela normal, minimizada ou cheia.
6. Uma imagem que mostre o problema, ocultando dados pessoais e conversas desnecessárias.

Não envie senhas, cookies, tokens ou arquivos de sessão. Uma reprodução com dados de exemplo costuma ser suficiente.

## Limites da verificação local

Os testes incluídos usam documentos e mensagens simulados. Eles ajudam a encontrar regressões nos leitores e no painel, mas não substituem uma verificação da extensão instalada nas versões atuais dos sites.

## Créditos

Criação, desenvolvimento e documentação: **[@MadtraxBR](https://www.twitch.tv/madtraxbr)**.
