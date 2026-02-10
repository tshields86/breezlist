export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lists: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          list_type: string
          is_template: boolean
          sort_preference: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name?: string
          description?: string | null
          list_type?: string
          is_template?: boolean
          sort_preference?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          list_type?: string
          is_template?: boolean
          sort_preference?: string
          created_at?: string
          updated_at?: string
        }
      }
      list_members: {
        Row: {
          id: string
          list_id: string
          user_id: string
          role: string
          invited_by: string | null
          invited_at: string
        }
        Insert: {
          id?: string
          list_id: string
          user_id: string
          role?: string
          invited_by?: string | null
          invited_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          user_id?: string
          role?: string
          invited_by?: string | null
          invited_at?: string
        }
      }
      list_invites: {
        Row: {
          id: string
          list_id: string
          email: string
          invited_by: string
          role: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          list_id: string
          email: string
          invited_by: string
          role?: string
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          email?: string
          invited_by?: string
          role?: string
          created_at?: string
          expires_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          list_id: string
          name: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          list_id: string
          name: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          name?: string
          sort_order?: number
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          list_id: string
          category_id: string | null
          text: string
          quantity: number | null
          unit: string | null
          notes: string | null
          is_completed: boolean
          is_starred: boolean
          sort_order: number
          completed_at: string | null
          completed_by: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          list_id: string
          category_id?: string | null
          text: string
          quantity?: number | null
          unit?: string | null
          notes?: string | null
          is_completed?: boolean
          is_starred?: boolean
          sort_order?: number
          completed_at?: string | null
          completed_by?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          category_id?: string | null
          text?: string
          quantity?: number | null
          unit?: string | null
          notes?: string | null
          is_completed?: boolean
          is_starred?: boolean
          sort_order?: number
          completed_at?: string | null
          completed_by?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      item_history: {
        Row: {
          id: string
          user_id: string
          text_normalized: string
          text_display: string
          category_hint: string | null
          frequency: number
          last_used_at: string
        }
        Insert: {
          id?: string
          user_id: string
          text_normalized: string
          text_display: string
          category_hint?: string | null
          frequency?: number
          last_used_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          text_normalized?: string
          text_display?: string
          category_hint?: string | null
          frequency?: number
          last_used_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      user_has_list_access: {
        Args: { _list_id: string }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}
