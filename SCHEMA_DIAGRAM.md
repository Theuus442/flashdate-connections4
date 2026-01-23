# 📊 FlashDate - Diagrama do Schema

## Estrutura das Tabelas

### 1️⃣ USERS (Usuários)

```
┌─────────────────────────────────┐
│         USERS                   │
├─────────────────────────────────┤
│ id (UUID) ⭐ PRIMARY KEY        │
│ email (TEXT) UNIQUE             │
│ name (TEXT)                     │
│ username (TEXT) UNIQUE          │
│ whatsapp (TEXT)                 │
│ gender (TEXT)                   │
│   └─ Valores: M, F, Outro       │
│ profile_image_url (TEXT)        │
│ role (TEXT)                     │
│   └─ Valores: admin, client     │
│ created_at (TIMESTAMP)          │
│ updated_at (TIMESTAMP)          │
└─────────────────────────────────┘
```

**Exemplo de dados:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "maria@example.com",
  "name": "Maria Silva",
  "username": "maria.silva",
  "whatsapp": "(11) 98765-4321",
  "gender": "F",
  "profile_image_url": "https://supabase.co/profiles/maria.jpg",
  "role": "client",
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-01-20T10:00:00Z"
}
```

---

### 2️⃣ EVENTS (Eventos)

```
┌─────────────────────────────────┐
│         EVENTS                  │
├─────────────────────────────────┤
│ id (UUID) ⭐ PRIMARY KEY        │
│ title (TEXT)                    │
│ location (TEXT)                 │
│ city (TEXT)                     │
│ date (TEXT)                     │
│ next_date (DATE)                │
│ schedule (TEXT)                 │
│ check_in (TEXT)                 │
│ environment (TEXT)              │
│ music (TEXT)                    │
│ dress_code (TEXT)               │
│ parking (TEXT)                  │
│ price (TEXT)                    │
│ vagas (INTEGER)                 │
│ vagas_limit_date (DATE)         │
│ description (TEXT)              │
│ event_image_url (TEXT)          │
│ email (TEXT)                    │
│ whatsapp (TEXT)                 │
│ created_at (TIMESTAMP)          │
│ updated_at (TIMESTAMP)          │
└─────────────────────────────────┘
```

**Exemplo de dados:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "title": "Armazém São Caetano",
  "location": "Armazém São Caetano",
  "city": "São Caetano do Sul, SP",
  "date": "Sábados com eventos regulares",
  "next_date": "2024-02-10",
  "schedule": "19:00",
  "check_in": "15-30 min antes",
  "environment": "Rústico e elegante",
  "music": "Música ao vivo a partir das 19h",
  "dress_code": "Esporte Fino / Casual Elegante",
  "parking": "Zona Azul gratuita",
  "price": "R$ 40,00",
  "vagas": 100,
  "vagas_limit_date": "2024-02-08",
  "description": "Encontros Presenciais com Inteligência Artificial",
  "event_image_url": "https://supabase.co/events/armazem.jpg",
  "email": "contato@flashdate.com.br",
  "whatsapp": "(11) 94163-7875",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-20T10:00:00Z"
}
```

---

### 3️⃣ SELECTIONS (Seleções/Matches)

```
┌──────────────────────────────────────┐
│         SELECTIONS                   │
├──────────────────────────────────────┤
│ id (UUID) ⭐ PRIMARY KEY             │
│ user_id (UUID) 🔗 → USERS.id        │
│ selected_user_id (UUID) 🔗 → USERS.id
│ type (TEXT)                          │
│   └─ Valores: match, friendship,    │
│      no-interest                    │
│ created_at (TIMESTAMP)               │
│ updated_at (TIMESTAMP)               │
│                                      │
│ UNIQUE (user_id, selected_user_id)  │
└──────────────────────────────────────┘
```

**Exemplo de dados:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "selected_user_id": "550e8400-e29b-41d4-a716-446655440001",
  "type": "match",
  "created_at": "2024-01-20T10:30:00Z",
  "updated_at": "2024-01-20T10:30:00Z"
}
```

**Como funciona:**
- Maria (user_id) selecionou João (selected_user_id) como "match"
- Se João também selecionou Maria como "match", é um match confirmado
- Tipos: `match` (interesse), `friendship` (amizade), `no-interest` (sem interesse)

---

### 4️⃣ EVENT_PARTICIPANTS (Participantes de Eventos)

```
┌──────────────────────────────────────┐
│      EVENT_PARTICIPANTS              │
├──────────────────────────────────────┤
│ id (UUID) ⭐ PRIMARY KEY             │
│ event_id (UUID) 🔗 → EVENTS.id      │
│ user_id (UUID) 🔗 → USERS.id        │
│ status (TEXT)                        │
│   └─ Valores: registered, confirmed,│
│      no-show                        │
│ joined_at (TIMESTAMP)                │
│                                      │
│ UNIQUE (event_id, user_id)          │
└──────────────────────────────────────┘
```

**Exemplo de dados:**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "event_id": "660e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "confirmed",
  "joined_at": "2024-01-18T15:00:00Z"
}
```

---

## 🔗 Relacionamentos

```
          USERS
        /     \
       /       \
   SELECTIONS  EVENT_PARTICIPANTS
       |            |
       v            v
    (matches)   (events)
               /
              /
           EVENTS
```

**Explicação:**
- Um `USER` pode ter vários `SELECTIONS` (matches)
- Um `USER` pode participar de vários `EVENT_PARTICIPANTS`
- Um `EVENT` pode ter vários `EVENT_PARTICIPANTS`
- Uma `SELECTION` conecta dois `USERS`

---

## 📦 Storage Buckets (Imagens)

```
SUPABASE STORAGE
├── user-profiles/
│   ├── {user_id}-{timestamp}-profile.jpg
│   ├── {user_id}-{timestamp}-profile.png
│   └── ...
│
└── event-images/
    ├── {event_id}-{timestamp}-event.jpg
    ├── {event_id}-{timestamp}-event.png
    └── ...
```

**Armazenamento:**
- `user-profiles`: Fotos de perfil dos usuários
- `event-images`: Imagens dos eventos

---

## 🔐 Políticas de Segurança (RLS)

### Users
- ✅ Todos podem **ver** usuários
- ✅ Cada usuário pode **atualizar** seu próprio perfil

### Events
- ✅ Todos podem **ver** eventos
- ✅ Apenas admins podem **criar** eventos
- ✅ Apenas admins podem **editar** eventos

### Selections
- ✅ Todos podem **ver** seleções
- ✅ Cada usuário pode **criar** suas próprias seleções
- ✅ Cada usuário pode **editar** suas próprias seleções
- ✅ Cada usuário pode **deletar** suas próprias seleções

### Event Participants
- ✅ Todos podem **ver** participantes
- ✅ Usuários podem **se registrar** em eventos

---

## 💡 Tipos de Dados

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| UUID | ID único | `550e8400-e29b-41d4-a716-446655440000` |
| TEXT | Texto | `"Maria Silva"` |
| INTEGER | Número inteiro | `100` |
| DATE | Data (YYYY-MM-DD) | `2024-02-10` |
| TIMESTAMP | Data e hora | `2024-01-20T10:00:00Z` |
| CHECK | Validação | `gender IN ('M', 'F', 'Outro')` |
| UNIQUE | Valor único | `email TEXT UNIQUE` |
| REFERENCES | Chave estrangeira | `user_id UUID REFERENCES users(id)` |

---

## 🎯 Tamanho Esperado

```
Exemplo para 1000 usuários:
- users: ~500 KB
- events: ~50 KB (1-2 eventos)
- selections: ~2-5 MB (muitos matches)
- event_participants: ~100 KB
- user-profiles: ~500 MB (500 fotos @ 500KB cada)
- event-images: ~50 MB (1-2 imagens @ 25MB cada)

TOTAL: ~1 GB (muito abaixo do limite Supabase)
```

---

**Diagrama criado para FlashDate 🎉**
