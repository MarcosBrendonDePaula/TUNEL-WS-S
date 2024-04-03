# README: Como Usar o Software no Windows

Este documento explica como instalar e configurar o software em um ambiente Windows. O software requer a instalação e configuração do OpenSSL para gerar um certificado autoassinado, a menos que um certificado personalizado já esteja disponível e configurado no arquivo `config.json`.

## Passo 1: Instalação do OpenSSL

1. Abra a pasta `requirements` que contém os instaladores e opções do OpenSSL.

2. Execute o instalador compativel com sua maquina do OpenSSL e siga as instruções do assistente de instalação para concluir a instalação.

3. Adicione a pasta do OpenSSL ao PATH do sistema seguindo as etapas abaixo.

## Passo 2: Adicionar OpenSSL ao PATH do Sistema

1. Pressione `Win + R`, digite `sysdm.cpl` e pressione Enter para abrir as Propriedades do Sistema.

2. Na guia "Avançado", clique em "Variáveis de Ambiente".

3. Na seção "Variáveis do Sistema", selecione a variável `Path` e clique em "Editar".

4. Clique em "Novo" e adicione o caminho completo para a pasta do OpenSSL. Por exemplo, `C:\OpenSSL\bin`.

5. Clique em "OK" para fechar todas as janelas de configuração.

## Passo 3: Configurar o arquivo `config.json`

1. Abra o arquivo `config.json` no diretório do software.

2. Configure os seguintes campos conforme necessário:
   - `targetAddress`: Endereço IP do servidor de destino.
   - `targetPort`: Porta do servidor de destino.
   - `saveLogs`: Define se os logs devem ser salvos (`true` para salvar, `false` para não salvar).
   - `customKeyPath`: Caminho para o arquivo da chave privada, se estiver usando um certificado personalizado. Se deixado em branco, o OpenSSL tentará criar um certificado automaticamente.
   - `customCertPath`: Caminho para o arquivo do certificado, se estiver usando um certificado personalizado. Se deixado em branco, o OpenSSL tentará criar um certificado automaticamente.

3. Salve as alterações no arquivo `config.json`.

## Passo 4: Executar o Software

1. Execute ou coloque para ser executado automaticamente o arquivo Server.exe

3. O software iniciará um servidor WSS na `443` e estará pronto para receber conexões.