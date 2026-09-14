-- =============================================================================
-- BANCO DE DADOS COMPLETO - IGREJA APOSTÓLICA BOAS NOVAS (IABN)
-- =============================================================================
-- PostgreSQL 16+
-- Schema alinhado ao modelo de dados do frontend (src/integrations/supabase/types.ts)
-- Compatível com Supabase ou PostgreSQL puro (self-hosted no CasaOS)
--
-- Executar:
--   docker compose up -d          # sobe o Postgres + aplica este schema
--   ou manualmente:
--   psql -U boasnovas_user -d boas_novas_db -f schema-completo.sql
-- =============================================================================

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- TIPOS ENUM
-- =============================================================================
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('owner','pastor','manager','finance','media','teacher','security','volunteer','member','viewer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE member_status AS ENUM ('active','inactive','under_discipline','transferred','visitor');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE credential_status AS ENUM ('active','pending','expired','revoked');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('income','expense');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE camera_status AS ENUM ('online','offline','alert','recording');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================================================
-- 1. TENANTS (Igrejas / Congregações)
-- =============================================================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    pastor_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. PEOPLE (Membros / Pessoas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    document VARCHAR(30),
    birth_date DATE,
    baptism_date DATE,
    marital_status VARCHAR(30),
    gender VARCHAR(20),
    address TEXT,
    photo_url TEXT,
    ministry VARCHAR(100),
    notes TEXT,
    can_access_lives BOOLEAN DEFAULT true,
    live_access_tier VARCHAR(20) DEFAULT 'standard',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_people_tenant ON people(tenant_id);
CREATE INDEX IF NOT EXISTS idx_people_email ON people(email);
CREATE INDEX IF NOT EXISTS idx_people_name ON people(full_name);

-- =============================================================================
-- 3. MEMBERSHIPS (Vínculo de membresia)
-- =============================================================================
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    status member_status DEFAULT 'active',
    member_number VARCHAR(50),
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memberships_person ON memberships(person_id);

-- =============================================================================
-- 4. USER ROLES (RBAC)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role app_role DEFAULT 'member'
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);

-- =============================================================================
-- 5. PROFILES
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(50),
    active_tenant_id UUID
);

-- =============================================================================
-- 6. GROUPS (Células / Redes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    leader_id VARCHAR(50),
    leader_name VARCHAR(255),
    description TEXT,
    meeting_day VARCHAR(30),
    meeting_time VARCHAR(10),
    category VARCHAR(50),
    members_count INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_groups_tenant ON groups(tenant_id);

-- =============================================================================
-- 7. GROUP MEMBERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    role VARCHAR(50),
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. FAMILIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255),
    address TEXT
);

CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    relationship VARCHAR(50)
);

-- =============================================================================
-- 9. EVENTS (Eventos / Cultos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(20) DEFAULT 'culto',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    location VARCHAR(255),
    banner_url TEXT,
    expected_attendance INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_time);

-- =============================================================================
-- 10. MEETINGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    date DATE,
    topic VARCHAR(255),
    preacher VARCHAR(255)
);

-- =============================================================================
-- 11. ATTENDANCE
-- =============================================================================
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    method VARCHAR(20) DEFAULT 'qr_code'
);

CREATE INDEX IF NOT EXISTS idx_attendance_event ON attendance(event_id);

-- =============================================================================
-- 12. CREDENTIALS
-- =============================================================================
CREATE TABLE IF NOT EXISTS credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    person_name VARCHAR(255),
    person_role VARCHAR(255),
    code VARCHAR(50) UNIQUE,
    qr_hash VARCHAR(255),
    status credential_status DEFAULT 'active',
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    template_id VARCHAR(50),
    photo_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_credentials_code ON credentials(code);

-- =============================================================================
-- 13. CREDENTIAL TEMPLATES
-- =============================================================================
CREATE TABLE IF NOT EXISTS credential_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255),
    role_label VARCHAR(255),
    color_scheme VARCHAR(50),
    background_style VARCHAR(50)
);

-- =============================================================================
-- 14. DONATIONS (Dízimos / Ofertas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    person_id UUID REFERENCES people(id) ON DELETE SET NULL,
    person_name VARCHAR(255),
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(30) DEFAULT 'tithe',
    payment_method VARCHAR(30) DEFAULT 'pix',
    date TIMESTAMPTZ DEFAULT NOW(),
    receipt_number VARCHAR(50),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(date);
CREATE INDEX IF NOT EXISTS idx_donations_type ON donations(type);

-- =============================================================================
-- 15. TRANSACTIONS (Lançamentos financeiros)
-- =============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type transaction_type DEFAULT 'income',
    category VARCHAR(100),
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'completed',
    payment_method VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

-- =============================================================================
-- 16. CAMPAIGNS
-- =============================================================================
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    target_amount DECIMAL(12,2),
    current_amount DECIMAL(12,2),
    start_date DATE,
    end_date DATE,
    active BOOLEAN DEFAULT true
);

-- =============================================================================
-- 17. CAMERAS (CFTV)
-- =============================================================================
CREATE TABLE IF NOT EXISTS cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255),
    location VARCHAR(255),
    stream_url TEXT,
    snapshot_url TEXT,
    status camera_status DEFAULT 'online',
    resolution VARCHAR(50),
    ptz_enabled BOOLEAN DEFAULT false,
    fps INT DEFAULT 30
);

-- =============================================================================
-- 18. LIVES (Transmissões)
-- =============================================================================
CREATE TABLE IF NOT EXISTS lives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255),
    stream_url TEXT,
    platform VARCHAR(20) DEFAULT 'custom',
    status VARCHAR(20) DEFAULT 'scheduled',
    viewers_count INT DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    preacher VARCHAR(255)
);

-- =============================================================================
-- 19. LIVE CHAT MESSAGES
-- =============================================================================
CREATE TABLE IF NOT EXISTS live_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    live_id UUID NOT NULL REFERENCES lives(id) ON DELETE CASCADE,
    sender_name VARCHAR(255),
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    is_pinned BOOLEAN DEFAULT false,
    is_prayer_request BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_chat_live ON live_chat_messages(live_id);

-- =============================================================================
-- 20. PRAYER REQUESTS (Pedidos de Oração - Público)
-- =============================================================================
CREATE TABLE IF NOT EXISTS prayer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255),
    category VARCHAR(30) DEFAULT 'outro',
    request TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending',
    prayer_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prayer_requests_date ON prayer_requests(created_at DESC);

-- =============================================================================
-- 21. MEDIA ITEMS
-- =============================================================================
CREATE TABLE IF NOT EXISTS media_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255),
    type VARCHAR(30),
    url TEXT,
    preacher VARCHAR(255),
    date DATE,
    duration VARCHAR(20)
);

-- =============================================================================
-- 22. CLASSES (Escola Dominical)
-- =============================================================================
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255),
    teacher_name VARCHAR(255),
    age_group VARCHAR(100),
    room VARCHAR(100),
    students_count INT DEFAULT 0
);

-- =============================================================================
-- 23. LESSONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255),
    scripture VARCHAR(255),
    content TEXT,
    date DATE
);

CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    person_id UUID REFERENCES people(id) ON DELETE CASCADE,
    attended BOOLEAN DEFAULT false,
    homework_done BOOLEAN DEFAULT false
);

-- =============================================================================
-- 24. AUDIT LOG
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id VARCHAR(50),
    user_name VARCHAR(255),
    action VARCHAR(100),
    entity VARCHAR(100),
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- =============================================================================
-- FUNÇÕES PLPGSQL
-- =============================================================================
CREATE OR REPLACE FUNCTION validate_live_access(p_person_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_can_access BOOLEAN;
BEGIN
    SELECT can_access_lives INTO v_can_access FROM people WHERE id = p_person_id;
    RETURN COALESCE(v_can_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION log_audit_event(
    p_action VARCHAR, p_table VARCHAR, p_details TEXT, p_user VARCHAR DEFAULT 'Admin'
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO audit_log (action, entity, details, user_name)
    VALUES (p_action, p_table, p_details, p_user)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SEED - DADOS INICIAIS
-- =============================================================================

-- Tenant Sede
INSERT INTO tenants (id, name, slug, city, state, pastor_name, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Igreja Apostólica Boas Novas',
    'boas-novas',
    'Fortaleza',
    'CE',
    'Pr. Carlos Demontieux',
    'active'
) ON CONFLICT (slug) DO NOTHING;

-- Membros (Diretoria e Liderança IABN 2026/2028)
INSERT INTO people (id, tenant_id, full_name, ministry, can_access_lives, live_access_tier)
VALUES
    ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Carlos Demontieux', 'Presidente IABN', true, 'ministerial'),
    ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Mônica Sousa', 'Vice-presidente IABN', true, 'ministerial'),
    ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Lorena Sousa', '1ª Secretaria', true, 'ministerial'),
    ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', 'Priscila Bárbara', '2ª Secretaria', true, 'ministerial'),
    ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000001', 'Daniel Alecrim', '1º Tesouraria', true, 'ministerial'),
    ('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000001', 'Fernanda Borges', '2º Tesouraria', true, 'ministerial'),
    ('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000001', 'Matheus Eduardo', 'Conselho Fiscal', true, 'standard'),
    ('00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000001', 'Neire Costa', 'Conselho Fiscal / Intercessão', true, 'ministerial'),
    ('00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000001', 'Ednei', 'Ministério de Homens / Ensino', true, 'ministerial'),
    ('00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000001', 'Regys', 'Ministério de Ensino', true, 'ministerial'),
    ('00000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000001', 'Danilo', 'Ministério de Integração / Intercessão', true, 'ministerial'),
    ('00000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-000000000001', 'Marquinhos', 'Pequenos Grupos / Manutenção', true, 'standard'),
    ('00000000-0000-0000-0000-000000000113', '00000000-0000-0000-0000-000000000001', 'Mércia', 'Ministério de Casais / Intercessão', true, 'standard'),
    ('00000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000001', 'Gleyce', 'Ministério de Eventos', true, 'standard')
ON CONFLICT (id) DO NOTHING;

-- Grupos / Ministérios
INSERT INTO groups (id, tenant_id, name, leader_name, category, members_count)
VALUES
    ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 'Ministério Infantil', 'Fernanda e Maria', 'ministerio', 0),
    ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', 'Ministério de Adolescentes', 'Priscila e Lorena', 'ministerio', 0),
    ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', 'Ministério de Homens', 'Demontieux e Ednei', 'ministerio', 0),
    ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000001', 'Ministério de Mulheres', 'Mônica e Neire', 'ministerio', 0),
    ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000001', 'Ministério de Casais', 'Demontieux & Mônica', 'ministerio', 0),
    ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000001', 'Ministério de Louvor', 'Matheus e Lorena', 'ministerio', 0),
    ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000001', 'Ministério de Ensino', 'Regys e Ednei', 'ministerio', 0),
    ('00000000-0000-0000-0000-000000000208', '00000000-0000-0000-0000-000000000001', 'Ministério de Integração', 'Danilo e Neire', 'ministerio', 0),
    ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000001', 'Ministério de Intercessão', 'Neire e Danilo', 'ministerio', 0),
    ('00000000-0000-0000-0000-000000000210', '00000000-0000-0000-0000-000000000001', 'Pequenos Grupos', 'Demontieux e Marquinhos', 'celula', 0),
    ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000001', 'Ministério de Mídias', 'Priscila, Matheus e Fernanda', 'ministerio', 0),
    ('00000000-0000-0000-0000-000000000212', '00000000-0000-0000-0000-000000000001', 'Ministério de Eventos', 'Fernanda e Gleyce', 'ministerio', 0),
    ('00000000-0000-0000-0000-000000000213', '00000000-0000-0000-0000-000000000001', 'Ministério de Manutenção', 'Marquinhos e Daniel', 'ministerio', 0)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- PERMISSÕES PARA POSTGREST
-- =============================================================================

-- Garantir que o boasnovas_user tem permissões completas em todas as tabelas
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO boasnovas_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO boasnovas_user;
GRANT USAGE ON SCHEMA public TO boasnovas_user;

-- Criar papel anônimo para leitura (PostgREST usa este papel)
DO $$ BEGIN
    CREATE ROLE anon;
EXCEPTION WHEN duplicate_object THEN null; END $$;

GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Garantir que o boasnovas_user pode executar funções
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO boasnovas_user;

-- =============================================================================
-- FIM DO SCHEMA
-- =============================================================================