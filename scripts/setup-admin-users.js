/**
 * Setup Admin Users in Supabase
 * Run this script once to create the admin users in the portal_users table
 * 
 * Usage: node scripts/setup-admin-users.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxdelxjdgkwscnojhlhc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4ZGVseGpkZ2t3c2Nub2pobGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczODM0NDIsImV4cCI6MjA4Mjk1OTQ0Mn0.G11AtJjEF8yKjMQVizzu_hQzq9ZORlRdFivbBU9vE3I';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const adminUsers = [
    {
        username: 'Ardy',
        password: 'Samarinda2026',
        full_name: 'Super Administrator',
        role: 'super_admin',
        is_active: true,
        module_access: ['angsuran', 'internet', 'musholla', 'komunitas', 'arisan', 'takjil', 'peduli', 'direktori', 'settings', 'users']
    },
    {
        username: 'admin.angsuran',
        password: 'angsuran123',
        full_name: 'Admin Angsuran',
        role: 'admin_angsuran',
        is_active: true,
        module_access: ['angsuran']
    },
    {
        username: 'admin.internet',
        password: 'internet123',
        full_name: 'Admin Internet',
        role: 'admin_internet',
        is_active: true,
        module_access: ['internet']
    },
    {
        username: 'admin.musholla',
        password: 'musholla123',
        full_name: 'Admin Musholla',
        role: 'admin_musholla',
        is_active: true,
        module_access: ['musholla']
    }
];

async function setupAdminUsers() {
    console.log('🔧 Setting up admin users in Supabase...\n');

    for (const user of adminUsers) {
        try {
            // Check if user already exists
            const { data: existing } = await supabase
                .from('portal_users')
                .select('id')
                .eq('username', user.username)
                .single();

            if (existing) {
                // Update existing user
                const { error } = await supabase
                    .from('portal_users')
                    .update({
                        password: user.password,
                        full_name: user.full_name,
                        email: user.email,
                        role: user.role,
                        is_active: user.is_active,
                        module_access: user.module_access
                    })
                    .eq('username', user.username);

                if (error) {
                    console.log(`❌ Error updating ${user.username}:`, error.message);
                } else {
                    console.log(`✅ Updated: ${user.username} (${user.role})`);
                }
            } else {
                // Insert new user
                const { error } = await supabase
                    .from('portal_users')
                    .insert([user]);

                if (error) {
                    console.log(`❌ Error creating ${user.username}:`, error.message);
                } else {
                    console.log(`✅ Created: ${user.username} (${user.role})`);
                }
            }
        } catch (err) {
            console.log(`❌ Error with ${user.username}:`, err.message);
        }
    }

    console.log('\n🎉 Setup complete!');
    console.log('\nLogin credentials:');
    console.log('  Super Admin: Ardy / Samarinda2026');
}

setupAdminUsers();
