-- User Role Management Backend Implementation
-- Create enum types for roles and statuses
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'blocked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update profiles table to include role and status columns
ALTER TABLE profiles_devbox_2024 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user',
ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create moderation reports table
CREATE TABLE IF NOT EXISTS moderation_reports_devbox_2024 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES profiles_devbox_2024(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES profiles_devbox_2024(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('spam', 'abuse', 'harassment', 'inappropriate', 'other')),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    moderator_id UUID REFERENCES profiles_devbox_2024(id) ON DELETE SET NULL,
    moderator_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log_devbox_2024 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES profiles_devbox_2024(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    target_user_id UUID REFERENCES profiles_devbox_2024(id) ON DELETE SET NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update user activity table to track role changes
ALTER TABLE user_activity_devbox_2024 
ADD COLUMN IF NOT EXISTS admin_action BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS target_user_id UUID REFERENCES profiles_devbox_2024(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles_devbox_2024(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles_devbox_2024(status);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON moderation_reports_devbox_2024(status);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_type ON moderation_reports_devbox_2024(type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin_id ON admin_activity_log_devbox_2024(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON admin_activity_log_devbox_2024(created_at);

-- Enable RLS on all tables
ALTER TABLE moderation_reports_devbox_2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log_devbox_2024 ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table (update existing)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles_devbox_2024;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles_devbox_2024;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles_devbox_2024;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles_devbox_2024;
DROP POLICY IF EXISTS "Moderators can view user profiles" ON profiles_devbox_2024;

-- Updated profile policies with role-based access
CREATE POLICY "Users can view own profile" ON profiles_devbox_2024
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile basic info" ON profiles_devbox_2024
    FOR UPDATE USING (
        auth.uid() = id AND 
        old.role = new.role AND 
        old.status = new.status
    );

CREATE POLICY "Admins can view all profiles" ON profiles_devbox_2024
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles_devbox_2024 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON profiles_devbox_2024
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles_devbox_2024 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Moderators can view user profiles" ON profiles_devbox_2024
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles_devbox_2024 
            WHERE id = auth.uid() AND role IN ('moderator', 'admin')
        )
    );

-- RLS Policies for moderation reports
CREATE POLICY "Moderators can view all reports" ON moderation_reports_devbox_2024
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles_devbox_2024 
            WHERE id = auth.uid() AND role IN ('moderator', 'admin')
        )
    );

CREATE POLICY "Users can create reports" ON moderation_reports_devbox_2024
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON moderation_reports_devbox_2024
    FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Moderators can update reports" ON moderation_reports_devbox_2024
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles_devbox_2024 
            WHERE id = auth.uid() AND role IN ('moderator', 'admin')
        )
    );

-- RLS Policies for admin activity log
CREATE POLICY "Admins can view activity log" ON admin_activity_log_devbox_2024
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles_devbox_2024 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert activity log" ON admin_activity_log_devbox_2024
    FOR INSERT WITH CHECK (auth.uid() = admin_id);

-- Function to log admin activities
CREATE OR REPLACE FUNCTION log_admin_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if the user performing the action is admin/moderator
    IF EXISTS (
        SELECT 1 FROM profiles_devbox_2024 
        WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    ) THEN
        INSERT INTO admin_activity_log_devbox_2024 (
            admin_id,
            action,
            target_user_id,
            details
        ) VALUES (
            auth.uid(),
            TG_OP || '_' || TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            jsonb_build_object(
                'old_values', to_jsonb(OLD),
                'new_values', to_jsonb(NEW)
            )
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for admin activity logging
DROP TRIGGER IF EXISTS profiles_admin_activity_trigger ON profiles_devbox_2024;
CREATE TRIGGER profiles_admin_activity_trigger
    AFTER UPDATE OR DELETE ON profiles_devbox_2024
    FOR EACH ROW EXECUTE FUNCTION log_admin_activity();

-- Function to update last_sign_in_at
CREATE OR REPLACE FUNCTION update_last_sign_in()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles_devbox_2024 
    SET last_sign_in_at = NOW(), updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating last sign in (if auth.users table is accessible)
-- Note: This might need to be handled in the application layer depending on Supabase setup

-- Function to prevent role escalation abuse
CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent users from escalating their own role
    IF auth.uid() = NEW.id AND OLD.role != NEW.role THEN
        -- Only admins can change roles
        IF NOT EXISTS (
            SELECT 1 FROM profiles_devbox_2024 
            WHERE id = auth.uid() AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'Only administrators can modify user roles';
        END IF;
    END IF;
    
    -- Prevent non-admins from creating admin users
    IF NEW.role = 'admin' AND NOT EXISTS (
        SELECT 1 FROM profiles_devbox_2024 
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only administrators can create admin users';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role escalation prevention
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON profiles_devbox_2024;
CREATE TRIGGER prevent_role_escalation_trigger
    BEFORE UPDATE ON profiles_devbox_2024
    FOR EACH ROW EXECUTE FUNCTION prevent_role_escalation();

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_id UUID)
RETURNS TABLE(permission TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT CASE 
        WHEN p.role = 'admin' THEN unnest(ARRAY[
            'tools.use', 'favorites.manage', 'profile.edit', 'activity.view',
            'users.view', 'content.moderate', 'reports.view',
            'users.manage', 'users.delete', 'roles.assign', 'system.settings', 
            'analytics.view', 'database.access'
        ])
        WHEN p.role = 'moderator' THEN unnest(ARRAY[
            'tools.use', 'favorites.manage', 'profile.edit', 'activity.view',
            'users.view', 'content.moderate', 'reports.view'
        ])
        ELSE unnest(ARRAY[
            'tools.use', 'favorites.manage', 'profile.edit', 'activity.view'
        ])
    END as permission
    FROM profiles_devbox_2024 p
    WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check user permission
CREATE OR REPLACE FUNCTION has_permission(user_id UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM get_user_permissions(user_id) 
        WHERE permission = required_permission
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing user activity policies to include admin actions
DROP POLICY IF EXISTS "Users can view own activity" ON user_activity_devbox_2024;
DROP POLICY IF EXISTS "Users can insert own activity" ON user_activity_devbox_2024;

CREATE POLICY "Users can view own activity" ON user_activity_devbox_2024
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM profiles_devbox_2024 
            WHERE id = auth.uid() AND role IN ('moderator', 'admin')
        )
    );

CREATE POLICY "Users can insert own activity" ON user_activity_devbox_2024
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can insert admin activity" ON user_activity_devbox_2024
    FOR INSERT WITH CHECK (
        admin_action = TRUE AND
        EXISTS (
            SELECT 1 FROM profiles_devbox_2024 
            WHERE id = auth.uid() AND role IN ('moderator', 'admin')
        )
    );

-- Create view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE status = 'active') as active_users,
    COUNT(*) FILTER (WHERE status = 'blocked') as blocked_users,
    COUNT(*) FILTER (WHERE role = 'admin') as admin_users,
    COUNT(*) FILTER (WHERE role = 'moderator') as moderator_users,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
    COUNT(*) FILTER (WHERE last_sign_in_at >= NOW() - INTERVAL '7 days') as active_users_7d
FROM profiles_devbox_2024;

-- Grant access to the view
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Admins can view dashboard stats" ON admin_dashboard_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles_devbox_2024 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Update the specified user to admin role
UPDATE profiles_devbox_2024 
SET 
    role = 'admin',
    status = 'active',
    updated_at = NOW()
WHERE id = '3d7d2258-aa18-4a62-9d88-1bbc5d404c24';

-- Insert admin activity log for the role change
INSERT INTO admin_activity_log_devbox_2024 (
    admin_id,
    action,
    target_user_id,
    details
) VALUES (
    '3d7d2258-aa18-4a62-9d88-1bbc5d404c24',
    'INITIAL_ADMIN_SETUP',
    '3d7d2258-aa18-4a62-9d88-1bbc5d404c24',
    jsonb_build_object(
        'action', 'Set initial admin user',
        'timestamp', NOW(),
        'automated', true
    )
);

-- Create function to safely promote user to admin (for future use)
CREATE OR REPLACE FUNCTION promote_to_admin(target_user_id UUID, promoting_admin_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    admin_exists BOOLEAN;
    target_exists BOOLEAN;
BEGIN
    -- Check if promoting user is admin
    SELECT EXISTS (
        SELECT 1 FROM profiles_devbox_2024 
        WHERE id = promoting_admin_id AND role = 'admin'
    ) INTO admin_exists;
    
    IF NOT admin_exists THEN
        RAISE EXCEPTION 'Only administrators can promote users to admin';
    END IF;
    
    -- Check if target user exists
    SELECT EXISTS (
        SELECT 1 FROM profiles_devbox_2024 
        WHERE id = target_user_id
    ) INTO target_exists;
    
    IF NOT target_exists THEN
        RAISE EXCEPTION 'Target user does not exist';
    END IF;
    
    -- Update user role
    UPDATE profiles_devbox_2024 
    SET 
        role = 'admin',
        updated_at = NOW()
    WHERE id = target_user_id;
    
    -- Log the activity
    INSERT INTO admin_activity_log_devbox_2024 (
        admin_id,
        action,
        target_user_id,
        details
    ) VALUES (
        promoting_admin_id,
        'PROMOTE_TO_ADMIN',
        target_user_id,
        jsonb_build_object(
            'action', 'User promoted to admin',
            'timestamp', NOW()
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to safely demote admin (with safeguards)
CREATE OR REPLACE FUNCTION demote_admin(target_user_id UUID, demoting_admin_id UUID, new_role user_role DEFAULT 'user')
RETURNS BOOLEAN AS $$
DECLARE
    admin_exists BOOLEAN;
    target_exists BOOLEAN;
    admin_count INTEGER;
BEGIN
    -- Check if demoting user is admin
    SELECT EXISTS (
        SELECT 1 FROM profiles_devbox_2024 
        WHERE id = demoting_admin_id AND role = 'admin'
    ) INTO admin_exists;
    
    IF NOT admin_exists THEN
        RAISE EXCEPTION 'Only administrators can demote admin users';
    END IF;
    
    -- Prevent self-demotion if they are the last admin
    SELECT COUNT(*) FROM profiles_devbox_2024 WHERE role = 'admin' INTO admin_count;
    
    IF admin_count <= 1 AND target_user_id = demoting_admin_id THEN
        RAISE EXCEPTION 'Cannot demote the last administrator';
    END IF;
    
    -- Update user role
    UPDATE profiles_devbox_2024 
    SET 
        role = new_role,
        updated_at = NOW()
    WHERE id = target_user_id AND role = 'admin';
    
    -- Log the activity
    INSERT INTO admin_activity_log_devbox_2024 (
        admin_id,
        action,
        target_user_id,
        details
    ) VALUES (
        demoting_admin_id,
        'DEMOTE_ADMIN',
        target_user_id,
        jsonb_build_object(
            'action', 'Admin demoted',
            'new_role', new_role,
            'timestamp', NOW()
        )
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON moderation_reports_devbox_2024 TO authenticated;
GRANT SELECT, INSERT ON admin_activity_log_devbox_2024 TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_permissions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_permission(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION promote_to_admin(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION demote_admin(UUID, UUID, user_role) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles_devbox_2024(updated_at);
CREATE INDEX IF NOT EXISTS idx_profiles_last_sign_in ON profiles_devbox_2024(last_sign_in_at);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_created_at ON moderation_reports_devbox_2024(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_target_user ON admin_activity_log_devbox_2024(target_user_id);

-- Verify the admin user was created
DO $$
DECLARE
    admin_count INTEGER;
    user_role TEXT;
BEGIN
    SELECT COUNT(*) FROM profiles_devbox_2024 WHERE role = 'admin' INTO admin_count;
    SELECT role FROM profiles_devbox_2024 WHERE id = '3d7d2258-aa18-4a62-9d88-1bbc5d404c24' INTO user_role;
    
    RAISE NOTICE 'Total admin users: %', admin_count;
    RAISE NOTICE 'User 3d7d2258-aa18-4a62-9d88-1bbc5d404c24 role: %', COALESCE(user_role, 'NOT FOUND');
    
    IF user_role = 'admin' THEN
        RAISE NOTICE 'SUCCESS: User has been promoted to admin';
    ELSE
        RAISE NOTICE 'WARNING: User promotion may have failed';
    END IF;
END $$;