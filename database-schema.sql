-- User Profiles Table (extends Supabase auth.users)
-- Stores additional user information for display purposes
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles (for contributor names)
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Gift Contributions Table for Group Gifts
-- This table tracks individual contributions to group gifts

CREATE TABLE public.gift_contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_id UUID NOT NULL REFERENCES public.gifts(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'CZK',
  message TEXT, -- Optional message from contributor
  is_anonymous BOOLEAN DEFAULT false, -- Hide contributor name from others
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate contributions from same user to same gift
  UNIQUE(gift_id, contributor_id)
);

-- Gift Contribution Messages Table for Communication
-- Allows contributors to communicate with each other (but not with gift owner)
CREATE TABLE public.gift_contribution_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_id UUID NOT NULL REFERENCES public.gifts(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_gift_contributions_gift_id ON public.gift_contributions(gift_id);
CREATE INDEX idx_gift_contributions_contributor_id ON public.gift_contributions(contributor_id);
CREATE INDEX idx_gift_contribution_messages_gift_id ON public.gift_contribution_messages(gift_id);
CREATE INDEX idx_gift_contribution_messages_created_at ON public.gift_contribution_messages(created_at);

-- Row Level Security Policies

-- Gift Contributions Policies
ALTER TABLE public.gift_contributions ENABLE ROW LEVEL SECURITY;

-- Contributors can see all contributions for gifts they contributed to (but not the gift owner)
CREATE POLICY "Contributors can view contributions for their group gifts" ON public.gift_contributions
  FOR SELECT USING (
    -- User contributed to this gift
    contributor_id = auth.uid()
    OR 
    -- User contributed to ANY contribution for this gift (can see other contributors)
    gift_id IN (
      SELECT gift_id FROM public.gift_contributions 
      WHERE contributor_id = auth.uid()
    )
    AND
    -- But NOT if user is the gift owner (no spoilers!)
    gift_id NOT IN (
      SELECT g.id FROM public.gifts g
      JOIN public.wishlists w ON g.wishlist_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

-- Contributors can insert their own contributions
CREATE POLICY "Contributors can create contributions" ON public.gift_contributions
  FOR INSERT WITH CHECK (
    contributor_id = auth.uid()
    AND
    -- Only for group gifts
    gift_id IN (SELECT id FROM public.gifts WHERE is_group_gift = true)
    AND
    -- Cannot contribute to own gifts
    gift_id NOT IN (
      SELECT g.id FROM public.gifts g
      JOIN public.wishlists w ON g.wishlist_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

-- Contributors can update their own contributions
CREATE POLICY "Contributors can update own contributions" ON public.gift_contributions
  FOR UPDATE USING (contributor_id = auth.uid())
  WITH CHECK (contributor_id = auth.uid());

-- Contributors can delete their own contributions
CREATE POLICY "Contributors can delete own contributions" ON public.gift_contributions
  FOR DELETE USING (contributor_id = auth.uid());

-- Gift Contribution Messages Policies
ALTER TABLE public.gift_contribution_messages ENABLE ROW LEVEL SECURITY;

-- Contributors can view messages for gifts they contributed to
CREATE POLICY "Contributors can view messages for their group gifts" ON public.gift_contribution_messages
  FOR SELECT USING (
    -- User contributed to this gift
    gift_id IN (
      SELECT gift_id FROM public.gift_contributions 
      WHERE contributor_id = auth.uid()
    )
    AND
    -- But NOT if user is the gift owner (no spoilers!)
    gift_id NOT IN (
      SELECT g.id FROM public.gifts g
      JOIN public.wishlists w ON g.wishlist_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

-- Contributors can insert messages for gifts they contributed to
CREATE POLICY "Contributors can create messages" ON public.gift_contribution_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND
    gift_id IN (
      SELECT gift_id FROM public.gift_contributions 
      WHERE contributor_id = auth.uid()
    )
    AND
    -- Cannot send messages for own gifts
    gift_id NOT IN (
      SELECT g.id FROM public.gifts g
      JOIN public.wishlists w ON g.wishlist_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

-- Function to calculate total contributions for a gift
CREATE OR REPLACE FUNCTION get_gift_contribution_total(gift_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(amount) FROM public.gift_contributions WHERE gift_id = gift_uuid),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if gift funding is complete
CREATE OR REPLACE FUNCTION is_gift_fully_funded(gift_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  target_price DECIMAL(10,2);
  total_contributions DECIMAL(10,2);
BEGIN
  SELECT price INTO target_price FROM public.gifts WHERE id = gift_uuid;
  SELECT get_gift_contribution_total(gift_uuid) INTO total_contributions;
  
  RETURN (target_price IS NOT NULL AND total_contributions >= target_price);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update gift reservation status when fully funded
CREATE OR REPLACE FUNCTION update_gift_reservation_on_full_funding()
RETURNS TRIGGER AS $$
BEGIN
  -- If gift is now fully funded, mark as reserved
  IF is_gift_fully_funded(NEW.gift_id) THEN
    UPDATE public.gifts 
    SET is_reserved = true, reserved_at = NOW()
    WHERE id = NEW.gift_id AND NOT is_reserved;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_gift_reservation
  AFTER INSERT OR UPDATE ON public.gift_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_gift_reservation_on_full_funding();

-- Function to validate group gift messages
CREATE OR REPLACE FUNCTION validate_group_gift_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if gift is a group gift
  IF NOT EXISTS (
    SELECT 1 FROM public.gifts 
    WHERE id = NEW.gift_id AND is_group_gift = true
  ) THEN
    RAISE EXCEPTION 'Messages can only be sent for group gifts';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate group gift messages
CREATE TRIGGER trigger_validate_group_gift_message
  BEFORE INSERT ON public.gift_contribution_messages
  FOR EACH ROW
  EXECUTE FUNCTION validate_group_gift_message();

-- Comments for documentation
COMMENT ON TABLE public.gift_contributions IS 'Tracks individual monetary contributions to group gifts';
COMMENT ON TABLE public.gift_contribution_messages IS 'Messages between contributors for coordinating group gifts (hidden from gift owner)';
COMMENT ON FUNCTION get_gift_contribution_total(UUID) IS 'Calculates total amount contributed to a group gift';
COMMENT ON FUNCTION is_gift_fully_funded(UUID) IS 'Checks if a group gift has reached its target price through contributions';