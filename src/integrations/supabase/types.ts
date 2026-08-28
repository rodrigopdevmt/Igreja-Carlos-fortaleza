export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole =
  | 'owner'
  | 'pastor'
  | 'manager'
  | 'finance'
  | 'media'
  | 'teacher'
  | 'security'
  | 'volunteer'
  | 'member'
  | 'viewer';

export type MemberStatus =
  | 'active'
  | 'inactive'
  | 'under_discipline'
  | 'transferred'
  | 'visitor';

export type CredentialStatus =
  | 'active'
  | 'pending'
  | 'expired'
  | 'revoked';

export type TransactionType = 'income' | 'expense';

export type EventType =
  | 'culto'
  | 'conferencia'
  | 'batismo'
  | 'vigilia'
  | 'ensaio'
  | 'reuniao';

export type CameraStatus = 'online' | 'offline' | 'alert' | 'recording';

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          city: string;
          state: string;
          pastor_name: string;
          created_at: string;
          status: 'active' | 'inactive';
        };
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>;
      };
      people: {
        Row: {
          id: string;
          tenant_id: string;
          full_name: string;
          email: string;
          phone: string;
          document: string;
          birth_date: string;
          baptism_date: string | null;
          marital_status: string;
          gender: string;
          address: string;
          photo_url: string | null;
          ministry: string | null;
          notes: string | null;
          can_access_lives?: boolean;
          live_access_tier?: 'standard' | 'ministerial' | 'blocked';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['people']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['people']['Insert']>;
      };
      memberships: {
        Row: {
          id: string;
          tenant_id: string;
          person_id: string;
          role: string;
          status: MemberStatus;
          member_number: string;
          joined_at: string;
        };
        Insert: Omit<Database['public']['Tables']['memberships']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['memberships']['Insert']>;
      };
      user_roles: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          role: AppRole;
        };
        Insert: Omit<Database['public']['Tables']['user_roles']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['user_roles']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          phone: string | null;
          active_tenant_id: string;
        };
        Insert: Database['public']['Tables']['profiles']['Row'];
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      groups: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          leader_id: string;
          leader_name: string;
          description: string;
          meeting_day: string;
          meeting_time: string;
          category: string;
          members_count: number;
        };
        Insert: Omit<Database['public']['Tables']['groups']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['groups']['Insert']>;
      };
      group_members: {
        Row: {
          id: string;
          tenant_id: string;
          group_id: string;
          person_id: string;
          role: string;
          joined_at: string;
        };
        Insert: Omit<Database['public']['Tables']['group_members']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['group_members']['Insert']>;
      };
      families: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          address: string;
        };
        Insert: Omit<Database['public']['Tables']['families']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['families']['Insert']>;
      };
      family_members: {
        Row: {
          id: string;
          tenant_id: string;
          family_id: string;
          person_id: string;
          relationship: string;
        };
        Insert: Omit<Database['public']['Tables']['family_members']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['family_members']['Insert']>;
      };
      events: {
        Row: {
          id: string;
          tenant_id: string;
          title: string;
          description: string;
          event_type: EventType;
          start_time: string;
          end_time: string;
          location: string;
          banner_url: string | null;
          expected_attendance: number;
        };
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
      };
      meetings: {
        Row: {
          id: string;
          tenant_id: string;
          event_id: string;
          date: string;
          topic: string;
          preacher: string;
        };
        Insert: Omit<Database['public']['Tables']['meetings']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['meetings']['Insert']>;
      };
      attendance: {
        Row: {
          id: string;
          tenant_id: string;
          event_id: string;
          person_id: string;
          checked_in_at: string;
          method: 'qr_code' | 'manual' | 'face';
        };
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['attendance']['Insert']>;
      };
      credentials: {
        Row: {
          id: string;
          tenant_id: string;
          person_id: string;
          person_name: string;
          person_role: string;
          code: string;
          qr_hash: string;
          status: CredentialStatus;
          issued_at: string;
          expires_at: string;
          template_id: string;
          photo_url: string | null;
        };
        Insert: Omit<Database['public']['Tables']['credentials']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['credentials']['Insert']>;
      };
      credential_templates: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          role_label: string;
          color_scheme: string;
          background_style: string;
        };
        Insert: Omit<Database['public']['Tables']['credential_templates']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['credential_templates']['Insert']>;
      };
      donations: {
        Row: {
          id: string;
          tenant_id: string;
          person_id: string | null;
          person_name: string;
          amount: number;
          type: 'tithe' | 'offering' | 'missions' | 'building_campaign' | 'other';
          payment_method: 'pix' | 'credit_card' | 'cash' | 'transfer' | 'boleto';
          date: string;
          receipt_number: string;
          notes: string | null;
        };
        Insert: Omit<Database['public']['Tables']['donations']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['donations']['Insert']>;
      };
      transactions: {
        Row: {
          id: string;
          tenant_id: string;
          type: TransactionType;
          category: string;
          description: string;
          amount: number;
          date: string;
          status: 'completed' | 'pending' | 'cancelled';
          payment_method: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
      campaigns: {
        Row: {
          id: string;
          tenant_id: string;
          title: string;
          description: string;
          target_amount: number;
          current_amount: number;
          start_date: string;
          end_date: string;
          active: boolean;
        };
        Insert: Omit<Database['public']['Tables']['campaigns']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['campaigns']['Insert']>;
      };
      cameras: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          location: string;
          stream_url: string;
          snapshot_url: string;
          status: CameraStatus;
          resolution: string;
          ptz_enabled: boolean;
          fps: number;
        };
        Insert: Omit<Database['public']['Tables']['cameras']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['cameras']['Insert']>;
      };
      lives: {
        Row: {
          id: string;
          tenant_id: string;
          title: string;
          stream_url: string;
          platform: 'youtube' | 'facebook' | 'custom';
          status: 'live' | 'scheduled' | 'ended';
          viewers_count: number;
          started_at: string;
          preacher: string;
        };
        Insert: Omit<Database['public']['Tables']['lives']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['lives']['Insert']>;
      };
      live_chat_messages: {
        Row: {
          id: string;
          tenant_id: string;
          live_id: string;
          sender_name: string;
          message: string;
          sent_at: string;
          is_pinned: boolean;
          is_prayer_request: boolean;
        };
        Insert: Omit<Database['public']['Tables']['live_chat_messages']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['live_chat_messages']['Insert']>;
      };
      media_items: {
        Row: {
          id: string;
          tenant_id: string;
          title: string;
          type: 'sermon_audio' | 'sermon_video' | 'bulletin' | 'slide';
          url: string;
          preacher: string;
          date: string;
          duration: string;
        };
        Insert: Omit<Database['public']['Tables']['media_items']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['media_items']['Insert']>;
      };
      classes: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          teacher_name: string;
          age_group: string;
          room: string;
          students_count: number;
        };
        Insert: Omit<Database['public']['Tables']['classes']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['classes']['Insert']>;
      };
      lessons: {
        Row: {
          id: string;
          tenant_id: string;
          class_id: string;
          title: string;
          scripture: string;
          content: string;
          date: string;
        };
        Insert: Omit<Database['public']['Tables']['lessons']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>;
      };
      lesson_progress: {
        Row: {
          id: string;
          tenant_id: string;
          lesson_id: string;
          person_id: string;
          attended: boolean;
          homework_done: boolean;
        };
        Insert: Omit<Database['public']['Tables']['lesson_progress']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['lesson_progress']['Insert']>;
      };
      audit_log: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          user_name: string;
          action: string;
          entity: string;
          details: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_log']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['audit_log']['Insert']>;
      };
    };
  };
}
