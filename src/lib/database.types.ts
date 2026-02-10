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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "lists_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "list_members_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "list_invites_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "categories_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "item_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: Record<string, never>
  }
}
