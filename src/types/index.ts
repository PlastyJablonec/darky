export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: 'email' | 'google';
  createdAt: Date;
  updatedAt: Date;
}

export interface Wishlist {
  id: string;
  userId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  occasion?: string;
  isPublic: boolean;
  shareId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Gift {
  id: string;
  wishlistId: string;
  title: string;
  description?: string;
  price?: number;
  currency: string;
  productUrl?: string;
  imageUrl?: string;
  priority: 'low' | 'medium' | 'high';
  isReserved: boolean;
  reservedBy?: string;
  reservedAt?: Date;
  isGroupGift: boolean;
  contributions?: Contribution[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Contribution {
  id: string;
  giftId: string;
  contributorName: string;
  contributorEmail?: string;
  amount: number;
  message?: string;
  createdAt: Date;
}

export interface WishlistShare {
  id: string;
  wishlistId: string;
  sharedBy: string;
  sharedWith: string;
  viewedAt?: Date;
  firstViewedAt?: Date;
  createdAt: Date;
}

export interface WishlistView {
  id: string;
  wishlistId: string;
  viewerId?: string;
  viewerInfo?: {
    ip?: string;
    userAgent?: string;
  };
  viewedAt: Date;
}

export interface Database {
  public: {
    Tables: {
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          occasion: string | null;
          is_public: boolean;
          share_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          image_url?: string | null;
          occasion?: string | null;
          is_public?: boolean;
          share_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          image_url?: string | null;
          occasion?: string | null;
          is_public?: boolean;
          share_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      gifts: {
        Row: {
          id: string;
          wishlist_id: string;
          title: string;
          description: string | null;
          price: number | null;
          currency: string;
          product_url: string | null;
          image_url: string | null;
          priority: string;
          is_reserved: boolean;
          reserved_by: string | null;
          reserved_at: string | null;
          is_group_gift: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wishlist_id: string;
          title: string;
          description?: string | null;
          price?: number | null;
          currency?: string;
          product_url?: string | null;
          image_url?: string | null;
          priority?: string;
          is_reserved?: boolean;
          reserved_by?: string | null;
          reserved_at?: string | null;
          is_group_gift?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wishlist_id?: string;
          title?: string;
          description?: string | null;
          price?: number | null;
          currency?: string;
          product_url?: string | null;
          image_url?: string | null;
          priority?: string;
          is_reserved?: boolean;
          reserved_by?: string | null;
          reserved_at?: string | null;
          is_group_gift?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      wishlist_shares: {
        Row: {
          id: string;
          wishlist_id: string;
          shared_by: string;
          shared_with: string;
          viewed_at: string | null;
          first_viewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wishlist_id: string;
          shared_by: string;
          shared_with: string;
          viewed_at?: string | null;
          first_viewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wishlist_id?: string;
          shared_by?: string;
          shared_with?: string;
          viewed_at?: string | null;
          first_viewed_at?: string | null;
          created_at?: string;
        };
      };
      wishlist_views: {
        Row: {
          id: string;
          wishlist_id: string;
          viewer_id: string | null;
          viewer_info: any | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          wishlist_id: string;
          viewer_id?: string | null;
          viewer_info?: any | null;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          wishlist_id?: string;
          viewer_id?: string | null;
          viewer_info?: any | null;
          viewed_at?: string;
        };
      };
    };
  };
}