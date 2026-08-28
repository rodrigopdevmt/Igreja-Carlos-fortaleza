-- =============================================================================
-- BANCO DE DADOS OFICIAL - IGREJA APOSTÓLICA BOAS NOVAS (VPS POSTGRESQL 16+)
-- =============================================================================
-- Execute este script no PostgreSQL da sua VPS:
-- psql -U postgres -d boas_novas_db -f schema.sql
-- =============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. TABELA DE DADOS CADASTRAIS DA IGREJA
-- =============================================================================
CREATE TABLE IF NOT EXISTS church_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'Igreja Apostólica Boas Novas',
    slug VARCHAR(100) UNIQUE NOT NULL DEFAULT 'boas-novas',
    pastor_name VARCHAR(255) NOT NULL DEFAULT 'Apóstolo & Pastores Presidentes',
    address TEXT DEFAULT 'Av. Paulista, 1500 - Bela Vista',
    city VARCHAR(100) DEFAULT 'São Paulo',
    state VARCHAR(50) DEFAULT 'SP',
    phone VARCHAR(50) DEFAULT '(11) 3254-8900',
    email VARCHAR(255) DEFAULT 'contato@boasnovas.org.br',
    cnpj VARCHAR(30) DEFAULT '12.345.678/0001-90',
    motto TEXT DEFAULT 'Mais que uma igreja, somos boas novas para o mundo.',
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. TABELA DE MEMBROS E ROL ECLESIÁSTICO
-- =============================================================================
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    cpf VARCHAR(20) UNIQUE,
    rg VARCHAR(20),
    birth_date DATE,
    address TEXT,
    neighborhood VARCHAR(100),
    city VARCHAR(100) DEFAULT 'São Paulo',
    state VARCHAR(50) DEFAULT 'SP',
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'member', -- 'member', 'pastor', 'bishop', 'deacon', 'leader', 'visitor'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'transferred', 'discipline'
    conversion_date DATE,
    baptism_water_date DATE,
    baptism_holy_spirit BOOLEAN DEFAULT false,
    sacraments JSONB DEFAULT '{"water_baptism": true, "holy_spirit": false, "communion": true}'::jsonb,
    can_access_lives BOOLEAN DEFAULT true, -- Permissão pastoral para assistir transmissões 4K
    qr_hash VARCHAR(100) UNIQUE, -- Código criptografado da credencial digital
    cell_id UUID,
    ministry VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_cpf ON members(cpf);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);
CREATE INDEX IF NOT EXISTS idx_members_qr_hash ON members(qr_hash);
CREATE INDEX IF NOT EXISTS idx_members_can_lives ON members(can_access_lives);

-- =============================================================================
-- 3. TABELA DE TRANSAÇÕES FINANCEIRAS (DÍZIMOS, OFERTAS E DESPESAS)
-- =============================================================================
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID REFERENCES members(id) ON DELETE SET NULL,
    person_name VARCHAR(255),
    type VARCHAR(50) NOT NULL, -- 'tithe', 'offering', 'special_campaign', 'expense'
    category VARCHAR(100) NOT NULL, -- 'culto_domingo', 'missoes', 'manutencao', etc.
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'pix', -- 'pix', 'cash', 'card', 'transfer', 'boleto'
    payment_reference VARCHAR(255),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'completed', -- 'completed', 'pending', 'cancelled'
    created_by VARCHAR(255) DEFAULT 'Tesouraria',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fin_date ON financial_transactions(date);
CREATE INDEX IF NOT EXISTS idx_fin_type ON financial_transactions(type);

-- =============================================================================
-- 4. TABELA DE CÂMERAS DE MONITORAMENTO CFTV
-- =============================================================================
CREATE TABLE IF NOT EXISTS cftv_cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    rtsp_url TEXT,
    hls_url TEXT,
    status VARCHAR(50) DEFAULT 'online', -- 'online', 'offline', 'warning'
    resolution VARCHAR(50) DEFAULT '4K Ultra HD',
    fps INT DEFAULT 60,
    bitrate VARCHAR(50) DEFAULT '8.5 Mbps',
    ai_detection_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. TABELA DE TRANSMISSÕES AO VIVO E CONSOLE DE INTERCESSÃO
-- =============================================================================
CREATE TABLE IF NOT EXISTS live_streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    preacher VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'live', -- 'live', 'scheduled', 'ended'
    stream_url TEXT,
    viewers_count INT DEFAULT 0,
    intercession_requests_count INT DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS live_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(50) DEFAULT 'Membro',
    message TEXT NOT NULL,
    is_prayer_request BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. TABELA DE CÉLULAS, REDES E GRUPOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS cells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    network VARCHAR(50) DEFAULT 'Adultos', -- 'Jovens', 'Casais', 'Mulheres', 'Homens', 'Kids'
    leader_name VARCHAR(255) NOT NULL,
    host_name VARCHAR(255),
    address TEXT,
    day_of_week VARCHAR(20) DEFAULT 'Quinta-feira',
    meeting_time TIME DEFAULT '20:00:00',
    members_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. TABELA DE EVENTOS E CALENDÁRIO
-- =============================================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) DEFAULT 'Templo Sede',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    category VARCHAR(50) DEFAULT 'culto', -- 'culto', 'conferencia', 'batismo', 'ensaio'
    banner_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. TRILHA DE AUDITORIA E SEGURANÇA IMUTÁVEL
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    user_name VARCHAR(255) DEFAULT 'Sistema / Administrador',
    user_role VARCHAR(50) DEFAULT 'owner',
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- =============================================================================
-- 9. FUNÇÕES DE PROCEDIMENTOS ARMAZENADOS (PL/PGSQL)
-- =============================================================================

-- Validação de acesso à Live
CREATE OR REPLACE FUNCTION validate_live_access(p_person_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_can_access BOOLEAN;
BEGIN
    SELECT can_access_lives INTO v_can_access FROM members WHERE id = p_person_id;
    RETURN COALESCE(v_can_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Registro automático de auditoria
CREATE OR REPLACE FUNCTION log_audit_event(p_action VARCHAR, p_table VARCHAR, p_details TEXT, p_user VARCHAR DEFAULT 'Admin')
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO audit_logs (action, table_name, details, user_name)
    VALUES (p_action, p_table, p_details, p_user)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Inserção de dados iniciais da Sede
INSERT INTO church_profiles (name, slug, pastor_name, address, city, state, phone, email, cnpj, motto)
VALUES (
    'Igreja Apostólica Boas Novas',
    'boas-novas',
    'Apóstolo & Pastores Presidentes',
    'Av. Paulista, 1500 - Bela Vista',
    'São Paulo',
    'SP',
    '(11) 3254-8900',
    'contato@boasnovas.org.br',
    '12.345.678/0001-90',
    'Mais que uma igreja, somos boas novas para o mundo.'
) ON CONFLICT (slug) DO NOTHING;
