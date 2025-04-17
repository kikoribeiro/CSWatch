# CSWatch

Repositório do trabalho de Integração de Sistemas

Este trabalho é inspirado no jogo Counter Strike, em que vai ser possivel analisar skins , agents e o mercado!

## Site alojado na Vercel
- https://cs-watch.vercel.app/

## Comando para correr o docker
- docker run -p 3000:3000 -v ~/cs-watch-data:/app/hooks cs-watch

## Estrutura das pastas e do projeto
### Cliente 
- app/skins
- app/agents
- app/agentsSOAP
- app/skinsQL
- app/market

### Servidor 
Todos os route.js que fazem a ligação entre o JSON e as Páginas Cliente
- app/api/rest
- app/api/soap
- app/api/graphql
- app/api/grpc

### JSONS e Schemas(xml)
- hooks/agents.json
- hooks/skins.json
- schemas/soap/agents.xsd

## POSTMAN TESTES

### GET Skins JSON
```http
  GET /api/rest/skins
```
#### Retorna todos os itens
![image](https://github.com/user-attachments/assets/74bb5031-6536-41e7-95ea-b71f81ca6f3a)

#

### POST Skins JSON
```http
  POST /api/rest/skins
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `id`      | `string` | **Obrigatório**. O ID da skin |
| `name`      | `string` | **Obrigatório**.O nome da skin |
| `description`      | `string` | A descrição da skin |
| `category`      | `string` | **Obrigatório**. A categoria da skin |
| `rarity`      | `string` | **Obrigatório**. A raridade da skin |
| `price`      | `number` | **Obrigatório**. O preço da skin |
| `image`      | `string` | **Obrigatório**. O URL da imagem da skin |


![image](https://github.com/user-attachments/assets/ba691cbe-d19f-4150-bf71-81b1a35d229b)

#

### GET Agents JSON
```http
  GET /api/rest/agents
```
#### Retorna todos os itens
![image](https://github.com/user-attachments/assets/74518dd4-f3b9-41c2-88ae-4f1b87e04477)

#

### GET Skins GraphQL
```http
  GET /api/graphql?query={skins{ id name price }}
```
#### Retorna todos os itens com id name e price
![Captura de ecrã 2025-04-16 235754](https://github.com/user-attachments/assets/d1c9f3c7-9590-43d0-9ab4-45505598e5b6)

#

### POST Skins GraphQL
```http
  POST /api/graphql
```
| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `id`      | `string` | **Obrigatório**. O ID da skin |
| `name`      | `string` | **Obrigatório**.O nome da skin |
| `price`      | `number` | **Obrigatório**. O preço da skin |

![Captura de ecrã 2025-04-17 000112](https://github.com/user-attachments/assets/b28da6a1-7a68-4759-9316-edd2d1642b60)

#

### GET Market gRPC
```http
  GET /api/grpc
```

![image](https://github.com/user-attachments/assets/a59b8fd4-90fd-4d4d-b4a2-9173bedcca17)

#

### POST Market gRPC
```http
  POST /api/grpc
```
| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `method`      | `string` | **Obrigatório**. O metodo quer irá ser executado |
| `skin_id`      | `string` | **Obrigatório**.O id da skin|
| `time_range`      | `number` | **Obrigatório**. Se o tempo é semana, dia ou mês |

![image](https://github.com/user-attachments/assets/4cbbf3f5-c2f3-4be0-9d73-c14dd4d4cbc6)

## Video de demonstração da aplicação
- https://www.youtube.com/watch?v=L1OChWGE-Rw

## Tecnologias utilizadas

- Apollo Client
- Next.js
- SOAP
- REST
- GraphQL
- gRPC

###

<div align="center">
  <img height="150" src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjI4NWptdHFyNXluOHZxeTFleGN0eTlvMml2NXNxb2trNGgyZjQwdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cruO3FTeoAxjiTVxPW/giphy.gif"  />
</div>
